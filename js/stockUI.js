(function(name, definition){
	
	window[name] = definition();

	window.onload = function(){

		var componentArr = [
			"stockMenu"
		];

		window.stockUIObj = new window[name]("stock-ui");

		stockUIObj.requireComponent(componentArr).done(function(data) {
			stockUIObj.init();
		});

		window.ui = stockUIObj;
	}
	
}("StockUI", function() {

	var StockUI = function(myStock){

		var self = this;

		self.stockId = "stock-ui";

		self.defaultSymbol = "000001.sh,399001.sz,600000.sh";

		self.optionalSymbol = function() {
			var optionalSymbolArr = MyStorage.get("optionalSymbolArr") || [];
			return optionalSymbolArr.length != 0 ? optionalSymbolArr.join(",") : self.defaultSymbol;
		}();

		self.stockApi = new StockApi();

		self.stockView = new StockView();

		self.deferred = self.stockApi.deferred;

		// 首頁 暫時關閉 a = []
		self.indexPageObj = (function(a) {
			var a = [];
		    var indexPageObj = (a || []).reduce(function(obj, curr) {
		    	var p = curr.split('=', 2);
		        obj[p[0]] = decodeURIComponent((p[1]|| "").replace(/\+/g, " "));
		    	return obj;
		    }, {});
		    // "quoteList";
		    if(indexPageObj.pageId === undefined) indexPageObj.pageId = "quoteList";
		    return indexPageObj;
		})(window.location.search.substr(1).split('&'));

		// 初始化 上一頁路徑
		self.historyPath = function() {
			var arr = [];
			if(self.indexPageObj.back !== undefined)
				arr.push({ pageId: self.indexPageObj.back})

			arr.push({ pageId: self.indexPageObj.pageId});
			return arr;
		}();
		
		// self.init();

		// 第一步就是朝所有event 都在這裡 其他的都是customEvent
		// view 也有自己的handleEvent 是customEvent 統一管理
		self.handleEvent = function() {
			// 防連點 start
			var closureObj = {};
			return function(event) {
				event.stopPropagation();
				// 判斷event target 是否存在map中
				if(event.currentTarget.viewId === undefined) return;
				var viewId = event.currentTarget.viewId;
				//禁止連點
				if(closureObj.lastViewId === viewId && new Date().getTime() - closureObj.lastClickTime < 1000) return;
				// all event here
				switch(event.type) {
					case "click":
						// 記錄連點資訊
						closureObj.lastViewId = viewId, closureObj.lastClickTime = new Date().getTime();
						switch(viewId) {
							case "uiBack":
								self.historyPath.pop();
								self.changePage({
									pageId: self.historyPath[self.historyPath.length-1].pageId,
									isBack: true
								});	
								break;

							case "qlA_searchBtn":
								self.eventShowPage({
									pageId: "quoteSearch",
									title: "搜尋"
								})

								break;

							case "qlA_menuBtn":

								self.pageInitial({
									pageId: "stockMenu", 
									noPageHeader: true
								}).then(function() {
									self.slidePage({
										pageId: "stockMenu",
										direction: "left",
										percent: "75%"
									})
								});

								break;

							case "qsA_submit":
								// qsASubmit();
								break;	

							case "smE_slideBack":
								self.slidePage({back: true});

								break;						

							case "uiMask":
								self.stockView.map.uiMask.data.eventObj.event();
								break;						


							default:
								var viewObj = self.stockView.map[viewId];

								if(viewId.indexOf("quote_") === 0) {
									self.showQuoteDetail(viewObj.data);

								// 搜尋股票
								} else if(viewId.indexOf("search_") === 0) {
									self.stockApi.quote({
										symbol: viewObj.data.symbol
									},function(rspObj){
										var quoteData = rspObj.apiData[0];
										self.showQuoteDetail(quoteData);
									});

								// 新增自選
								} else if(viewId.indexOf("optional_") === 0) {
									
									var symbol = viewId.split("_")[1],
										optionalSymbolArr = MyStorage.get("optionalSymbolArr") || [],
										pos = optionalSymbolArr.indexOf(symbol);

									// 按鈕變換
									if(pos < 0) {
										optionalSymbolArr.push(symbol);
										viewObj.elem.setAttribute("class","ls-text");
									} else {
										optionalSymbolArr.splice(pos,1);
										viewObj.elem.setAttribute("class","ls-plus");
									}

									// 回quoteList 要reload
									// self.stockView.map.quoteList.data.isReload = true;

									MyStorage.set("optionalSymbolArr", optionalSymbolArr);
									self.optionalSymbol = optionalSymbolArr.join(",");

								// 切換線圖
								} else if(viewId.indexOf("qdDradio_") === 0) {
									var symbol = self.stockView.map.quoteDetail.data.body.symbol;
									self.stockView.map.qdB.data.chartName = viewId.split("_")[1];
									self.stockView.map.qdB.clean();
									self.stockView.map.qdB.render();
								}

						}

						break; // end of click

					case "input":
						switch(viewId) {
							case "qsA_input":
								if(closureObj.qsAInputTimer !== undefined) clearTimeout(closureObj.qsAInputTimer)

								closureObj.qsAInputTimer = setTimeout(function() {
									var value = self.stockView.map[viewId].elem.value;

									self.stockApi.search({
										param: value
									},function(rspObj) {
										var table = self.stockView.map["quoteSearch"].elem.getElementsByTagName('table')[0];
										table.innerHTML = "";

										rspObj.apiData.pop();

										if(rspObj.apiData.length === 0) table.innerHTML = '<tr style="border:0;cursor: auto;"><td><span></span></td><td>查無資料</td><td>';
										
										var optionalSymbolArr = MyStorage.get("optionalSymbolArr") || [];

										rspObj.apiData.forEach(function(item,i) {

											self.stockView.create({
												viewId: "search_" + i,
												tag: "tr",
												html: '<td><span name="optionalSymbol" class="'+ (optionalSymbolArr.indexOf(item.symbol) < 0 ? 'ls-plus' : 'ls-text') +'"></span></td><td>'+ item.name +'</td><td>'+ item.symbol.split('.')[0] +'</td>',
												data: item,
												eventBinding: function(elem) {
													elem.addEventListener("click",self);
													var optionalSymbolElem = elem.querySelectorAll('[name=optionalSymbol]')[0];
													if(optionalSymbolElem === undefined) return;

													self.stockView.assign({
														viewId: "optional_" + item.symbol,
														elem: optionalSymbolElem,
														eventBinding: function() {
															optionalSymbolElem.addEventListener("click",self);
														}
													})
												},

												renderNow: function(elem) {
													table.appendChild(elem);
												}
											})
										})
									})
								},500)
								break;
						}

						break; // end of keypress
				}
			}
		}();


		self.qsASubmit = function() {
			getQuoteListView.call(self);
		};

		self.showQuoteDetail = function(quoteData) {
			var pageId = "quoteDetail";

			self.pageInitial({pageId: pageId, data: {
				title: getQuoteDetailTitle(quoteData),
				body: quoteData
			}});

			self.changePage({pageId: pageId});
		};

		self.showQuoteSearch = function(fromViewId) {
			var pageId = "quoteSearch",
				fromViewIdObj = self.stockView.map[fromViewId];

			self.pageInitial({pageId: pageId, data: fromViewIdObj.data});

			// page title
			// self.stockView.map["page-header-quoteSearch"].data = '<div>' + fromViewIdObj.data.name + '</div><div style="font-size:12px;">' + fromViewIdObj.data.symbol + '</div>';
			// self.stockView.map["page-header-quoteSearch"].render();

			// content

			self.changePage({pageId: pageId});
		};
	}

	StockUI.prototype = {

		init: function(){

			var self = this;

			// self.oriElem = function() {
			// 	var oriHtml = document.getElementById(self.stockId).innerHTML,
			// 		oriElem	= document.createElement("section");

			// 	oriElem.innerHTML = oriHtml;
			// 	return oriElem;
			// }();


			self.mainElement = document.getElementById(self.stockId);
			
			try {
				if( self.mainElement instanceof HTMLElement === false
					|| window.StockApi === undefined
				) return;

			} catch(e) {
				return;
			}

			// initial page

			var self = this;

			// 全部
			self.stockView.assign({
				viewId: this.stockId,
				elem: self.mainElement
			});

			// 首頁
			self.pageInitial({pageId: self.indexPageObj.pageId, noPageHeader: self.indexPageObj.back ? false : true});

			document.getElementById(self.indexPageObj.pageId).addClass("active");
			
		},

		requireComponent: function(componentArr) {
			var self = this, defArr = [];

			componentArr.forEach(function(component) {
				var deferred = self.stockApi.deferred();
				defArr.push(deferred);

				var script = document.createElement("script");
				script.src = "js/" + component + ".js";
				document.body.appendChild(script);
				script.onload = deferred.resolve;
			})
			
			return $.when.apply($,defArr);
		},

		setComponent: function(name, component) {
			var self = this;
			self.stockView.pageComponentMap[name] = component;
		},

		slidePage: function () {
			var closureObj;
			return function(argObj) {
				var self = this;
				if(argObj.back === true) {
					var slidePage = document.querySelectorAll("section[data-role=page].slide")[0];
					slidePage.setAttribute("style","width: " + closureObj.percent + ";" + closureObj.direction + ": -100%");

					closureObj = {};
					setTimeout(function() {
						slidePage.style = "";
						slidePage.removeClass("slide").removeClass("slide-ready");

						// remove cover
						self.stockView.map.uiMask.remove();
					},500)
					return;
				}

				self.maskReset({
					bgColor: "transparent",
					event: self.slidePage.bind(self,{back: true})
				});

				closureObj = argObj;

				var elem = self.stockView.map[argObj.pageId].elem;
				elem.setAttribute("style","width: " + argObj.percent + ";" + argObj.direction + ": -100%");
				elem.addClass("slide-ready");

				setTimeout(function() {
					elem.addClass("slide");
					elem.setAttribute("style","width: " + argObj.percent + ";" + argObj.direction + ": 0");
				},100)

   			}
		}(),

		eventShowPage: function(argObj) {
			var self = this;
			self.pageInitial({
				pageId: argObj.pageId, 
				data: {
					title: argObj.title,
					body: argObj.data
				},
				noPageHeader: argObj.noPageHeader
			}).then(function(){
				self.changePage({pageId: argObj.pageId});	
			});
		},

		maskReset: function(argObj) {
			var self = this,
				maskId = "uiMask";

			if(self.stockView.map[maskId] === undefined) {
				self.stockView.create({
					viewId: maskId,
					html: '<section id="uiMask"></section>',
					attr: {style: {background: argObj.bgColor }},
					data: {eventObj: {
						type: argObj.type || "click", 
						event: argObj.event
					}},
					renderNow: function(elem) {
						self.stockView.map["stock-ui"].elem.appendChild(elem);
					}
				})
			}

			var maskViewObj = self.stockView.map[maskId],
				eventType = maskViewObj.data.eventObj.type;

			maskViewObj.elem.style = "background:" + argObj.bgColor;
			
			maskViewObj.elem.removeEventListener(eventType, self);
			maskViewObj.elem.addEventListener(eventType, self);

		},

		pageInitial: function(initObj) {
			// pageId,data, noPageHeader
			var self = this,
				pageId = initObj.pageId,
				pageElem = document.getElementById(pageId),
				pageCpntObj = self.stockView.pageComponentMap[pageId],
				pageInitdef = self.deferred(),
				allDoneDef = self.deferred();

			if(initObj.data === undefined && pageCpntObj.pageInit instanceof Function)
				pageCpntObj.pageInit.call(self).then(pageInitdef.resolve);
			else 
				pageInitdef.resolve(initObj.data);

			pageInitdef.then(function(pageInitData) {
				if(self.stockView.map.hasOwnProperty(pageId) === false){
					self.stockView.assign({
						viewId: pageId,
						elem: pageElem,
						render: function() {
							// title initial
							if(initObj.noPageHeader !== true) {
								self.prependPageHeader({
									pageId: pageId,
									title: self.stockView.map[pageId].data.title
								});	
							}
							// 該頁面的成員 去畫面中尋找 並進行初始化
							Object.keys(pageCpntObj).forEach(function(cpntId) {
								var cpntObj = pageCpntObj[cpntId],
									viewObj = self.stockView.map[cpntId];

								if(	document.getElementById(cpntId) === null) return;
								
								if(self.stockView.map[cpntId] === undefined) {
									// 寫入component html
									document.getElementById(cpntId).innerHTML = cpntObj.html();
									self.stockView.assign({
										viewId: cpntId,
										elem: document.getElementById(cpntId),
										init: cpntObj.init.bind(self)
									});
								}

								if(self.stockView.map[cpntId].render instanceof Function) self.stockView.map[cpntId].render();
							})
						}
					});


				}

				// 設定初始資料
				if(pageInitData !== undefined) self.stockView.map[pageId].data = pageInitData;

				// 設定reload
				self.stockView.map[pageId].pageReload = pageCpntObj.pageReload;

				self.stockView.map[pageId].render();
				allDoneDef.resolve();
			});

			return allDoneDef;
		},


		prependPageHeader: function(argObj) {
			var self = this,
				pageElem = document.getElementById(argObj.pageId),
				pageHeaderElem = pageElem.getElementsByClassName('page-header')[0],
				viewId = "page-header-" + argObj.pageId;//.split("-")[1];

			if(pageHeaderElem === undefined) {

				self.stockView.create({
					viewId: viewId,
					html: '<section class="page-header"><button class="back left"></button><div></div></section>',
					eventBinding: function(elem) {
						self.stockView.assign({
							viewId: "uiBack",
							elem: elem.getElementsByTagName('button')[0],
							eventBinding: function(btnElem) {
								btnElem.addEventListener("click",self);
							}
						})
					},
					render: function(elem) {
						if(document.getElementById("quoteDetail").firstElementChild !== elem)
							pageElem.insertBefore(self.stockView.map[viewId].elem, document.getElementById(argObj.pageId).firstChild);
								
						elem.getElementsByTagName('div')[0].innerHTML = self.stockView.map[viewId].data;
					}
				});
			}

			self.stockView.map[viewId].data = argObj.title;
			self.stockView.map[viewId].render();
		},
 
		changePage: function(argObj) {
			var self = this,
				pageId = argObj.pageId,
				direction = (argObj.isBack || false) ? "prev" : "next",

				nextPageViewObj = self.stockView.map[pageId],
				nextPageElem = nextPageViewObj.elem,
				oriPageElem = document.querySelectorAll("section[data-role=page].active")[0];


			oriPageElem.addClass("back").removeClass("active");
			nextPageElem.addClass(direction);

			// 看下一頁是否需要reload
			if( nextPageViewObj.pageReload instanceof Function
			) {
				nextPageViewObj.pageReload.call(self);
				// nextPageViewObj.data.isReload = false;
			};

			setTimeout(function(){
				nextPageElem.addClass("active").removeClass(direction).style.transition = "0.5s";

				if(argObj.isBack !== true) self.historyPath.push({ pageId: pageId});

				// 清除該清除的 
				Object.keys(self.stockView.pageComponentMap[oriPageElem.id]).forEach(function(viewId) {
					var viewObj = self.stockView.map[viewId];
					if(typeof viewObj !== "object") return;
					if(viewObj.clean instanceof Function) viewObj.clean();
				});

				// 動畫結束再刪掉
				setTimeout(function () {
					oriPageElem.removeClass("back");
					nextPageElem.style.transition = "";
				}, 600)

			},50);
		}
	};


	var StockView = function() {

		this.map = {}; // all views here

	}

	StockView.prototype = {

		pageComponentMap: {
			// stockMenu: {
			// 	smA: {
			// 		html: function() {
			// 			return '<div><img src="img/qmi.png"><span>水晶股市</span></div>';
			// 		},
			// 		init: function() {

			// 		}
			// 	},

			// 	smB: {
			// 		html: function() {
			// 			return '';
			// 		},
			// 		init: function() {
			// 			var content = ["行情中心","沪深股市","沪港通","香港股市"],
			// 				viewObj = this.stockView.map.smB.elem;

			// 			viewObj.innerHTML = content.reduce(function(prev,curr,i) {
			// 				if(i == 1) prev = '<div><span>' + prev + '</span>';
			// 				if(i % 4 == 0) prev += '</div>';
			// 				if(i % 4 == 0 && i % 12 != 0) prev += '<div>';
			// 				return prev + '<span>' + curr + '</span>';
			// 			});
			// 		}
			// 	},

			// 	smC: {
			// 		html: function() {
			// 			return '<div class="sm-block">手机水晶森林</div>';
			// 		},
			// 		init: function() {
			// 		}
			// 	},

			// 	smD: {
			// 		html: function() {
			// 			return '<div class="sm-block">我要提意见</div>';
			// 		},
			// 		init: function() {
			// 		}
			// 	},

			// 	smE: {
			// 		html: function() {
			// 			return '<div class="sm-block">关闭左侧导航</div>';
			// 		},
			// 		init: function() {
			// 			var self = this, // this => bind stockUI
			// 				viewObj = self.stockView.map.smE;

			// 			// 輸入股票event
			// 			self.stockView.assign({
			// 				viewId: "smE_slideBack",
			// 				elem: viewObj.elem.getElementsByTagName("div")[0],
			// 				eventBinding: function(thisElem) {
			// 					thisElem.addEventListener("click",self);
			// 				}
			// 			})
			// 		}
			// 	}
			// },

			quoteList: {
				pageReload: function() {
					getQuoteListView.call(this);
				},

				qlA: {
					html: function() {
						return '<section class="page-header">' +
						'<button class="menu left"></button><div>行情中心</div><button class="right search"></button>' +
						'</section>';
					},
					init: function() {
						var self = this,
							viewObj = this.stockView.map.qlA.elem;

						// 去搜尋頁
						self.stockView.assign({
							viewId: "qlA_searchBtn",
							elem: viewObj.querySelectorAll(".search")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("click",self);
							}
						});

						// 去菜單
						self.stockView.assign({
							viewId: "qlA_menuBtn",
							elem: viewObj.querySelectorAll(".menu")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("click",self);
							}
						});
					}					
				},

				qlB: {
					html: function() {
						return '<section class="stock-table">' +
						'	<table><thead><tr><th>名称代码</th><th>最新价</th><th>涨跌幅</th></thead><tbody></tbody></table>' +
						'</section>';
					},
					init: function() {
						var self = this;
						getQuoteListView.call(self);

						this.stockView.map.qlB.clean = function() {
							Object.keys(self.stockView.map).forEach(function(key) {
								if(key.indexOf('quote_') === 0) self.stockView.map[key].remove()
							});
						}
					}					
				}
			},

			quoteSearch: {
				qsA: {
					html: function() {
						return '<section class="search">' +
						'	<span class="input"><input placeholder="请输入股票名称/代码/首字母"></span>' +
						'</section>' +
						'<section><table></table></section>';
					},
					init: function() {
						var self = this,
							viewObj = self.stockView.map.qsA;

						// 輸入股票event
						self.stockView.assign({
							viewId: "qsA_input",
							elem: viewObj.elem.getElementsByTagName("input")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("input",self);
							}
						})


						viewObj.clean = function() {
							self.stockView.map.qsA_input.elem.value = "";
							Object.keys(self.stockView.map).forEach(function(key) {
								if(key.indexOf('search_') === 0 || key.indexOf('optional_') === 0) 
									self.stockView.map[key].remove();
							});
							viewObj.elem.getElementsByTagName('table')[0].innerHTML = "";
						}
					}					
				}
			},

			quoteDetail: {
				// 若quoteDetail為首頁 要先取得報價
				pageInit: function() {
					var self = this,
						deferred = self.stockApi.deferred(),
						viewObj = self.stockView.map.quoteDetail;

					// 是否為首頁
					if(self.indexPageObj.pageId === "quoteDetail" && self.indexPageObj.symbol !== undefined) {

						// 先做上一頁
						self.pageInitial({pageId: self.indexPageObj.back, noPageHeader: true});

						self.stockApi.quote({
							symbol: self.indexPageObj.symbol
						},function(rspObj){
							var quoteData = rspObj.apiData[0];
							deferred.resolve({
								title: getQuoteDetailTitle(quoteData),
								body: quoteData
							});
						});
					} else {
						deferred.resolve();
					}

					return deferred;
					// this.stockView.map.stockMenu.elem.querySelectorAll(".slide:after").addEventListener("click",this);
				},

				qdA: {
					html: function() {
						return '';
					},
					init: function() {
						
					}					
				},

				qdB: {
					html: function() {
						return '';
					},
					init: function() {
						var self = this,
							canvasId = "H5Chart",
							viewObj = self.stockView.map.qdB;

						viewObj.render = function() {
							var qdData = self.stockView.map["quoteDetail"].data.body,
								// 預設線圖 月k
								chartName = self.indexPageObj.chartName || viewObj.data.chartName || "line";

							// remove
							var canvasElem = viewObj.elem.getElementsByTagName("canvas")[0];
							if(canvasElem !== undefined) canvasElem.parentNode.removeChild(canvasElem);
							
							
							// reset
							var canvasSize = window.innerWidth > 780 ? 780 : window.innerWidth-20;

							viewObj.elem.innerHTML = '<canvas id="'+ canvasId +'" width="'+ canvasSize +'" height="'+ Math.max(canvasSize*0.66, 450) +'" style="z-index: 100001;background: transparent;"></canvas>';


							self.stockApi[chartName]({
								symbol: qdData.symbol
							},function(rspObj) {
								console.log("qdData.symbol",qdData.symbol);
								console.log("rspObj",rspObj);
								if(rspObj.isSuccess !== true) {
									throw "error";
									return;
								}

								// 時 昨 開 高 滴 收
								switch(chartName) {
									case caseMatch(self.stockApi.caseK.split("v2/").join("")):

										rspObj.apiData.pop();
										H5Chart.k({
											dataArr: rspObj.apiData.map(function(item) {
												return [item.date, item.open, item.open, item.high, item.low, item.last, item.volume, 0];
											})
										});

										break;
									case "line":
										var lineObj = {
											quote: {
							                    time: 20111214150106,
							                    open: qdData.openPrice,
							                    preClose: qdData.preClosePrice,
							                    highest: qdData.highPrice,
							                    lowest: qdData.highPrice,
							                    price: qdData.lastPrice,
							                    volume: qdData.volume,
							                    amount: 38621178573
							                },
							                mins: rspObj.apiData.map(function(item) {
												return {
													price: item.lastPrice, 
													volume: item.volume, 
													amount: 0
												}
											},{})
										};

										lineObj.mins.pop();

										H5Chart.line({
											canvasId: canvasId,
											canvasSize: canvasSize,
											lineObj: lineObj
										})
									 
										break;
								}
							});

							function caseMatch(str) {
								 return str.split(",")[str.split(",").indexOf(chartName)];
							}
						};

						viewObj.clean = function() {
							console.log("shit");
							var canvasId = "H5Chart";
							
							[document.getElementById(canvasId),
							document.getElementById(canvasId + '_tip'),
							document.getElementById(canvasId + '_crossLines_H'),
							document.getElementById(canvasId + '_crossLines_V')]
							.forEach(function(item) {
								if(item !== null) item.parentNode.removeChild(item);
							});
						}
					}				
				},

				qdC: {
					html: function() {
						return '';
					},
					init: function() {
					}					
				},

				qdD: {
					html: function() {
						return '<input data-name="line" name="k-cate" type="radio" checked>' +
						'<input data-name="dayk" name="k-cate" type="radio">' +
						'<input data-name="weekk" name="k-cate" type="radio">' +
						'<input data-name="monthk" name="k-cate" type="radio">' +
						'<input data-name="m60" name="k-cate" type="radio">' +
						'<input data-name="m30" name="k-cate" type="radio">';
					},
					init: function() {
						var self = this,
							qdData = self.stockView.map["quoteDetail"].data.body,
							viewObj = self.stockView.map.qdD;

							// 預設線圖 月k
							// chartName = qdData.chartName || "monthk";

						Array.prototype.forEach.call(self.stockView.map.qdD.elem.getElementsByTagName("input"),function(elem,i) {
							if( self.indexPageObj.chartName !== undefined && elem.dataset.name === self.indexPageObj.chartName) 
								elem.checked = true;
							else if(i == 0) elem.checked = true;
							
							self.stockView.assign({
								viewId: "qdDradio_" + elem.dataset.name,
								elem: elem,
								eventBinding: function(elem) {
									elem.addEventListener("click",self);
								},
							});
						});
					}					
				},

				qdE: {
					html: function() {
						return '<div></div>' +
						'<div><span name="lastPrice" style="font-weight: 600;"></span>' + 
						'	<span><span>高:</span><span name="highPrice"></span></span>' + 
						'	<span><span>开:</span><span name="openPrice"></span></span>' + 
						'	<span><span>量:</span><span><span name="volume"></span><font>万</font></span></span></div>' + 
						'<div><span style="font-weight: 600;"><span name="volumeRatio"></span><span><span name="amplitudeRate"></span><font>%</font></span></span>' + 
						'	<span><span>低:</span><span name="lowPrice"></span></span>' + 
						'	<span><span>换:</span><span name="change"></span></span>' + 
						'	<span><span>额:</span><span><span name="amount"></span><font>万</font></span></span></div>'
						// '<div><span><span>上漲家數：</span><span name="">44</span></span>' + 
						// '	<span><span>平盤家數：</span><span name="">55</span></span>' + 
						// '	<span><span>下跌家數：</span><span name="">66</span></span></div>'
						;
					},
					init: function() {
						var self = this, // this => bind stockUI
							viewObj = self.stockView.map.qdE;
						
						viewObj.render = function() {
							var qdData = self.stockView.map["quoteDetail"].data.body,
								colorArr = ["lastPrice", "volumeRatio", "amplitudeRate"];
							viewObj.elem.getElementsByTagName('div')[0].innerHTML = qdData.name + "(" + qdData.symbol + ")";


							if(Object.keys(qdData).length > 0) {
								Array.prototype.forEach.call(viewObj.elem.querySelectorAll("[name]"), function(thisElem) {
									if(colorArr.indexOf(thisElem.getAttribute("name")) !== -1) {
										thisElem.setAttribute("class", qdData.diffClass + "-text");
										if(thisElem.getAttribute("name") === "amplitudeRate")
											thisElem.parentNode.getElementsByTagName('font')[0].setAttribute("class", qdData.diffClass + "-text");
									}
									thisElem.innerHTML = qdData[thisElem.getAttribute("name")] || "";
								});
							}
						}
					} // init					
				} // qdE
			} // quoteDetail
		},

		create: function(argObj) {
			// try {
				var self = this;
					elem = document.createElement(argObj.tag || "div"),
					viewId = argObj.viewId || (new Date()).getTime();

				if(argObj.html !== undefined) elem.innerHTML = argObj.html;

				// 表示只取裡面的html
				if(argObj.tag === undefined) {
					elem = elem.children[0];
				} else {
					Object.keys(argObj.attr || {}).forEach(function(key) {
						switch(key) {
							case "style":
								var styleObj = argObj.attr[key],
									styleStr = "";
								Object.keys(styleObj).forEach(function(key) {
									styleStr += key + ":" + styleObj[key] + ";";
								});
								argObj.attr[key] = styleStr;
								break;

							default:
								elem.setAttribute(key,argObj.attr[key]);		
								break;
						};
					});
				}

				elem.dataset.ui = viewId;

				Object.keys(argObj.dataset || {}).forEach(function(key) {
					if(key !== "ui") elem.dataset[key] = argObj.dataset[key];
				});

				argObj.elem = elem;
				argObj.viewId = viewId;

				self.assign(argObj);

			// } catch(e) {
			// 	throw "StockUI createView syntax error";
			// 	console.log(argObj);
			// 	return false;
			// }
		},

		assign: function(argObj) {
			var elem = argObj.elem;

			elem.viewId = argObj.viewId;

			this.map[argObj.viewId] = {
				elem: elem,
				data: argObj.data || {},
				render: argObj.render !== undefined ? argObj.render.bind(this, elem) : (argObj.renderNow ? argObj.renderNow.bind(this, elem) : undefined),
				remove: removeView.bind({viewId: argObj.viewId, mapObj: this.map})
			};

			// event binding
			if(typeof argObj.eventBinding === "function") argObj.eventBinding(elem);
			// render now
			if(typeof argObj.renderNow === "function") argObj.renderNow(elem);
			// is Page Component init
			if(typeof argObj.init === "function") argObj.init();
		},

	};


	function getQuoteListView() {
		var self = this;

		if(self.stockView.map.qlB === undefined) return;

		// ajax interval
		// setInterval(function quoteInterval() {

			// self.stockView.map.qlA_input.elem.value = "";
			var optionalSymbol = self.optionalSymbol !== "" ? self.optionalSymbol : self.defaultSymbol;

			self.stockApi.quote({
				symbol: optionalSymbol
			},function(rspObj){
				var dataArr = rspObj.apiData,
					viewIdArr = [];

				if(rspObj.isSuccess !== true) return;

				self.stockView.map.qlB.clean();

				dataArr.forEach(function(stockObj) {
					if(stockObj.status === "") return;

					var viewId = "quote_" + stockObj.symbol;

					viewIdArr.push(viewId);

					if(self.stockView.map[viewId] !== undefined) {
						self.stockView.map[viewId].data = stockObj;
						return;
					}

					self.stockView.create({
						viewId: viewId,
						tag: "tr",
						html: '<td></td><td></td><td></td>',
						data: stockObj,

						eventBinding: function(elem) {
							elem.addEventListener("click",self);
						},
						render: function(viewId) {
							return function(){
								var viewObj = self.stockView.map[viewId],
									diffPrice = viewObj.data.lastPrice - viewObj.data.openPrice,
									diffClass = function() {
										if(diffPrice > 0) return "rise";
										if(diffPrice < 0) return "fall";
										return "";
									}();

								// if(viewObj.data.name === "浦发银行") diffClass = "fall";
								viewObj.data.diffClass = diffClass;


								// var tempPrice = Math.floor((parseInt(this.data.price) + (Math.random()*100 -50))*100)/100;
								viewObj.elem.getElementsByTagName("td")[0].innerHTML = viewObj.data.name;
								viewObj.elem.getElementsByTagName("td")[1].innerHTML = '<font class="'+ diffClass +'-text">' + viewObj.data.lastPrice + '</font>';
								viewObj.elem.getElementsByTagName("td")[2].innerHTML = function(){
									var diffPct = viewObj.data.openPrice != 0 ? Math.round(((diffPrice) / viewObj.data.openPrice) * 10000) / 100 : "--";
									return '<div class="change ' + diffClass + '">' + diffPct + '%</div>';
								}();
								self.mainElement.getElementsByTagName('tbody')[0].appendChild(viewObj.elem);
							}
						}(viewId)
					});

						
				}); 

				viewIdArr.forEach(function(thisViewId) {
					self.stockView.map[thisViewId].render();
				});
			});

		// return quoteInterval }(),30000); // end of setInterval
	};


	function removeView() {
		if(this.mapObj[this.viewId].elem.parentNode !== undefined)
			this.mapObj[this.viewId].elem.parentNode.removeChild(this.mapObj[this.viewId].elem);

		delete this.mapObj[this.viewId];
	};

	// 設定quoteDetail標題
	function getQuoteDetailTitle(quoteData) {
		return '<div style="position:relative;bottom:5px">' + 
		'<div style="font-size:16px;">' + quoteData.name + '</div>' +
		'<div style="font-size:12px;">' + quoteData.symbol + '</div></div>';
	}


	// tool
	Element.prototype.addClass = function(cn){
		this.className += " " + cn;
		return this;
	},

	Element.prototype.removeClass = function(cn){
		var tempArr = this.className.split(" ");
		if(tempArr.indexOf(cn) < 0 ) return this;

		tempArr.splice(tempArr.indexOf(cn),1);
		this.className = tempArr.join(" ");

		return this;
	}

    var MyStorage = {
    	get: function(itemName) {
    		try {
    			return JSON.parse(localStorage.getItem(itemName));
    		} catch(e) {
    			return localStorage.getItem(itemName);
    		}
    	},
    	set: function(itemName, itemValue) {
    		if(itemValue === undefined) throw "parameter 2 is necessary";

    		if(typeof item === "string") localStorage.setItem(itemName, itemValue);
    		else localStorage.setItem(itemName, JSON.stringify(itemValue));
    	}
    }



	return StockUI;

}))
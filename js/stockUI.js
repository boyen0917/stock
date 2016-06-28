(function(name,definition){
	
	window[name] = definition();

	window.onload = function(){

		window.ui = new window[name]("stock-ui");
		window.qq = 123;
	}
	
}("StockUI", function() {


	var StockUI = function(myStock){

		var self = this;

		self.stockId = "stock-ui";

		self.defaultSymbol = "000001.sh,399001.sz,00001.hk,00379.hk,00145.hk,00552.hk";

		self.stockApi = new StockApi();

		self.stockView = new StockView();

		self.homePageId = "quoteList";

		self.historyPath = [{ pageId: self.homePageId}];

		self.init();

		// 第一步就是朝所有event 都在這裡 其他的都是customEvent
		// view 也有自己的handleEvent 是customEvent 統一管理
		self.handleEvent = function() {
			// 防連點 start
			var closureObj = {};
			return function(event) {
				// 判斷event target 是否存在map中
				console.log("vev",event);
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
								self.changePage(self.historyPath[self.historyPath.length-1].pageId, true);
								break;

							case "qlA_searchBtn":
								self.eventShowPage({
									pageId: "quoteSearch",
									title: "搜尋"
								})

								break;

							case "qlA_menuBtn":

								self.pageInitial({pageId: "stockMenu", noPageHeader: true});

								self.slidePage({
									pageId: "stockMenu",
									direction: "left",
									percent: "75%",
								})

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
								if(viewId.indexOf("quote_") === 0) {
									showQuoteDetail(viewId);
								}

						}

						break; // end of click

					case "input":
						switch(viewId) {
							case "qsA_input":
								// self.stockView.map.qlA_input.data.symbol = self.stockView.map.qlA_input.elem.value;
								if(closureObj.qsAInputTimer !== undefined) {
									console.log("nonononon");
									clearTimeout(closureObj.qsAInputTimer)
								}
								closureObj.qsAInputTimer = setTimeout(function() {
									console.log("qsAInputTimer go",self.stockView.map[viewId].elem.value);

								},500)

								// self.stockApi.search({
								// 	param: "001"
								// },function(data) {
								// 	console.log("heyhey",data);
								// })

								break;
						}

						break; // end of keypress
				}
			}
		}();


		function qsASubmit() {
			getQuoteListView.call(self);
		};

		function showQuoteDetail(fromViewId) {
			var pageId = "quoteDetail",
				fromViewIdObj = self.stockView.map[fromViewId];

			self.pageInitial({pageId: pageId, data: fromViewIdObj.data});

			// page title
			self.stockView.map["page-header-quoteDetail"].data = 
				'<div style="position:relative;bottom:5px">' + 
					'<div style="font-size:16px;">' + fromViewIdObj.data.name + '</div>' +
					'<div style="font-size:12px;">' + fromViewIdObj.data.symbol + '</div></div>';
			self.stockView.map["page-header-quoteDetail"].render();

			// content

			self.changePage(pageId);
		};

		function showQuoteSearch(fromViewId) {
			var pageId = "quoteSearch",
				fromViewIdObj = self.stockView.map[fromViewId];

			self.pageInitial({pageId: pageId, data: fromViewIdObj.data});

			// page title
			self.stockView.map["page-header-quoteSearch"].data = '<div>' + fromViewIdObj.data.name + '</div><div style="font-size:12px;">' + fromViewIdObj.data.symbol + '</div>';
			self.stockView.map["page-header-quoteSearch"].render();

			// content

			self.changePage(pageId);
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
			self.pageInitial({pageId: self.homePageId, noPageHeader: true});

			document.getElementById(self.homePageId).addClass("active");
			
		},

		slidePage: function () {
			var closureObj;
			return function(argObj) {
				var self = this;
				if(argObj.back === true) {
					console.log("slide back~");
					var slidePage = document.querySelectorAll("section[data-role=page].slide")[0];
					slidePage.style = "width: " + closureObj.percent + ";" + closureObj.direction + ": -100%"

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
				elem.style = "width: " + argObj.percent + ";" + argObj.direction + ": -100%"
				elem.addClass("slide-ready");

				setTimeout(function() {
					elem.addClass("slide");
					elem.style = "width: " + argObj.percent + ";" + argObj.direction + ": 0";
				},100)

   			}
		}(),

		eventShowPage: function(argObj) {
			this.pageInitial({pageId: argObj.pageId, data: argObj.data});
			// page title
			this.stockView.map["page-header-" + argObj.pageId].data = argObj.title;
			this.stockView.map["page-header-" + argObj.pageId].render();

			if(argObj.init instanceof Function) argObj.init();
			this.changePage(argObj.pageId);
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
				pageElem = document.getElementById(pageId);

			// if(initObj.reset === undefined) {
			// 	var parentNode = pageElem.parentNode;
			// 	parentNode.removeChild(pageElem);

			// 	parentNode.appendChild(self.oriElem.querySelectorAll("#"+pageId)[0])
			// 	delete self.stockView.map[pageId];

			// 	pageElem = document.getElementById(pageId);
			// }

			if(self.stockView.map.hasOwnProperty(pageId) === false){
				self.stockView.assign({
					viewId: pageId,
					elem: pageElem,
					render: function() {
						console.log();
						if(self.stockView.pageComponentMap[pageId].pageInit instanceof Function) 
							self.stockView.pageComponentMap[pageId].pageInit.call(self);

						// 該頁面的成員 去畫面中尋找 並進行初始化
						Object.keys(self.stockView.pageComponentMap[pageId]).forEach(function(cpntId) {
							var cpntObj = self.stockView.pageComponentMap[pageId][cpntId],
								viewObj = self.stockView.map[cpntId];

							if(document.getElementById(cpntId) === null) return;

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

			self.stockView.map[pageId].data = initObj.data,
			self.stockView.map[pageId].render();

			// 非首頁 
			if(initObj.noPageHeader === undefined) self.prependPageHeader(pageId);
		},

		prependPageHeader: function(pageId) {
			var self = this,
				pageElem = document.getElementById(pageId),
				pageHeaderElem = pageElem.getElementsByClassName('page-header')[0],
				viewId = "page-header-" + pageId;//.split("-")[1];

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
						elem.getElementsByTagName('div')[0].innerHTML = self.stockView.map[viewId].data;
					}
				});

				// 只insert 1次 所以寫在外面
				pageElem.insertBefore(self.stockView.map[viewId].elem, document.getElementById(pageId).firstChild);
			}
		},
 
		changePage: function(pageId,isBack) {
			var self = this;

			var direction = (isBack || false) ? "prev" : "next",
				nextPage = self.stockView.map[pageId].elem,
				deferred = self.stockApi.deferred(),
				oriPage = document.querySelectorAll("section[data-role=page].active")[0];

			oriPage.addClass("back").removeClass("active");
			nextPage.addClass(direction);

			setTimeout(function(){
				nextPage
				.addClass("active")
				.removeClass(direction);

				nextPage.style.transition = "0.5s";

				// 動畫結束再刪掉
				setTimeout(function () {
					oriPage.removeClass.call(oriPage, "back");
					nextPage.style.transition = "";
				}, 600)
				if(isBack !== true) self.historyPath.push({ pageId: pageId})
			},50);
			

			return deferred;
		}
	};


	var StockView = function() {

		this.map = {}; // all views here

	}

	StockView.prototype = {

		pageComponentMap: {
			stockMenu: {
				pageInit: function() {
					// this.stockView.map.stockMenu.elem.querySelectorAll(".slide:after").addEventListener("click",this);
				},

				smA: {
					html: function() {
						return '<div><img src="img/qmi.png"><span>三竹財富網</span></div>';
					},
					init: function() {

					}
				},

				smB: {
					html: function() {
						return '';
					},
					init: function() {
						var content = ["行情中心","滬深股市","滬港通","香港股市","美國股市","基金","全球指數","期貨","現貨","外匯","黃金","債券"],
							viewObj = this.stockView.map.smB.elem;

						viewObj.innerHTML = content.reduce(function(prev,curr,i) {
							if(i == 1) prev = '<div><span>' + prev + '</span>';
							if(i % 4 == 0) prev += '</div>';
							if(i % 4 == 0 && i % 12 != 0) prev += '<div>';
							return prev + '<span>' + curr + '</span>';
						});
					}
				},

				smC: {
					html: function() {
						return '<div class="sm-block">手機東方財富網</div>';
					},
					init: function() {
					}
				},

				smD: {
					html: function() {
						return '<div class="sm-block">我要提意見</div>';
					},
					init: function() {
					}
				},

				smE: {
					html: function() {
						return '<div class="sm-block">關閉左側導航</div>';
					},
					init: function() {
						var self = this, // this => bind stockUI
							viewObj = self.stockView.map.smE;

						// 輸入股票event
						self.stockView.assign({
							viewId: "smE_slideBack",
							elem: viewObj.elem.getElementsByTagName("div")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("click",self);
							}
						})
					}
				}
			},

			quoteList: {
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

						// 去搜尋頁
						self.stockView.assign({
							viewId: "qlA_menuBtn",
							elem: viewObj.querySelectorAll(".menu")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("click",self);
							}
						})

					}					
				},

				qlB: {
					html: function() {
						return '<section class="stock-table">' +
						'	<table><thead><tr><th>名稱代碼</th><th>最新價</th><th>漲跌幅</th></thead><tbody></tbody></table>' +
						'</section>';
					},
					init: function() {
						getQuoteListView.call(this);
					}					
				}
			},

			quoteSearch: {
				qsA: {
					html: function() {
						return '<section class="search">' +
						'	<span class="input"><input placeholder="請輸入股票名稱/代號/首字母"></span>' +
						'</section>';
					},
					init: function() {
						var self = this,
							viewObj = this.stockView.map.qsA.elem;

						// 輸入股票event
						self.stockView.assign({
							viewId: "qsA_input",
							elem: viewObj.getElementsByTagName("input")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("input",self);
							}
						})

						// 送出event
						// self.stockView.assign({
						// 	viewId: "qsA_submit",
						// 	elem: viewObj.getElementsByTagName("button")[0],
						// 	eventBinding: function(thisElem) {
						// 		thisElem.addEventListener("click",self);
						// 	}
						// })
					}					
				}
			},

			quoteDetail: {
				qdA: {
					html: function() {
						return '<section class="title">' +
						' <span><div name="price"></div><div><span name="diff"></span><span name="diffper"></span></div></span>' +
						' <span>' +
						' 	<div><span><span>量: </span><span name="qty"></span></span><span><span>高: </span><span name="hi"></span></span></div>' +
						' 	<div><span><span>開: </span><span name="open"></span></span><span><span>低: </span><span name="low"></span></span></div>' +
						' </span>' +
						'</section>';
					},
					init: function() {
						var self = this, // this => bind stockUI
							viewObj = self.stockView.map.qdA;

						viewObj.render = function() {
							var qdData = self.stockView.map["quoteDetail"].data;

							if(Object.keys(qdData).length > 0) {
								viewObj.elem.querySelectorAll("[name]").forEach(function(thisElem) {
									// thisElem.addClass("red");
									thisElem.innerHTML = qdData[thisElem.getAttribute("name")] || "";
								});
							}
						}
					}					
				},

				qdB: {
					html: function() {
						return '<div id="chart_div" class="k-chart"></div>'
					},
					init: function() {
						var self = this; // this => bind stockUI

						self.stockApi.monthk({
							symbol: "000001.sh"
						},function(data) {
							console.log("data",data);
						})
						
						// google.charts.load('current', {'packages':['corechart']});
						// google.charts.setOnLoadCallback(drawChart);
					}					
				},

				qdC: {
					html: function() {

						return '<section class="content"> ' +
						' <div><span>今收</span><span name="price"></span></div>' +
						' <div><span>今開</span><span name="open"></span></div>' +
						' <div><span>最高</span><span name="hi"></span></div>' +
						' <div><span>最低</span><span name="low"></span></div>' +
						' <div><span>今量</span><span name="qty"></span></div>' +
						'</section>';
					},
					init: function() {
						
					}					
				},

				qdD: {
					html: function() {
						return '<input name="k-cate" type="radio"><input name="k-cate" type="radio"><input name="k-cate" type="radio"><input name="k-cate" type="radio"><input name="k-cate" type="radio"><input name="k-cate" type="radio">';
					},
					init: function() {
						
					}					
				},

				qdE: {
					html: function() {
						return '<div></div>' +
						'<div><span name="lastPrice"></span>' + 
						'	<span><span>高:</span><span name="highPrice"></span></span>' + 
						'	<span><span>開:</span><span name="openPrice"></span></span>' + 
						'	<span><span>量:</span><span><span name="volume"></span>萬</span></span></div>' + 
						'<div><span><span name="volumeRatio"></span><span><span name="amplitudeRate"></span><span>%</span></span></span>' + 
						'	<span><span>低:</span><span name="lowPrice"></span></span>' + 
						'	<span><span>換:</span><span name="change"></span></span>' + 
						'	<span><span>額:</span><span><span name="amount"></span>萬</span></span></div>' +
						'<div><span><span>上漲家數：</span><span name="">44</span></span>' + 
						'	<span><span>平盤家數：</span><span name="">55</span></span>' + 
						'	<span><span>下跌家數：</span><span name="">66</span></span></div>'
						;
					},
					init: function() {
						var self = this, // this => bind stockUI
							viewObj = self.stockView.map.qdE;

						viewObj.render = function() {
							var qdData = self.stockView.map["quoteDetail"].data;
							viewObj.elem.getElementsByTagName('div')[0].innerHTML = qdData.name + "(" + qdData.symbol + ")";

							if(Object.keys(qdData).length > 0) {
								viewObj.elem.querySelectorAll("[name]").forEach(function(thisElem) {
									// thisElem.addClass("red");
									thisElem.innerHTML = qdData[thisElem.getAttribute("name")] || "";
								});
							}
						}
					}					
				}
			}
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

				return self.assign(argObj);

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

			// 比較原來的選股 沒有就刪除
			// var symbolStr = self.stockView.map.qlA_input.elem.value || self.defaultSymbol;
			// Object.keys(self.stockView.map).filter(function (viewId) {
			// 	return viewId.indexOf("quote_") === 0;
			// }).forEach(function (viewId) {
			// 	if(symbolStr.indexOf(viewId.split("_")[1]) < 0) {
			// 		self.stockView.map[viewId].remove();
			// 	}
			// });

			// self.stockView.map.qlA_input.elem.value = "";

			self.stockApi.quote({
				symbol: self.defaultSymbol
			},function(rspObj){
				console.log("quote",rspObj);
				var dataArr = rspObj.apiData;
					viewIdArr = [];

				if(rspObj.isSuccess !== true) return;
				
				dataArr.forEach(function(stockObj) {
					if(stockObj.status === "") return;

					var viewId = "quote_" + stockObj.symbol;

					viewIdArr.push(viewId);

					if(self.stockView.map[viewId] === undefined) {

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
									var viewObj = self.stockView.map[viewId];
									// var tempPrice = Math.floor((parseInt(this.data.price) + (Math.random()*100 -50))*100)/100;
									viewObj.elem.getElementsByTagName("td")[0].innerHTML = viewObj.data.name;
									viewObj.elem.getElementsByTagName("td")[1].innerHTML = viewObj.data.lastPrice;
									viewObj.elem.getElementsByTagName("td")[2].innerHTML = function(){
										if(+viewObj.data.openPrice === 0) 
											var diffPct = "--", diffClass = "";
										else
											var diffPct = Math.round(((viewObj.data.lastPrice - viewObj.data.openPrice) / viewObj.data.openPrice) * 10000) / 100 + "%",
												diffClass = diffPct === "0%" ? "" : (diffPct < 0 ? "fall" : "rise");


										return '<div class="change ' + diffClass + '">' + diffPct + '</div>';
									}();
									self.mainElement.getElementsByTagName('tbody')[0].appendChild(viewObj.elem);
								}
							}(viewId)
						});
					} else {
						self.stockView.map[viewId].data = stockObj;
					}
				}); 

				viewIdArr.forEach(function(thisViewId) {
					self.stockView.map[thisViewId].render();
				});
			});

		// return quoteInterval }(),3000); // end of setInterval
	}


	function drawChart(argObj) {
		var argObj = {
				dataArr: [
					['操', 20, 28, 38, 45],
					['Tue', 31, 38, 55, 66],
					['Wed', 50, 55, 77, 80],
					['Thu', 77, 77, 66, 50],
					['Fri', 68, 66, 22, 15]
				],
				options: {
					hAxis: {
						textPosition: 'none'
					},
					bar: { groupWidth: '20px' }, // Remove space between bars.
						candlestick: {
					    	fallingColor: { strokeWidth: 0, fill: 'greed' }, // red
					    	risingColor: { strokeWidth: 0, fill: 'red' }   // green
						}
					}
			};

		var data = google.visualization.arrayToDataTable(argObj.dataArr, true);
		var chart = new google.visualization.CandlestickChart(argObj.elem);

		chart.draw(data, options);
	};


	function removeView() {
		this.mapObj[this.viewId].elem.parentNode.removeChild(this.mapObj[this.viewId].elem);
		delete this.mapObj[this.viewId];
	};


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





	return StockUI;

}))
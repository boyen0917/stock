(function(name,definition){
	
	window[name] = definition();

	window.onload = function(){
		window.ui = new window[name]("stock-ui");
	}
	

}("StockUI", function() {


	var StockUI = function(myStock){

		this.stockId = "stock-ui";

		this.stockApi = new StockApi();

		this.stockView = new StockView(this); // init

		this.homePageId = "page-quoteList";

		this.historyPath = [{ pageId: this.homePageId}];


		this.init();

		// 第一步就是朝所有event 都在這裡 其他的都是customEvent
		// view 也有自己的handleEvent 是customEvent 統一管理
		this.handleEvent = function() {
			// 防連點 start
			var lastViewId,lastClickTime;
			return function(event) {
				// var viewId = event.currentTarget.dataset.ui;

				// 判斷event target 是否存在map中
				if(event.currentTarget.viewId === undefined) return;
				var viewId = event.currentTarget.viewId;

				//禁止連點
				if(lastViewId === viewId && new Date().getTime() - lastClickTime < 1000) return;
				// all event here
				switch(event.type) {
					case "click":
						// 記錄連點資訊
						lastViewId = viewId, lastClickTime = new Date().getTime();
						switch(viewId) {
							case "ui-back":
								this.historyPath.pop();
								this.changePage(this.historyPath[this.historyPath.length-1].pageId, true);
								break;

							case "qlA_submit":
								alert(this.stockView.map.qlA_input.data.val);
								break;

							default:
								if(viewId.indexOf("quote_") === 0) {
									this.showQuoteDetail(viewId);
								}
						}

						break; // end of click

					case "keypress":
						switch(viewId) {
							case "qlA_input":
								this.stockView.map.qlA_input.data.val = this.stockView.map.qlA_input.elem.value;

								break;
						}

						break; // end of keypress


				}
			}
		}();
	}

	StockUI.prototype = {

		init: function(){

			var self = this;

			// self.stockView = new StockView();

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
			self.pageInitial(self.homePageId);

			document.getElementById(self.homePageId).addClass("active");
			
		},

		pageInitial: function(pageId, hasPageHeader) {
			var self = this,
				cpntPageId = pageId.split("-")[1],
				pageElem = document.getElementById(pageId);


			self.stockView.assign({
				viewId: pageId,
				elem: pageElem,
				renderNow: function() {
					// 該頁面的成員 去畫面中尋找 並進行初始化
					Object.keys(self.stockView.pageComponentMap[cpntPageId]).forEach(function(cpntId) {
						var cpntObj = self.stockView.pageComponentMap[cpntPageId][cpntId];
						if(document.getElementById(cpntId) === null) return;

						// 寫入component html
						document.getElementById(cpntId).innerHTML = cpntObj.html();

						self.stockView.assign({
							viewId: cpntId,
							elem: document.getElementById(cpntId),
							init: cpntObj.init.bind(self)
						});
					})
				}
			});

			// 非首頁 
			if(hasPageHeader !== undefined) self.prependPageHeader(pageId);
		},

		prependPageHeader: function(pageId) {
			var self = this,
				pageElem = document.getElementById(pageId),
				pageHeaderElem = pageElem.getElementsByClassName('page-header')[0],
				viewId = "page-header-" + pageId.split("-")[1];

			if(pageHeaderElem === undefined) {

				self.stockView.create({
					viewId: viewId,
					html: '<section class="page-header">' +
						'<button><img src="img/arrow-l.png"></button>' +
						'<div></div>' +
					'</section>',
					eventBinding: function(elem) {
						self.stockView.assign({
							viewId: "ui-back",
							elem: elem.getElementsByTagName('button')[0],
							eventBinding: function(btnElem) {
								btnElem.addEventListener("click",self);
							}
						})
					},
					render: function(elem) {
						console.log("vv", self.stockView.map[viewId].data);
						elem.getElementsByTagName('div')[0].innerHTML = self.stockView.map[viewId].data;
					}
				});

				pageHeaderObj = self.stockView.map[viewId];
				// 只insert 1次 所以寫在外面
				pageElem.insertBefore(pageHeaderObj.elem, document.getElementById(pageId).firstChild);
				pageHeaderObj.render();
			// } else {
			// 	var headerElem = pageElem.getElementsByClassName('page-header')[0];
			// 	headerElem.parentNode.removeChild(headerElem);
			}
		},


		showQuoteDetail: function(fromViewId) {
			var qd = "page-quoteDetail",
				fromViewIdObj = this.stockView.map[fromViewId];

			this.pageInitial(qd, true);

			// page title
			this.stockView.map["page-header-quoteDetail"].data = '<div>' + fromViewIdObj.data.name + '</div><div style="font-size:12px;">' + fromViewIdObj.data.symbol + '</div>';

			this.changePage(qd);
		},
 
		changePage: function(pageId,isBack) {
			var self = this;

			var direction = (isBack || false) ? "prev" : "next",
				nextPage = self.stockView.map[pageId].elem;
				deferred = self.stockApi.deferred();

			document.querySelectorAll("section[data-role=page].active")[0].removeClass("active");

			nextPage.addClass(direction);
			setTimeout(function(){
				nextPage.addClass("active");
				nextPage.removeClass(direction);

				if(isBack !== true) self.historyPath.push({ pageId: pageId})
			},50);
			

			return deferred;
		}
	};


	var StockView = function() {

		this.map = {}; // all views here

		this.historyPath = [];

	}

	StockView.prototype = {

		pageComponentMap: {
			quoteList: {
				qlA: {
					html: function() {
						return '<section class="search">' +
						'	<span class="input"><input placeholder="請輸入股票名稱/代號/首字母"></span>' +
						'	<span class="button"><button class="edit">送出</button></span>' +
						'</section>';
					},
					init: function() {
						var self = this,
							view = this.stockView.map.qlA.elem;

						// 輸入股票event
						self.stockView.assign({
							viewId: "qlA_input",
							elem: view.getElementsByTagName("input")[0],
							eventBinding: function(thisElem) {
								thisElem.addEventListener("keypress",self);
							}
						})

						// 送出event
						self.stockView.assign({
							viewId: "qlA_submit",
							elem: view.getElementsByTagName("button")[0],
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

						viewObj.elem.querySelectorAll("[name]").forEach(function(thisElem) {

						});
					}					
				},

				qdB: {
					html: function() {
						return '<section class="k-chart">k線圖</section>'
					},
					init: function() {
						var self = this; // this => bind stockUI
					}					
				},

				qdC: {
					html: function() {
						return '<section class="content"> ' +
						' <div><span>今開</span><span class="green">2814.65</span></div>' +
						' <div><span>昨收</span><span class="red">2821.05</span></div>' +
						' <div><span>最高</span><span class="">2814.65</span></div>' +
						' <div><span>最低</span><span class="">2814.65</span></div>' +
						'</section>';
					},
					init: function() {
						
					}					
				},

				qdD: {
					html: function() {
						return ' <span>分時</span><span>K線</span>';
					},
					init: function() {
						
					}					
				}
			}
		},

		create: function(opObj) {
			// try {
				var self = this;
					elem = document.createElement(opObj.tag || "div"),
					viewId = opObj.viewId || (new Date()).getTime();

				if(opObj.html !== undefined) elem.innerHTML = opObj.html;

				// 表示只取裡面的html
				if(opObj.tag === undefined) {
					elem = elem.children[0];
				} else {
					Object.keys(opObj.attr || {}).forEach(function(key) {
						switch(key) {
							case "style":
								var styleObj = opObj.attr[key],
									styleStr = "";
								Object.keys(styleObj).forEach(function(key) {
									styleStr += key + ":" + styleObj[key] + ";";
								});
								opObj.attr[key] = styleStr;
								break;

							default:
								elem.setAttribute(key,opObj.attr[key]);		
								break;
						};
					});
				}

				elem.dataset.ui = viewId;

				Object.keys(opObj.dataset || {}).forEach(function(key) {
					if(key !== "ui") elem.dataset[key] = opObj.dataset[key];
				});

				opObj.elem = elem;
				opObj.viewId = viewId;

				return self.assign(opObj);

			// } catch(e) {
			// 	throw "StockUI createView syntax error";
			// 	console.log(opObj);
			// 	return false;
			// }
		},

		assign: function(opObj) {
			var elem = opObj.elem;

			elem.viewId = opObj.viewId;

			this.map[opObj.viewId] = {
				elem: elem,
				data: opObj.data || {},
				// opObj.render存在 return bind 
				render: opObj.render !== undefined ? opObj.render.bind(this, elem) : (opObj.renderNow ? opObj.renderNow.bind(this, elem) : undefined)
				// function() {
				// 	if(opObj.render !== undefined) {
				// 		return opObj.render.bind(this, elem);
				// 	} else if(opObj.renderNow !== undefined) {
				// 		return opObj.renderNow.bind(this, elem)
				// 	}
				// }()
			};

			// event binding
			if(typeof opObj.eventBinding === "function") opObj.eventBinding(elem);
			// console.log(opObj);
			// render now
			if(typeof opObj.renderNow === "function") opObj.renderNow(elem);

			// is Page Component init
			if(typeof opObj.init === "function") opObj.init();
		},

	};


	function getQuoteListView() {
		var self = this;

		if(self.stockView.map.qlB === undefined) return;

		// ajax interval
		// setInterval(function quoteInterval() {
		
			self.stockApi.quote({
				symbol: "000001.sh,399001.sz,00001.hk,00379.hk,00145.hk,00552.hk"
			},function(data){

				var contentObj = data[Object.keys(data)[0]],
					viewIdArr = [];

				if(contentObj.isSuccess !== true) return;
				console.log(contentObj.data);
				Object.keys(contentObj.data).forEach(function(key) {
					
					var stockObj = contentObj.data[key]
						viewId = "quote_" + key;

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
									var tempPrice = viewObj.data.price;
									viewObj.elem.getElementsByTagName("td")[0].innerHTML = viewObj.data.name;
									viewObj.elem.getElementsByTagName("td")[1].innerHTML = tempPrice;
									viewObj.elem.getElementsByTagName("td")[2].innerHTML = function(){
										if(+viewObj.data.open === 0) 
											var diffPct = "--", diffClass = "";
										else
											var diffPct = Math.round(((tempPrice - viewObj.data.open) / viewObj.data.open) * 10000) / 100 + "%",
												diffClass = diffPct === "0%" ? "" : (diffPct < 0 ? "fall" : "rise");


										return '<div class="change ' + diffClass + '">' + diffPct + '</div>';
									}();
									self.mainElement.getElementsByTagName('tbody')[0].appendChild(viewObj.elem);
								}
							}(viewId)
						});
					} else {
						viewObj.data = stockObj;
					}
				}); 
				console.log("viewIdArr",viewIdArr);
				viewIdArr.forEach(function(thisViewId) {
					self.stockView.map[thisViewId].render();
				});
			});

		// return quoteInterval }(),3000); // end of setInterval
	}
	


	// tool
	Element.prototype.addClass = function(cn){
		this.className += " " + cn;
	},

	Element.prototype.removeClass = function(cn){
		var tempArr = this.className.split(" ");
		if(tempArr.indexOf(cn) < 0 ) return;

		tempArr.splice(tempArr.indexOf(cn),1);
		this.className = tempArr.join(" ");
	}





	return StockUI;

}))
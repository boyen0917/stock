(function(name,definition){
	
	window[name] = definition();

	window.onload = function(){
		window[name].init("my-stock");
	}
	

}("StockUI", function() {

	// var StockUI = function(domId){

	// 	var self = this;
	// 	self.init(domId);

	// };

	var StockUI = {

		keyID: "my-stock",

		stockApi: new StockApi(),

		// 第一步就是朝所有event 都在這裡 其他的都是customEvent
		handleEvent: function() {

			// 防連點
			var lastViewId,lastClickTime;

			return function(event) {

				var viewId = event.currentTarget.dataset.ui;

				//禁止連點
				if(lastViewId === viewId && lastClickTime-(new Date().getTime()) < 1000) return;

				switch(event.type) {
					case "click":

						// 記錄連點資訊
						lastViewId = viewId, lastClickTime = new Date().getTime();

						switch(viewId) {

							case "ui-back":
								this.changePage("page-quoteList",true);
							break;

							default:

								if(viewId.indexOf("quote_") === 0) {
									this.showQuoteDetail(viewId);
								}
						}
					break;
				}
			}
				
		}(),


		init: function(domId){

			var self = this;

			self.mainDom = document.getElementById(domId);

			try {
				if( self.mainDom instanceof HTMLElement === false
					|| window.StockApi === undefined
				) return;

			} catch(e) {
				return;
			}

			// initial page

			Viewer.create({
				viewId: "stock-ui",
				tag: "section",
				attr: { id: "stock-ui" },
				renderNow: function(element) {
					self.mainDom.appendChild(element);
				}
			});

			// quoteList page

			Viewer.create({
				viewId: "page-quoteList",
				tag: "section",
				attr: {
					id: "page-quoteList",
					class: "active"
				},
				dataset: {role: "page"},
				html: self.quoteListHtml(),
				eventBinding: function(element) {
					// element.querySelectorAll("section.page-header > button")[0].addEventListener("click",self);
				},
				renderNow: function(element) {
					document.getElementById("stock-ui").appendChild(element);
				}
			});
			
			// ajax interval
			setInterval(function quoteInterval() {
			
				self.stockApi.quote({
					symbol: "000001.sh,399001.sz,00001.hk,00379.hk,00145.hk,00552.hk"
				},function(data){

					var contentObj = data[Object.keys(data)[0]];

					if(contentObj.isSuccess !== true) return;

					Object.keys(contentObj.data).forEach(function(key) {
						var stockObj = contentObj.data[key];

						if(Viewer.map["quote_"+key] === undefined) {

							Viewer.create({
								viewId: "quote_" + key,
								tag: "tr",
								html: '<td></td><td></td><td></td>',
								data: stockObj,

								eventBinding: function(element) {
									element.addEventListener("click",self);
								},

								render: function() {
									// var tempPrice = Math.floor((parseInt(this.data.price) + (Math.random()*100 -50))*100)/100;
									var tempPrice = this.data.price;
									this.element.getElementsByTagName("td")[0].innerHTML = this.data.name;
									this.element.getElementsByTagName("td")[1].innerHTML = tempPrice;
									this.element.getElementsByTagName("td")[2].innerHTML = function(){
										var diffPct = Math.round(((tempPrice - this.data.open) / this.data.open) * 10000) / 100;
										return '<div class="change ' + (diffPct < 0 ? "fall" : "rise") + '">' + diffPct + '%</div>';
									}.call(this);

									self.mainDom.getElementsByTagName('tbody')[0].appendChild(this.element);
								}
								
							});
						} else {
							Viewer.map["quote_"+key].data = stockObj;
						}
					}); 
					
					Object.keys(Viewer.map).forEach(function(key) {

						if(key.indexOf("quote_") === 0) {

							Viewer.map[key].render();
						}
					});
				});

			return quoteInterval }(),3000);
		},

		
		showQuoteDetail: function(viewId) {
			// console.log("showQuoteDetail viewId",viewId);
			this.changePage("page-quoteDetail");
		},


		changePage: function(pageId,isReverse) {
			var self = this,
				direction = (isReverse || false) ? "prev" : "next",
				deferred = self.stockApi.deferred();
			// console.log("changePage",self.mainDom.querySelectorAll("section[data-role=page]"));
			// console.log("this",self);
			if(document.getElementById(pageId) === null) {

				Viewer.create({
					viewId: pageId,
					tag: "section",
					attr: {id: pageId },
					dataset: {role: "page"},
					html: self.quoteDetailHtml(),
					eventBinding: function(element) {
						element.querySelectorAll("section.page-header > button")[0].addEventListener("click",self);
					},
					renderNow: function(element) {
						document.getElementById("stock-ui").appendChild(element);
					}
				});
			}

			document.querySelectorAll("section[data-role=page].active")[0].removeClass("active")
			Viewer.map[pageId].element.addClass(direction);
			setTimeout(function(){
				Viewer.map[pageId].element.removeClass(direction);
				Viewer.map[pageId].element.addClass("active");
			},50);
			

			return deferred;
		},

		quoteListHtml: function() {
			return '<section class="search">' +
			'		<span class="input"><input placeholder="請輸入股票名稱/代號/首字母"></span>' +
			'		<span class="button"><button class="edit">編輯</button></span>' +
			'	</section>' +
			'	<section class="stock-table">' +
			'		<table>' +
			'			<thead>' +
			'				<tr>' +
			'					<th>名稱代碼</th>' +
			'					<th>最新價</th>' +
			'					<th>漲跌幅</th>' +
			'				</tr>' +
			'			</thead>' +
			'			<tbody>' +
			'		</table>' +
			'</section>';
		},

		quoteDetailHtml: function() {
			return '<section class="page-header">' +
			'		<button data-ui="ui-back"><-</button>' +
			'		<div><div>上證指數</div><div>SH000001</div></div>' +
			'	</section>' +
			'	<section class="title">title' +
			'	</section>' +
			'	<section class="content">content' +
			'	</section>' +
			'	<section class="footer">footer' +
			'</section>';
		}

	}


	window.Viewer = {

		map: {}, // all views here

		create: function(opObj) {
			// try {
				var self = this;
					element = document.createElement(opObj.tag || "div"),
					viewId = opObj.viewId || (new Date()).getTime();

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
							element.setAttribute(key,opObj.attr[key]);		
							break;
					};
				});

				element.dataset.ui = viewId;

				if(opObj.html !== undefined) element.innerHTML = opObj.html;
				
				if(opObj.dataset !== undefined) {
					Object.keys(opObj.dataset).forEach(function(key) {
						element.dataset[key] = opObj.dataset[key];
					});
				}

				opObj.element = element;
				opObj.viewId = viewId;

				return self.assign(opObj);

			// } catch(e) {
			// 	throw "StockUI createView syntax error";
			// 	console.log(opObj);
			// 	return false;
			// }
		},

		assign: function(opObj) {
			// event binding
			if(typeof opObj.eventBinding === "function") opObj.eventBinding(opObj.element);
			// console.log(opObj);
			// render now
			if(typeof opObj.renderNow === "function") opObj.renderNow(opObj.element);

			this.map[opObj.viewId] = {
				element: opObj.element,
				data: opObj.data || {},
				render: opObj.renderNow || (function() { return opObj.render.call(this) })
			};

			return opObj.viewId;
		},


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
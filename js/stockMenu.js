
(function(definition){

	var component = definition();
	stockUIObj.setComponent("stockMenu", component);

}(function() {
	return {
		smA: {
			html: function() {
				return '<div><img src="img/qmi.png"><span>水晶股市</span></div>';
			},
			init: function() {

			}
		},

		smB: {
			html: function() {
				return '';
			},
			init: function() {
				var content = ["行情中心","沪深股市","沪港通","香港股市"],
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
				return '<div class="sm-block">手机水晶森林</div>';
			},
			init: function() {
			}
		},

		smD: {
			html: function() {
				return '<div class="sm-block">我要提意见</div>';
			},
			init: function() {
			}
		},

		smE: {
			html: function() {
				return '<div class="sm-block">关闭左侧导航</div>';
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
	}
}))
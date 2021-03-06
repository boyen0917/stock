
(function(name,definition){

	window[name] = definition();

}("StockApi", function() {


	window.StockGlobal = {

		domain: "sseap.mitake.com.cn",

		des3Key: "b68384a66092849f10f72d0e",

		authLockDef: MyDeferred()

	}

	// usage

	// var stockObj = new StockApi();

	// stockObj.getV1Quote()


	 var StockApi = function(args) {
		// = "000001.sh,399001.sz,00001.hk"
		var self = this;

		// k線圖
		self.caseK = "v2/m5,v2/m15,v2/m30,v2/m60,v2/m120,v2/dayk,v2/weekk,v2/monthk";

		// auth

		// self.auth();


		// api list

		self.quote = function(optionObj,cb){
			self.api({
				apiName: "v2/quote",
				symbol: optionObj.symbol,
				callback: cb
			})
		};

		self.cateranking = function(optionObj,cb){
			self.api({
				apiName: "v2/cateranking",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.revcateranking = function(optionObj,cb){
			self.api({
				apiName: "v2/revcateranking",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.catequote = function(optionObj,cb){
			self.api({
				apiName: "v2/catequote",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		
		self.quotentrd1 = function(optionObj,cb){
			self.api({
				apiName: "v2/quotentrd1",
				symbol: optionObj.symbol,
				callback: cb
			});
		};


		self.search = function(optionObj,cb){
			console.log("optionObj.param=>"+optionObj.param);
			self.api({
				apiName: "v1/search",
				symbol:null,
				param: optionObj.param,
				callback: cb
			});
		};

		self.line = function(optionObj,cb){
			self.api({
				apiName: "v2/line",
				symbol: optionObj.symbol,
				callback: cb
			});
		};
		self.line5d = function(optionObj,cb){
			self.api({
				apiName: "v2/line5d",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.m5 = function(optionObj,cb){
			self.api({ // 5 15 30 60 120
				apiName: "v2/m5",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.m30 = function(optionObj,cb){
			self.api({ // 5 15 30 60 120
				apiName: "v2/m30",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.m60 = function(optionObj,cb){
			self.api({ // 5 15 30 60 120
				apiName: "v2/m60",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.m120 = function(optionObj,cb){
			self.api({ // 5 15 30 60 120
				apiName: "v2/m120",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.dayk = function(optionObj,cb){
			self.api({ // 5 15 30 60 120
				apiName: "v2/dayk",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.weekk = function(optionObj,cb){
			self.api({
				apiName: "v2/weekk",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

		self.monthk = function(optionObj,cb){
			self.api({
				apiName: "v2/monthk",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

	}


	StockApi.prototype = {

		auth: function() {
			// 401 重新做auth 只限一次
			var auth401Flag = false;
			return function() {
				var self = this,
					deferred = self.deferred(),
					authDeferred = self.deferred(),
					isExpired = function() {
						return new Date().getTime() > (StockGlobal.authExpiredTime || 9999999999999)
					}();

				// console.log("now,et,isExpired",new Date().getTime(), StockGlobal.authExpiredTime,isExpired);

				if(StockGlobal.token === undefined || isExpired) {

					self.api({
						apiName: "v1/service/echo",
						noHeaders: true
					}).done(function(rspObj){

						var echo = rspObj.data.getResponseHeader("t");
						console.log("echo", echo);
						if(echo === null) {
							deferred.reject();
							return;
						}

						self.api({
							apiName: "v1/service/auth",
							noHeaders: true,
							method: "post",
							body: DES3.encrypt(StockGlobal.des3Key, JSON.stringify({"bid":"168","platform":"AndroidPhone","brand":"Xiaomi","device":"MI4LTE","os":"6.0.1","hid":"7f17913f4975c70edadbb57a865372022805425","name":"com.chi.dev","ver":"61","appkey":"FTB92rC2gpdY1y4IyWrGBcsA8Mo0h3CvQezE9txN3rg=","timestamp":echo}))
						}).done(function(rspObj){
							if(rspObj.data.status === 401) {
								console.log("auth err 401");
								if(auth401Flag === false) {
									auth401Flag = true;
									self.auth().done(function() {
										deferred.resolve();
										StockGlobal.authLockDef.resolve();
									})
								} else {
									deferred.reject();
								}
								return;
							}

							var authObj = JSON.parse(DES3.decrypt(StockGlobal.des3Key, rspObj.apiData));
							if(authObj.token === undefined) return;

							StockGlobal.token = authObj.token;
							StockGlobal.auth = authObj;
							StockGlobal.authExpiredTime = +echo + 8*60*60*1000;

							deferred.resolve();
							StockGlobal.authLockDef.resolve();
							
						});
					})
				} else {
					deferred.resolve();
				}

				deferred.done(authDeferred.resolve)
				.fail(function() {
					alert("验证错误");
				})

				return authDeferred;
			}
		}(),

		api: function(args) {
			var self = this,
				deferred = self.deferred();
				apiDeferred = self.deferred();

			if(args.noHeaders === true) deferred.resolve();
			else {
				// auth lock -> auth -> api 
				StockGlobal.authLockDef.done.call(self, self.auth().done.bind(self, deferred.resolve))
			}

			deferred.done(function() { 

				new MyAjax(args).done(function(rspObj) {
					if(rspObj.isSuccess === true) 
						rspObj.apiData = self.toArray(args.apiName, rspObj.data.responseText, args.symbol);
					else 
						rspObj.apiData = {};
					
					rspObj.args = args;

					if(rspObj.apiData.length==1) rspObj.apiData = rspObj.apiData[0];
					
					if(typeof args.callback === "function") args.callback(rspObj);

					apiDeferred.resolve(rspObj);
				});
				
			})
			return apiDeferred;
		},

		getItemsFormatArr: function(apiName,segments){
			var self = this, itemObj = {};
			// return [name, isDecode, isPrice]
			switch(apiName) {
				case caseMatch("v2/quote,v2/cateranking,v2/revcatequote,v2/catequote"):
					return [
						["status",		false,false],	["symbol",			false,false],	["name",			false,false],	["datetime",	true ,true ],	["pinyin",		false,false],				
						["market",		false,false],	["subtype",			false,false],	["lastPrice",		true ,true ],	["highPrice",	true ,true ],	["lowPrice",	true ,true ],		
						["openPrice",	true ,true ],	["preClosePrice",	true ,true ],	["changeRate",		true ,true ],	["volume",		true ,true ],	["nowVolume",	true ,true ],		
						["turnoverRate",true ,true ],	["limitUp",			true ,true ],	["limitDown",		true ,true ],	["averageValue",true ,true ],	["change",		true ,true ],
						["amount",		true ,true ],	["volumeRatio",		false,false],	["buyPrice",		true ,true ],	["sellPrice",	true ,true ],	["buyVolume",	true ,true ],			
						["sellVolume",	true ,true ],	["totalValue",		true ,true ],	["flowValue",		true ,true ],	["netAsset",	false,false],	["pe",			true ,true ],				
						["roe",			true ,true ],	["captitalization",	true ,true ],	["circulatingShare",true ,true ],	["buyPrices",	true ,true ],	["sellPrices",	true ,true ],		
						["buyVolumes",	true ,true ],	["sellVolumes",		true ,true ],	["amplitudeRate",	false,false],	["receipts",	false,false]
					]; //30-39};;

					break;
				case caseMatch("v1/search,v2/search"):
					return [["symbol"],["name"],["pinyin"],["type"],["f"]];
					break;

				case caseMatch(self.caseK):
					// 日期[2]时间[2]开[2]高[2]低[2]收[2]量[2]参考价[3]
					return [["date", true, false],["time", true, false],["open", true, true],["high", true, true],["low", true, true],["last", true, true],["volume", true, false],["prefPrice", true, true]];
					break;

				case caseMatch("v2/line,v2/line5d"):
					// 最新价[2]成交量[2]时间[2]均价[3]
					return [["lastPrice", true, true],["volume", true, false],["time", true, false],["avgPrice", true, true]];
					break;

				default:
					return false;
			}

			function caseMatch(apiStr) {
				 return apiStr.split(",")[apiStr.split(",").indexOf(apiName)];
			}
		},
		toArray: function(apiName, oriStr, symbol){

			var self = this;
			return oriStr.split('\u0004').map(function(segments, i4) {
				var formatArr = self.getItemsFormatArr(apiName,i4);
				if(formatArr === false) return oriStr;

				return segments.split('\u0003').map(function(rows, i3){
					return rows.split('\u0002').reduce(function(obj, item, i2, oriArr) {
						// 資料多過預期數量
						if(formatArr[i2] === undefined) return obj;
						// isDecode
						if(formatArr[i2][1]) item = base93decodeString(item);
						// isPrice
						if(formatArr[i2][2]){
							switch(apiName) {
								case caseMatch("v2/quote,v2/cateranking,v2/revcateranking,v2/catequote"):
									item = priceStrFormat(item, oriArr[1]);
								break;
								case caseMatch(self.caseK):
									item = priceStrFormat(item, symbol);
								break;
								case caseMatch("v2/line,v2/line5d"):
									item = priceStrFormat(item, symbol);
								break;

							}
						}
						obj[formatArr[i2][0]]= item;
						return obj;
					},{})
				});
			});
			function caseMatch(apiStr) {
				 return apiStr.split(",")[apiStr.split(",").indexOf(apiName)];
			}
		},

		resultFormat: function(isSuccess,msg,data) {
			return {
				isSuccess: isSuccess,
				data: data,
				msg: msg
			}
		},

		deferred: function() {
			return MyDeferred();
		}
	}


	var MyAjax = function(args){

		var self = this;

		self.newArgs = {

			url: function(){
				// 指定url 
				if(args.url !== undefined) 
					return args.url;
				else
					return "http://" + self.domain + "/" + args.apiName ;
			}(),

			headers: function() {
				// 指定headers 
				if(args.specifiedHeaders !== undefined) return args.specifiedHeaders;

				var newHeaders = {};

				// 添加外部headers
				if(args.headers !== undefined) {
					$.extend(newHeaders, args.headers);
				}

				// 設定預設值
				newHeaders.Token = StockGlobal.token;
				if(args.symbol){
					newHeaders.Symbol = args.symbol;
				}
				if(args.param){
					newHeaders.Param = args.param;
				}
				// newHeaders.Param 

				return newHeaders;
			}(),

			timeout: 100000,

			type: args.method || "get"
		};

		// no headers
		if(args.noHeaders === true) delete self.newArgs.headers;

		// 不是get 再加入body
		if(self.newArgs.type !== "get") self.newArgs.data = (typeof args.body === "string") ? args.body : JSON.stringify(args.body);

		// 將args帶來的多的參數補進去newArgs
		Object.keys(args).forEach(function(argsKey){
			if(self.newArgs.hasOwnProperty(argsKey) === false)
				self.newArgs[argsKey] = args[argsKey];
		});

		var completeCB,successCB,errorCB,
			ajaxDeferred = $.Deferred();
		// 執行
		$.ajax(self.newArgs).complete(function(completeData) {
			completeData.ajaxArgs = self.newArgs;

			if(completeData.status === 200) {
				ajaxDeferred.resolve({
					isSuccess: true, 
					data: completeData
				});
			} else {
				ajaxDeferred.resolve({
					isSuccess: false, 
					data: completeData
				});
			}
		});

		// 先搜集好callback 如果有呼叫 deferred完成後就執行
		(function(){
			ajaxDeferred.promise().complete = function(cb) {
				completeCB = cb;
				return ajaxDeferred.promise();
			};

		    ajaxDeferred.promise().success = function(cb) {
		        successCB = cb;
		        return ajaxDeferred.promise();
		    };

			ajaxDeferred.promise().error = function(cb) {
				errorCB = cb;
				return ajaxDeferred.promise();
			};
		}())

		// success 來這裡
		ajaxDeferred.done(function(result){

			// try {
			// 	console.log("result", result);
			// 	var responseObj = JSON.parse(result.data.responseText);
			// } catch(e) {
			// 	var responseObj = "unknown error";
			// }
        	

			// // callback execute
			// if(typeof self.newArgs.callback === "function") self.newArgs.callback({ isSuccess: result.isSuccess, data: responseObj});


			// 成功失敗 都complete
			self.onComplete(result.data);

			if(completeCB instanceof Function) completeCB(result.data);

			if(result.isSuccess === true) {
				// self.onSuccess(result.data);	

				if(successCB instanceof Function) {
		    		responseObj.ajaxArgs = result.data.ajaxArgs;

		        	successCB(responseObj);
		        }
			} else {

				if(errorCB instanceof Function) errorCB(result.data);
				else self.onError(result.data);
			}

	    })

		return ajaxDeferred.promise();
	} // end of MyAjax




	MyAjax.prototype = {

		domain: StockGlobal.domain,

		onSuccess: function(data) {

			return;
		},

		onError: function(errData){
			// 不做錯誤顯示
			if(this.newArgs.noError === true) return;

			// 401
			if(errData.status == 401){

				return;
			}
		},
			
		onComplete: function(data) {

			return;
		}

	}

	function MyDeferred() {
		return $.Deferred();

		// var myResolve,myReject;
		// var myPromise = new Promise(function(resolve, reject){
		// 	myResolve = resolve;
		// 	myReject = reject;
		// });

		// myPromise.resolve = myResolve;
		// myPromise.reject = myReject;
		// return myPromise;
	}
	
		


	return StockApi;

}))
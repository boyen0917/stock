
(function(name,definition){

	window[name] = definition();

}("StockApi", function() {


	window.StockGlobal = {

		token: "MitakeWeb"

	}

	// usage

	// var stockObj = new StockApi();

	// stockObj.getV1Quote()


	 var StockApi = function(args) {
		// = "000001.sh,399001.sz,00001.hk"
		var self = this,
			symbol,
			serverIpArr = self.getServerListIpArr();


		// self.init();


		// api list

		self.quote = function(optionObj,cb){
			self.ajax({
				apiName: "v2/quote",
				symbol: optionObj.symbol,
				serverIpArr: serverIpArr,

				// parse map 

				callback: cb
			});
		};

	}


	StockApi.prototype = {

		getServerListIpArr: function(){
			return ServerList.sites.map(function(item){
				return item.ip
			});
		},

		

		parser: function(oriStr){

			return oriStr.split('\u0003').reduce(function(obj,curr){
	            var items = curr.split('\u0002'),
	            	symbol = items[1],
	              	time = datetimeStrFormat(base93decodeString(items[3]));

	            if(symbol !== undefined) {
	            	obj[symbol] = {
			            symbol: symbol,
			            symbolkey: dotToUl(symbol),
			            name: items[2],
			            time: time,
			            price: priceStrFormat(base93decodeString(items[7]),items[5]+items[6]),
			            hi: priceStrFormat(base93decodeString(items[8]),items[5]+items[6]),
			            open: priceStrFormat(base93decodeString(items[10]),items[5]+items[6]),
			            qty: parseInt(base93decodeString(items[13])/10000)+"萬",
			            diff: priceStrFormat(base93decodeString(items[7])-base93decodeString(items[11]),items[5]+items[6]),
			            diffpre: "",
			            low: priceStrFormat(base93decodeString(items[9]),items[5]+items[6]),
			            ch: base93decodeString(items[15]),
			            money: parseInt(base93decodeString(items[20])/100000000)+"億",
			            overtime: compareDateTime(time)
			        }
	            }
		        return obj;
			},{});
		},


		ajax: function(ajaxArgs) {
			var self = this,
				deferred = $.Deferred(),
				serversDefArr = [];

			if(ajaxArgs.symbol === undefined) {

				serversDefArr[serversDefArr.length] = this.resultFormat(false,"no symbol");

			} else if(ajaxArgs.serverIpArr instanceof Array === false) {

				serversDefArr[serversDefArr.length] = this.resultFormat(false,"serverIpArr is not an array");

			} else {

				ajaxArgs.serverIpArr.forEach(function(ip) {
					serversDefArr[serversDefArr.length] = new MyAjax({
						serverIp: ip,
						apiName: ajaxArgs.apiName,
						symbol: ajaxArgs.symbol
					})
				})
			}

			$.when.apply($, serversDefArr).done(function() {
				var resultObj = Array.prototype.reduce.call(arguments,function(obj,item){
					// console.log("item.data ajaxArgs",item.data.ajaxArgs);
					var thisObj = {};
					if(item.isSuccess === true) {
						try {
							thisObj = self.resultFormat(true,"ajax success",self.parser(item.data.responseText));	
						} catch(e) {
							thisObj = self.resultFormat(false,"parse error",item.data);
						}
						
					} else {
						thisObj = self.resultFormat(false, (item.msg || "ajax error"),item.data);
					}

					obj[item.data.ajaxArgs.serverIp] = thisObj;
					return obj;
				},{});




				deferred.resolve(resultObj);

				if(typeof ajaxArgs.callback === "function") ajaxArgs.callback(resultObj);
			})
			
			return deferred.promise();
		},

		resultFormat: function(isSuccess,msg,data) {
			return {
				isSuccess: isSuccess,
				data: data,
				msg: msg
			}
		},


		deferred: function() {
			var myResolve,myReject;
			var myPromise = new Promise(function(resolve, reject){
				myResolve = resolve;
				myReject = reject;
			});

			myPromise.resolve = myResolve;
			myPromise.reject = myReject;
			return myPromise;
		}
	}


	window.MyAjax = function(args){

		var self = this;

		self.newArgs = {

			url: function(){
				// 指定url 
				if(args.url !== undefined) 
					return args.url;
				else
					return "http://" + args.serverIp + "/" + args.apiName ;
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
				newHeaders.Symbol = args.symbol;
				// newHeaders.Param 

				return newHeaders;
			}(),

			timeout: 3000,

			type: args.method || "get"
		};

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

			// 成功失敗 都complete
			self.onComplete(result.data);

			if(completeCB instanceof Function) completeCB(result.data);

			if(result.isSuccess === true) {
				self.onSuccess(result.data);	

				if(successCB instanceof Function) {
		        	var responseObj = JSON.parse(result.data.responseText);
		    		responseObj.ajaxArgs = result.data.ajaxArgs;

		        	successCB(responseObj);
		        }
			} else {

				self.onError(result.data);

				if(errorCB instanceof Function) errorCB(result.data);
			}

	    })

		return ajaxDeferred.promise();
	} // end of MyAjax




	MyAjax.prototype = {

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


	return StockApi;

}))
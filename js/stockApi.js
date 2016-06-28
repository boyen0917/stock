
(function(name,definition){

	window[name] = definition();

}("StockApi", function() {


	window.StockGlobal = {

		domain: "180.163.112.216:22016",

		token: "MitakeWeb"

	}

	// usage

	// var stockObj = new StockApi();

	// stockObj.getV1Quote()


	 var StockApi = function(args) {
		// = "000001.sh,399001.sz,00001.hk"
		var self = this;

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

		self.monthk = function(optionObj,cb){
			self.api({
				apiName: "v2/monthk",
				symbol: optionObj.symbol,
				callback: cb
			});
		};

	}


	StockApi.prototype = {

		api: function(args){
			var self = this,
				deferred = self.deferred();

			new MyAjax(args).done(function(rspObj) {
				
				rspObj.apiData = self.toArray(args.apiName, rspObj.data.responseText);
				rspObj.args = args;
				
				if(typeof args.callback === "function") args.callback(rspObj);

				deferred.resolve(rspObj);
			});

			return deferred;

		},

		getServerListIpArr: function(){
			return ServerList.sites.map(function(item){
				return item.ip
			});
		},
		getItemsDecode:function(apiName,segments){

			var isDecode=[];

			if(apiName=="v2/quote" || apiName=="v2/cateranking" || apiName=="v2/catequote"){
				isDecode=[false,false,false,true,false,false,false,true,true,true,// 0-9
				true,true,true,true,true,true,true,true,true,true, //10-19
				true,false,true,true,true,true,true,true,false,true, //20-29
				true,true,true,true,true,true,true,false,false,true]; //30-39};
			}
			if(apiName=="v1/search"){
				isDecode=null;
			}
			return isDecode;
		},
		getItemsPrice:function(apiName,segments){
			var isPrice=[];
			if(apiName=="v2/quote" || apiName=="v2/cateranking" || apiName=="v2/catequote"){
				//需修改
				isPrice=[false,false,false,true,false,false,false,true,true,true,// 0-9
				true,true,true,true,true,true,true,true,true,true, //10-19
				true,false,true,true,true,true,true,true,false,true, //20-29
				true,true,true,true,true,true,true,false,false,true]; //30-39};
			}
			if(apiName=="v1/search"){
				isPrice=null;
			}
			return isPrice;
		},
		getItemsFormatArr: function(apiName,segments){
			var itemObj = {};
			switch(apiName) {
				case caseMatch("v2/quote,v2/cateranking,v2/catequote"):

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
					return ["symbol","name","pinyin","type","f"];
					break;

				case "v2/monthk":
					// 日期[2]时间[2]开[2]高[2]低[2]收[2]量[2]参考价[3]
					return ["date","time","ko","ke","kq","kc","volume","prefPrice"];
					break;
			}

			function caseMatch(apiStr) {
				 return apiStr.split(",")[apiStr.split(",").indexOf(apiName)];
			}
		},

		toArray: function(apiName,oriStr){
			var arr=[];
			var segments=oriStr.split('\u0004');

			for(var i=0;i<segments.length;i++){
				var rows 		= segments[i].split('\u0003'),
					rowsArr		= [],
				// var names=this.getItemsName(apiName,i);
				// var isDecode=this.getItemsDecode(apiName,i);
				// var isPrice=this.getItemsPrice(apiName,i);
					itemFormat 	= this.getItemsFormatArr(apiName,i),
					names 		= itemFormat instanceof Array ? itemFormat[0] : itemFormat,
					isDecode	= itemFormat instanceof Array ? itemFormat[1] : false,
					isPrice 	= itemFormat instanceof Array ? itemFormat[2] : false;
				
				for(var j=0;j<rows.length;j++){
					var items=rows[j].split('\u0002');
					
					var itemsRename=[];
					for(var k=0;k<items.length;k++){
						
						if(null!=isDecode && isDecode[k]){
							items[k]=base93decodeString(items[k]);
						}
						if(null!=isPrice && isPrice[k]){
							//需調整
							items[k]=priceStrFormat(items[k],items[5]+items[6])
							
						}
						itemsRename[names[k]]=items[k];
					}
					rowsArr.push(itemsRename);
				}
				arr.push(rowsArr);
			}

			if(arr.length==1){
				arr=arr[0];
			}
			
			return arr;
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


	return StockApi;

}))
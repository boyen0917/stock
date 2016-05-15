      var _apiname="dayk"; 

      $( document ).ready(function() {
        //auth("114.80.155.134:22016");
        //auth("sseap.mitake.com.cn");
        $("#api").bind("change", function(e) {
          _apiname=$(this).val();
          reShow();
        });
        reShow();
        $("#search").click(function(){
          reShow();
        });

        
      });

      var qrysymbol="";
      function auth(server_ip){
        var appkeyStr="AGaIp1tEvMs/aRG0nQlOqsRcWAYMs9lQtYXj9UhLUNA=";
        var bidStr="168";
        var platformStr="AndroidPhone";
        var brandStr="Xiaomi";
        var deviceStr="MI9";
        var osStr="4.4.4";
        var hidStr="Web";
        var nameStr="com.chi.phone";
        var varStr="99";
        var timestampStr=(new Date().getTime())+"";
        //var hash = CryptoJS.SHA3("Message");
        //console.log(hash);
        
        var bodyArr={appkey:appkeyStr,
          bid:bidStr,
          platform:platformStr,
          brand:brandStr,
          device:deviceStr,
          os:osStr,
          hid:hidStr,
          name:nameStr,
          ver:varStr,
          timestamp: timestampStr};

        var body = JSON.stringify(bodyArr).toString();
        console.log(body);
        var key = "b68384a66092849f10f72d0e";
        var keyHex = CryptoJS.enc.Utf8.parse(key);
        //CryptoJS.AES.decrypt(CryptoJS.enc.Base64.parse(texto),key,{mode:CryptoJS.mode.ECB, padding: CryptoJS.pad.Iso10126});

        var encrypted = CryptoJS.DES.encrypt("{\"a\":\"b\"}", keyHex, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        });
        //encrypted = CryptoJS.DES.encrypt("{\"a\":\"b\"}",keyHex);
        //key = CryptoJS.MD5(key);
        //var iv = CryptoJS.lib.WordArray.create(64/8);
        //var encrypted = CryptoJS.TripleDES.encrypt(body, key, {iv: iv});

        //var encodeBody=CryptoJS.TripleDES.encrypt(body, "b68384a66092849f10f72d0e");
        var encodeBody=encrypted.toString();
        console.log(" lenght= "+encodeBody.length);
        console.log(encodeBody);
        var req_url="http://"+server_ip+"/v1/service/auth";
        $.ajax({
          url: req_url,
          type: "POST",
          timeout: 3000,
          data: encodeBody,
          //dataType: "text",
          /*beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', "000001.sh");
            //xhr.setRequestHeader('Param', "1");
          },*/
          //processData: false,
          success: function(result){
            console.log(result);
          }
        });
      }

      function reShow(){
        ///request_line("sseap.mitake.com.cn","line5d");
        $("#profolio tbody tr").remove(); 
        request_line(_serverip,_apiname,$("#qrysymbol").val(),$("#qryparam").val());
        //request_line("172.16.1.25:8081","line5d");
        
      }
      
      function request_line(apserver,apiname,symbol,param){
        var ipkey=dotToUl(apserver);
        var req_url="http://"+apserver+"/v2/"+apiname;
        
        $.ajax({
          url: req_url,
          type: "GET",
          timeout: 3000,
          //dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', symbol);
            //xhr.setRequestHeader('Symbol', "000890.sz");
            if(param && param.length>0){
              xhr.setRequestHeader('Param', param);
            }
          },
          //processData: false,
          success: function(result){
            rows=result.split('\u0003');
            
            for(var i=0 ; i<rows.length ; i++){
              items=rows[i].split('\u0002');


              var date=base93decodeString(items[0]);
              var time=base93decodeString(items[1]);
              var open=base93decodeString(items[2]);
              var high=base93decodeString(items[3]);
              var low=base93decodeString(items[4]);
              var close=base93decodeString(items[5]);
              var volumn=base93decodeString(items[6]);
              var ref_price=base93decodeString(items[7]);
              var avg_price=base93decodeString(items[8]);
              var row="<tr>"+
                  "<td >"+date+"</td>"+
                  "<td >"+time+"</td>"+
                  "<td >"+open+"</td>"+
                  "<td >"+high+"</td>"+
                  "<td >"+low+"</td>"+
                  "<td >"+close+"</td>"+
                  "<td >"+volumn+"</td>"+
                  "<td >"+ref_price+"</td>"+
                  "<td >"+avg_price+"</td>"+
                  "</tr>";


              $("#profolio > tbody").append(row);
            }
          },
          error: function(result){
          }
        });
      }
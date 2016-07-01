function compareDateTime(dt1){
        var now     = new Date();
        var hour    = now.getHours();
        var minute  = now.getMinutes();

        if( (hour==9 && minute > 25) || (hour>9 && hour<15) ){ 

          var dt2=$("#CurrentTime").text()
          dt1=dt1.replace(/\-/g,"");
          dt1=dt1.replace(/\:/g,"");
          dt1=dt1.replace(/\ /g,"");

          dt2=dt2.replace(/\-/g,"");
          dt2=dt2.replace(/\:/g,"");
          dt2=dt2.replace(/\ /g,"");
          var gap=parseInt(dt1)-parseInt(dt2);
          if(gap >60 || gap < -60){
            return true;
          }else{
            return false;
          }
        }else{
          return false;
        }
        
      }

      function getDateTime() {
        var now     = new Date(); 
        var year    = now.getFullYear();
        var month   = now.getMonth()+1; 
        var day     = now.getDate();
        var hour    = now.getHours();
        var minute  = now.getMinutes();
        var second  = now.getSeconds(); 
        if(month.toString().length == 1) {
            var month = '0'+month;
        }
        if(day.toString().length == 1) {
            var day = '0'+day;
        }   
        if(hour.toString().length == 1) {
            var hour = '0'+hour;
        }
        if(minute.toString().length == 1) {
            var minute = '0'+minute;
        }
        if(second.toString().length == 1) {
            var second = '0'+second;
        }   
        var dateTime = year+'-'+month+'-'+day+' '+hour+':'+minute+':'+second;  
        $("#CurrentTime").html(dateTime);
         return dateTime;
      }

      
      

      function priceStrFormat(priceStr,stockType){
        // console.log(priceStr+"   "+ stockType);
        /*if(stockType=="sh1400"){
          priceStr=parseFloat(priceStr/100000).toFixed(2);
        }
        if(stockType=="sh1001" || stockType=="sz1001"  || 
          stockType=="sh1003" || stockType=="sz1003"  || 
          stockType=="sh1004" || stockType=="sz1004"  || 
          stockType=="sz1400" || stockType=="hk1010"){
          priceStr=parseFloat(priceStr/1000).toFixed(2);
        }*/
        // console.log("priceStrFormat "+stockType);
        if(stockType.indexOf("sh") >=0 || stockType.indexOf("sz") || stockType.indexOf("sz") ){
          // console.log("priceStrFormat 1 "+stockType);  
          if(stockType.indexOf("000")==0 && stockType.indexOf("sh") >=0 ){
            // console.log("priceStrFormat 2 "+stockType+  "   "+ priceStr);
            priceStr=parseFloat(priceStr/100000).toFixed(2);   
            // console.log("priceStrFormat 2-1 "+stockType+  "   "+ priceStr);
          }else{
            // console.log("priceStrFormat 3 "+stockType);
            priceStr=parseFloat(priceStr/1000).toFixed(2);  
          }

        }



        return +priceStr;
      }


      function datetimeStrFormat(dateStr){
        dateStr=dateStr+"";
        
        if(dateStr.length==14){
          return dateStr.substr(0,4)+"-"+dateStr.substr(4,2)+"-"+dateStr.substr(6,2)+" "+
          dateStr.substr(8,2)+":"+dateStr.substr(10,2)+":"+dateStr.substr(12,2);
        }else{
          return dateStr;
        }
      }
      function dotToUl(ipkey){
        if(ipkey){
          ipkey=ipkey.replace(/\./g,'_');
          ipkey=ipkey.replace(":","_");
        }
        return ipkey;
      }

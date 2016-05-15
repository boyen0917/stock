      //var urlStr="http://203.66.57.126";
      //var urlStr="http://192.168.3.48:16888";
      //var urlStr="http://localhost:8080";
     /* var urlStr="http://sseap.mitake.com.cn";
      var myStock="600000.sh";
      var aStock="600000.sh";
      var aStockPreClose=0;
      var profolioPage=0;
      var pageSize=100;
      var chart;
      var tickId;
      var myProfolioId;
      var logPanel;*/
      var audio = new Audio('js/soundsaaa16.wav');

      $( document ).ready(function() {
        initTable();
        showPing();
        showNewPrice();
        showEastMoney();
        getDateTime();
        setInterval(showPing,60*1000);
        setInterval(showNewPrice,10*1000);
        setInterval(showEastMoney,5*1000);
        setInterval(getDateTime,1*1000);
        
        $("#search").click(function(){
          qrysymbol=$("#qrysymbol").val();
          initTable();
          showPing();
          showNewPrice();
        });
        $(".stockbox").click(function(){
          var name= $(this).children()[0];
          var idItems=name.id.split("_");
          var ipport=idItems[0]+"."+idItems[1]+"."+idItems[2]+"."+idItems[3]+":"+idItems[4];
          var stockno=idItems[5]+"."+idItems[6];
          showStockDetail(ipport,stockno);
          
        });
        $(".server_ip").click(function(event){
          showStockDetail(event.target.id,"600354.sh");
          
        });
        $(".server_name").click(function(event){
          showStockDetail(event.target.id,"600354.sh");          
        });

        $("#stock_detail_search").click(function(){
          showStockDetail("80.163.112.216:22016","600354.sh");
        });

        $(document).keyup(function(e) {
          if(e.keyCode == 27) {
            $('.stock_detail_view').css('display','none');
          }
        });
      });

      var qrysymbol="";
      function initTable(){
        $("#profolio > tbody > tr").remove();

        //$("#profolio > tbody").append(gapTr);
        for(var i=0;i<serverlist.sites.length;i++){

          var stocks=serverlist.sites[i].stocks.split(",");
          var rowsize=serverlist.sites[i].aps.length+1;
          var ipkey=dotToUl(serverlist.sites[i].ip);
          var siterow="<tr style='background:#87CEFA'>"+
            "<td rowspan='"+rowsize+"' style='background:#f0f0f0' align='center' valign='middle'>"+serverlist.sites[i].name+"</td>"+
            "<td class='server_name' id='"+serverlist.sites[i].ip+"'>"+serverlist.sites[i].name+"</td>"+
            "<td class='server_ip' id='"+serverlist.sites[i].ip+"'>"+serverlist.sites[i].ip+"</td>"+
            "<td id='"+ipkey+"_ping' align='center' style='background:#FA8072'>No</td>";
          if(qrysymbol.length>0){
            var tmp=qrysymbol.split(",");
            for(var j=0;j<tmp.length;j++){
              stocks.push(tmp[j]);
            }
          }

          
          for(k=0;k<stocks.length;k++){
            var symbolkey=dotToUl(stocks[k]);
            //"<label id='"+ipkey+"_symbol'>-</label><BR>"+
            siterow+="<td class='stockbox'>"+
            "<label id='"+ipkey+"_"+symbolkey+"_name'>-</label>"+
            "<label id='"+ipkey+"_"+symbolkey+"_price'>-</label>"+
            "<label id='"+ipkey+"_"+symbolkey+"_time' class='stockbox_time'>-</label>"+
            "</td>";
          }

          siterow+= "</tr>";
          $("#profolio > tbody").append(siterow);

          

          for(j=0;j<serverlist.sites[i].aps.length;j++){
            var stocks=serverlist.sites[i].aps[j].stocks.split(",");
            var ipkey=dotToUl(serverlist.sites[i].aps[j].ip);
            var aprow="<tr><td class='server_name' id='"+serverlist.sites[i].aps[j].ip+"'>"+serverlist.sites[i].aps[j].name+"</td>"+
              "<td class='server_ip' id='"+serverlist.sites[i].aps[j].ip+"'>"+serverlist.sites[i].aps[j].ip+"</td>"+
              "<td id='"+ipkey+"_ping' align='center' style='background:#FA8072'>No</td>";

          if(qrysymbol.length>0){
            var tmp=qrysymbol.split(",");
            for(var k=0;k<tmp.length;k++){
              stocks.push(tmp[k]);
            }
          }
            for(k=0;k<stocks.length;k++){
              var symbolkey=dotToUl(stocks[k]);
              //"<label id='"+ipkey+"_symbol'>-</label><BR>"+
              aprow+="<td class='stockbox'>"+
              "<label id='"+ipkey+"_"+symbolkey+"_name'>-</label>"+
              "<label id='"+ipkey+"_"+symbolkey+"_price'>-</label>"+
              "<label id='"+ipkey+"_"+symbolkey+"_time' class='stockbox_time'>-</label>"+
              "</td>";
            }
              aprow+="</tr>";
            $("#profolio > tbody").append(aprow);
          }
        }


      }

      function showEastMoney(){
        var east="http://nufm2.dfcfw.com/EM_Finance2014NumericApplication/JS.aspx?type=CT&cmd=0000011,3990012&sty=DFPIU&st=z&sr=&p=&ps=&cb=&js=var%20C1Cache={quotation:[(x)]}&token=44c9d251add88e27b65ed86506f6e5da&0.548897797241807";

        $.ajax({
          url: east,
          dataType: 'script',
          success: function(result){
            //console.log("showEastMoney "+C1Cache.quotation[0]);
            //console.log("showEastMoney "+C1Cache.quotation[1]);
            var quote_sh =C1Cache.quotation[0].split(",");

            $("#EastMoneyPrice").html(quote_sh[2]);
          },
          async: true
        });
      }

      function showNewPrice(apserver,symbol){
        for(i=0;i<serverlist.sites.length;i++){
          request_quote(serverlist.sites[i].ip,serverlist.sites[i].stocks);
          for(j=0;j<serverlist.sites[i].aps.length;j++){
            request_quote(serverlist.sites[i].aps[j].ip,serverlist.sites[i].aps[j].stocks);
          }
        }      
      }

      function showPing(){
        for(i=0;i<serverlist.sites.length;i++){
          var isSucc=request_ping(serverlist.sites[i].ip);
          for(j=0;j<serverlist.sites[i].aps.length;j++){
            var isSucc=request_ping(serverlist.sites[i].aps[j].ip);
          }
        }        
      }

      function showStockDetail(ip,stock){
        $('.stock_detail_view').css('display','block');
        $("#stock_detail_id").val(stock);
        request_stock_quote(ip,stock);
      }

      
      function request_ping(apserver){
        var ipkey=dotToUl(apserver);
        
        var reqTime=Date.now();
        var req_url="http://"+apserver+"/v1/service/ping";
            $.ajax({
              url: req_url,
              type: "GET",
              timeout: 3000,
              success: function(result){
                var sTime=Date.now()-reqTime;
                $("#"+ipkey+"_ping").html("Yes ("+sTime+"ms)");
                $("#"+ipkey+"_ping").removeAttr("style");
                return true;
              },
              error: function(result){
                $("#"+ipkey+"_ping").html("No");
                $("#"+ipkey+"_ping").css("background","#FA8072");
                if($("#audiopower:checked").length>0){
                  audio.play();  
                }
                
                return false;
              }
            });
      }
      function request_quote(apserver,symbol){
        if(qrysymbol.length>0){
          symbol+=","+qrysymbol;
        }
        var ipkey=dotToUl(apserver);
        var req_url="http://"+apserver+"/v2/quote";
        $.ajax({
          url: req_url,
          type: "GET",
          timeout: 3000,
          //dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', symbol);
          },
          //processData: false,
          success: function(result){
            rows=result.split('\u0003');
            
            for(var i=0 ; i<rows.length ; i++){
              items=rows[i].split('\u0002');

              var symbol=items[1];
              var symbolkey=dotToUl(symbol);
              var name=items[2];
              var time=datetimeStrFormat(base93decodeString(items[3]));
              var price=priceStrFormat(base93decodeString(items[7]),items[5]+items[6]);
              var overtime=compareDateTime(time);
              //time=time.replace(" ","<BR>");
              $("#"+ipkey+"_"+symbolkey+"_symbol").html(symbol);
              $("#"+ipkey+"_"+symbolkey+"_name").html(name);
              $("#"+ipkey+"_"+symbolkey+"_price").html(price);
              $("#"+ipkey+"_"+symbolkey+"_time").html(time);
              if(overtime){
                $("#"+ipkey+"_time").css("background","#FA8072");
                if($("#audiopower:checked").length>0){
                  audio.play();  
                }
              }else{
                $("#"+ipkey+"_time").removeAttr("style");
              }
            }
          },
          error: function(result){
          }
        });
      }

      function request_stock_quote(apserver,symbol){
        if(qrysymbol.length>0){
          symbol+=","+qrysymbol;
        }
        var ipkey=dotToUl(apserver);
        var req_url="http://"+apserver+"/v2/quote";
        //alert(apserver+ "    "+symbol);
        $.ajax({
          url: req_url,
          type: "GET",
          timeout: 3000,
          //dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', symbol);
          },
          //processData: false,
          success: function(result){

              var items=result.split('\u0002');
              var symbol=items[1];
              var symbolkey=dotToUl(symbol);
              var name=items[2];
              var time=datetimeStrFormat(base93decodeString(items[3]));
              var price=priceStrFormat(base93decodeString(items[7]),items[5]+items[6]);
              var hi=priceStrFormat(base93decodeString(items[8]),items[5]+items[6]);
              var open=priceStrFormat(base93decodeString(items[10]),items[5]+items[6]);
              var qty=parseInt(base93decodeString(items[13])/10000)+"萬";
              var diff=priceStrFormat(base93decodeString(items[7])-base93decodeString(items[11]),items[5]+items[6]);
              var diffpre="";//decodeString(items[13]);
              var low=priceStrFormat(base93decodeString(items[9]),items[5]+items[6]);
              var ch=base93decodeString(items[15]);
              var money=parseInt(base93decodeString(items[20])/100000000)+"億";
              var overtime=compareDateTime(time);

              console.log("items[11] => "+items[11]);
              console.log("decode items[11] => "+base93decodeString(items[11]));
              //time=time.replace(" ","<BR>");
              console.log("sub-type => "+items);
              $("#stock_name").text(name);
              $("#stock_no").text(symbol);
              $("#stock_time").text(time);
              $("#stock_price").text(price);
              $("#stock_hi").text(hi);
              $("#stock_open").text(open);
              $("#stock_qty").text(qty);
              $("#stock_diff").text(diff);
              $("#stock_diffpre").text(diffpre);
              $("#stock_low").text(low);
              $("#stock_ch").text(ch);
              $("#stock_money").text(money);

              $("#stock_31").text(base93decodeString(items[31]));
              $("#stock_27").text(items[27]);
              $("#stock_28").text(items[28]);
              $("#stock_29").text(items[29]);
              console.log("items[26] =>"+items[26]);

              /*for(var j=0;j<items.length;j++){
                var tr="<tr><td>"+j+"</td><td>"+items[j]+"</td></tr>";
                $("#stock_value > tbody").append(tr);
              }*/

              /*$("#"+ipkey+"_"+symbolkey+"_symbol").html(symbol);
              $("#"+ipkey+"_"+symbolkey+"_name").html(name);
              $("#"+ipkey+"_"+symbolkey+"_price").html(price);
              $("#"+ipkey+"_"+symbolkey+"_time").html(time);
              //console.log($("#audiopower").attr('checked'));
              if(overtime){
                $("#"+ipkey+"_time").css("background","#FA8072");
                if($("#audiopower:checked").length>0){
                  audio.play();  
                }
              }else{
                $("#"+ipkey+"_time").removeAttr("style");
              }*/
            //}
          }
        });
      }
      




      function showRanking(){
        var ranking=urlStr+"/v2/ranking";
        $.ajax({
          url: ranking,
          dataType: "text",
          type: "GET",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
          },
          processData: false,
          success: function(result){
            addLog(ranking,["Token: MitakeWeb",""],result);
            $("#profolio > tbody > tr").remove();

            var gapTrStr=["重要指數","漲幅榜","跌幅榜","創業板漲幅榜","中小板漲幅榜"];
            var fregram=result.split('\u0004');
            for(j=0;j<fregram.length;j++){
              var gapTr="<tr><td>"+gapTrStr[j]+"</td></tr>";
              $("#profolio > tbody").append(gapTr);
              var itemArr=fregram[j].split('\u0003');
              for(i=0;i<itemArr.length;i++){
                if(itemArr[i].length>0){
                  
                  var item=itemArr[i].split('\u0002');
                  item[3]=item[3].substr(8);
                  item[3]=item[3].substr(0,2)+":"+item[3].substr(2,2)+":"+item[3].substr(4);
                  var change=(item[4]-item[5])/1000;
                  var changePre=((item[4]-item[5])/item[5])*100;
                  var stockKey=item[3].replace(".","_");
                  {
                    if(item[3].length>0){
                      var tr="<tr id='"+stockKey+"_tr' class='oneStock'>";
                      tr+="<td>"+item[1]+"</td>";
                      tr+="<td>"+item[2]+"</td>";
                      tr+="<td id='"+stockKey+"_2'>"+item[4]/1000+"</td>";
                      tr+="<td id='"+stockKey+"_ch'>"+change+"</td>";
                      tr+="<td id='"+stockKey+"_chpre'>"+changePre.toFixed(2)+"%</td>";
                      tr+="<td id='"+stockKey+"_4'>"+item[3]+"</td>";
                      tr+="<td><span id='"+stockKey+"' class='glyphicon glyphicon-trash delstock'></span></td>";
                      $("#profolio > tbody").append(tr);
                      
                    }
                  }
                }
              }
            }
          }
        });
      }

      

      function search(){
        //alert("search");
        var key=$("#searchinput").val();
        key=encodeURIComponent(key);
        var search=urlStr+"/v2/search";
        $.ajax({
          url: search,
          dataType: "text",
          type: "GET",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Param', key);
          },
          processData: false,
          success: function(result){
            addLog(search,["Token: MitakeWeb","Param: "+key],result);
            var itemArr=result.split('\u0003');
            var filterStr="";
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                if(item[0].indexOf(key)>=0 || item[1].indexOf(key)>=0 ){
                  var symbol=item[0].substr(0,item[0].indexOf("."));
                  filterStr+="<tr><td id='"+item[0]+"'class='addstock'><span class='glyphicon glyphicon-plus'></span> "+item[1]+"("+symbol+")</td></tr>";
                  
                }
              }
            }
            $("#searchresult > tbody > tr").remove();
            $("#searchresult").append(filterStr);
            $(".addstock").click(function(){
              if(localStorage.mystock.indexOf(this.id)==-1){
                localStorage.mystock=localStorage.mystock+this.id+",";
                initMyStock();
                loadDefaultProfolio();
              }
            });
          }
        });
      }
      function initMyStock(){
        
        if(localStorage.mystock){
          if(localStorage.mystock.indexOf("SHA")>0){
            localStorage.mystock="600000.sh,";
          }
          myStock=localStorage.mystock;
        }else{
          localStorage.mystock="600000.sh,";
        }
        loadPageButton();
      }
      function loadOneStock(){
        //loadOneStockTick();
        loadOneStockQuote();
        loadOneStockLine();
      }
      function initOneStockLineView(){
        chart = new Highcharts.Chart({
          chart:{
            renderTo: 'container'
          },
          animation:false,
          title: null,
          credits:{
            text: null
          },
          legend: {
            enabled: false
          },
          tooltip:{
            enabled:false
          },
          plotOptions:{
            area:{
              fillColor: {
                linearGradient: [ 0,200,400],
                stops: [
                  [0, Highcharts.getOptions().colors[0]],
                  [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
              },
              animation:false,
              color: "#4b32f9",
              fillOpacity: 0.6,
              lineWidth: 1,
              states: {
                hover: {
                  enabled: false
                }
              }
            },
            line:{
              animation:false,
              grouping: false,
              color: "#ff0000",
              lineWidth: 1,
              states: {
                hover: {
                  enabled: false
                }
              }
            }
          },
          xAxis:{
            labels: {
                enabled: false
            },
            max: 240

          },
          yAxis:[{
            title: null,
            labels: {
                enabled: false
            }
          },{
            title: null,
            labels: {
                enabled: false
            }
          }],
          series:[{
            type: 'area',
            fillOpacity: 0.01,
            //data: valumeArr,
            dataGrouping:{
              enabled: false
            }
          },{
            type: 'line',
            name: "",
            //data: cPrice,
            yAxis: 1,
            dataGrouping:{
              enabled: false
            }
          }]
        });
        
      }
      function loadOneStockNewslist(){
        var news=urlStr+"/v2/newslist";
        

        $.ajax({
          url: news,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', /*"aStock"*/"603969.sh");
          },
          processData: false,
          success: function(result){
            addLog(news,["Token: MitakeWeb","Symbol: 603969.sh"],result);
            $("#aStockNews > tbody > tr").remove();
            
            var itemArr=JSON.parse(result);
            var html="";
            for(i=0;i<itemArr.length;i++){

              var item=itemArr[i];

              item.ShowTime=/*item.ShowTime.substr(0,4)+"/"+item.ShowTime.substr(4,2)+"/"+
              item.ShowTime.substr(6,2)+"  "+*/item.ShowTime.substr(8,2)+":"+
              item.ShowTime.substr(10,2)+":"+item.ShowTime.substr(12,2);  
              html+="<tr class='opennews' id='"+item.newsid+"'><td >";
              html+="<div class='row' style='margin-left: 3px;'>";
              html+="<span class='label label-info'>"+item.ShowTime+"</span>   ";
              html+="<span class='label label-primary'>"+item.Source+"</span>";
              html+="</div>";
              html+="<div class='row' style='margin-left: 3px;'>"+item.Title+"</div>";
              html+="</td></tr>";
            }
            $("#aStockNews > tbody").append(html);
            $(".opennews").click(function(){
              loadOneStockNews(this.id);
            });
          }
        });
      }
      function loadOneStockNews(newid){
        var news=urlStr+"/v2/news";
        

        $.ajax({
          url: news,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', newid);
          },
          processData: false,
          success: function(result){
            addLog(news,["Token: MitakeWeb","Symbol: "+newid],result);
            
            bootbox.alert(result, function() {
                //console.log("Alert Callback");
            });
          }
        });
      }

      function loadOneStockLine(){
        var line=urlStr+"/v2/line";
        $.ajax({
          url: line,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', aStock);
          },
          processData: false,
          success: function(result){
              //console.log(result);
            //addLog(line,["Token: MitakeWeb","Symbol: "+aStock],result);
            
            var itemArr=result.split('\u0003');
            var priceArr=new Array();
            var valumnArr=new Array();
            for(i=0;i<itemArr.length;i++){

              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                priceArr.push(item[0]/1000);
                valumnArr.push(parseInt(item[1]));
              }
            }
            chart.yAxis[1].setExtremes(aStockPreClose*0.9,aStockPreClose*1.1);
            chart.series[0].setData(valumnArr,false);
            chart.series[1].setData(priceArr,false);
            chart.redraw();
          }
        });
      }

      function loadOneStockQuote(){
        //console.log("loadOneStockQuote="+aStock);
        var profolio=urlStr+"/v2/quote";
        $.ajax({
          url: profolio,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', aStock);
          },
          processData: false,
          success: function(result){
            //addLog(profolio,["Token: MitakeWeb","Symbol: "+aStock],result);
            var itemArr=result.split('\u0003');
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                aStockPreClose=item[11]/1000;
                $("#aStock_name").text(item[1]+"("+item[2]+")");
                $("#aStock_deal").text(item[7]/1000);
                $("#aStock_hi").text(item[8]/1000);
                $("#aStock_low").text(item[9]/1000);
                $("#aStock_open").text(item[10]/1000);
                $("#aStock_preclose").text(item[11]/1000);
                //console.log("preclose "+item[11]);


                var change=(item[11]-item[7])/1000;
                var changepre=((item[11]-item[7])/item[11])*100;
                $("#aStock_change").text(change);
                $("#aStock_changepre").text(changepre.toFixed(2)+"%");
                
                $("#aStock_buyVolume").text(item[23]);
                $("#aStock_sellVolume").text(item[24]);

                
                $("#aStock_volume").text((item[13]/10000000).toFixed()+"万");
                $("#aStock_amount").text((item[20]/100000000000).toFixed()+"亿");
                //aStock_b5p
                var buyP5=(item[33]);
                var buyV5=(item[34]);
                var sellP5=(item[35]);
                var sellV5=(item[36]);
                
                $("#sell10table > tbody > tr").remove();
                $("#buy10table > tbody > tr").remove();
                if(item[6]!="i"){
                  setOneStock10Step("buy",buyP5,buyV5);
                  setOneStock10Step("sell",sellP5,sellV5);
                  
                }else{
                  var tr="<tr><td colspan='4'>查无资料</td>";
                  $("#sell10table > tbody").append(tr);
                  $("#buy10table > tbody").append(tr);
                }
              }
            }
          }
        });
      }

      function setOneStock10Step(bors,price,value){
        price=price.split(",");
        value=value.split(",");
        var value1=new Array(value.length);
        var value2=new Array(value.length);
        var buyStr=["买一","买二","买三","买四","买五","买六","买七","买八","买九","买十"];
        var sellStr=["卖十","卖九","卖八","卖七","卖六","卖五","卖四","卖三","卖二","卖一"];
        var html="";
        for(j=0;j<value.length;j++){
          value1[j]=value[j].substr(0,value[j].indexOf("|"));
          value2[j]=value[j].substr(value[j].indexOf("|")+1);
          var str="";
          if(bors=="buy"){
            str=buyStr[j];
          }else{
            str=sellStr[j+sellStr.length-value.length];
          }
          html+="<tr><td>"+str+"</td>"+
          "<td>"+price[j]/1000+"</td>"+
          "<td>"+value1[j]+"</td>"+
          "<td>"+value2[j]+"</td></tr>";
        }
        $("#"+bors+"10table > tbody").append(html);
        
      }

      function setOneStock5Step1(bors, pvoronev, value){
        for(i=0;i<10;i++){
          if(pvoronev=="p" && value[i]!="-"){
            $("#aStock_"+bors+(i)+pvoronev).text(value[i]/1000);
          }else{
            $("#aStock_"+bors+(i)+pvoronev).text(value[i]);
          }
        }
      }

      function loadOneStockTick(){
        var profolio=urlStr+"/v2/trd1";
        $.ajax({
          url: profolio,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', aStock);
          },
          processData: false,
          success: function(result){
            addLog(profolio,["Token: MitakeWeb","Symbol: "+aStock],result);
            var itemArr=result.split('\u0003');
            var html="";
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                var timedate=item[1];
                if(timedate.indexOf("9")==0){
                  timedate="0"+timedate;
                }
                timedate=timedate.substr(0,2)+":"+timedate.substr(2,2)+":"+timedate.substr(4,2);
                html+="<tr><td>"+item[0]+"</td>";
                html+="<td>"+timedate+"</td>";
                html+="<td>"+(item[3]/1000)+"</td>";
                html+="<td>"+(item[2])+"</td>";
              }
            }
            $("#aStockTick > tbody > tr").remove();
            $("#aStockTick > tbody").append(html);
          }
        });
      }

      function loadDefaultProfolio(){
        var profolio=urlStr+"/v2/squote";
        var profolioList="";
        var myStockArr=myStock.split(",");
        //console.log("profolioPage="+profolioPage);
        for(i=profolioPage*pageSize;i<myStockArr.length && i<(profolioPage+1)*pageSize;i++){
          
          profolioList+=myStockArr[i]+",";
        }

        $.ajax({
          url: profolio,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Symbol', profolioList);
          },
          processData: false,
          success: function(result){
            //addLog(profolio,["Token: MitakeWeb","Symbol: "+profolioList],result);
            var itemArr=result.split('\u0003');
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                item[4]=item[4].substr(8);
                item[4]=item[4].substr(0,2)+":"+item[4].substr(2,2)+":"+item[4].substr(4);

                var dot=1000;
                if(item[6]=="i"){
                  dot=100000;
                }
                var change=(item[1]-item[2])/dot;
                var changePre=((item[1]-item[2])/item[1])*100;
                var stockKey=item[3].replace(".","_");
                if($("#"+stockKey+"_tr").length>0){
                  setValue(stockKey+"_2",(item[2]/dot).toFixed(2));
                  setValue(stockKey+"_ch",change);
                  setValue(stockKey+"_chpre",changePre.toFixed(2)+"%");
                  setValue(stockKey+"_4",item[4]);
                }else{
                  if(item[3].length>0){
                    var tr="<tr id='"+stockKey+"_tr' class='oneStock'>";
                    tr+="<td>"+item[3]+"</td>";
                    tr+="<td>"+item[0]+"</td>";
                    tr+="<td id='"+stockKey+"_2'>"+(item[2]/dot).toFixed(2)+"</td>";
                    tr+="<td id='"+stockKey+"_ch'>"+change+"</td>";
                    tr+="<td id='"+stockKey+"_chpre'>"+changePre.toFixed(2)+"%</td>";
                    tr+="<td id='"+stockKey+"_4'>"+item[4]+"</td>";
                    tr+="<td><span id='"+stockKey+"' class='glyphicon glyphicon-trash delstock'></span></td>";
                    $("#profolio > tbody").append(tr);
                    
                  }
                }
              }
            }
            $(".delstock").click(function(){
                      delstock(this.id);
                    });

            $(".oneStock").click(function(){
              aStock=(this.id.replace("_","."));
              aStock=aStock.replace("_tr","");
              loadOneStock();
            });
          }
        });
        
      }
      function initBanKuaiButton(){
        var banKuai=urlStr+"/v2/cate";
        var html="<button id='myStock' class='catebutton btn btn-primary' type='button'>自選</button> ";
        
        html+="<button id='ranking' class='ranking btn btn-primary' type='button'>排行</button> "
        html+="<button id='SHAIndex' class='subcatebutton btn btn-primary' type='button'>上海指数</button> ";
        html+="<button id='SHEIndex' class='subcatebutton btn btn-primary' type='button'>深圳指数</button> ";
        html+="<button id='Startup' class='subcatebutton btn btn-primary' type='button'>创业板</button> ";
        html+="<button id='MiddleNSmall' class='subcatebutton btn btn-primary' type='button'>中小板</button> ";
        html+="<button id='SHASHEA' class='subcatebutton btn btn-primary' type='button'>沪深A股</button> ";
        html+="<button id='SHAA' class='subcatebutton btn btn-primary' type='button'>上证A股</button> ";
        html+="<button id='SHAB' class='subcatebutton btn btn-primary' type='button'>上证B股</button> ";
        html+="<button id='SHEA' class='subcatebutton btn btn-primary' type='button'>深证A股</button> ";
        html+="<button id='SHEB' class='subcatebutton btn btn-primary' type='button'>深证B股</button> ";
        html+="<button id='SHAOption' class='subcatebutton btn btn-primary' type='button'>上交所期权</button> ";


        $.ajax({
          url: banKuai,
          type: "GET",
          dataType: "text",
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
          },
          processData: false,
          success: function(result){
            addLog(banKuai,["Token: MitakeWeb"],result);
            var itemArr=result.split('\u0003');
            
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                html+="<button id='"+item[0]+"' class='catebutton btn btn-primary' type='button'>"+item[1]+"</button>  ";
              }
            }
            $("#catediv").html(html);
            $(".catebutton").click(function(){
              if(this.id=="myStock"){
                //myStock=localStorage.mystock;
                initMyStock();
                $("#profolio > tbody > tr").remove();
                loadDefaultProfolio();
                $("#catelistdiv").html("");
              }else{
                loadSubBanKuai(this.id);
              }
            });
            $(".subcatebutton").click(function(){
              loadSubBanKuaiList(this.id);
            });
            $(".ranking").click(function(){
              showRanking();
            });
          }
        });
        $("#catediv").html(html);
        $(".subcatebutton").click(function(){
          loadSubBanKuaiList(this.id);
        });
        $(".ranking").click(function(){
          showRanking();
        });
      }

      function loadSubBanKuai(cateid){
        var banKuai=urlStr+"/v2/cate";
        
        $.ajax({
          url: banKuai,
          type: "GET",
          dataType: "text",
          processData: false,
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Param', cateid);
          },
          success: function(result){
            addLog(banKuai,["Token: MitakeWeb","Param: "+cateid],result);

            var itemArr=result.split('\u0003');
            var html="";
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                html+="<button id='"+item[0]+"' class='subcatebutton btn btn-info btn-xs' type='button'>"+item[1]+"</button>  ";
              }
            }
            $("#catelistdiv").html(html);
            $(".subcatebutton").click(function(){
              loadSubBanKuaiList(this.id);
            });
          }
        });
      }

      function loadSubBanKuaiList(cateid){
        var banKuai=urlStr+"/v2/cate";
        $.ajax({
          url: banKuai,
          type: "GET",
          dataType: "text",
          processData: false,
          beforeSend: function(xhr){
            xhr.setRequestHeader('Token', "MitakeWeb");
            xhr.setRequestHeader('Param', cateid);
          },
          success: function(result){
            addLog(banKuai,["Token: MitakeWeb","Param: "+cateid],result);
            var itemArr=result.split('\u0003');
            var html="";
            for(i=0;i<itemArr.length;i++){
              if(itemArr[i].length>0){
                var item=itemArr[i].split('\u0002');
                html+=item[0]+",";
              }
            }
            $("#profolio > tbody > tr").remove();
            myStock=html;
            clearInterval(myProfolioId);
            loadDefaultProfolio();
            loadPageButton();
            myProfolioId=setInterval(loadDefaultProfolio, 3000);
          }
        });
      }

      function loadPageButton(){
        //$("#pagestr").text((profolioPage+1)+"/"+Math.ceil(myStock.split(",").length/20)+"  页");
        $("#pagestr").text("共 "+(myStock.split(",").length-1)+" 笔");
        $("#pagedown").click(function(){
          console.log("pagedown");
            if(profolioPage<Math.ceil(myStock.split(",").length/20)){
              console.log("pagedown ceil");
              clearInterval(myProfolioId);
              profolioPage=profolioPage+1;
              
              loadDefaultProfolio();
              console.log("pagedown " +profolioPage);
              //myProfolioId=setInterval(loadDefaultProfolio, 3000);
              $("#pagestr").text((profolioPage+1)+"/"+Math.ceil(myStock.split(",").length/20)+"  页");
            }
        });
        $("#pagedown").click(function(){
            if(profolioPage>0){
              profolioPage--;
              loadDefaultProfolio();
              $("#pagestr").text((profolioPage+1)+"/"+Math.ceil(myStock.split(",").length/20)+"  页");
            }
        });
      }

      function delstock(stockid){
        localStorage.mystock=localStorage.mystock.replace(stockid.replace("_",".")+",","");
        initMyStock();
        loadDefaultProfolio();
        $('#'+stockid+"_tr").remove();
      }

      function setValue(itemId, itemValue){
        $("#"+itemId).text(itemValue);
      }
      var allLog=new Array();
      var logIndex=-1;
      var logStatus="play";
      function initLogEvent(){
        $("#logbackward").click(function(){
          if(logStatus=="pause"){
            if(logIndex>0){
              logIndex--;
              showLog(logIndex);
            }
          }
        });
        $("#logpause").click(function(){
          if(logStatus=="play"){
            logStatus="pause";
            logIndex=allLog.length-1;
          }
        });
        $("#logplay").click(function(){
          if(logStatus=="pause"){
            logStatus="play";
            logIndex=-1;
          }
        });
        $("#logstop").click(function(){
          allLog=new Array();
        });
        $("#logforward").click(function(){
          if(logStatus=="pause"){
            if(logIndex<allLog.length-1){
              logIndex++;
              showLog(logIndex);
            }
          }
        });

      }
      function addLog(urlStr,header,result){
        var item=new Array();
        item.push(urlStr);
        item.push(header);
        item.push(result);
        allLog.push(item);
        if(logStatus=="play"){
          showLog(allLog.length-1);
        }

        //allLog=urlStr+"<BR>"+allLog;
        //console.log(urlStr);
        //$("#log").val(urlStr);
        //console.log("out"+logPanel.content);
        //logPanel.content.text=allLog;//.append();
      }
      function showLog(index){
        var item=allLog[index];
        var text="----- URL -----\n"+item[0]+"\n"+
          "----- HEADER -----\n";
        var header=item[1];//.split(",");
        //console.log(item[1]);
        //console.log(item[1].length);
        for(i=0;i<header.length;i++){
          text=text+header[i]+"\n";
        }
        text+="----- RESPONSE -----\n";
        item[2]=item[2].replace(/\u0002/g,"[2]");
        item[2]=item[2].replace(/\u0003/g,"[3]\n");
        item[2]=item[2].replace(/\u0004/g,"[4]\n");
        text+=item[2];
          //item[2]+"\n";
        $("#log").val(text);
      }


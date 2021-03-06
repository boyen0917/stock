var _serverip;
var serverlist={
	"sites":[
		{
			"name":"士林機房",
			"ip":"211.21.129.152:8081",
			"stocks":"000001.sh,399001.sz,00001.hk",
			"aps":[
				{
					"name":"主站AP01",
					"ip":"211.21.129.152:8081",
					"stocks":"000001.sh,399001.sz,00001.hk"
				}]
		},
		{
			"name":"主站环境",
			"ip":"180.163.112.216:22016",
			"stocks":"000001.sh,399001.sz,00001.hk",
			"aps":[
				{
					"name":"主站AP01",
					"ip":"10.92.14.3:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"主站AP02",
					"ip":"10.92.14.13:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"主站AP03",
					"ip":"10.92.14.32:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				}
			]
		},
		{
			"name":"土城环境",
			"ip":"123.125.108.117:22016",
			"stocks":"000001.sh,399001.sz,00001.hk",
			"aps":[
				{
					"name":"土城AP01",
					"ip":"10.88.10.12:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"土城AP02",
					"ip":"10.88.10.22:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"土城AP03",
					"ip":"10.88.10.32:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				}
			]
		},
		{
			"name":"上证全真环境",
			"ip":"114.80.155.134:22016",
			"stocks":"000001.sh,399001.sz,00001.hk",
			"aps":[
				{
					"name":"全真AP01",
					"ip":"10.81.1.62:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"全真AP02",
					"ip":"10.81.1.72:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"全真AP03",
					"ip":"10.81.1.82:22016",
					"stocks":"000001.sh,399001.sz,00001.hk"
				}
			]
		},
		{
			"name": "水晶",
			"ip":"sseap.mitake.com.cn",
			"stocks":"000001.sh,399001.sz,00001.hk",
			"aps":[
				{
					"name":"水晶AP01-25",
					"ip":"172.16.1.25:8081",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
				{
					"name":"水晶AP02-26",
					"ip":"172.16.1.26:8081",
					"stocks":"000001.sh,399001.sz,00001.hk"
				},
			]
		}/*,
		{
			"name":"上证测试机",
			"ip":"180.168.97.230:16888",
			"aps":[]
		}*/

	]	
};




$( document ).ready(function() {

	if($("#serveriplist")){

		var seleHtml=""
		for(var i=0;i<serverlist.sites.length;i++){
			seleHtml+="<option value='"+serverlist.sites[i].ip+"'>"+serverlist.sites[i].name+"("+serverlist.sites[i].ip+")"+"</option>";
			for(var j=0;j<serverlist.sites[i].aps.length;j++){
				seleHtml+="<option value='"+serverlist.sites[i].aps[j].ip+"'>"+serverlist.sites[i].aps[j].name+"("+serverlist.sites[i].aps[j].ip+")"+"</option>";
			}
		}

		$("#serveriplist").html("<select id='serverselector'>"+seleHtml+"</select>");
		$("#serverselector").bind("change", function(e) {
			_serverip=$(this).val();
			reShow();
		});
		/*$('#serverselector').change(function() 
		{
		   alert('Value change to ' + $(this).attr('value'));
		});*/

	}
});
(function(){
	require.config(
		{
			paths:
			{
				"XBDApp":"../../Base/src/xbdapp" //配置Require指定XBDApp的位置	
			}
			,config:
			{
				"XBDApp":
				{
					"AppName": "DemoApp"  //应用的名字，可选
					/*
					处理依赖库的位置
					默认不指定会采用网络上的CDN来加载。其中jquery默认是zepto，当采用CDN时，确保你能够访问互联网，并能够访问//cdn.bootcss.com/，已经采用了//cdn.bootcss.com/相对配置，并且该CDN支持HTTPS，所以对于HTTPS可以无缝使用
					,"depends":
					{
						"jquery":""
						,"underscore":""
						,"backbone":""
					}
					*/
					,"hashChange": false //配置是否使用hashChange。如果为false就会发生页面跳转，OFBIZ应用默认就是false
					,"URLRoot": "/xbd-plugins/WINREM/demo/" //配置根路径，每个项目应该不一样，如果不配置默认为"/"，OFBIZ页面不指定会自动根据当前location取得组件对应的control路径，如xxxx.com/testcomp/control/
					,"Routers":{	//路由配置的套路跟之前的设计一样，所有的模块指向知己的controller.js。默认的*action指向defaultAction
						routes:
						{
							"demo.html":"./js/mod/demo/controller.js"
							,"help.html":"./js/mod/help/controller.js"
							,"*action":"defaultAction"
						}
						,defaultAction: function(route)
						{
							console.log("defaultAction:" + route);
						}
					}
				}	
			}
		}
	);
	
	require(
		[
			"XBDApp"
			,"../src/winrem.js"
		]
		,function(XBDApp, winrem)
		{
			XBDApp.getInstance(
				function(app){
					winrem.attach_resize();
					app.start(
						function()
						{

						}
					);
				}
			);
		}
	);
})();

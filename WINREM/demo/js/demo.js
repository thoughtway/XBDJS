(function(){
	require.config(
		{
			paths:
			{
				"XBDApp":"../../Base/src/xbdapp"	
			}
			,config:
			{
				"XBDApp":
				{
					"AppName": "DemoApp"
					,"hashChange": false
					,"URLRoot": "/xbd-plugins/WINREM/demo/"
					,"Routers":{
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

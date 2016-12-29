(function(win){
	var xbdappInst = null;
	var config = {};
	
	var XDBApplication = function(configure)
	{	
		var envReady = false, startFunc = null;;
		var self = this, isOFB = false, appRouter = null;
		var ROOT = (configure && configure.URLRoot)?configure.URLRoot:"/";
		
		//priavte function
		function defineRouter()
		{
			var routerConf = {
				initialize: function()
				{
					this.on(
						'route'
						,function (route, params)
						{
							if ("defaultAction" != route)
							{
								//console.log(route);
								require(
									[route]
									,function (controller)
									{
										if(router.currentController &&
										   router.currentController !== controller)
										{
											router.currentController.onRouteChange && router.currentController.onRouteChange();
										}
										router.currentController = controller;
										controller.apply(null, params);	 //每个模块约定都返回controller
									}
								);
							}
						}
					);

					var fragment = Backbone.history.getFragment();

					if (!Backbone.history._useHashChange &&
						!Backbone.history._usePushState)
					{
						for (var i = 0; i < Backbone.history.handlers.length; i++)
						{
							var handler = Backbone.history.handlers[i];
							if (handler.route.test(fragment))
							{
								var name = this.routes[fragment];
								var args = this._extractParameters(handler.route, fragment);

								if ((typeof this[name]).toLowerCase() == "function")
								{
									this[name].apply(this, args);										
								}
								this.trigger.apply(router, ['route:' + name].concat(args));
								this.trigger('route', name, args);
								Backbone.history.trigger('route', this, name, args);

								break;
							}
						}
					}
				}
				,execute: function(callback, args, name)
				{
					if ((typeof callback).toLowerCase() === "function")
					{
						callback.apply(this, args);
					}
				}
			};
			
			if (configure && configure.Routers)
			{
				routerConf = _.extend(routerConf, configure.Routers);
			}
			var router = XDBApplication.prototype.Router = Backbone.Router.extend(routerConf);
			
			return router;
		}
		
		function getOFBURLInfo()
		{
			if (isOFB)
			{
				var curHref = location.href;
			
				var OFBURLInfo = {
					proto: location.protocol
					,host: location.host
					,path: location.pathname
					,component: null
					,querystring: null
				}

				var controlIndex = OFBURLInfo.path.indexOf("/control/");
				if (-1 != controlIndex)
				{
					var prefix = OFBURLInfo.path.substr(0, controlIndex);
					OFBURLInfo.component = prefix.substr(prefix.lastIndexOf("/") + 1);
				}

				var qsTagIndex = curHref.indexOf("?");
				if (-1 != qsTagIndex)
				{
					OFBURLInfo.querystring = curHref.substr(qsTagIndex + 1);
				}

				return OFBURLInfo;	
			}
			else
			{
				return null;
			}
		}
		
		function getDependsLibPath(libname)
		{
			var defaultCDN = {
				"jquery": "//cdn.bootcss.com/zepto/1.2.0/zepto.min"
				,"zepto": "//cdn.bootcss.com/zepto/1.2.0/zepto.min"
				,"underscore":"//cdn.bootcss.com/underscore.js/1.8.3/underscore-min"
				,"backbone": "//cdn.bootcss.com/backbone.js/1.3.3/backbone-min"
			};
			
			if (configure && configure.depends && configure.depends[libname])
				return configure.depends[libname];
			else
				return defaultCDN[libname];
		}
		
		function checkBaseDepends(callback)
		{
			var dependsConfig = {paths:{}, shim:{}};
			var $DEFINED = true, needLoad = false;
			if ((typeof jQuery).toLowerCase() === "undefined" &&
				(typeof Zepto).toLowerCase() === "undefined")
			{
				$DEFINED = false;
				dependsConfig.paths["jquery"] = getDependsLibPath("jquery");
				dependsConfig.shim["jquery"] = 
				{
					exports:'$'
				};

				needLoad = true;
			}

			if ((typeof Backbone).toLowerCase() === "undefined")
			{
				dependsConfig.paths["underscore"] = getDependsLibPath("underscore");
				dependsConfig.paths["backbone"] = getDependsLibPath("backbone");
				dependsConfig.shim["underscore"] = 
				{
					exports:'_'
				};
				dependsConfig.shim["backbone"] = 
				{
					exports: "Backbone"
					,deps: ["underscore"]
				}

				if (!$DEFINED)
				{
					dependsConfig.shim["backbone"]["deps"].push("jquery")
				}

				needLoad = true;
			}

			if (needLoad)
			{
				//console.log(dependsConfig);
				var baseRequire = requirejs.config(dependsConfig);
				baseRequire(
					["backbone"]
					,function()
					{
						callback.apply(this, [])
					}
				);	
			}
			else
			{
				callback.apply(this, []);
			}
		}
		
		function getConfigureProperty(key)
		{
			if (configure)
			{
				return configure[key];
			}
			else 
				return null;
		}
		
		function setBodyClass()
		{
			var docBody = document.querySelector("body");
			var bodyCls = (docBody.getAttribute("class"))?docBody.getAttribute("class").split(","):[];
			var ua = navigator.userAgent.toLowerCase();

			if (ua.indexOf("android") != -1)
			{
				bodyCls.push("mobile");	
				bodyCls.push("android");
			}
			else if (ua.indexOf("iphone") != -1)
			{
				bodyCls.push("mobile");
				if (ua.indexOf("ipad") == -1)
					bodyCls.push("iphone");
				else
					bodyCls.push("ipad");
			}

			if (-1 != document.cookie.indexOf("OFBiz.Visitor="))
			{
				bodyCls.push("OFB");
				isOFB = true;
			}

			bodyCls.push("XDBApp");
			docBody.setAttribute("class", bodyCls.join(" "));
		}
		
		//public function
		this.init = function()
		{			
			setBodyClass();
			
			checkBaseDepends(function(){
				
				if (isOFB || (typeof configure.hashChange).toLowerCase() == "boolean")
				{
					var ofbUrl = getOFBURLInfo();
					if (null != ofbUrl)
					{
						if (!configure || !configure.URLRoot)
						{
							ROOT = "/" + ofbUrl.component + "/control/"
						}
					}
					
					Backbone.history.start(
						{
							hashChange: false
							,pushState: false
							,silent: false
							,root: ROOT
						}
					);
				}
				else
				{
					Backbone.history.start({pushState: true});
				}
				
				var router = defineRouter();
				appRouter = new router();
				envReady = true;
				
				if (null != startFunc)
				{
					startFunc.apply(self, [self]);
					startFunc = null;
				}
			});
		};
		
		this.getRouter = function()
		{
			return appRouter;
		}
		
		this.start = function(callback)
		{
			startFunc = callback;
			if (envReady)
			{
				var title = (configure && configure.AppName)?configure.AppName:document.title;

				title = (configure && configure.AppTitle)?configure.AppTitle:title;
				document.title = title;

				startFunc.apply(self, [self]);
				startFunc = null;
			}
		}		
		
		this.getAppName = function()
		{
			return getConfigureProperty("AppName");
		}
		
		this.getAppTitle = function()
		{
			return getConfigureProperty("AppTitle");
		}
		
		this.init();
	}
	
	var XDBApp = 
	{
		getInstance:function(callback)
		{
			if (null == xbdappInst)
			{
				xbdappInst = new XDBApplication(config);
				callback.apply(this, [xbdappInst]);
			}
			else
			{
				callback.apply(this, [xbdappInst]);
			}
			//return xdbappInst;
		}
		,base: {}
	}	
	
	if ((typeof define).toLowerCase() === "function")
	{
		define(
			['module']
			,function(module)
			{
				config = module.config();				
				return XDBApp;
			}
		);
	}
	else
	{
		window.XDBApp = XDBApp;
	}
	
	//XDBApp.init();
})(window);
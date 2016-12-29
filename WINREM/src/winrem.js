//本组件自动设置HTML的font-size，作为整个应用的rem值。
(function(win){
	var v = null
		,initial_scale = null
		,dom = win.document
		,domEle = dom.documentElement
		,viewport = dom.querySelector('meta[name="viewport"]')
		,flexible = dom.querySelector('meta[name="flexible"]');
	
	var winrem_mod = function(w)
	{
		
		if (viewport) 
		{
			//viewport：<meta name="viewport"content="initial-scale=0.5, minimum-scale=0.5, maximum-scale=0.5,user-scalable=no,minimal-ui"/>
			var o = viewport.getAttribute("content").match(/initial\-scale=(["']?)([\d\.]+)\1?/);
			if(o)
			{
				initial_scale = parseFloat(o[2]);
				v = parseInt(1 / initial_scale);
			}
		} 
		else 
		{
			if (flexible) 
			{
				var o = flexible.getAttribute("content").match(/initial\-dpr=(["']?)([\d\.]+)\1?/);
				if(o)
				{
					v = parseFloat(o[2]);
					initial_scale = parseFloat((1 / v).toFixed(2))
				}
			}
		}
		
		if (!v && !initial_scale) 
		{
			var n = (w.navigator.appVersion.match(/android/gi), w.navigator.appVersion.match(/iphone/gi));
			v = w.devicePixelRatio;
			v = n ? v >= 3 ? 3 : v >= 2 ? 2 : 1 : 1, initial_scale = 1 / v
		}
		//没有viewport标签的情况下
		if (domEle.setAttribute("data-dpr", v), !viewport) 
		{
			if (viewport = dom.createElement("meta")
				,viewport.setAttribute("name", "viewport")
				,viewport.setAttribute("content", "initial-scale=" + initial_scale + ", maximum-scale=" + initial_scale + ", minimum-scale=" + initial_scale + ", user-scalable=no,minimal-ui")
				, domEle.firstElementChild) 
			{
				domEle.firstElementChild.appendChild(viewport)
			} 
			else 
			{
				var m = dom.createElement("div");
				m.appendChild(viewport), dom.write(m.innerHTML)
			}
		}
		
		w.dpr = v;
		
		this.attached = false;
		
		this.resize();
	}
	
	//如果需要捕捉reszie事件，得到实例以后，直接调用该方法。参数isattah为false时，取消resize事件绑定。
	winrem_mod.prototype.attach_resize = function(isattach)
	{
		if (undefined == isattach)
			isattach = true;
		
		if ((typeof isattach).toLowerCase() !== "boolean")
			isattach = false;
		
		console.log(isattach);
		
		if (true === isattach)
		{
			console.log(this.attached)
			if (false === this.attached)
			{
				
				if (win.addEventListener)
				{
					win.addEventListener(
						"resize"
						,this.resize)
				}
				else if (win.attachEvent)
				{
					win.attachEvent(
						"onresize"
						,this.resize
					);
				}
				else
				{
					win["resize"] = this.resize;
				}
				
				this.attached = true;
				console.log(this.attached);
			}
		}
		else if (false === isattach)
		{
			if (true === this.attached)
			{
				if (win.addEventListener)
				{
					win.removeEventListener(
						"resize"
						,this.resize)
				}
				else if (win.attachEvent)
				{
					win.detachEvent(
						"onresize"
						,this.resize
					);
				}
				else
				{
					win["resize"] = null;
				}
				
				this.attached = false;
			}
		}
	}
	
	winrem_mod.prototype.resize = function() 
	{
		var domWidth = domEle.getBoundingClientRect().width;
		var domHeight = domEle.getBoundingClientRect().height;
		//console.log(domHeight, domWidth, v);
		
		if(domWidth / v > 540)
		{
			domHeight = domHeight * v;
		}
		
		//console.log(domHeight, domWidth);
		//console.log(domHeight/47, domWidth/33.75);
		
		if (Math.abs(domWidth / 33.75 - 14) > Math.abs(domHeight / 47 - 14))
		{
			win.rem = domHeight / 47;
			//console.log("deps Height");
		}
		else
		{
			win.rem = domWidth / 33.75;
			//console.log("deps width");
		}
			
		
		//win.rem = domWidth / 33.75; //以宽度为单位作为屏幕的基准
		//win.rem = domHeight / 47; //以高度为单位作为屏幕的基准
		
		domEle.style.fontSize = win.rem + "px";
	}
	
	var inst = null;
	
	if ((typeof define).toLowerCase() === "function")
	{
		define(
			[]
			,function()
			{
				if (null == inst)
				{
					inst = new winrem_mod(win);
				}
				
				return inst;
			}
		);
	}
	else
	{
		if ((typeof XBDApp).toLowerCase() === "undefined")
		{
			XBDApp = {};
			XBDApp.base = {};		
		}
		
		if ((typeof XBDApp.base.winrem).toLowerCase() !== "object")
		{
			XBDApp.base.winrem = new winrem_mod(win);
		}
	}
})(window);


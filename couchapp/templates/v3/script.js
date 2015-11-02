(function()
{

	//css
	var csslink = document.createElement('link');
	csslink.setAttribute("rel","stylesheet");
	csslink.setAttribute("type","text/css");
	csslink.setAttribute("href","{{Embeddcode.hostname.prod}}/c/twr/{{Embeddcode.hash}}/{{style}}");
	document.getElementsByTagName('head')[0].appendChild(csslink);

	var socialbox = document.getElementsByClassName("socialbox");
	for(i=0;i < socialbox.length;i++){ 
		if (socialbox[i].hasAttribute('style')){
			socialbox[i].removeAttribute('style');
		}
	}


	function socialcookie() {
		var setup = {};
			setup.timeout = 3000;
			setup.promise = (typeof ES6Promise !== "undefined")?ES6Promise.Promise:undefined;

		if (typeof crossStorageClientHUB !== "object"){
			crossStorageClientHUB = new CrossStorageClient('http://www.zdf.de/ZDFxt/module/socialoptin/hub.html',setup);			
		} else {
			return;
		}
		
		crossStorageClientHUB.onConnect()
			.then(function() {
				return crossStorageClientHUB.get("social");})
			.then(function(res) {
				if (res !== null){
					//Fire event
					console.log(res); //==true or false
					if(res === true)
					{						
						activateSocial();
					}
				} else{
					//Fire event
					console.log("undefined"); //wer braucht das?
				}})["catch"](function(err) {
				// Handle error
				console.log("error xxx",err);
			});
	}


	function loadScript(url,callback,args) {
	    scriptEl = document.createElement('script');
	    scriptEl.type = 'text/javascript';
	    scriptEl.async = true;
	    scriptEl.src = url;

	    if (typeof(callback) === 'function'){

	    	if ("onload" in scriptEl){
			    scriptEl.onload = function(){
			        // remote script has loaded
			        if (args){
			        	callback.apply(null,args);
			        } else {
			        	callback.apply();
			        }
			    };    		
	    	} else {
	    		var r = false;
	            scriptEl.onreadystatechange = function() {
					if (!r && (!this.readyState || this.readyState === 'complete')) {
						r = true;
				        if (args){
				        	callback.apply(null,args);
				        } else {
				        	callback.apply();
				        }
					}
	            };
			}
	    }	    	
	    document.getElementsByTagName('head')[0].appendChild(scriptEl);
	}


	//global collection of social content
	if (typeof socialcontentbdsg == 'undefined') {
		socialcontentbdsg = [];
	}

	socialcontentbdsg.push( function bdsg{{hash}}() {

		var htmlsrc64 = '{{{Embeddcode.html64}}}';
		var script = '{{{Embeddcode.inline}}}';
		var scripts = [];

		{{#each Embeddcode.scriptlinks}}
		scripts.push("{{this}}");
		{{/each}}	



		this.activate = function activate()
		{


			function atobforIE (s){
				if (typeof atob === "function"){
					return atob(s);
				} else {
				    var e={},i,b=0,c,x,l=0,a,r='',w=String.fromCharCode,L=s.length;
				    var A="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
				    for(i=0;i<64;i++){e[A.charAt(i)]=i;}
				    for(x=0;x<L;x++){
				        c=e[s.charAt(x)];b=(b<<6)+c;l+=6;
				        while(l>=8){((a=(b>>>(l-=8))&0xff)||(x<(L-2)))&&(r+=w(a));}
				    }
				    return r;			
				}
			}
			document.getElementById('_{{Embeddcode.hash}}').innerHTML = atobforIE(htmlsrc64);

			if (scripts.length > 0){
				for(var i1=0; i1 < scripts.length; i1++)
				{
					var last = (i1 == scripts.length-1); //true on last script url
					if (last){
						loadScript(scripts[i1],function(script){
							eval(script);
						},Array(script));
					} else {
						loadScript(scripts[i1]);
					}
				}
			} else {
				eval(script);
			}
		}

		if (typeof socialcookievalue !== "undefined" && socialcookievalue){
			this.activate();
		} else {
			return {
				activate:activate
			}
		}
	}());


	//Click
	if (typeof activateSocial !== "function"){

		var removeclass = function removeclass(){

			var els  = document.getElementsByClassName("overlayon");
			for (var i=0;i<els.length;i++){
				var el = els[i];
					el.className = el.className.replace(/\boverlayon\b/,'overlayoff');
			}
		}

		activateSocial = function activateSocial() //global 
		{

			socialcookievalue = true;
			crossStorageClientHUB.onConnect()
				.then(function() {
					return crossStorageClientHUB.set('social', true);})
				.then(function(res) {
					console.log("save");
				})["catch"](function(err) {
					if(err.message == "Invalid permissions for set"){
						alert("Änderungen sind nur über die zdf.de Domain zulässig.");
					}
					console.log("error csc",err);
				});

			while(socialitem = socialcontentbdsg.pop()){
				socialitem.activate();
			}

			removeclass();	
		}
	}



	var execscripts = function(){
    	// remote script shoul have loaded
		socialcookie();
	}

	//HUB
	if (typeof crossStorageClientHUB == 'undefined'){
		
		if (typeof Promise == 'undefined'){
			loadScript("http://www.zdf.de/ZDFxt/module/socialoptin/js/libs/es6-promise.js", function(){
				loadScript("http://www.zdf.de/ZDFxt/module/socialoptin/js/cross-storage/client.js", execscripts);				
			});			
		} else {
			loadScript("http://www.zdf.de/ZDFxt/module/socialoptin/js/cross-storage/client.js", execscripts);			
		}
	}	


})();

//css
(function (){
	
	if (typeof socialcss == 'undefined') {
		var csslink = document.createElement('link');
		csslink.setAttribute("rel","stylesheet")
		csslink.setAttribute("type","text/css")
		csslink.setAttribute("href","style.css");
		document.getElementsByTagName('head')[0].appendChild(csslink);
		socialcss = true;
	}

})();


//global collection of social content
if (typeof socialcontentbdsg == 'undefined') {
	socialcontentbdsg = [];
}

socialcontentbdsg.push( function bdsg5ca604e477c1f7facb7fe705afb10c9e1fd4e49d() {

	var htmlsrc64 = 'PGlmcmFtZSBzcmM9Imh0dHA6Ly96ZGYubWFzc3JlbC5pby9uZW8tbWFnYXppbi1yb3lhbGUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZyYW1lYm9yZGVyPSIwIiBzY3JvbGxpbmc9ImF1dG8iIG1hcmdpbmhlaWdodD0iMHB4IiBtYXJnaW53aWR0aD0iMHB4IiBhbGxvd2Z1bGxzY3JlZW49IiI+PC9pZnJhbWU+';
	var script = 'console.log("inline code");';
	var scripts = [];


	/*private*/
	function insertScript(url, evaluate) {
	    scriptEl = document.createElement('script');
	    scriptEl.type = 'text/javascript';
	    scriptEl.async = true;

	    if (evaluate){
	    	if ("onload" in scriptEl){
			    scriptEl.onload = function(){
			        // remote script has loaded
			        eval(script);
			    };    		
	    	} else {
	    		setTimeout(function(){
		        	// remote script shoul have loaded
	        		eval(script);
	    		},2000);
	    	}
	    }
	    scriptEl.src = url;
	    document.getElementsByTagName('head')[0].appendChild(scriptEl);
	}

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
		document.getElementById('_5ca604e477c1f7facb7fe705afb10c9e1fd4e49d').innerHTML = atobforIE(htmlsrc64);

		if (scripts.length > 0){
			for(var i1=0; i1 < scripts.length; i1++)
			{
				var last = (i1 == scripts.length-1);
				insertScript(scripts[i1],last);
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
	var activateSocial = function activateSocial()
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
	}
}


//HUB
(function (undefined ) {	

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

	function insertScript(url,exec,callback) {
	    scriptEl = document.createElement('script');
	    scriptEl.type = 'text/javascript';
	    scriptEl.async = true;
	    scriptEl.src = url;

	    if (exec){
	    	if ("onload" in scriptEl){
			    scriptEl.onload = function(){
			        // remote script has loaded
			        socialcookie();
			    };    		
	    	} else {
	    		setTimeout(function(){
		        	// remote script shoul have loaded
	        		socialcookie();
	    		},2000);
	    	}
	    }
	    if (callback){
	    	if ("onload" in scriptEl){
			    scriptEl.onload = function(){
			        // remote script has loaded
			        callback();
			    };    		
	    	} else {
	    		setTimeout(function(){
		        	// remote script shoul have loaded
	        		callback();
	    		},2000);
	    	}	    	
	    }
	    document.getElementsByTagName('head')[0].appendChild(scriptEl);
	}


	if (typeof crossStorageClientHUB == 'undefined'){
		
		if (typeof Promise == 'undefined'){
			insertScript("http://www.zdf.de/ZDFxt/module/socialoptin/js/libs/es6-promise-2.0.0.min.js",false, function(){
				insertScript("http://www.zdf.de/ZDFxt/module/socialoptin/js/cross-storage/client-0.3.3.js",true);				
			});			
		} else {
			insertScript("http://www.zdf.de/ZDFxt/module/socialoptin/js/cross-storage/client-0.3.3.js",true);			
		}
	}	

})();

//eventcapture for p12


// function SocialElementBdsg()
// {
// 	var id = "5ca604e477c1f7facb7fe705afb10c9e1fd4e49d";
// 	var htmlsrc64 = 'PGlmcmFtZSBzcmM9Imh0dHA6Ly96ZGYubWFzc3JlbC5pby9uZW8tbWFnYXppbi1yb3lhbGUiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZyYW1lYm9yZGVyPSIwIiBzY3JvbGxpbmc9ImF1dG8iIG1hcmdpbmhlaWdodD0iMHB4IiBtYXJnaW53aWR0aD0iMHB4IiBhbGxvd2Z1bGxzY3JlZW49IiI+PC9pZnJhbWU+';

// 	this.getID = function getID()
// 	{
// 		return id;
// 	}

// 	this.getSource = function getSource()
// 	{
// 		return atob(htmlsrc64);
// 	}
// }


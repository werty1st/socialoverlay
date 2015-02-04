
(function (){	
	var csslink = document.createElement('link');
	csslink.setAttribute("rel","stylesheet")
	csslink.setAttribute("type","text/css")
	csslink.setAttribute("href","{{clienthostname}}/c/twr/_design/tweetrenderdb/templates/v1/style.css");
	document.getElementsByTagName('head')[0].appendChild(csslink);
}())


//eventcapture for p12


function bdsg{{hash}}(){

	
	var htmlsrc64 = '{{{html64}}}';

	var script = '{{{inline}}}';
	var scripts = [];

	{{#each scriptlinks}}
	scripts.push("{{this}}");
	{{/each}}	

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

	document.getElementById('{{hash}}').innerHTML = atob(htmlsrc64);
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

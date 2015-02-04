var phantom = require('phantom');



//=applogic (message, imagebuffer)
exports.load = function(w,h,contentUrl,applogic){
	this.height = h;
	this.width  = w;
	//this.content = content.replace("src=\"//","src=\"https://").replace("src='//","src='https://");
	var self = this;
	
	//wrapper
	phantom.create(function (ph) {
		ph.createPage(function (page) {

			console.log("phantom.create");
			//bildgröße
			page.set("viewportSize", {
				width: self.width,
				height: self.height
			});
		
			page.set("settings.userAgent","Mozilla/5.0 (X11; Linux x86_64; rv:28.0) Gecko/20100101 Firefox/28.0");

			//console.log("ph.createPage");
			var buffer = "";
    		var count = 0;
    		var timeout;
    		var filenamex = 0;
    		var pagedimensions;

			//rendeCompleteEvent
	    	page.set('onLoadFinished', function ( status ){

				setTimeout(function(){
	    			console.log("phantomRender.onLoadFinished");
					page.renderBase64('PNG', function(base64){		    			
			    		var buf = new Buffer(base64, 'base64');
			    		buffer = buf;
						page.evaluate(function () {
						 return {"x":document.body.offsetWidth,
						         "y":document.body.offsetHeight}
						        }, function (result) {
						        		pagedimensions = result;
								   });
		    		});
		    		//page.render('image:' + new Date() +'.png', {format: 'png', quality: '100'});					

	    			count++;
	    			if (timeout){
	    			 	clearTimeout(timeout);
	    				count--;
	    			}
					timeout = setTimeout(function(){
						count--;
						console.log("counts: ", count);
						console.log('Page width:' , pagedimensions.x, " Page height: ",pagedimensions.y);
						applogic.emit("applogic.renderImageCompleted", buffer, pagedimensions);
						console.log("ph exit");
						ph.exit();
					},2000);  



					},2000); 

			});	    


	    	// setInterval(function(){
	    	// 	page.render('image:' + new Date() +'.png', {format: 'png', quality: '100'});
	    	// },5000);

			page.set("onConsoleMessage", function(msg, lineNum, sourceId) {
				console.log('PHJS_CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
			});

			//todo mit onResourceTimeout und request.id alle requests abfangen und erst nach dem letzten
			//den onLoadFinished event auslösen, vorher onLoadFinished sammeln
	    	page.set('onResourceRequested', function(data)
    		{
  				console.log("onResourceRequested", data);
    		});

			page.set('onResourceReceived', function(response)
			{
				applogic.emit("applogic.ping");
			});

	    	//quelltext einfügen und render auslösen
	     	
	     	//page.set('content', self.content);
	     	page.open(contentUrl);
	     	//console.log("phjs content: ", self.content);
     		

		});
	},"--ssl-protocol=TLSv1");
}



//db setup
var cradle = require('cradle');
var util = require("util");
var EventEmitter = require('events').EventEmitter;

var Handlebars = require('handlebars');
function renderTemplate(html,data){
	var template = Handlebars.compile(html);
	var text = template(data);
	//return new Handlebars.SafeString(text);
	return (text);
}


function Datastore(config)
{
	if (typeof config !== "object") config = {};

	config.couchserver = config.couchserver || "http://localhost";
	config.version = config.version || "v2";

	var self = this;
	this.doc = {};
	var db = new (cradle.Connection)(config.couchserver, 5984).database('twr');

	var RenderRequest = {};
	var Embeddcode = {};

	db.exists(function (err, exists) {
	    if (err && !exists) {
	      console.log('error', err);
	      throw new Error("Database not ready");
	    }
	  });


	function uploadComplete ( emitNext, payload ){
		return function(err, doc)
		{
			if (!err)
			{
				console.log("rev:",doc.rev);
				console.log("next:",emitNext);
				self.doc = doc;
				self.emit(emitNext, payload);
			} else 
			{
				console.log(err);
			}
		};
	}

	this.on("datastore.getDocRequest", function (_RenderRequest, _Embeddcode){
		//gucke im speicher/cache nach sonst render neu
		console.log("datastore.getDocRequest");

		RenderRequest = _RenderRequest;
		Embeddcode 	  = _Embeddcode;		

        /*
        //RenderRequest
        { code: '<blockquote class="twitter-tweet" lang="de"><p>Hübscher Willkommensgruß in unserer Kantine auf dem Lerchenberg. <a href="http://t.co/ahQ1YNCHZR">pic.twitter.com/ahQ1YNCHZR</a></p>&mdash; ZDF (@ZDF) <a href="https://twitter.com/ZDF/status/516534564421136384">29. September 2014</a></blockquote>\r\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>\r\n',
          hostname: 'http://wmaiz-v-sofa02.dbc.zdf.de',
          overwrite: true,
          screensize: [ 320, 768, 1224, 1824 ],
          version: 2,
          autorefresh: { freq: 12, duration: 1, enabled: true },
          mobileurl: 'http://m.zdf.de',
          slug: 'test631' }
        
        //Embeddcode
        { scriptlinks: [ '//platform.twitter.com/widgets.js' ],
          inline: 'console.log("inline code");',
          html64: 'PGJsb2NrcXVvdGUgY2xhc3M9InR3aXR0ZXItdHdlZXQiIGxhbmc9ImRlIj48cD5Iw7xic2NoZXIgV2lsbGtvbW1lbnNncnXDnyBpbiB1bnNlcmVyIEthbnRpbmUgYXVmIGRlbSBMZXJjaGVuYmVyZy4gPGEgaHJlZj0iaHR0cDovL3QuY28vYWhRMVlOQ0haUiI+cGljLnR3aXR0ZXIuY29tL2FoUTFZTkNIWlI8L2E+PC9wPuKAlCBaREYgKEBaREYpIDxhIGhyZWY9Imh0dHBzOi8vdHdpdHRlci5jb20vWkRGL3N0YXR1cy81MTY1MzQ1NjQ0MjExMzYzODQiPjI5LiBTZXB0ZW1iZXIgMjAxNDwvYT48L2Jsb2NrcXVvdGU+Cgo=',
          hash: 'f4a7e6e2567107a950d86d74af9eea8b41904090',
          hostname: 'http://wmaiz-v-sofa02.dbc.zdf.de' }

        */  		

		db.get(Embeddcode.hash, function(err, doc)
		{

			// console.log(doc);
			// process.exit();
			if (!err && !RenderRequest.overwrite)
			{
				self.doc = doc;
				//todo abschalten und einschaltbar machen (überschreiben/löschen button)
				self.emit("datastore.docFound");
				//self.emit("datastore.newDocCreated");
			} else
			{
				//doc=undefined OR rev!=null
				console.log("not found OR overwrite by request");		

				var newdoc = {};
				newdoc.type = "post";
				newdoc.hostname 	= RenderRequest.overwrite;
				newdoc.screensize 	= RenderRequest.screensize;
				newdoc.autorefresh 	= RenderRequest.autorefresh;
				newdoc.mobileurl 	= RenderRequest.mobileurl;
				newdoc.slug 		= RenderRequest.slug;
				
				newdoc.version = "101";
				newdoc.dateCreated = new Date();

				if(!doc){

					db.save(Embeddcode.hash, newdoc, function (err, res) {
					  if (err) {
					    // Handle error
					  } else {
					    // Handle success
					    self.doc = res;
						console.log("new doc created",res);
						self.emit("datastore.newDocCreated");
					  }
					});							

				} else {

					self.doc = {id: doc._id, rev: doc._rev};

					//delete doc
					db.remove(self.doc.id, self.doc.rev, function (err, res) {
						// Handle response
						if(!err){
						    self.doc = res;
							console.log("doc updated");

							//save new doc data
							db.save(Embeddcode.hash, newdoc, function (err, res) {
							  if (err) {
							    // Handle error
							    throw new Error("Doc save failed",err);
							  } else {
							    // Handle success
							    self.doc = res;
								console.log("doc updated");
								self.emit("datastore.newDocCreated");
							  }
							});	

						} else {
							throw new Error("Doc overwrite failed",err);
						}
					});


				
				}



			}

		});
	});

	// --> saveScriptRequest
	this.on("datastore.saveRendersourceRequest", function(){
		console.log("datastore.saveRendersourceRequest");

		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/rendersource.html", function(err, repl){
			if (!err){
				var template_html = repl.body.toString('utf8');
				var target_html = renderTemplate(template_html, { code:RenderRequest.code,
																  bgimageurl: RenderRequest.bgimageurl
																});

				db.saveAttachment( self.doc , 	//doc.id
				{ name : 'rendersource.html',
				  'Content-Type' : 'text/html;charset=utf-8',
				  body : target_html
				},
				uploadComplete("datastore.saveRendersourceComplete"));
			}
		});
	})


	// this.on("datastore.saveIframeRequest", function(){
	// 	console.log("datastore.saveIframeRequest");

	// 	db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/iframe.html", function(err, repl){
	// 		if (!err){
	// 			var template_html = repl.body.toString('utf8');
	// 			var renderSource = Embeddcode.hostname + "/c/twr/"+ Embeddcode.hash +"/rendersource.html";
	// 			var target_html = renderTemplate(template_html, { rendersource: renderSource , bgimageurl: RenderRequest.bgimageurl});

	// 			db.saveAttachment( self.doc , 	//doc.id
	// 			{ name : 'iframe.html',
	// 			  'Content-Type' : 'text/html;charset=utf-8',
	// 			  body : target_html
	// 			},
	// 			uploadComplete("datastore.saveIframeComplete"));
	// 		}
	// 	});
	// })



	this.on("datastore.saveImageRequest", function (name,imagedimensions,imagebuffer){
	//this.on("datastore.saveImageRequest", function (){
		//gucke im speicher/cache nach sonst render neu
		console.log("datastore.saveImageRequest as",name);

		//speichere bild in db
		db.saveAttachment( self.doc , 	//doc.id
							  { 
							  	name : name,
							  	'Content-Type' : 'image/png',
							  	body : imagebuffer  
							  },
							  uploadComplete("datastore.saveImageComplete", {name: name} ) );
	});




	this.on("datastore.updateDocDateRequest", function (){
		console.log("datastore.updateDocDateRequest");

		db.merge(	self.doc.id,
					{ dateUpdated: new Date() }, 
					uploadComplete("datastore.updateDocDateComplete", {} )
				);
	});




	// --> saveOrigEmbedCodeRequest
	this.on("datastore.saveScriptRequest", function (){
		console.log("datastore.saveScriptRequest");

		//template laden
		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/script.js", function(err, repl){
			if (!err){
				var template_script = repl.body.toString('utf8');
				var targetscript = renderTemplate(template_script, Embeddcode);

				db.saveAttachment( self.doc , 	//doc.id
					{ name : 'script.js',
					  'Content-Type' : 'text/javascript;charset=utf-8',
					  body : targetscript
					},
					uploadComplete("datastore.saveScriptComplete")
				);
			}
		})
	});



	this.on("datastore.saveCssRequest", function (){
		console.log("datastore.saveCssRequest");

		//template laden
		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/style.css", function(err, repl){
			if (!err){
				var template_script = repl.body.toString('utf8');
				var targetscript = renderTemplate(template_script, { 	hash : self.doc.id,
																  		imagedimensions : Embeddcode.imagedimensions,
																  		bgimageurl: RenderRequest.bgimageurl
																   });

				db.saveAttachment( self.doc , 	//doc.id
					{ name : 'style.css',
					  'Content-Type' : 'text/css;charset=utf-8',
					  body : targetscript
					},
					uploadComplete("datastore.saveCssComplete")
				);
			}
		})
	});


	this.on("datastore.saveHtmlRequest", function(){
		console.log("datastore.saveHtmlRequest");

		var template_name = "embed.html";
		
		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/"+template_name, function(err, repl){
			if (!err){
				var template_html = repl.body.toString('utf8');
				var target_html = renderTemplate(template_html, { hash : self.doc.id,
																  clienthostname : Embeddcode.hostname,
																  imagedimensions : Embeddcode.imagedimensions,
																  bgimageurl: RenderRequest.bgimageurl
																});

				db.saveAttachment( self.doc , 	//doc.id
				{ name : 'embed.html',
				  'Content-Type' : 'text/html;charset=utf-8',
				  body : target_html
				},
				uploadComplete("datastore.saveHtmlComplete"));
			}
		});		
	})

	this.on("datastore.saveXmlRequest", function(){
		console.log("datastore.saveXmlRequest");	

		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/embed.xml", function(err, repl){
			if (!err){
				var template_html = repl.body.toString('utf8');
				var target_html = renderTemplate(template_html, {hash:self.doc.id,clienthostname:Embeddcode.hostname});

				db.saveAttachment( self.doc , 	//doc.id
				{ name : 'embed.xml',
				  'Content-Type' : 'text/xml;charset=utf-8',
				  body : target_html
				},
				uploadComplete("datastore.saveXmlComplete"));
			}
		});		
	})	













}

util.inherits(Datastore, EventEmitter);
module.exports.Datastore = Datastore;

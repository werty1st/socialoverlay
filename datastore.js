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
	config.version = config.version || "v2";	//umbauen: nicht am anfang sondern per request

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


	function uploadComplete ( emitNext ){
		return function(err, doc)
		{
			if (!err)
			{
				console.log("rev:",doc.rev);
				console.log("next:",emitNext);
				self.doc = doc;
				self.emit(emitNext);
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

		db.get(Embeddcode.hash, function(err, doc)
		{
			//console.log(doc); 
			if (!err && !RenderRequest.overwrite)
			{
				self.doc = doc;
				//todo abschalten und einschaltbar machen (überschreiben/löschen button)
				self.emit("datastore.docFound");
				//self.emit("datastore.newDocCreated");
			} else
			{
				console.log("overwrite by request");
				self.doc.id = Embeddcode.hash;
				delete self.doc.rev;
				self.emit("datastore.newDocCreated");
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
																  bgimageurl: RenderRequest.bgimageurl,
																  size: (RenderRequest.screensize==1)?"klein":"gross"
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


	this.on("datastore.saveIframeRequest", function(){
		console.log("datastore.saveIframeRequest");

		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/iframe.html", function(err, repl){
			if (!err){
				var template_html = repl.body.toString('utf8');
				var renderSource = Embeddcode.hostname + "/c/twr/"+ Embeddcode.hash +"/rendersource.html";
				var target_html = renderTemplate(template_html, { rendersource: renderSource , bgimageurl: RenderRequest.bgimageurl});

				db.saveAttachment( self.doc , 	//doc.id
				{ name : 'iframe.html',
				  'Content-Type' : 'text/html;charset=utf-8',
				  body : target_html
				},
				uploadComplete("datastore.saveIframeComplete"));
			}
		});
	})


	this.on("datastore.saveImageRequest", function (){
		//gucke im speicher/cache nach sonst render neu
		console.log("datastore.saveImageRequest");

		//speichere bild in db
		db.saveAttachment( self.doc , 	//doc.id
							  { name : 'preview',
							  	'Content-Type' : 'image/png',
							  	body : Embeddcode.imagebuffer  
							  },
							  uploadComplete("datastore.saveImageComplete") );
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
																  		size: (RenderRequest.screensize==1)?"klein":"gross",
																  		bgimageurl: (RenderRequest.screensize==2)?RenderRequest.bgimageurl:""
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

		
		db.getAttachment("_design/tweetrenderdb", "templates/"+config.version+"/embed.html", function(err, repl){
			if (!err){
				var template_html = repl.body.toString('utf8');
				var target_html = renderTemplate(template_html, { hash : self.doc.id,
																  clienthostname : Embeddcode.hostname,
																  imagedimensions : Embeddcode.imagedimensions,
																  // bgimageurl: RenderRequest.bgimageurl
																  bgimageurl: (RenderRequest.screensize==2)?RenderRequest.bgimageurl:""
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

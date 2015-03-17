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

					db.merge(Embeddcode.hash, newdoc, function (err, res) {
					  if (err) {
					    // Handle error
					  } else {
					    // Handle success
					    self.doc = res;
						console.log("doc updated",res);
						self.emit("datastore.newDocCreated");
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

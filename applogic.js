
var ds = require('./datastore');
var crypto = require('crypto');
var jsdom = require("jsdom").jsdom;

var util = require("util");
var EventEmitter = require('events').EventEmitter;

var Handlebars = require('handlebars');

//erzeuge hash und suche in db 
// wenn vorhanden antworte mit link aus DB
// sonst erstelle bild und speichere in DB und antworte mit link aus DB
// this.imageObj = datastore.get( this.content );

console.log("applogic init");

function gethash ( content )
{
    //cache hash content
    var shasum = crypto.createHash('SHA1');
    var hash = shasum.update(content);
    var d = shasum.digest('hex');    
    return d;
}

function extractscript2 (src)
{
    function isInline (node)
    {
        if (node.getAttribute("src") !== null)return false; else return true;
    }

    var result = { scriptlinks:[], inline:'console.log(\"inline code\");' };
    var doc = jsdom( src, { features: { ProcessExternalResources: false }} );
    var s = doc.getElementsByTagName("script");

    for (var i = s.length - 1; i >= 0; i--) {
        if (isInline(s[i]))
        {
            //console.log("inline");
            var sl = s[i].innerHTML;
            sl = sl.replace(/'/g, '"');
            //console.log("script inline: ",sl);
            result.inline +=(sl+";");
        } else 
        {
            //console.log("scriptlinks");
            var sr = s[i].getAttribute("src");
            result.scriptlinks.push(sr);
        }
    };


    for (var i = s.length - 1; i >= 0; i--) {
        var el = s[i];
        el.parentNode.removeChild(el);
    };
    
    //result.html = doc.getElementsByTagName("body")[0].innerHTML;
    result.html64 = new Buffer( doc.getElementsByTagName("body")[0].innerHTML ).toString('base64');
    result.inline = result.inline;
    
    return result;

}

function Applogic ( rasterrizer )
{
    //var config = config || {};
    
    // we need to store the reference of `this` to `self`, so that we can use the current context in the setTimeout (or any callback) functions
    // using `this` in the setTimeout functions will refer to those funtions, not the Radio class
    var self = this;
    var Embeddcode = {};
    
    var version = "v2";
    var hostname = "http://sofa01.zdf.de";
    //var hostname = "http://wmaiz-v-sofa02.dbc.zdf.de";


    var dbcomplete = false;
    var datastore = new ds.Datastore({couchserver:"http://localhost"});

    var doc = {};

    var running = false;

    /*
     RenderRequest.code       => html embedcode
     RenderRequest.hostname   => zur erknnung von prod oder int
     RenderRequest.overwrite  => bei erkanntem hash trotzdem neu anlegen
     RenderRequest.screensize => 1:360x400,2:800x600
     RenderRequest.version    => nicht implementiert
     RenderRequest.bgimageurl => bg image for iframe rendering
    */

    this.on("applogic.renderImageRequest", function (myRenderRequest) {
        console.log('applogic.renderImageRequest');  
        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
        //console.log(myRenderRequest);

        if (running){
            console.log("waiting for open request");
            return;
        }
        running = true;

        //console.log(RenderRequest);  return;
        RenderRequest          = myRenderRequest;

        Embeddcode             = extractscript2( RenderRequest.code );
        Embeddcode.hash        = gethash( RenderRequest.code );//berechne hash und suche in db danach        
        //Embeddcode.original  = RenderRequest.code;
        //Embeddcode.hostname    = RenderRequest.hostname; //hostname; //wird überschrieben
        Embeddcode.hostname    = hostname; //wird überschrieben im webmaster editor anpassen auf sofa01.zdf.de
        

        RenderRequest.version  = version; //wird überschrieben

        
        /*
            Embeddcode.hash             => hash des embedcodes
            Embeddcode.original         => original embedcode mit script
            Embeddcode.html64           => embedcode ohne script als base64
            Embeddcode.inline64         => inline js als base64
            Embeddcode.scriptlinks      => array of js urls
        */
        
        //suche nach doc mit doc.id==hash
        datastore.emit("datastore.getDocRequest", RenderRequest, Embeddcode); // --> newDocCreated
    });

    //hash in db gefunden
    datastore.on("datastore.docFound", function(){
        console.log('datastore.docFound');
        self.emit("applogic.CodeComplete", Embeddcode.hash);
        running = false;
    });    

    datastore.on("datastore.newDocCreated", function (){
        console.log('applogic.datastore.newDocCreated');
        datastore.emit("datastore.saveRendersourceRequest");
    });   

    datastore.on("datastore.saveRendersourceComplete", function(){
        console.log('applogic.datastore.saveRendersourceComplete');
        datastore.emit("datastore.renderImageRequest");
        
        // if (RenderRequest.bgimageurl){
        //     datastore.emit("datastore.saveIframeRequest");
        // } else {
        //     datastore.emit("datastore.renderImageRequest");
        // }
    });


    datastore.on("datastore.saveIframeComplete", function(){
        console.log('applogic.datastore.saveIframeComplete');
        datastore.emit("datastore.renderImageRequest");
    });


    datastore.on("datastore.renderImageRequest", function(){
        console.log('applogic.datastore.renderImageRequest');

        var renderSource = "";
            renderSource = Embeddcode.hostname + "/c/twr/"+ Embeddcode.hash +"/rendersource.html";

        // if (RenderRequest.bgimageurl){
        //     renderSource = Embeddcode.hostname + "/c/twr/"+ Embeddcode.hash +"/iframe.html";
        // } else {
        //     renderSource = Embeddcode.hostname + "/c/twr/"+ Embeddcode.hash +"/rendersource.html";
        // }

        //renderSource
        console.log(renderSource);
        //bilder rendern und hochlade

        function sendImagebuffer(imagebuffer, imagedimensions, onCompleted)
        {

            if (typeof imagebuffer === "function"){
                //error
                console.log( imagebuffer() );
                running = false;
                onCompleted();
                self.emit("applogic.error", imagebuffer() );
                return;
            }

            //console.log("save image with size:", imagedimensions);
            Embeddcode.imagedimensions = imagedimensions;
            Embeddcode.imagebuffer     = imagebuffer;

            self.emit("applogic.renderImageComplete");
            onCompleted();
        }

        try {            
            rasterrizer.renderUrl(
                renderSource,
                sendImagebuffer,
                RenderRequest.screensize
                /*url, sendImagebuffer(imagebuffer, onCompleted)*/
            );
        } catch (err){
            running = false;
        }
    });

    this.on("applogic.renderImageComplete", function () {
        console.log('applogic.renderImageComplete');        
        datastore.emit("datastore.saveImageRequest");
    });

    datastore.on("datastore.saveImageComplete", function(){
        console.log('applogic.datastore.saveImageComplete');
        datastore.emit("datastore.saveScriptRequest");
    });


    datastore.on("datastore.saveScriptComplete", function(){
        console.log('applogic.datastore.saveScriptComplete');
        datastore.emit("datastore.saveCssRequest");
    });

    datastore.on("datastore.saveCssComplete", function(){
        console.log('applogic.datastore.saveCssComplete');
        datastore.emit("datastore.saveHtmlRequest");
    });    

    datastore.on("datastore.saveHtmlComplete", function(){
        console.log('applogic.datastore.saveHtmlComplete');
        datastore.emit("datastore.saveXmlRequest");
    });



    datastore.on("datastore.saveXmlComplete", function(){
        console.log('applogic.datastore.saveXmlComplete');        
        self.emit("applogic.CodeComplete", Embeddcode.hash);
        running = false;
    });


    

    // this.on("applogic.ping", function () {
    //     console.log("applogic.ping");
    //     //sende ping an browser
    // });


}



//vererbe event funktion
util.inherits(Applogic, EventEmitter);

module.exports = Applogic;



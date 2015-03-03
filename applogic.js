
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
        Embeddcode.hostname    = RenderRequest.hostname; //hostname; //wird überschrieben
        //Embeddcode.hostname    = hostname; //wird überschrieben im webmaster editor anpassen auf sofa01.zdf.de
        

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

        // erstelle bilder mit 3*4 4*3 16*9 9*16 mit (800*600, 1280*800, 1920*1080)
        var screensizes = [
            // {w:  800, h:  600, name:"1l"},
            // {w:  600, h:  800, name:"1p"},
            {w: 1280, h:  800, name:"default"} //2l
            // {w:  800, h: 1280, name:"2p"},
            // {w: 1080, h: 1920, name:"3l"},
            // {w: 1920, h: 1080, name:"3p"}
        ];


        //todo
        default bild prüfen
        browser ansicht anpassen progressbar bild 1 von x usw

        var counter = 0;

        //bleibt für ein doc gleich
        Embeddcode.imagedimensions = screensizes;

        datastore.on("datastore.saveImageComplete", function(){
            console.log('applogic.datastore.saveImageComplete');
            open--;
            console.log("open",open);
            if (open == 0){
                //letztes bild erzeugt                
                self.emit("applogic.renderImagesComplete");
            }
        });

        //ein screenshot wurde erstellt
        function saveImagebuffer(imagebuffer, imagedimensions, nextRender)
        {

            var name = screensizes[counter].name;

            if (typeof imagebuffer === "function"){
                //error
                console.log( imagebuffer() );
                running = false;
                nextRender();
                //fehler beim rendern an browser durchleiten
                self.emit("applogic.error", imagebuffer() );
                return;
            }

            //console.log("save image with size:", imagedimensions);
            // Embeddcode.imagebuffer     = imagebuffer;

            datastore.emit("datastore.saveImageRequest",name,imagedimensions,imagebuffer);
            nextRender();
        }

        var open = 0;
        //erzeuge 6 render tasks
        for(var i = 0; i<screensizes.length; i++)
        {
            try {
                rasterrizer.renderUrl(
                    renderSource,
                    saveImagebuffer, /*posttarget*/
                    screensizes[i]
                    /*url, saveImagebuffer(imagebuffer, nextRender)*/
                );
                open++;
                console.log("open",open);
            } catch (err){
                running = false;
            }

        }

    });

    this.on("applogic.renderImagesComplete", function () {
        console.log('applogic.renderImagesComplete');        
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



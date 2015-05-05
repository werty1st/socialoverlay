
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
    //var hostname = "http://sofa01.zdf.de";
    var hostname = ""; //"http://wmaiz-v-sofa02.dbc.zdf.de";


    var dbcomplete = false;
    var datastore = new ds.Datastore({couchserver:"http://localhost"});

    var doc = {};
    var running = false;


    this.on("applogic.renderImageRequest", function (myRenderRequest) {
        console.log('applogic.renderImageRequest');  
        console.log("XXXXXXXXXXXXXXXXXXXXXXXXXXX");
        //console.log(myRenderRequest);

        /*
        //RenderRequest
        { code: '<blockquote class="twitter-tweet" lang="de"><p>Hübscher Willkommensgruß in unserer Kantine auf dem Lerchenberg. <a href="http://t.co/ahQ1YNCHZR">pic.twitter.com/ahQ1YNCHZR</a></p>&mdash; ZDF (@ZDF) <a href="https://twitter.com/ZDF/status/516534564421136384">29. September 2014</a></blockquote>\r\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>\r\n',
          hostname: 'http://wmaiz-v-sofa02.dbc.zdf.de',
          overwrite: true,
          screensize: [ 320, 768, 1224, 1824 ],
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


        if (running){
            console.log("waiting for open request");
            return;
        }
        running = true;

        RenderRequest          = myRenderRequest;        

        Embeddcode             = extractscript2( RenderRequest.code );
        Embeddcode.hash        = gethash( RenderRequest.code );//berechne hash und suche in db danach        
        Embeddcode.hostname         = {};
        Embeddcode.hostname.int     = 'http://' + RenderRequest.hostname_int; //hostname; //wird überschrieben
        Embeddcode.hostname.prod    = 'http://' + RenderRequest.hostname_prod; //hostname; //wird überschrieben
               

        // console.log(RenderRequest);  return;
        // console.log(Embeddcode);
        // process.exit();
        
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

        //offene rendertasks zählen
        var open = 0;  

        //renderSource
        var renderSource = "";
            renderSource = Embeddcode.hostname.int + "/c/twr/"+ Embeddcode.hash +"/rendersource.html";
        console.log(renderSource);

        //bilder rendern und hochlade
        datastore.on("datastore.saveImageComplete", function( imagedata ){
            console.log('applogic.datastore.saveImageComplete');
            self.emit("applogic.progress",{msg: "gepspeichert", name: imagedata.name});
            
            open--;
            console.log("open",open);            
            if (open == 0){
                //letztes bild erzeugt                
                self.emit("applogic.renderImagesComplete");
            }
        });

        //erhaltene breiten erkennen und duplicate filtern
        Embeddcode.imagesSizesReceived = [];
        //ein screenshot wurde erstellt
        function saveImagebuffer(imagesize)
        {
            //var imagename = imagesize+"px";


            return function (imagebuffer, imagedimensionsWanted, imagedimensionsGot, renderNext){              

                if (typeof imagebuffer === "function"){
                    //error
                    console.log( imagebuffer() );
                    running = false;
                    renderNext();
                    //fehler beim rendern an browser durchleiten
                    self.emit("applogic.error", imagebuffer() );
                    return;
                }

                console.log("save image with req-size:", imagedimensionsWanted);
                console.log("save image with realsize:", imagedimensionsGot);

                var imagename = imagedimensionsGot.width+"px";


                if (Embeddcode.imagesSizesReceived.indexOf(imagedimensionsGot.width)>=0){
                    console.log("skip duplicate size");
                    datastore.emit("datastore.saveImageComplete", {name:"skip"});
                } else {
                    Embeddcode.imagesSizesReceived.push(imagedimensionsGot.width);                    
                    datastore.emit("datastore.saveImageRequest", imagename, imagebuffer);
                }
                console.log(Embeddcode.imagesSizesReceived);

                renderNext();                
                self.emit("applogic.progress",{msg: "speichern", name: imagename});
            }
        }

        //erzeuge render tasks (je nach anzahl der ausgewählten größen)
        self.emit("applogic.progress",{ msg: "start",
                                        max: RenderRequest.screensize.length,
                                        screensizes: RenderRequest.screensize
                                      });

              
        for(var i = 0; i< RenderRequest.screensize.length; i++)
        {
            try {
                rasterrizer.renderUrl(
                    renderSource,
                    saveImagebuffer( RenderRequest.screensize[i] ), /*ist posttarget in renderyt*/
                    RenderRequest.screensize[i]
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
        datastore.emit("datastore.updateDocDateRequest");
    });


    datastore.on("datastore.updateDocDateComplete", function () {
        console.log('applogic.updateDocDateComplete');        
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



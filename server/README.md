social media overlay
====================

TODO
css erstellen Done

auto refresh screenshot
	id bleibt gleich, es wird nur der anhang geändert
	bei neuem content ID neue ID. änderungen immer über picker


Bearbeiten einer alten ID über den picker ermöglichen. Rejected (nur in extremfällen->imperia)


Langfristig Renderer komplett trennen.
	Im Picker wird ein Auftrag erzeugt und in DB gespeichert.
	Der Renderer überwacht den Changes Feed/listViewOpen und rendert nach einander.
	Der P12 Script im HTML Embeddcode muss generisch sein, da beim Speichern die Anzahl der Bilder nicht fest steht.
	Nachteil keine Vorschau oder 2 wege (mit und ohne vorschau implementieren)
	Oder nicht so weit treiben und im Picker auf ChangesFeed warten und dann Vorschau anzeigen.


Live schalten Funktion
	auf sofa02 ausgewählte (aktivierte) Elemente auf sofa01 synchronisieren. picker auf sofa01 so aufbauen das er den auf sofa02 nutzt
	auf 01 im prinzip alles ausbauen. live und dev arbeiten(rendern) auf 02. dafür unterschiedliche design docs benutzen. 
	dev auf merlin umziehen.

####
render auftrag speichern damit er für url=int oder url=live gerendert werden kann. 
speichern wärend render deaktivieren

renderauftrag abspeichern mit feld für targets=c1/c2
dienst auf c2 prüft auf renderaufträge und erzeugt einmal bilder und für jedes ziel css/html/js dateien.

####


ziel:
 neue funktionen live verfügbar machen
 alte inhalte müssen erreichbar bleiben. (alte docs auf sofa01)
 entwicklungsfähigkeit muss bleiben

 sofa1 spielt weiter aus
 picker auf sofa02 umleiten. 02 rendert und synct auf 01
 
 live und testing als desiogn doc einsetzen


Ablauf:
Vor die Pickerschnittstelle:
	Live stelle Button: doc.status = "live", replicate mit filter auf 01
	Zurückziehen:		doc.status = "depub", doc auf 01 löschen
	playouturl ändern




MR Code min-height durch height:100% ersetzen



Welche Auswirkungen hat welche Einstellung:

$scope.targetlocationopt = [ { name:"Standard", value:'default'}, //100% kein margin
							 { name:"zdfsport.de Startseite", value:'zdfsportstart'}, //feste größe kein margin
							 { name:"zdf.de SB Raster", value:'zdfsbraster'}, //100% mit margin -8px
							 { name:"zdf.de Faktenbox", value:'faktenbox'} ]; //über html-src 

var css_source = "templates/"+config.version+"/style.css";
var dyncss = { elHeight : "100%", margin:"0px" };

if (RenderRequest.targetlocation == "zdfsportstart") {
	css_source = "templates/"+config.version+"/style_sportstart.css";
} else if (RenderRequest.targetlocation == "zdfsbraster") {
	dyncss.margin = "-8px";
} else if (RenderRequest.targetlocation == "faktenbox"){
	dyncss.elHeight = "350px";
	dyncss.margin = "0px";
}else /*default*/ {
}


Platzierung: Standard
	RenderRequest.screensize = [946]; //946x532
	Desktop Css: 
	Mobil Css: 

Platzierung: zdfsport
	Desktop Css: style_sportstart.css
	Mobil Css: style_sportstart.css /*wird eh mobil nicht ausgespielt*/

Platzierung: zdf.de SB Raster
	Desktop Css: 
	Mobil Css: 	

Platzierung: Faktenbox
	Desktop Css: 
	Mobil Css: 	


Embed Css: min-height: 330px; height: 100%;
Es gibt keine Extra Mobil Version mehr. -> CSS:

#_{{hash}}.zdfembed {
    text-align: center;
    height: {{css.elHeight}};
    width: 100%;    
    overflow: hidden;
    margin: {{css.margin}};
}  

.fitMlbody #_{{hash}}.zdfembed {  
    margin: 0px;
    margin-bottom: 8px;
}  

server kompletten request speichern lassen damit er ihn neu ausführen kann.
server um cron gesteuerte komponente ergänzen die die veröffentlichten mit der internen db abgleicht und die neu renderung übernimmt
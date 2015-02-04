twitter_renderer
================

twitter_renderer

ziel ist ein htmlwidget von twitter mit ersetzten urls.
das widget wird vom twitter script erzeugt

die urls werden auf einen reverse proxy geleitet.
das problem ist diesen proxy gegen missbrauch abzusichern
alternativ könnten die elemente gelande und durch eigene urls ersetzt werden
links werden mit "sie verlassen jetzt ... versehen" leave.to?url=http://www.web.de

Twitter
<blockquote class="twitter-tweet" lang="de"><p>Såre scener fra et liv med bror med Downs -<a href="http://t.co/DycIyYZOxD">http://t.co/DycIyYZOxD</a> <a href="https://twitter.com/hashtag/sorteringssamfunnet?src=hash">#sorteringssamfunnet</a> <a href="https://twitter.com/hashtag/debatten?src=hash">#debatten</a> <a href="https://twitter.com/hashtag/nrkdebatt?src=hash">#nrkdebatt</a> <a href="https://twitter.com/hashtag/downs?src=hash">#downs</a> <a href="http://t.co/s7RvfVQicu">pic.twitter.com/s7RvfVQicu</a></p>&mdash; Geir Olav Drablos (@godrablos) <a href="https://twitter.com/godrablos/status/510143515758964736">11. September 2014</a></blockquote>
<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>

Facebook
<div id="fb-root"></div> <script>(function(d, s, id) { var js, fjs = d.getElementsByTagName(s)[0]; if (d.getElementById(id)) return; js = d.createElement(s); js.id = id; js.src = "//connect.facebook.net/de_DE/all.js#xfbml=1"; fjs.parentNode.insertBefore(js, fjs); }(document, 'script', 'facebook-jssdk'));</script>
<div class="fb-post" data-href="https://www.facebook.com/HofButenland/posts/728570373847553" data-width="466"><div class="fb-xfbml-parse-ignore"><a href="https://www.facebook.com/HofButenland/posts/728570373847553">Beitrag</a> von <a href="https://www.facebook.com/HofButenland">Hof Butenland</a>.</div></div>


Google Plus
<!-- Place this tag in your head or just before your close body tag. -->
<script type="text/javascript" src="https://apis.google.com/js/plusone.js"></script>
<!-- Place this tag where you want the widget to render. -->
<div class="g-post" data-href="https://plus.google.com/102860501900098846931/posts/BTZNZjjjTZC"></div>
<!-- <div class="g-post" data-href="https://plus.google.com/102860501900098846931/posts/Qnfx7ECzooW"></div> -->

MR
<script>!function(a,b,c,d,e,f,g,h,i,j,k){h=a[d]=a[d]||{},h.ui=h.ui||[],i=a[e]=a[e]||{},i[f]||(j=b.getElementsByTagName(c)[0],k=b.createElement(c),k.src="//platform.massrelevance.com/js/massrel.js",j.parentNode.insertBefore(k,j),i[f]=function(){h.ui.push([].slice.call(arguments))}),i[f]("load",{el:b.getElementById(g)})}(window,document,"script","massrel","spredfast","exp","mr-space_heute_de");</script>

MR heuteJ
<div class="mr-space" id="mr-space_heutejournal_team" data-space-id="zdf/heutejournal_team" style="min-height: 500px;"></div>
<script>!function(a,b,c,d,e,f,g,h,i,j,k){h=a[d]=a[d]||{},h.ui=h.ui||[],i=a[e]=a[e]||{},i[f]||(j=b.getElementsByTagName(c)[0],k=b.createElement(c),k.src="//platform.massrelevance.com/js/massrel.js",j.parentNode.insertBefore(k,j),i[f]=function(){h.ui.push([].slice.call(arguments))}),i[f]("load",{el:b.getElementById(g)})}(window,document,"script","massrel","spredfast","exp","mr-space_heutejournal_team");</script>

MR Neo
<iframe src="http://zdf.massrel.io/neo-magazin-royale" width="1050" height="630" frameborder="0" scrolling="auto" marginheight="0px" marginwidth="0px" allowfullscreen></iframe>

Vimdeo
<iframe src="//player.vimeo.com/video/57974967" width="500" height="281" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>

YT
<iframe width="560" height="315" src="//www.youtube.com/embed/UDAXuWANp5c" frameborder="0" allowfullscreen></iframe>


NEO
<iframe src="http://zdf.massrel.io/neo-magazin-royale" width="1050" height="630" style="background-image:url(http://cm2-prod-pre.zdf.de/ZDFpreview/zdfportal/blob/36041990/5/data.png)" frameborder="0" scrolling="auto" marginheight="0px" marginwidth="0px" allowfullscreen></iframe>


noscript link finden
====================
https://twitter.com/search?q=516534564421136384
FB
GP
MR




TODO Prio2
----------
ein globaler versonierter "arbeitsscript"
dieser holt anhand der id im parentElement (später vlt url parameter)
das passende js+preview image aus der DB

//preview sollte mit verschiedenen hintergrundfarben gerendert werden können (besonders wichtig für MR)
//rand aus bild entfernen


#_FaktenBoxEl_3_#_NewFaktenBoxModul gp lädt nicht gescheit

click -> "crossStorageClientHUB" ist undefiniert timer oder so einbauen für ie



Flow
====

applogic 	on "applogic.renderImageRequest" 		-> applogic  	emit "datastore.getDocRequest"

datastore 	on "datastore.getDocRequest"			-> datastore 	emit "datastore.docFound"
													-> datastore 	emit "datastore.newDocCreated"

datastore	on "datastore.docFound"					-> datastore 	emit "applogic.CodeComplete"



applogic 	on "datastore.newDocCreated"			-> datastore 	emit "datastore.saveScriptRequest"

datastore 	on "datastore.saveScriptRequest"		-> datastore 	emit "datastore.saveOrigEmbedCodeRequest"

datastore	on "datastore.saveOrigEmbedCodeRequest" -> datastore 	emit "datastore.saveHtmlRequest"

datastore	on "datastore.saveHtmlRequest"			-> datastore 	emit "datastore.saveXmlRequest"

datastore	on "datastore.saveXmlRequest"			-> datastore 	emit "datastore.saveScriptCompleted"


applogic	on "datastore.saveScriptCompleted"		-> applogic 	emit "applogic.renderImageCompleted"


applogic 	on "applogic.renderImageCompleted"		-> datastore 	emit "datastore.saveImageRequest"

datastore	on "datastore.saveImageRequest"			-> datastore 	emit "datastore.saveImageCompleted"

applogic	on "datastore.saveImageCompleted"		-> applogic 	emit "applogic.CodeComplete"


app 		on "applogic.CodeComplete"				-> socket 		emit "CodeComplete"


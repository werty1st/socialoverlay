var webPage = require('webpage');
var page = webPage.create();

var filenamex=0;

page.onLoadFinished = function(status) {
  console.log('Status: ' + status);
  page.render('image:' + filenamex++ +'.png', {format: 'png', quality: '100'});

};

page.open('http://127.0.0.1/c/twr/93f95687ed667e8e5cbb0f7e5306ae64de377199/embed.html', function (status) {
  var url = page.url;
  console.log('URL: ' + url);
  // phantom.exit();
});


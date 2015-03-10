// var page = require('webpage').create();

// page.open("http://localhost/t/fb.html", function (status) {
// 	page.render('image:' + new Date() +'.png', {format: 'png', quality: '100'});
// 	console.log("opened google? ", status);
	
// 	page.evaluate(function () { return document.title; }, function (result) {
// 		console.log('Page title is ' + result);
// 	});
// });			




var page = require("webpage").create();
var homePage = 'http://localhost/c/twr/b06e606cdd950bf13aefb9eef57c2694dd3b659c/rendersource.html';
 

page.open(homePage);
page.onLoadFinished = function(status) {
  var url = page.url;
 
  console.log("Status:  " + status);
  console.log("Loaded:  " + url);
  setTimeout(function() { 
  	
  	page.render('image:' + new Date() +'.png', {format: 'png', quality: '100'});

  	setTimeout(function() { phantom.exit(); }, 5000);
  }, 5000);
};
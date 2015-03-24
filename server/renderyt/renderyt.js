/*
node-debug --web-host 0.0.0.0 --save-live-edit true renderyt.js 
http://wmaiz-v-sofa02.dbc.zdf.de:8080/debug?port=5858
apt-get install flashplugin-installer imagemagick openjdk-jre daemon
https://github.com/werty1st/selenium-grid-startup
*/

//global unique object for multiple requests

var gm = require('gm');
//setup environment
var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
    until = webdriver.until,
    chrome = require('selenium-webdriver/chrome');
var runHeadless = require('./headless');

var options = {};
var headless;
var driver;
var rw;

headless = runHeadless({ display: {width: 1920, height: 1080, depth: 24}},
function(err, childProcess, servernum){
	//xvfb ready
	if(!err){
		//servernum = 10;
		console.log("display at:",servernum);
		process.env.DISPLAY = ":" + servernum;
		process.env.PATH = process.env.PATH+":"+__dirname;
		driver = new chrome.Driver();
		rw = new RenderWorker();
		rw.init();
	} else {
		//error
		throw new Error("X or Selenium not running.");
	}
});

module.exports.renderUrl = function renderUrl(url, posttarget, screensize){

	var task = function task (onCompleted) {
		var _url = url;
		var _posttarget = posttarget;
		renderRequestTask(driver, _url, _posttarget, screensize, onCompleted);		
	}

	rw.add( task );

	//http://www.w3schools.com/browsers/browsers_display.asp
	//screensize 0=auto 
	// erstelle bilder mit 3*4 4*3 16*9 9*16 mit (800*600, 1280*800, 1920*1080)
	//breit fest
	// erstelle bilder mit 3*4 4*3 16*9 9*16 mit (800*600, 1280*800, 1920*1080) bei fester breite des divs
	//beides fest
	// container div size definiert nur iframes zb. youtube wird nur ein bild gerendert
}

function RenderWorker()
{
	var initcompleted = false;
	var pool = [];
	var running = false;

	this.add = function add(func)
	{
		pool.push(func);
		//console.log("poolsize:",pool.length);
		run();
	}

	this.init = function init()
	{
		initcompleted = true;
		run();
	}

	var completed = function completed()
	{
		running = false;
		//console.log("next rw");
		//console.log("poolsize:",pool.length);
		run();
	}

	var run = function run()
	{
		if (running) return;		
		if (!initcompleted) return;

		if (pool.length > 0)
		{
			running = true;
			var task = pool.shift();			
				task(completed);
		}
	}

}


function saveImage(buffer, imagedimensions, clientSize, posttarget, onCompleted) {
	
	posttarget(buffer, imagedimensions, clientSize, onCompleted);
}


function captureScreen(driver, imagedimensions, clientSize, posttarget, onCompleted) {

	function convertImage(image, imagedimensions)
	{

		gm(image, "temp.png")
			.options({imageMagick: true})
			.crop(imagedimensions.width, imagedimensions.height, imagedimensions.x, imagedimensions.y)
			.toBuffer('PNG',function (err, buffer) {
				saveImage( buffer,
						   {"width":imagedimensions.width, "height": imagedimensions.height}, 
						   clientSize,
						   posttarget,
						   onCompleted);
			});
			// .write("test.png", function (err) {
			// 	if (!err) console.log('crazytown has arrived');
			// 	console.log("saved to:","test.png");
			//     //saveImage(imagefile, posttarget, onCompleted);
			// })
	}

	//console.log("imagedimensions",imagedimensions);

	driver.takeScreenshot().then(
	    function(image, err) {
	    	var buf = new Buffer(image, 'base64');
	        convertImage(buf, imagedimensions);
	        // require('fs').writeFile("temp.png", image, 'base64', function(err) {
	        // });
	    }
	);
}


function pageloaded(driver, posttarget, Timeout, onCompleted){
	clearTimeout(Timeout);
	console.log("session loaded");

	setTimeout(function (){
			var imagedimensions = {};

			var x = driver.wait(function() {
		
				return driver.findElement(By.id("maincontainer")).then(function(ele) {
					
					//inject script

					var response = driver.executeAsyncScript(
					    'var callback = arguments[arguments.length - 1];' +
					    'var d = document.getElementById(\"maincontainer\");' +
					    'callback( { height: d.firstElementChild.clientHeight, width: d.firstElementChild.clientWidth } )' );

					response.then(function (clientSize) {
						//console.log("clientSize", clientSize);

						ele.getLocation().then(function(point){
							imagedimensions.x = point.x;
							imagedimensions.y = point.y;

							ele.getSize().then(function(size){
								imagedimensions.width = clientSize.width;
								imagedimensions.height = clientSize.height;
								//take screenshot
								captureScreen(driver, imagedimensions, clientSize, posttarget, onCompleted);
							})
						});
					});					
					return true;

			 	}, function (Err) {
			 		//benachrichtige applogic über den fehler
			 			posttarget(function(){
			 				return Err.message;
			 			},"",onCompleted);
			 			x.cancel();
			 		return true;
			 	});
			 	
			}, 10000);

		},6000);	
}



function renderRequestTask(driver, url, posttarget, screensize, onCompleted){

	driver.manage().window().setSize(1920,1080).then(function (val1){
		//console.log("windows set size complete");	
		driver.manage().window().getSize().then(function (val1){
			console.log("windows size:",val1);

			//todo
			//laufenden process/timeout abfragen wenn vorhandn dann push nach waitingCalls
			//alternativ einen pool aus new chrome.Driver(); //bringt keinen performane vorteil lieber eins nach dem anderen

			//todo fehler einbauen kein default
			//var url = url || 'http://merlin.intern.zdf.de:5984/twr/c0cb0d515756ec82976722085fa7d904257eb5de/rendersource.html';

			var timeout1 = 0;
			driver.get(url);	

			var pagestate = driver.executeScript('return document.readyState;')

			timeout1 = setTimeout(function ()
			{
				console.log("session took to much time to load");
			},16000)

			pagestate.then(function(readyState){
				console.log("pagestate",readyState);

				if (readyState === "complete" || readyState === "interactive"){

					//seite geladen und kann manipuliert werden
					console.log("resize to",screensize);

					var response = driver.executeAsyncScript(
					    'var callback = arguments[arguments.length - 1];' +
					    'document.getElementById(\"maincontainer\").style.width=\"'+screensize+'px\";' +
					    'callback( document.getElementById(\"maincontainer\").style.width )' );

					response.then(function (param) {
						console.log("response", param);
						
						if(screensize+"px" == param){
							pageloaded(driver, posttarget, timeout1, onCompleted);
						} else {
							console.log("resize error",screensize,param);
							return;
						}
					});
					


				}
			});


		});			
	});


}

/*
node-debug --web-host 0.0.0.0 --save-live-edit true renderyt.js 
http://wmaiz-v-sofa02.dbc.zdf.de:8080/debug?port=5858
apt-get install flashplugin-installer imagemagick openjdk-jre daemon
https://github.com/werty1st/selenium-grid-startup
*/




function RenderWorker()
{
	var initcompleted = false;
	var pool = [];
	var running = false;

	this.add = function add(func)
	{
		pool.push(func);
		console.log("poolsize_add:",pool.length);
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
		console.log("next rw");
		console.log("poolsize_com:",pool.length);
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

var gm = require('gm');
//setup environment
var webdriver = require('selenium-webdriver'),
	By = webdriver.By,
    until = webdriver.until,
    firefox = require('selenium-webdriver/firefox');



var runHeadless = require('./headless');




function saveImage(buffer, imagedimensions, posttarget, onCompleted) {
	
	posttarget(buffer, imagedimensions, onCompleted);
}


function captureScreen(driver, imagedimensions, posttarget, onCompleted) {

	function convertImage(image)
	{
		var deltax = 18;
		var deltay = 10;

		//todo 
		if (imagedimensions.width < 800){
			deltax = 0;
		}
		if (imagedimensions.height < 600){
			deltax = 0;
		}

		gm(image, "temp.png")
			.options({imageMagick: true})
			.crop(imagedimensions.width-deltax, imagedimensions.height-deltay, imagedimensions.x, imagedimensions.y)
			.toBuffer('PNG',function (err, buffer) {
				saveImage(buffer, {"width":imagedimensions.width, "height": imagedimensions.height}, posttarget, onCompleted);
			});
			// .write("test.png", function (err) {
			// 	if (!err) console.log('crazytown has arrived');
			// 	console.log("saved to:","test.png");
			//     //saveImage(imagefile, posttarget, onCompleted);
			// })
	}

	driver.takeScreenshot().then(
	    function(image, err) {
	    	var buf = new Buffer(image, 'base64');
	        convertImage(buf);
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
					ele.getLocation().then(function(point){
						imagedimensions.x = point.x;
						imagedimensions.y = point.y;

						ele.getSize().then(function(size){
							imagedimensions.width = size.width;
							imagedimensions.height = size.height;
							//take screenshot
							captureScreen(driver, imagedimensions, posttarget, onCompleted);
						})
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
			 	
			}, 7000);



			// var ele = driver.findElement(By.id("maincontainer"));
			// 	ele.getLocation().then(function(point){
			// 		imagedimensions.x = point.x;
			// 		imagedimensions.y = point.y;
	
			// 		ele.getSize().then(function(size){
			// 			imagedimensions.width = size.width;
			// 			imagedimensions.height = size.height;
			// 			//take screenshot
			// 			captureScreen(imagedimensions, posttarget, onCompleted);
			// 		})
			// 	});			
		},4000);	
}



function renderRequestTask(driver, url, posttarget, screensize, onCompleted){

	console.log("running session",url);


	driver.manage().window().setSize(screensize.w, screensize.h).then(function (val1){
		console.log("windows set size complete");	
		driver.manage().window().getSize().then(function (val1){
			console.log("windows size:",val1);

			//todo
			//laufenden process/timeout abfragen wenn vorhandn dann push nach waitingCalls
			//alternativ einen pool aus new firefox.Driver(); //bringt keinen performane vorteil lieber eins nach dem anderen

			//todo fehler einbauen kein default
			//var url = url || 'http://merlin.intern.zdf.de:5984/twr/c0cb0d515756ec82976722085fa7d904257eb5de/rendersource.html';

			var timeout1 = 0;
			driver.get(url);	

			var pagestate = driver.executeScript('return document.readyState;')

			timeout1 = setTimeout(function ()
			{
				console.log("session took to much time to load");
			},15000)

			pagestate.then(function(readyState){
				console.log("pagestate",readyState);
				if (readyState === "complete"){
					pageloaded(driver, posttarget, timeout1, onCompleted);
				}
			});


		});			
	});


}

var options = {};
var headless;
var driver;
var rw;

	headless = runHeadless({ display: {width: 1920, height: 1080, depth: 24}},
	function(err, childProcess, servernum){
		//xvfb ready
		if(!err){
			console.log("display at:",servernum);
			process.env.DISPLAY = ":" + servernum;
			driver = new firefox.Driver();
			rw = new RenderWorker();
			rw.init();
		} else {
			//error
			throw new Error("X or Selenium not running.");
		}
	});

module.exports.renderUrl = function renderUrl(url, posttarget, screensize){

	//console.log("screensize",screensize);



	rw.add(function(onCompleted){
		var _url = url;
		var _posttarget = posttarget;
		renderRequestTask(driver, _url, _posttarget, screensize, onCompleted);		
	});






	// driver.manage().window().setSize(800,800).then(function (val1){
	// 	console.log("windows set size complete");	

	// 	driver.manage().window().getSize().then(function (val1){
	// 		console.log("windows size",val1);		
	// 	});			
	// });


	//http://www.w3schools.com/browsers/browsers_display.asp

	//screensize 0=auto 
	// erstelle bilder mit 3*4 4*3 16*9 9*16 mit (800*600, 1280*800, 1920*1080)

	//breit fest
	// erstelle bilder mit 3*4 4*3 16*9 9*16 mit (800*600, 1280*800, 1920*1080) bei fester breite des divs

	//beides fest
	// container div size definiert nur iframes zb. youtube wird nur ein bild gerendet








}



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
    firefox = require('selenium-webdriver/chrome');

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
						console.log("image dim:", point);
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
		},5000);	
}



function renderRequestTask(driver, url, posttarget, onCompleted){

	console.log("running session",url);

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
		if (readyState === "complete" || readyState === "interactive"){
			pageloaded(driver, posttarget, timeout1, onCompleted);
		}
	});
}

var options = {};
var headless = {};
var driver = {};
var rw = {};
process.env.PATH = process.env.PATH+":"+"/opt/";

	headless.klein = new runHeadless({ display: {width: 350, height: 350, depth: 24}},
	function(err, childProcess, servernum) {
		//xvfb ready
		if(!err){
			console.log("display at:",servernum);
			process.env.DISPLAY = ":" + servernum;
			driver.klein = new firefox.Driver();
			rw.klein = new RenderWorker();
			rw.klein.init();
		} else {
			//error
			throw new Error("X or Selenium not running.");
		}
	});


	headless.gross = runHeadless({ display: {width: 900, height: 650, depth: 24}},
	function(err, childProcess, servernum){
		//xvfb ready
		if(!err){
			console.log("display at:",servernum);
			process.env.DISPLAY = ":" + servernum;
			driver.gross = new firefox.Driver();
			rw.gross = new RenderWorker();
			rw.gross.init();
		} else {
			//error
			throw new Error("X or Selenium not running.");
		}
	});

module.exports.renderUrl = function renderUrl(url, posttarget, screensize){

	//console.log("screensize",screensize);

	if(screensize==1){
		//klein

		driver.klein.manage().window().setSize(360, 550).then(function (){
			console.log("windows set size complete");	
	
			rw.klein.add(function(onCompleted){
				var _url = url;
				var _posttarget = posttarget;
				renderRequestTask(driver.klein, _url, _posttarget, onCompleted);		
			});

		});

	} else if (screensize==2){
		//groß
		driver.gross.manage().window().setSize(1600, 1200).then(function (){
			console.log("windows set size complete");	
			rw.gross.add(function(onCompleted){
				var _url = url;
				var _posttarget = posttarget;
				renderRequestTask(driver.gross, _url, _posttarget, onCompleted);		
			});
		});		
	}




}


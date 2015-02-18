(function(){

	var app = angular.module("tapp",['angularSpinner']);


	angular.module("tapp").config( function($provide, $compileProvider, $filterProvider){

		//switch hostnames
		if ("wmaiz-v-sofa02.dbc.zdf.de" == location.hostname) {
			$provide.value('db_host', 'wmaiz-v-sofa02.dbc.zdf.de');	

		} else if ("wmaiz-v-sofa01.dbc.zdf.de" == location.hostname) {
			$provide.value('db_host', 'sofa01.zdf.de');
		} else {
			alert("Hostname unsupported");
		}
		//$provide.value('db_host', 'wmaiz-v-sofa02.dbc.zdf.de');
		
		// ändern wenn webmaster editor angepasst
		//$provide.value('db_host', location.hostname);
	});


	app.factory('socket', function ($rootScope) {
		//http://www.html5rocks.com/en/tutorials/frameworks/angular-websockets/?redirect_from_locale=de
		var socket = io.connect(location.href, {path:location.pathname+"socket.io"});
		return {
			on: function (eventName, callback) {
				socket.on(eventName, function () {  
					var args = arguments;
					$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
			emit: function (eventName, data, callback) {
				socket.emit(eventName, data, function () {
					var args = arguments;
					$rootScope.$apply(function () {
						if (callback) {
							callback.apply(socket, args);
						}
					});
				})
			}
		};
	});


	//app
	app.controller('TweecodeController', function($http, $scope) {


		var query = window.location.search.substring(1);
		var vars = query.split("&");
		var getvars = {};


		for (var i=0;i<vars.length;i++) {
		  var pair = vars[i].split("=");
		  getvars[ pair[0] ] = pair[1];
		}

		//picker
		this.save = function save (data)
		{
			var res = {
				"getvars":getvars,
				"content":[
					{
						"id": "noid",
						"description":	"socialbdsg",
						"visibleFrom":"2011-11-24T00:00:00+01:00",
						"visibleTo":"2024-11-24T00:00:00+01:00",
						"fragments":[
							{
								"fragmentURI": $scope.tapp.playoutUrl,
								"playout":"web"
							},
							{
								"fragmentURI": $scope.tapp.playoutXmlUrl,
								"playout":"xml"
							}							
						]
					}
				]
			};
			var targetOrigin = unescape(location.search.match(/targetOrigin=([^&]+)/)[1]);
			PickerResultInterface.sendResult(res, targetOrigin);
		};

	});



	//form
	app.controller("EmbeddcodeController", function($http, socket, $scope, usSpinnerService, db_host){
		$scope.code = window.unescape(atob(default_code));
		$scope.image = "";
		$scope.holder = true;
		
		$scope.autorefresh = {freq:1,duration:1};
		

		$scope.overwriteopt = [{label:"Ja", value:true},{label:"Nein", value:false}];
		$scope.overwrite = $scope.overwriteopt[1];

		$scope.screensizeopt = [{label:"klein", value:1},{label:"groß", value:2}];
		$scope.screensize = $scope.screensizeopt[0];

		$scope.versionopt = [{label:"v1", value:1},{label:"v2", value:2}];
		$scope.version = $scope.versionopt[1];



		$scope.durationopt = [
								{label:"", value:1},
								{label:"v2", value:2},
								{label:"v2", value:2},
								{label:"v2", value:2},
							 ];
		$scope.duration = $scope.durationopt[1];



		var self = this;



		//warte anmiation 
		//todo timeout einbauen mit meldung bei ablauf
		$scope.startSpin = function(){
			$scope.holder = true;
		    usSpinnerService.spin('spinner-1');
		}
		$scope.stopSpin = function(){
			$scope.holder = false;
		    usSpinnerService.stop('spinner-1');
		}
		socket.on("ping", function(){
			console.log("ping");
		})

		socket.on("applogic.error", function(err){
			console.log("Error",err);
			alert("Starten sie einen neuen Versuch.");
		})


		socket.on('CodeComplete', function (id) {
		    console.log("Generation complete");
		    $scope.stopSpin();


		    //todo auf event umschreiben
		    var previewO = {};
		    	previewO.imageurl = "/c/twr/"+ id +"/preview";
		    	previewO.htmlcode = "/c/twr/"+ id +"/embed.html";
		    	previewO.xmlcode = "/c/twr/"+ id +"/embed.xml";

		    $scope.image = previewO.imageurl+"?"+ new Date().getTime();

		    //selfPower
   			$scope.tapp.playoutUrl = location.protocol + "//" + db_host + previewO.htmlcode;
   			$scope.tapp.playoutXmlUrl = location.protocol + "//" + db_host + previewO.xmlcode;
			//$scope.tapp.playoutUrl = location.origin + previewO.htmlcode;
			$http.get(previewO.htmlcode)
			.success( function(data, status, headers, config) {
				//var localS = document.getElementById('codetextarea').value = data;
            });

		});		



		$scope.renderCode = function renderCode(){
			//absenden
			$scope.image = "holder.js/300x300/sky/text:Tweet";
			$scope.startSpin();
			socket.emit('socket.renderImageRequest', {
				code: $scope.code,
				hostname: location.origin,
				overwrite: $scope.overwrite.value,
				screensize: $scope.screensize.value,
				version: $scope.version.value,
				bgimageurl: $scope.bgimageurl
			});			
		};

	});
	
})();



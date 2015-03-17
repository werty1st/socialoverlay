//main
angular.module("tapp")
.controller("MainController", function($http, socket, $rootScope, $scope, db_host, $compile, default_code){
	$scope.code = window.unescape(atob(default_code));
	$scope.$parent.location = "#/maint";


	$scope.autorefresh = {freq:1,duration:1};
	//$scope.overwriteopt = [{label:"Ja", value:true},{label:"Nein", value:false}];
	$scope.overwrite = false;//$scope.overwriteopt[1].value;
	//min-width
	$scope.screensizeopt = [{
								label:"320px",
								value:1
							},{
								label:"768px",
								value:2
							},{
								label:"1224px",
								value:3
							},{
								label:"1824px",
								value:4
							}];
	$scope.screensize = [1,2,3,4];
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


	socket.on("progress", function(data){

		if (data.msg == "start"){
			console.log("start",data.max); // mal 3 plus start und ende event

			$scope.progressSetup(data.max*2+2);
			$scope.progressProgress();
		} else if (data.msg == "speichern") {
			console.log("speichern",data.name);
			$scope.progressProgress();
		} else if (data.msg == "gepspeichert") {
			console.log("gepspeichert",data.name);
			$scope.progressProgress();
		} else if (data.msg == "finished") {
			console.log("finished");
			//progress 100%
			$scope.progressSetup(10);
			$scope.progressFinish();
		}
	})

	socket.on("applogic.error", function(err){
		console.log("Error",err);
		alert("Starten sie einen neuen Versuch.");
	})


	socket.on('applogic.CodeComplete', function (id) {
	    console.log("Generation complete");


	    //todo auf event umschreiben
	    var previewO = {};
	    	//previewO.imageurl = "/c/twr/"+ id +"/2l";
	    	previewO.htmlcode = "/c/twr/"+ id +"/embed.html";
	    	previewO.xmlcode = "/c/twr/"+ id +"/embed.xml";

	    //$scope.image = previewO.imageurl+"?"+ new Date().getTime();

	    //selfPower
			$scope.pickerData = {};
			$scope.pickerData.playoutUrl = location.protocol + "//" + db_host + previewO.htmlcode;
			$scope.pickerData.playoutXmlUrl = location.protocol + "//" + db_host + previewO.xmlcode;

		//$scope.tapp.playoutUrl = location.origin + previewO.htmlcode;
		$http.get(previewO.htmlcode)
		.success( function(data, status, headers, config) {
			//var localS = document.getElementById('codetextarea').value = data;
        });

	});		



	$scope.renderCode = function renderCode(){
		//absenden
		socket.emit('socket.renderImageRequest', {
			code: $scope.code,
			hostname: location.origin,
			overwrite: $scope.overwrite,
			screensize: $scope.screensize.value,
			version: $scope.version.value,
			bgimageurl: $scope.bgimageurl
		});			
	};




});
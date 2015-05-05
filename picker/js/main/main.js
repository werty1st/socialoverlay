//main
angular.module("tapp")
.controller("MainController", function($http, socket, $rootScope, $scope, $compile, default_code, wrtyuitabService, db_hosts){
	$scope.code = window.unescape(atob(default_code));
	$scope.$parent.location = "#/maint";


	$scope.autorefresh = {freq:12,duration:1};
	$scope.autorefresh.enabled = true;
	
	$scope.overwrite = true;
	
	$scope.screensizeopt = [
		{
			label:"200px",
			value:200
		},{
			label:"320px",
			value:320
		},{
			label:"768px",
			value:768
		},{
			label:"1224px",
			value:1224
		},{
			label:"1824px",
			value:1824
		}
	];

	$scope.screensize = [320,768]; //preselected defaults
	$scope.versionopt = [{label:"v1", value:1},{label:"v2", value:2}];
	$scope.version = $scope.versionopt[1];


	$scope.usemobileurl = false;
	$scope.mobileurl = "http://m.zdf.de";
	$scope.slug = "unbenannt_" + (new Date()).getMilliseconds();

	var self = this;

	$scope.$watch(function () {
			return wrtyuitabService.get();
		},
		function(newVal, oldVal) {
			$scope.activeTab = newVal;
		});

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
		$scope.pickerData = id;	

	});		


	$scope.renderCode = function renderCode(){
		//absenden
		socket.emit('socket.renderImageRequest', {
			code: $scope.code,
			hostname_int:  db_hosts.int, //location.origin,
			hostname_prod: db_hosts.pub, //location.origin,
			overwrite: $scope.overwrite,
			screensize: $scope.screensize,
			version: $scope.version.value,
			autorefresh: $scope.autorefresh,
			bgimageurl: $scope.bgimageurl,
			mobileurl: $scope.mobileurl,
			slug: $scope.slug
		});			
	};




});
angular.module("tapp",[ 'ngRoute',
						'wrtyuitab',
						'wrtyuiprogressbar',
						'ui.bootstrap',
						'socketsetup',
						'pickerinterface'
					  ])
	.config( function($provide, $compileProvider, $filterProvider){

		//switch hostnames
		if ("wmaiz-v-sofa02.dbc.zdf.de" == location.hostname) {
			$provide.value('db_host', 'wmaiz-v-sofa02.dbc.zdf.de');	

		} else if ("wmaiz-v-sofa01.dbc.zdf.de" == location.hostname) {
			$provide.value('db_host', 'sofa01.zdf.de');
		} else {
			alert("Hostname unsupported");
		}

		$provide.value('default_code', 'PGJsb2NrcXVvdGUgY2xhc3M9InR3aXR0ZXItdHdlZXQiIGxhbmc9ImRlIj48cD5I/GJzY2hlciBXaWxsa29tbWVuc2dydd8gaW4gdW5zZXJlciBLYW50aW5lIGF1ZiBkZW0gTGVyY2hlbmJlcmcuIDxhIGhyZWY9Imh0dHA6Ly90LmNvL2FoUTFZTkNIWlIiPnBpYy50d2l0dGVyLmNvbS9haFExWU5DSFpSPC9hPjwvcD4mbWRhc2g7IFpERiAoQFpERikgPGEgaHJlZj0iaHR0cHM6Ly90d2l0dGVyLmNvbS9aREYvc3RhdHVzLzUxNjUzNDU2NDQyMTEzNjM4NCI+MjkuIFNlcHRlbWJlciAyMDE0PC9hPjwvYmxvY2txdW90ZT4NCjxzY3JpcHQgYXN5bmMgc3JjPSIvL3BsYXRmb3JtLnR3aXR0ZXIuY29tL3dpZGdldHMuanMiIGNoYXJzZXQ9InV0Zi04Ij48L3NjcmlwdD4NCg==');			

	})
	.config(['$routeProvider',
		function($routeProvider) {
			$routeProvider.
				when('/', {
					templateUrl: 'js/main/main.html',
					controller: 'MainController'
				}).
				when('/maint', {
					templateUrl: 'js/maintance/maint.html',
					controller: 'MaintController'
				}).
				otherwise({
					redirectTo: '/'
				});
	}])
	.controller('appController', function($scope){
		$scope.location = "#maint";
	})

	//eigenes modul für einstellungen in den tabs
	/*
		$scope.autorefresh = {freq:1,duration:1};
		

		$scope.overwriteopt = [{label:"Ja", value:true},{label:"Nein", value:false}];
		$scope.overwrite = $scope.overwriteopt[1];

		$scope.screensizeopt = [{label:"klein", value:1},{label:"groß", value:2}];
		$scope.screensize = $scope.screensizeopt[0];

		$scope.versionopt = [{label:"v1", value:1},{label:"v2", value:2}];
		$scope.version = $scope.versionopt[1];

		usw...	


	*/

	
	




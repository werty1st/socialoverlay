angular.module("tapp").controller("MaintController", function($http, $scope){
	console.log("maint init");
	$scope.$parent.location = "#/";

	/*
> curl -vX PUT $HOST/mydatabase --cookie AuthSession=YW5uYTo0QUIzOTdFQjrC4ipN-D-53hw1sJepVzcVxnriEw -H "X-CouchDB-WWW-Authenticate: Cookie" -H "Content-Type: application/x-www-form-urlencoded"
{"ok":true}
	*/

	$scope.login = function login(){

		console.log("login");

		$http({
			method: 'POST',
			withCredentials: true,
			url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/_session',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'},
			transformRequest: function(obj) {
				var str = [];
				for(var p in obj)
					str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
					return str.join("&");
				},
				data: {name: $scope.user.name, password: $scope.user.password}
			}).success(function (data, status, header, config) {
				console.log("authorized");//,data, status, header, config);

			});
	}


	$scope.logout = function logout(){

		console.log("login");

		$http({
			method: 'DELETE',
			url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/_session',
			headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			}).success(function (data, status, header, config) {
				console.log("logout");
			});
	}

});
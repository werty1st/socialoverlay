angular.module("tapp")
	.controller("MaintController", ['$http', '$scope', '$cookies', '$cookieStore', 'couchLoginService',
		function($http, $scope, $cookies, $cookieStore, $cls){
			console.log("maint init");
			$scope.$parent.location = "#/";
			
			$scope.user = true;
			$scope.couchdb = {};

			/*
		> curl -vX PUT $HOST/mydatabase --cookie AuthSession=YW5uYTo0QUIzOTdFQjrC4ipN-D-53hw1sJepVzcVxnriEw -H "X-CouchDB-WWW-Authenticate: Cookie" -H "Content-Type: application/x-www-form-urlencoded"
		{"ok":true}
			*/

			function getUser(user){
				$scope.user = user;		
				$scope.loginname = "";
				$scope.loginpassword = "";							
			}

			$scope.login = function () {
				$cls.login($scope.loginname, $scope.loginpassword, getUser);
			}

			$scope.logout = function () {
				$cls.logout(getUser);
			}

			$scope.status = function () {
				$cls.status(getUser);
			}

			$scope.status();



			//alle //veraltet //live mit refresh oder ohne

			$scope.remove = function remove(id, rev, index) {
				$http({
					method: 'DELETE',
					withCredentials: true,
					url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/'+id+'?rev='+rev
					}).success(function (data) {
						$scope.couchdb.all.splice(index,1);
						console.log("data",data)
					}).error(function() {						
					});

			}

			$scope.imageFilter = function imageFilter(obj) {
			    var wordsToFilter = ['image/png'];
			    for (var i = 0; i < wordsToFilter.length; i++) {
			        if (obj.content_type.indexOf(wordsToFilter[i]) !== -1) {
			            return true;
			        }
			    }
			    return false;
			};

			//http://bazalt-cms.com/ng-table/example/10

			$scope.getAll = function getAll(){

				$http({
					method: 'GET',
					withCredentials: true,
					url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/_design/tweetrenderdb/_list/list_all/all',
					}).success(function (data) {
						$scope.couchdb.all = data;
						console.log("data",data)
					}).error(function() {
						$scope.couchdb.all = null;
					});

			}

	}]);
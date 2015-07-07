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

				if (user !== false) $scope.getAll();
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
				if (!confirm("Der Eintrag wird entfernt.") ) return;

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

			$scope.imageFilter = function imageFilter(items) {
			    var result = {};
			    var wordsToFilter = ['image/png'];
			    angular.forEach(items, function(obj, key) {

				    for (var i = 0; i < wordsToFilter.length; i++) {
				        if (obj.content_type.indexOf(wordsToFilter[i]) !== -1) {
				        	obj.name = key;
				            result[key] = obj;
				        }
				    }

	
			    });
			    return result;
			}			

			//http://bazalt-cms.com/ng-table/example/10

			$scope.getAll = function getAll(){

				$http({
					method: 'GET',
					withCredentials: true,
					url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/_design/tweetrenderdb/_view/all',
					//url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/_design/tweetrenderdb/_list/list_all/all',
					}).success(function (data) {
						$scope.couchdb.all = [];
							angular.forEach(data.rows, function(obj, key) {
								$scope.couchdb.all.push(obj.value);
							});
						console.log("data",data.rows)
					}).error(function() {
						$scope.couchdb.all = null;
					});

			}

			$scope.hideFromSync = function hideFromSync(id, rev, index){
				var $doc = $scope.couchdb.all[index];
				$doc.live = !$doc.live;

				$http({
					method: 'PUT',
					withCredentials: true,
					url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/' + id,
					data: $doc
					}).success(function (data) {
						$doc._rev = data.rev;
						console.log("data",data)
					}).error(function() {						
					});

			}

	}]);
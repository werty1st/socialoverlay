angular.module( "wrtyuihistory", ["pickerinterface"] )
.directive('history', ['$http', '$picker', function($http, $picker) {

        //ziel: pickerinterface abschicken können ohne neu zu rendern,        
        //starte abfrage an couchdb und hänge ergebnis an result
        // ansicht: name, datum, vorschaubild(analog admin), auswahlbutton
        // speichern button aktivieren ...
       

        function getAvailable($scope){

            $http({
                method: 'GET',
                withCredentials: true,
                url: './c/twr/_design/tweetrenderdb/_view/posts_active?descending=true&limit=5',
                }).success(function (data) {
                    //$scope.couchdb.all = data;
                    //console.log("data",data);
                    $scope.recents = [];
                        angular.forEach(data.rows, function(obj, key) {
                            $scope.recents.push(obj.value);
                        });
                }).error(function() {
                    $scope.recents = "empty";
                    //$scope.couchdb.all = null;
                });

        }

        function imageFilter(items) {
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

        function controller ($scope){
            $scope.imageFilter = imageFilter;
            getAvailable($scope);

            $scope.insert = function insert(item){
                console.log("Item insert:", item);
                $picker.save( item._id );
            }

            console.log("history controllerFn");
        }

        function link (scope, element, attrs){
            //console.log("history linkFn");            
        }

        return {
            restrict: 'E',
            scope: {

            },
            templateUrl: "./js/history/history.html",
            link: link,
            controller: controller
        }
    }]);


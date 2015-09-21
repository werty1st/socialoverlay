angular.module( "wrtyuihistory", ["pickerinterface"] )
.directive('history', ['$http', '$picker', 'db_hosts', function($http, $picker, db_hosts) {

        //ziel: pickerinterface abschicken können ohne neu zu rendern,        
        //starte abfrage an couchdb und hänge ergebnis an result
        // ansicht: name, datum, vorschaubild(analog admin), auswahlbutton
        // speichern button aktivieren ...

        /*
            $scope.pickerData.playoutUrl = location.protocol + "//" + db_host + previewO.htmlcode;
            $scope.pickerData.playoutXmlUrl = location.protocol + "//" + db_host + previewO.xmlcode;
        */        

        function getAvailable($scope){

            $http({
                method: 'GET',
                withCredentials: true,
                url: 'http://' + db_hosts.int + ':5984/twr/_design/tweetrenderdb/_view/posts_active?descending=true',
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
            $scope.db_host = db_hosts.int;
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


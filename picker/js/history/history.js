angular.module("wrtyuihistory", ['ui.bootstrap.buttons'] )
.directive('history', ['$http', function($http) {

        //ziel: pickerinterface abschicken können ohne neu zu rendern,        
        //starte abfrage an couchdb und hänge ergebnis an result
        // ansicht: name, datum, vorschaubild(analog admin), auswahlbutton
        // speichern button aktivieren ...


        function getAvailable(element){


            $http({
                method: 'GET',
                withCredentials: true,
                url: 'http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/_design/tweetrenderdb/_list/list_available_by_date/posts_available?descending=true',
                }).success(function (data) {
                    //$scope.couchdb.all = data;
                    console.log("data",data)
                }).error(function() {
                    //$scope.couchdb.all = null;
                });

        }


        function link (scope, element, attrs){
            console.log("history linkFn");
            getAvailable(element);
        }

        return {
            restrict: 'E',
            templateUrl: "./js/history/history.html",
            link: link
        }
    }]);


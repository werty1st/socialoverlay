/* .directive('myLog', function($interval) {

        function Log(size){
            var _size = size || 15;
            var _log = [];
            var mytimeout = {};

            this.entries = _log;

            this.add = function add(msg){
                var remove = _log.length + 1 - _size;
                if (remove > 0){
                    _log.shift();                
                }
                _log.push(msg);
                //this.update();
            }


            this.update = function update($element, $timeout){
                
                var $el = $($element[0].querySelector('.jumbotron-log'));
                    $el.scrollTop($el[0].scrollHeight - $el[0].clientHeight);
                
                $timeout.cancel(mytimeout);
                
                mytimeout = $timeout(function() {
                    var $el = $($element[0].querySelector('.jumbotron-log'));
                        $el.scrollTop($el[0].scrollHeight - $el[0].clientHeight);
                }, 0, false);
                
            }
        }

        function link(scope, element, attrs) {

            // element.on('$destroy', function() {
            //     $interval.cancel(timeoutId);
            // });

            // timeoutId = $interval(function() {
            //     scope.log.add(new Date());
            // }, 100);
        }


        function getTime(){
            function addZero(i){
                return (i < 10)?'0'+i:i;
            }

            function addZeros(i){
                if (i < 10){
                    return '00'+i;
                } else if (i<100){
                    return '0'+i;
                } else{
                    return i;
                }
            }

            var d = new Date();
            var h = addZero(d.getHours());
            var m = addZero(d.getMinutes());
            var s = addZero(d.getSeconds());
            var ms = addZeros(d.getMilliseconds());

            return h + ':' + m + ':' + s + ':' + ms;
        }

        return {
            transclude: true,
            restrict: 'AE',
            scope: {
                logAdd: '='
            },
            template: '<h1 style="display:inline">Log</h1> \
                       <button type="button" class="btn pull-right btn-danger" ng-click="clearLog()">Log leeren</button> \
                       <div style="height:424px; overflow-y: auto;" class="jumbotron jumbotron-log"> \
                       <div ng-repeat="item in log.entries">{{item}} \
                       </div> \
                       </div>',
            link: link,
            controller: function($scope, $element, $timeout) {

                $scope.log = new Log(1000, $element);
                
                $scope.logAdd = function(msg) {
                    //console.log("myfn called");                
                    $scope.log.add( getTime() + ': ' + msg);
                    $scope.log.update($element, $timeout);               
                }
                $scope.clearLog = function() {
                    while($scope.log.entries.length > 0) {
                        $scope.log.entries.pop();
                    }
                }            
            }        
        };
  })*/

angular.module("eu.wrty.ui", [])
.directive('myProgress', function() {



        return {
            restrict: 'A',
            scope: {
                progressForward: '=',
                setup: '=',
                finish: '='
            },
            template: '<progressbar \
                            class="progress-striped active" \
                            value="dynamic" \
                            max="max" \
                            type="{{type}}">{{type}} \
                        </progressbar>',
            controller: function($scope, $element) {

                $scope.dynamic = 0;  
                $scope.max = 0;
                        

                $scope.progressForward = function(val) {
                    val = (typeof val == 'undefined')?1:val;
                    $scope.dynamic += val;
                }

                $scope.setup = function(val) {
                    $scope.type = "info";
                    $scope.dynamic = 0;
                    $scope.max = val;
                }            

                $scope.finish = function() {
                    $scope.dynamic = $scope.max;
                    $scope.type = "success";
                }            
            }        
        };
  });

/*
    <result my-progress="true" progress-forward="progressProgress" finish="progressFinish" setup="progressSetup"></result>
*/
angular.module("wrtyuiprogressbar", [])
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
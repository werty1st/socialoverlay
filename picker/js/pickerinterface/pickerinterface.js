angular.module( "pickerinterface", [] )
.directive('pickerResultInterface', function() {

		var path = 'http://cm2-prod-pre.zdf.de/studio/pickerResultInterface.js';


	    var scriptEl = document.createElement('script');
		    scriptEl.type = 'text/javascript';
		    scriptEl.async = true;
		    scriptEl.src = path;
	    (document.head || document.body).appendChild(scriptEl);


        return {
            restrict: 'A',
            scope: {
                pickerData: '=pickerData'
            },
            template: '	<input \
            				type=\"button\" \
            				ng-class=\"{\'btn-success\': embcodeForm.$valid, \'btn-danger\': !embcodeForm.$valid}\" \
            				class=\"btn btn-group-justified\" \
            				value=\"Speichern\" />',
            controller: function($scope, $element) {
            	//todo nur wenn pickerData != undefined
            },
            link: function($scope, $element, attribute) {

                $element[0].onclick = function save () {

                	if(!$scope.pickerData || (location.search == "")) return;


					var query = window.location.search.substring(1);
					var vars = query.split("&");
					var getvars = {};


					for (var i=0;i<vars.length;i++) {
					  var pair = vars[i].split("=");
					  getvars[ pair[0] ] = pair[1];
					}
					
					var res = {
						"getvars":getvars,
						"content":[
							{
								"id": "noid",
								"description":	"socialbdsg",
								"visibleFrom":"2011-11-24T00:00:00+01:00",
								"visibleTo":"2024-11-24T00:00:00+01:00",
								"fragments":[
									{
										"fragmentURI": $scope.pickerData.playoutUrl,
										"playout":"web"
									},
									{
										"fragmentURI": $scope.pickerData.playoutXmlUrl,
										"playout":"xml"
									}							
								]
							}
						]
					};
					var targetOrigin = unescape(location.search.match(/targetOrigin=([^&]+)/)[1]);
					PickerResultInterface.sendResult(res, targetOrigin);
				}

            }        
        };
  });
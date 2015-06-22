angular.module( "pickerinterface", [] )
	.service('$picker', ["db_hosts", '$http', function (db_hosts, $http) {

		console.log("picker setup");

		var path = 'http://cm2-prod-pre.zdf.de/studio/pickerResultInterface.js';

	    var scriptEl = document.createElement('script');
		    scriptEl.type = 'text/javascript';
		    scriptEl.async = true;
		    scriptEl.src = path;
	    (document.head || document.body).appendChild(scriptEl);




		/*curl -X POST -H "Content-Type: application/json" 
		  	-d '{"source":"http://s2:5984/twr", "target":"http://s2:5984/twr2",
				"doc_ids":["f4a7e6e2567107a950d86d74af9eea8b41904090"],
				"filter":"tweetrenderdb/livefilter",
				"query_params": {"status":"live"} }'
			http://s2:5984/_replicate

curl -X POST -H "Content-Type: application/json" -d '{"source":"http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr", 
"target":"http://wmaiz-v-sofa01.dbc.zdf.de:5984/twr2", "doc_ids":["5ca604e477c1f7facb7fe705afb10c9e1fd4e49d"],
 "filter":"tweetrenderdb/livefilter", "query_params": {"status":"live"} }' http://wmaiz-v-sofa02.dbc.zdf.de:5984/_replicate


		*/
	    function publishDoc (id, callback) {
	    	//status = live
	    	//rev holen; todo rev gleich mitgeben lassen von applogic oder histroy

			$http({
					method: 'GET',
					withCredentials: true,
					url: 'http://'+db_hosts.int+':5984/twr/'+id
					}).success(function ( doc ) {
						//var rev = headers("ETag").replace(/^"(.*)"$/, '$1');
						doc.status = "live";
						$http({
								method: 'PUT',
								withCredentials: true,
								url: 'http://'+db_hosts.int+'/twr/'+id,
								data: doc
								}).success(function (response) {
									//{ok: true, id: "f4a7e6e2567107a950d86d74af9eea8b41904090", rev: "19-867cf34fbae4ccdc671eb551e3f0873a"}
									
									//sync									
									//wellcome to callback hell
									$http({
											method: 'POST',
											withCredentials: true,
											url: 'http://'+db_hosts.int+':5984/_replicate',
											data: 	{ 	source: 'http://'+db_hosts.int+'/twr',
														target: 'http://'+db_hosts.prod+'/twr',
														doc_ids: [id],
														filter: "tweetrenderdb/livefilter",
														query_params: {"status":"live"}

													}
											}).success(function (data) {
												//{ok: true, id: "f4a7e6e2567107a950d86d74af9eea8b41904090", rev: "19-867cf34fbae4ccdc671eb551e3f0873a"}
												console.log("data",data)
												//sync
												if (data.ok){
													callback(null,data)
												} else {
													callback("Error","Das Dokument wurde auf dem Zielserver nicht akzeptiert.");
												}

											}).error(function() {
												callback("Error","Das Dokument konnte nicht auf den Zielserver übertragen werden.");
											});

								}).error(function() {
									callback("Error","Das Dokument konnte nicht zum Veröffentlichen markiert werden.");						
								});

					}).error(function() {
						callback("Error","Das Dokument mit der id "+id+" wurde nicht gefunden.");
					});	    	

	    }

	    //curl -X DELETE http://s2:5984/twr/f4a7e6e2567107a950d86d74af9eea8b41904090?rev=9-c02092f2442ebdff4d7cd7e0973ce8ac
	    function depublishDoc (id, callback) {
	    	//status = nichtlive
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

	    function submitPicker ( docId ) {
			console.log("document.referrer",document.referrer);

			if ("http://cm2-int-pre.zdf.de/studio/"  != document.referrer && 
				"http://cm2-prod-pre.zdf.de/studio/" != document.referrer){
				//todo button ohne p12 ausblenden
				//alert("Nur aus P12 heraus aufrufbar.");
			}

			var pickerData;

			if ("http://cm2-prod-pre.zdf.de/studio/" == document.referrer) {
				//hier erzeugen sonst doppelt
				pickerData = { 
	                    playoutUrl:     "http://"+ db_hosts.pub + "/c/twr/" + docId + "/embed.html",
	                    playoutXmlUrl:  "http://"+ db_hosts.pub + "/c/twr/" + docId + "/embedm.html"
	                };
			} else {
				pickerData = { 
	                    playoutUrl:     "http://"+ db_hosts.int + "/twr/" + docId + "/embed.html",
	                    playoutXmlUrl:  "http://"+ db_hosts.int + "/twr/" + docId + "/embedm.html"
	                };
			}


			if(!pickerData || (location.search == "")) return;

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
								"fragmentURI": pickerData.playoutUrl + "?" + Math.random(),
								"playout":"web"
							},
							{
								"fragmentURI": pickerData.playoutXmlUrl,
								"playout":"xml"
							}							
						]
					}
				]
			};
			var targetOrigin = unescape(location.search.match(/targetOrigin=([^&]+)/)[1]);
			PickerResultInterface.sendResult(res, targetOrigin);	    	
	    }

		var save = function save ( docId ) {

			publishDoc(docId, function(err, result){
				if (!err){
					submitPicker( docId );
				} else {
					//leider fehlgeschalgen
					alert(err);
				}
			}); 


		}




		return {save: save};
	}])
	.directive('pickerResultInterface', [ '$picker', function ($picker) {


		console.log("1",$picker);
	    

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

                $element[0].onclick = function() {
                	$picker.save( $scope.pickerData );
                };

            }        
        };
	}]);
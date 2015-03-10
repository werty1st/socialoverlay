angular.module( "tapp" )
	.config( function($provide, $compileProvider, $filterProvider){

		//switch hostnames
		if ("wmaiz-v-sofa02.dbc.zdf.de" == location.hostname) {
			$provide.value('db_host', 'wmaiz-v-sofa02.dbc.zdf.de');	

		} else if ("wmaiz-v-sofa01.dbc.zdf.de" == location.hostname) {
			$provide.value('db_host', 'sofa01.zdf.de');
		} else {
			alert("Hostname unsupported");
		}
		//$provide.value('db_host', 'wmaiz-v-sofa02.dbc.zdf.de');
		
		// ändern wenn webmaster editor angepasst
		//$provide.value('db_host', location.hostname);
	});

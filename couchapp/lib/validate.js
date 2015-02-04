function intersect_safe(arr1, arr2)
{
	var results = [];

	for (var i = 0; i < arr1.length; i++) {
	    if (arr2.indexOf(arr1[i]) !== -1) {
	        // results.push(arr1[i]);
	        return true;
	    }
	}
	return false;
}

module.exports = function (newDoc, oldDoc, userCtx) {
	
	// if (!intersect_safe(["redakteur","_admin"], userCtx.roles))
	//  throw({forbidden : "Bitte anmelden"});

	var type = (newDoc || oldDoc)["type"];

	if(type == "image" || type == "video"){
		//check user/type usw are set
	}

	if(type == "person"){
		//check user/type usw are set
		 //throw({forbidden : 'no way'});

	}

	if(type == "settings"){
		//check user/type usw are set
		if (!intersect_safe(["redakteur","_admin"], userCtx.roles))
		 throw({forbidden : "Bitte anmelden"});

	}


};
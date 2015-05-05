//filtered replication

exports.livefilter = function(doc, req){
	
	if (doc.type != "post"){
		return false;
	} 
	
	if (doc.status == req.query.status){
		return true;
	}

	return false;
}
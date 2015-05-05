/*
 * Values exported from this module will automatically be used to generate
 * the design doc pushed to CouchDB.
 */





module.exports = {
    //updates: require('./updates'),
    // shows: require('./shows'),
    views: require('./views'),
    lists: require('./lists'),
    rewrites: require('./rewrites'),
    filters: require('./filters')   
    //http://www***.de:5984/twr/_changes?filter=tweetrenderdb/livefilter
    //http://         :5984/twr/_changes?filter=tweetrenderdb/livefilter&status=live
    //validate_doc_update: require('./validate'),
	//http://localhost:5984/diebruecke/_design/b2/_view/byType

};



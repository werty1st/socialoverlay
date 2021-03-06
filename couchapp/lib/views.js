exports.posts = {
        map: function (doc) {
            if (doc.type == "post")
                emit(doc.type, doc);
        }
    };

//http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/_design/tweetrenderdb/_view/uncat
exports.uncat = {
        map: function (doc) {
            if (doc.type != "post")
                emit("old", doc._id);
        }
    };    


exports.all = {
    map: function (doc) {
        emit(doc._id, doc);
    }
}

//kriterium definieren mind 1 bild, (eigener aktiv haken, zeitfenster)    
exports.posts_active = {
        map: function (doc) {
            if ((doc.type == "post") && (doc.screensize.length > 0))
                emit(doc.dateCreated, doc);
        }
    };    
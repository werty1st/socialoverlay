exports.personen = {
        map: function (doc) {
            if (doc.type == "person")
                emit(doc.type, doc);
        }
    };
//startseite backend
//http://localhost:5984/diebruecke/_design/b2/_list/list_Personen/personen/
// exports.list_Personen = function (head, req) {
//     var header = {};
//     var items = [];
    
//     header['Content-Type'] = 'text/html; charset=utf-8';
//     start({code: 200, headers: header});

//     var list = "empty";
//     while(row = getRow()){
//         items.push(row.value);
//     }
//     list = handlebars.templates['list_item.html']({items: items, baseurl: baseurl});


//     var context = {title: "Die Brücke 2 Backend Editor", knusper: list}
//     html = handlebars.templates['base.html'](context);

//     send(html); 
//     //send(JSON.stringify(context));
//     //send(list);
// }

//http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr/_design/tweetrenderdb/_list/list_all/all
//convert object to array for angularjs loop or list function
exports.list_all = function (head, req) {
    var header = {};
    var items = [];
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});

    var list = "empty";
    while(row = getRow()){
        row.value.attachments = [];
        for(var att in row.value._attachments){
            var tatt = row.value._attachments[att];
                tatt.name = att;
            row.value.attachments.push(tatt);
        }
        delete row.value._attachments;
        items.push(row.value);
    }
    
    send(JSON.stringify(items)); 

}


exports.list_available_by_date = function (head, req) {
    var header = {};
    var items = [];
    
    header['Content-Type'] = 'application/json; charset=utf-8';
    start({code: 200, headers: header});

    var list = "empty";
    while(row = getRow()){
        row.value.attachments = [];
        for(var att in row.value._attachments){
            var tatt = row.value._attachments[att];
                tatt.name = att;
            row.value.attachments.push(tatt);
        }
        delete row.value._attachments;
        items.push(row.value);
    }
    
    send(JSON.stringify(items)); 

}
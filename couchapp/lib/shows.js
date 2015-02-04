exports.detail_view_edit = function (doc, req) {

    var context = { doc: doc,
                    imgbaseurl: imgbaseurl,
                    mediabaseurl: mediabaseurl,
                    baseurl: baseurl
                };

    var user_details = handlebars.templates['details_item_edit.html'](context);

    var context = {title: "Die Brücke 2 Backend Editor", content: user_details}
    //var html    = templates.render('base.html', req, context);
    html = handlebars.templates['base.html'](context);

    return {
        body : html,
        headers : {
            "Content-Type" : "text/html; charset=utf-8"
            }
    } 
};
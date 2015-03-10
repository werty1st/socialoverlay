var express = require('express');
var app = express();
    app.enable('trust proxy');
    app.use('/',express.static(__dirname+"/../"));

var server = app.listen(process.env.PORT || 3004, function() {
    console.log('Listening on port %d', server.address().port);
});

//export PORT=8080 && node -e "console.log(process.env.PORT);
var Applogic = require('./applogic');

var express = require('express');
var app = express();
    app.enable('trust proxy');
    
    app.use('/testt/',express.static(__dirname+'/couchapp/templates/'));
    app.use('/',express.static(__dirname+'/picker'));

var server = app.listen(process.env.PORT || 3001, function() {
    console.log('Listening on port %d', server.address().port);
});
var io = require('socket.io').listen(server); // this tells socket.io to use our express server

// console.log("applogic: ",applogic);
// applogic.on("loaded",function(){
//     console.log("loaded event triggered",new Date());
// });

// applogic.emit("loaded");
/*var fs = require('fs');
var Handlebars = require('handlebars');
//var template = Handlebars.compile(fs.readFileSync('./templates/default_embed.html', 'utf8').toString());


app.get('/script/:id', function(req, res) {

    console.log(req.params.id);
      // Use whatever you would to render the template function
        res.setHeader('content-type', 'text/html; charset=utf-8');
        res.end(template({id:req.params.id}));

});
*/
var rasterrizer = require('./renderyt/renderyt');

function socketfunction (socket) {

    var applogic = new Applogic(rasterrizer);
    var ping = 0;

    //von applogic aufgerufen
    applogic.on("applogic.CodeComplete", function(id){
        console.log("app.applogic.CodeComplete");
        socket.emit('CodeComplete', id);
    });


    applogic.on("applogic.ping", function () {        
        ping++;
        socket.emit('ping');
    });

    applogic.on("applogic.error", function (err) {        
        console.log("app.applogic.error");
        socket.emit('applogic.error', err);
    });

    //vom client aufgerufen
    socket.on('socket.renderImageRequest', function (RenderRequest) {
        console.log('app.socket.renderImageRequest');

        //register for ping result
        // applogic.once("applogic.renderImageCompleted", function(){
        //     console.log("pings:", ping);
        //     ping = 0;
        // })

        applogic.emit('applogic.renderImageRequest',RenderRequest);
    });

    // Success!  Now listen to messages to be received
    socket.on('message',function(event){
        console.log('Received message from client!',event);
    });
    socket.on('disconnect',function(){
        console.log('Server has disconnected');
    });

    io.sockets.on('connection', function (socket) {
        //console.log('A new user connected!');
    });

};
var ws1 = io.of('/t/');
    ws1.on('connection', socketfunction);

var ws2 = io.of('/');
    ws2.on('connection', socketfunction);






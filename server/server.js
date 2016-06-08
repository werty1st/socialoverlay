//export PORT=8080 && node -e "console.log(process.env.PORT);
var Applogic = require('./applogic');

var express = require('express');
var app = express();
    app.enable('trust proxy');
    
    app.use('/testt/',express.static(__dirname+'/couchapp/templates/'));
    app.use('/',express.static(__dirname+'/picker'));

var server = app.listen(process.env.PORT || 3003, function() {
    console.log('Listening on port %d', server.address().port);
});
var io = require('socket.io').listen(server); // this tells socket.io to use our express server

const db_int = "http://wmaiz-v-sofa02.dbc.zdf.de:5984/twr";
const db_prod = "http://wmaiz-v-sofa01.dbc.zdf.de:5984/twr";
const db_prod_live_url = "http://sofa01.zdf.de/c/twr/"; //render this url into template

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

    var applogic = new Applogic({ version: "v3" }, rasterrizer);

    //von applogic aufgerufen
    applogic.on("applogic.CodeComplete", function(id){
        console.log("app.applogic.CodeComplete");
        socket.emit('progress',{msg:"finished"});
        socket.emit('applogic.CodeComplete', id);
    });


    applogic.on("applogic.progress", function (data) {        
        socket.emit('progress',data);
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
        RenderRequest.db_int = db_int;
        RenderRequest.db_prod_live_url = db_prod_live_url;
        RenderRequest.db_prod = db_prod;

        applogic.emit('applogic.renderImageRequest',RenderRequest);
    });

    // client wants to publish doc to live server
    socket.on('socket.publishDoc', function(data){
        
        // register docID = publish completed and forward to client
        applogic.once(data.docId,function(result){
            socket.emit(data.docId, result);
        })

        console.log("socket.publishDoc",data);
        applogic.emit('applogic.publishDoc',data);

    })

    // Success!  Now listen to messages to be received
    socket.on('message',function(event){
        console.log('Received message from client!',event);
    });
    socket.on('disconnect',function(){
        console.log('Server has disconnected');
        console.log('Todo handle running rendering');
    });

}

// var ws1 = io.of('/t/');
//     ws1.on('connection', socketfunction);

io.of('/').on('connection', socketfunction);






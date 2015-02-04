var webpage = require("webpage");
var page = webpage.create({"sslProtocol":"tlsv1"});

page.viewportSize = {
    width: 300,
    height: 300
};
page.settings.userAgent = "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:21.0) Gecko/20130331 Firefox/21.0";
//page.settings.sslProtocol = "tlsv1";

var file = "twitter.png";



page.onLoadFinished = function(status) {

    window.setTimeout(function(){     
      console.log('Status: ' + status);
      page.render(file);
      phantom.exit(0);
    },5000); 

};

page.onError = function (msg, trace) {
    console.log("error",msg,trace);
    // trace.forEach(function(item) {
    //     console.log('  ', item.file, ':', item.line);
    // })
}

page.onResourceRequested = function(requestData, networkRequest) {
  console.log('Request (#' + requestData.id + '): ' + requestData.url);
};

page.open("http://wmaiz-v-sofa02.dbc.zdf.de/c/twr/f4a7e6e2567107a950d86d74af9eea8b41904090/rendersource.html", function(status) {
    if (status === "success") {
    	console.log("OK");
   	
    } else {
    	console.log("error");
    }
});



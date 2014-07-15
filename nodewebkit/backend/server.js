var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var mdns = require('mdns');
var util = require('util');
//var io = require('socket.io');
//var io = require('socket.io')(http);

//var apiLocalhandle = require("./apiLocalhandle");
//var apiHttphandle = require("./apiHttphandle");


function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    config.riolog(url.parse(request.url));
    var pathname = url.parse(request.url).pathname;
    var absolute = url.parse(request.url).query;

    config.riolog("Request for " + pathname + " received.");
    config.riolog("Request for " + absolute );
    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      config.riolog("Received POST data chunk '"+ postDataChunk + "'.");
    });
    request.addListener("end", function() {
      route(handle, pathname, absolute, response, postData);
    });
  }
  http.createServer(onRequest).listen(config.SERVERPORT);
  
  var io = require('socket.io').listen(config.SOCKETIOPORT);
  io.sockets.on('connection', function (socket) {
    var sequence = [
      mdns.rst.DNSServiceResolve()
    , mdns.rst.getaddrinfo({families: [4] })
    ];
    var browser = mdns.createBrowser(mdns.tcp('http'),{resolverSequence: sequence});

    browser.on('serviceUp', function(service) {
      socket.emit('mdnsUp', service);
      var str=JSON.stringify(service);
      util.log("service up: "+str);
    });
    browser.on('serviceDown', function(service) {
      socket.emit('mdnsDown', service);
      var str=JSON.stringify(service);
      util.log("service down: "+str);
    });
    util.log("listen to services");
    browser.start();
  });

  config.riolog("Server has started.");
  //filesHandle.monitorFiles('/home/v1/resources');
}

exports.start = start;

function listen(upFallback,downFallback) {

}
exports.listen = listen;

function advertise() {
  var ad = mdns.createAdvertisement(mdns.tcp('http'), config.MDNSPORT,{name: config.SERVERNAME});
  ad.start();
}
exports.advertise = advertise;

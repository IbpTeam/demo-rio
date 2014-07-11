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
  config.riolog("Server has started.");
  //filesHandle.monitorFiles('/home/v1/resources');
}

exports.start = start;

function listen() {
  var sequence = [
      mdns.rst.DNSServiceResolve()
    , mdns.rst.getaddrinfo({families: [4] })
  ];
  var browser = mdns.createBrowser(mdns.tcp('http'),{resolverSequence: sequence});

  browser.on('serviceUp', function(service) {
    //var str=JSON.stringify(service);
    util.log("service up: "+ service.name);
  });
  browser.on('serviceDown', function(service) {
    //var str=JSON.stringify(service);
    util.log("service down: "+service.name);
  });
  util.log("listen to services");
  browser.start();
}
exports.listen = listen;

function advertise() {
  var ad = mdns.createAdvertisement(mdns.tcp('http'), 4444,{name: config.SERVERNAME});
  ad.start();
}
exports.advertise = advertise;

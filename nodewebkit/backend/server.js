var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var filesHandle = require("./filesHandle");
var mdns = require('mdns');
var util = require('util');
var mdns = require('../lib/api/device.js');
var now= new Date();  

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    config.riolog(url.parse(request.url));
    var pathname = decodeURIComponent(url.parse(request.url).pathname);
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
    mdns.addDeviceListener(function (signal, args){
      var interface = args[0];
      var protocol = args[1];
      var name = args[2];
      var type = args[3];
      var domain = args[4];
      var flags = args[5];
      //console.log(args);
      switch(signal){
        case 'ItemNew':{
          socket.emit('mdnsUp', args);
          console.log('A new device is add, name: "'+  name + '"');
        }       
        break;
        case 'ItemRemove':{
          socket.emit('mdnsDown', args);
          console.log('A device is removed, name: "'+  name + '"');
        }
        break;
      }
    });
    mdns.createServer(function(){
      var name = config.SERVERNAME;
      var port = config.MDNSPORT;
      var txtarray = [config.SERVERNAME, 'hello'];
      mdns.entryGroupCommit(name,  port, txtarray);
    });
  });

  config.riolog("Server has started.");
  filesHandle.monitorNetlink('./var/.netlinkStatus');
}

exports.start = start;


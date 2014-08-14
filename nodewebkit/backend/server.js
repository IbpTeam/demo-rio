var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var dataSync = require("./DataSync");
var mdns = require('mdns');
var util = require('util');
var listOfOscDevices={};
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
    var sequence = [
      mdns.rst.DNSServiceResolve()
    , mdns.rst.getaddrinfo({families: [4] })
    ];
    var browser = mdns.createBrowser(mdns.tcp('http'),{resolverSequence: sequence});

    browser.on('serviceUp', function(service) {
      if(service.port==config.MDNSPORT){
        if(!listOfOscDevices[service.name]) {
          listOfOscDevices[service.name] = service;
          var cnt = Object.keys(listOfOscDevices).length;
          console.log('There are '+cnt+' devices');
        }
        socket.emit('mdnsUp', service);
//        var str=JSON.stringify(service);
//        util.log("service up: "+str+now.toLocaleTimeString());
        var serviceRecord = service.txtRecord;
        if (typeof(serviceRecord) != "undefined") {
          console.log(serviceRecord.account +"----------------");
          var deviceId = serviceRecord.deviceID;
          console.log(serviceRecord.deviceID = "================");
          console.log(deviceId.localeCompare(config.uniqueID) + "-----------------");
          if (serviceRecord.account == config.ACCOUNT && deviceId.localeCompare(config.uniqueID) > 0) {
            //sendMessage
            console.log("start to send sync request");
            dataSync.syncRequest(service.addresses);
          };
        };
      }
      
      
    });
    browser.on('serviceDown', function(service) {
      if(listOfOscDevices[service.name]) {
        delete listOfOscDevices[service.name];
        var cnt = Object.keys(listOfOscDevices).length;
        console.log('There are '+cnt+' devices');
        socket.emit('mdnsDown', service);
        var str=JSON.stringify(service);
        util.log("service down: "+str+now.toLocaleTimeString());
      }
      //socket.emit('mdnsDown', service);
     // var str=JSON.stringify(service);
     //util.log("service down: "+service.name+now.toLocaleTimeString());

    });
    browser.on('serviceChanged', function(service) {
      /*if(listOfOscDevices[service.name]) {
        delete listOfOscDevices[service.name];
        var cnt = Object.keys(listOfOscDevices).length;
        console.log('There are '+cnt+' devices');
      }
      socket.emit('mdnsDown', service);
      var str=JSON.stringify(service);*/
    //  util.log("service changed: "+service.name+now.toLocaleTimeString());
    });
    util.log("listen to services");
    browser.start();
    var txt_record = {
      deviceName: config.SERVERNAME,
      account:config.ACCOUNT,
      deviceID:config.uniqueID
    };
    var ad = mdns.createAdvertisement(mdns.tcp('http'), config.MDNSPORT,{txtRecord: txt_record});
    ad.start();
  });

  config.riolog("Server has started.");
  //Unuseful code. When executed in node-main, this code will make node-webkit crash.
  //filesHandle.monitorFiles('/home/v1/resources');
  filesHandle.monitorNetlink('./var/.netlinkStatus');
}

exports.start = start;


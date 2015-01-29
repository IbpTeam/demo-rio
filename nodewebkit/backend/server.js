var http = require("http");
var https = require("https");
var ws = require("ws");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var util = require('util');
var cp = require('child_process');
var now= new Date();  

var server;
var wsServer;

function start(callback,route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = decodeURIComponent(url.parse(request.url).pathname);

    config.riolog("Request for " + pathname + " received.");
    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      config.riolog("Received POST data chunk '"+ postDataChunk + "'.");
    });
    request.addListener("end", function() {
      route(handle, pathname, response, postData);
    });
  }
  if(server!==undefined&&wsServer!==undefined){
    callback(true);
    return;
  }
  if (config.ISSECURE === true){
    try{
      var options = {
        key: fs.readFileSync(config.KEYPATH),
        cert: fs.readFileSync(config.CERTPATH)
      };
      server = https.createServer(options, onRequest);
    }catch(e){
      console.log("Warning: some exception happened when create https server, so use http now.");
      server = http.createServer(onRequest);
    }
  }else {
    server = http.createServer(onRequest);
  }
  server.listen(config.SERVERPORT);

  //Start the webSocketServer for path /ws
  var WebSocketServer = require('ws').Server;
  wsServer = new WebSocketServer({server: server, path: config.WEBSOCKETPATH});
  wsServer.on('connection', function(client) {
    client.send(JSON.stringify({
      msg: 'This is a message from the server! ' + new Date().getTime(),
      sessionID: client._socket._handle.fd
    }));
    client.on('message', function(message){
        console.log('received: %s', message);
        route(handle, config.WEBSOCKETPATH, client, message);
    });
    client.on('disconnect',function(){
      console.log('websocket has disconnected:%s', client);
      // remove all listeners of this client
      removeWSListeners(client);
    });
  });
  wsServerInstance = wsServer;
  config.riolog("Server has started.");
  callback(true);
}

exports.start = start;

function close(callback){
  try{
    if(wsServer!==undefined){
      wsServer.close();
      wsServer=undefined;
    }
    if(server!==undefined){
      server.close();
      server=undefined;
    }
    callback(true);
  }catch(e){
    callback(false);
  }
}

exports.close=close;

var wsServerInstance = null;
function getWSServer() {
  return wsServerInstance;
}

exports.getWSServer = getWSServer;

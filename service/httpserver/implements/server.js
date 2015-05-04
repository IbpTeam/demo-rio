var http = require("http"),
    https = require("https"),
    ws = require("ws"),
    url = require("url"),
    sys = require('sys'),
    path = require('path'),
    fs = require('fs'),
    config = require("../../../config"),
    util = require('util'),
    cp = require('child_process'),
    router = require('./router');

function HTTPServer(router) {
  this._server = null;
  this._wsServer = null;
  this._router = router;
  this._proxy = {};

  this._start();
}

HTTPServer.prototype.close = function(callback) {
  var cb = callback || function() {};
  // needed?
  // this._wsServer.close();
  this._server.close(cb);
}
  
HTTPServer.prototype._onRequest = function(request, response) {
  var postData = "",
      pathname = decodeURIComponent(url.parse(request.url).pathname),
      self = httpServer;

  config.riolog("Request for " + pathname + " received.");
  request.setEncoding("utf8");

  request.on("data", function(postDataChunk) {
    postData += postDataChunk;
    config.riolog("Received POST data chunk '" + postDataChunk + "'.");
  }).on("end", function() {
    self._router.route(self._proxy, pathname, response, postData);
  });
}

HTTPServer.prototype._start = function() {
  var self = this;
  if(config.ISSECURE === true) {
    try {
      var options = {
        key: fs.readFileSync(config.KEYPATH),
        cert: fs.readFileSync(config.CERTPATH)
      };
      self._server = https.createServer(options, self._onRequest);
    } catch(e) {
      console.log("Warning: some exception happened when create https server, so use http now.");
      self._server = http.createServer(self._onRequest);
    }
  } else {
    self._server = http.createServer(self._onRequest);
  }
  self._server.listen(config.SERVERPORT);

  //Start the webSocketServer for path /ws
  var WebSocketServer = require('ws').Server;
  self._wsServer = new WebSocketServer({
    server: self._server,
    path: config.WEBSOCKETPATH
  });
  self._wsServer.on('connection', function(client) {
    client.send(JSON.stringify({
      msg: 'This is a message from the server! ' + new Date().getTime(),
      sessionID: client._socket._handle.fd
    }));

    client.on('message', function(message) {
        console.log('received: %s', message);
        self._router.route(self._proxy, config.WEBSOCKETPATH, client, message);
    }).on('disconnect',function() {
      console.log('websocket has disconnected:%s', client);
      // remove all listeners of this client
      removeWSListeners(client);
    });
  });
  config.riolog("Server has started.");
}

var httpServer = null,
    stub = null;
exports.setStub = function(stub_) {
  if(typeof stub_ !== 'undefined')
    stub = stub_;
};

exports.start = function(callback) {
  var cb = callback || function() {};
  if(httpServer == null) {
    httpServer = new HTTPServer(router);
    stub.notify('start');
    cb(null);
  }
  cb('Server already started');
};

exports.stop = function(callback) {
  var cb = callback || function() {};
  if(httpServer == null) return cb('Server has not started');
  httpServer.close(function() {
    httpServer = null;
    stub.notify('stop');
    cb(null);
  });
};


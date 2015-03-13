// TODO: implements the server for reciving RPC requests from clients
//   and register/unregister requests from services

var net = require('net');

function Cache(capacity) {
  this._capacity = capacity || 10;
  this._size = 0;
  this._c = new Array(capacity);
}

Cache.prototype.get = function(key) {
  if(typeof this._c[key] !== 'undefined') {
    // TODO: change the corresponding LRU perameter
    return this._c[key];
  }
  throw 'Not found';
}

Cache.prototype.set = function(key, val) {
  // TODO: remove LRU obj, if cache has full
}

function PeerEnd() {
  this._port = 56765;
  this._services = new Cache(20);

  this._init();
}

PeerEnd.prototype._init = function() {
  // TODO: start up a server
  var self = this,
      server = self._server = net.createServer(self._accept);
  server.listen(self._port, function() {
    console.log('This peer is listening on', server.address());
  });
  server.on('error', function(e) {
    // TODO: handle errors occured on server
  });
}

PeerEnd.prototype._destroy = function() {
  // TODO: close all connections and server
}

PeerEnd.prototype._accept = function(cliSock) {
  // TODO: varify this connection
  cliSock.on('data', function(data) {
    // TODO: make sure this is a completed data packet
  }).on('end', function() {
    // TODO: handle client disconnect
  });
}

PeerEnd.prototype._dispatcher = function(msg) {
  // TODO: handle msgs from clients
}

PeerEnd.prototype.connect = net.connect;


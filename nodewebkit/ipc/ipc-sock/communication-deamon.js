// TODO: implements the server for reciving RPC requests from clients
//   and register/unregister requests from services
var net = require('net');

// Elements of this cache are objects like: {
//  val: the real value
//  age: the age of this value
// }
function Cache(capacity) {
  this._capacity = capacity || 10;
  this._size = 0;
  this._c = new Array(capacity);
}

Cache.prototype.get = function(key) {
  if(typeof this._c[key] !== 'undefined') {
    // TODO: change the corresponding LRU perameter
    this._c[key].age = 0;
    for(var k in this._c) {
      this._c[k].age++;
    }
    return this._c[key].val;
  }
  throw 'Not found';
}

Cache.prototype.set = function(key, val) {
  // TODO: remove LRU obj, if cache has full
  if(this._size == this._capacity) {
    var oKey = this._findOldest();
    // TODO: release the corresponding resource
    this._c[oKey] = null;
    delete this._c[oKey];
    this._size--;
  }
  this._c[key] = {
    age: 1,
    val: val
  };
  this._size++;
}

Cache.prototype._findOldest = function() {
  var oldest = 0, oKey = null;
  for(var k in this._c) {
    if(this._c[k].age > oldest) {
      oldest = this._c[k];
      oKey = k;
    }
  }
  return oKey;
}

function PeerEnd() {
  this._port = 56765;
  this._svrObj = new Cache(20);
  this._svrList = [];

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
  this._server.close();
}

PeerEnd.prototype._accept = function(cliSock) {
  // TODO: varify this connection
  cliSock.on('data', function(data) {
    // TODO: make sure this is a completed data packet
    this._dispatcher(data);
  }).on('end', function() {
    // TODO: handle client disconnect
  });
}

PeerEnd.prototype._packet = function(content) {
}

PeerEnd.prototype._unpack = function(packet) {
}

PeerEnd.prototype._dispatcher = function(msg) {
  // TODO: handle msgs from clients
}

// TODO: maintain a connection for seconds, close idle connections
//  which have none communication with the peer out of time.
PeerEnd.prototype._getConnection = function(ip, callback) {
  var cb = callback || function() {},
      client = net.connect({
        host: ip,
        port: this._port
      }, function() {
        cb(client);
      });
  client.on('data', function(data) {});
  return client;
}

// TODO: API for clients to send sth to peers
PeerEnd.prototype.send = function(dstAddr, content) {
  if(net.isIP(dstAddr) == 0)
    return 'Invalid IP address';
  var conn = this._getConnection(dstAddr);
}

// TODO: API for clients to register services
PeerEnd.prototype.register = function(svrName, svrAddr) {}

// TODO: API for clients to unregister services
PeerEnd.prototype.unregister = function(svrName) {}


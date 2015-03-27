// TODO: implements the server for reciving RPC requests from clients
//   and register/unregister requests from services
var net = require('net'),
    Stub = require('./commdaemonStub') ;

// Elements of this cache are objects like: {
//  val: the real value
//  age: the age of this value
// }, by default.
function Cache(capacity, stratagy) {
  this._capacity = capacity || 10;
  this._size = 0;
  this._c = new Array(capacity);
  if(typeof stratagy !== 'undefined') {
    if(typeof stratagy.init === 'undefined' 
        || typeof stratagy.update === 'undefined'
        || typeof stratagy.repTarget === 'undefined') {
      this._init = this._born;
      this._update = this._older;
      this._repTarget = this._findOldest;
    } else {
      this._init = stratagy.init;
      this._update = stratagy.update;
      this._repTarget = stratagy.repTarget;
    }
  }
}

Cache.prototype.get = function(key) {
  if(typeof this._c[key] !== 'undefined') {
    // update the information of cached element
    this._update(key, this._c);
    return this._c[key].val;
  }
  throw 'Not found';
}

Cache.prototype.set = function(key, val) {
  // By default, remove the LRU obj if cache has full
  if(this._size == this._capacity) {
    this._repTarget(this._c);
    this._size--;
  }
  this._c[key] = {
    val: val
  };
  this._init(key, this._c);
  this._size++;
}

Cache.prototype._born = function(key, list) {
  list[key].age = 1;
}

Cache.prototype._older = function(key, list) {
  list[key].age = 0;
  for(var k in list) {
    list[k].age++;
  }
}

Cache.prototype._findOldest = function(list) {
  var oldest = 0, oKey = null;
  for(var k in list) {
    if(list[k].age > oldest) {
      oldest = list[k].age;
      oKey = k;
    }
  }
  // release the corresponding resource
  try {
    list[key].val.release();
    list[key] = null;
    delete list[key];
  } catch(e) {
    console.log(e);
  }
}

function PeerEnd() {
  this._port = 56765;
  this._callStack = [];
  this._svrObj = new Cache(20); // svrName -> proxy obj
  this._svrList = []; // svrName -> module path
  this._connList = new Cache(20, {
    init: function(key, list) {
      list[key].timer = setTimeout(function() {
        try {
          list[key].val.release();
          list[key] = null;
          delete list[key];
          console.log('Connection to', key, 'has been closed');
        } catch(e) {
          console.log(e);
        }
      }, 120000);
    },
    update: function(key, list) {
      clearTimeout(list[key].timer);
      list[key].timer = setTimeout(function() {
        try {
          list[key].val.release();
          list[key] = null;
          delete list[key];
          console.log('Connection to', key, 'has been closed');
        } catch(e) {
          console.log(e);
        }
      }, 120000);
    },
    repTarget: function(list) {
      // need do nothing
    }
  })

  this._init();
}

PeerEnd.prototype._init = function() {
  // start up a server
  var self = this,
      server = self._server = net.createServer(function(cliSock) {
        self._accept(cliSock);
      });
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
  var self = this;
  // TODO: cache accepted connection
  // self._connList.set(cliSock.remoteAddress, cliSock);
  cliSock.on('data', function(data) {
    console.log(this.remoteAddress + ':' + this.remotePort + ' sends: ' + data.toString());
    // TODO: make sure this is a completed data packet
    self._dispatcher(data, this.remoteAddress);
  }).on('error', function(err) {
    // TODO: handle errors
    console.log(err);
  }).on('end', function() {
    // TODO: handle client disconnect
  });
}

PeerEnd.prototype._packet = function(content) {
  // TODO: put content into a data packet
  return JSON.stringify(content);
}

PeerEnd.prototype._unpack = function(packet) {
  // TODO: get content from data packet
  return JSON.parse(packet);
}

PeerEnd.prototype._dispatcher = function(msg, srcAddr) {
  // handle msgs from clients
  try {
    var content = this._unpack(msg);
    switch(content.action) {
      // TODO: run these handlers concurrently
      case 0: // call
        conetent.srcAddr = srcAddr;
        this._callHandler(content);
        break;
      case 1: // return
        this._returnHandler(content);
        break;
      case 2: // notify
        this._notifyHandler(content);
        break;
      default:
        break;
    }
  } catch(e) {
    console.log(e);
  }
}

PeerEnd.prototype._callHandler = function(content) {
  // find Service proxy object based on svr of content
  var self = this,
      svrProxy;
  try {
    svrProxy = self._svrObj.get(content.svrName);
  } catch(e) {
    try {
      svrProxy = require(self._svrList[content.svrName]).getProxy();
      self._svrObj.set(content.svrName, svrProxy);
    } catch(e) {
      // service not found
      self.send(content.srcAddr, {
        action: 1,
        svr: content.svr,
        token: content.token,
        func: content.func,
        ret: ['Service not found']
      });
    }
  }
  // TODO: specify on/off call's callback
  content.args.push(function(result) {
    // send result to client
    self.send(content.srcAddr, {
      action: 1,
      svr: content.svr,
      token: content.token,
      func: content.func,
      ret: [null, result]
    });
  });
  svrProxy[content.func].apply(svrProxy, content.args);
}

PeerEnd.prototype._returnHandler = function(content) {
  // find cb from call stack based on token of content
  if(typeof this._callStack[content.token] === 'undefined')
    return console.log('Callback not found');
  this._callStack[content.token].apply(this, content.ret);
  this._callStack[content.token] = null;
  delete this._callStack[content.token];
}

PeerEnd.prototype._notifyHandler = function(content) {
  // TODO: use stub to notify targets
  stub.notify.apply(stub, content.args);
}

// TODO: maintain a connection for seconds, close idle connections
//  which have none communication with the peer out of time.
PeerEnd.prototype._getConnection = function(ip) {
  var client, self = this;
  try {
    client = self._connList.get(ip);
  } catch(e) {
    client = net.connect(self._port, ip, function() {
      // connected successfully
      self._connList.set(ip, client);
    });
    client.setKeepAlive(true);
    client.release = client.destroy;
    self._accept(client);
    /* client.on('data', function(data) { */
      // // TODO: handle data from server
    // }).on('error', function(err) {
      // // TODO: handle errors
      // console.log(err);
    // }).on('end', function() {
      // // TODO: disconnected from server
    /* }); */
  }
  return client;
}

PeerEnd.prototype._contentVarify = function(content) {
  if(typeof content !== 'object')
    return 'Invalid type of content, should be an object';
  if(content.action < 0 && content.action > 2)
    return 'Unknown action';
  return null;
}

// TODO: API for clients to send sth to peers
// content -> JSON object: {
//  action: {call(0)|return(1)|notify(2)} -> Number,
//  svr: {the name of service} -> String,
//  func: {the name of function to be called} -> String,
//  args: {args needed} -> Array
// }
// e.g. {
//  action: 0(or 1),
//  svr: 'service1'
//  func: 'fn1',
//  args: [arg1, arg2](or [ret])
// },
// {
//  action: 2,
//  args: [event, arg1, arg2]
// }
PeerEnd.prototype.send = function(dstAddr, content, callback) {
  var cb = callback || function() {};
  if(net.isIP(dstAddr) == 0)
    return cb('Invalid IP address');
  var ret;
  if((ret = this._contentVarify(content)) != null)
    return cb(ret);
  if(content.action == 0) {
    // TODO: generate a token
    content.token = '';
    this._callStack[content.token] = cb;
  }
  var conn = this._getConnection(dstAddr);
  conn.write(this._packet(content), function() {
    // TODO: do sth after sending packet
    // If this is a RPC msg, call this callback after reciving responses from remote
    if(content.action != 0) cb(null, 0);
  });
}

// API for clients to register services
PeerEnd.prototype.register = function(svrName, svrAddr, callback) {
  var cb = callback || function() {};
  if(typeof this._svrList[svrName] !== 'undefined')
    cb('Service has been registered.');
  // TODO: varify this svrAddr
  this._svrList[svrName] = svrAddr;
  cb(null);
}

// API for clients to unregister services
PeerEnd.prototype.unregister = function(svrName, callback) {
  var cb = callback || function() {};
  if(typeof this._svrList[svrName] === 'undefined')
    cb('Service is not registered.');
  this._svrList[svrName] = null;
  delete this._svrList[svrName];
  cb(null);
}

var stub = null;
(function main() {
  var peer = new PeerEnd();
  // For test
  /* peer.send('192.168.1.100', 'Hello world!!'); */
  // setTimeout(function() {
    // peer.send('192.168.1.100', 'Hello again');
  /* }, 60000); */
  // TODO: register PeerEnd on local IPC framework to be a service
  stub = Stub.getStub(peer);
})();


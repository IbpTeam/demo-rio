// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.im",
  "path": "/nodejs/webde/im",
  "name": "nodejs.webde.im",
  "type": "dbus",
  "service": true,
  "interface": [{
    "name": "send",
    "in": [
      "String"
    ]
  }],
  "serviceObj": {
    send: function(val, callback) {
      var msg = JSON.parse(val);
      stub.notify(msg.typ, msg.txt);
      var retObj = new Object();
      retObj.ret = msg.txt;
      callback(retObj);
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('../../../webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null,
  cd = null;
exports.getStub = function(proxyAddr) {
  if (stub == null) {
    if (typeof proxyAddr === 'undefined')
      throw 'The path of proxy\'s module file we need!';
    // TODO: replace $cdProxy to the path of commdaemonProxy
    cd = require('../../../nodewebkit/ipc/commdaemon/commdaemonProxy').getProxy();
    cd.register(initObj.name, proxyAddr, function(ret) {
      if (ret.err) {
        return console.log(ret.err, 'This service cannot be accessed from other devices since failed to register on CD');
      }
    });
    stub = new Stub();
  }
  return stub;
}
// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var type = 'dbus', pf = process.platform;
if(pf == 'linux') {
  type = 'dbus';
} else if(pf == 'win32') {
} else if(pf == 'darwin') {
}

var initObj = {
  "address": "nodejs.webde.service",
  "path": "/nodejs/webde/service",
  "name": "nodejs.webde.service.commdeamon",
  "type": type,
  "service": true,
  "interface": [
    {
      "name": "send",
      "in": [
        "String",
        "String"
      ],
      "out": "Auto"
    },
    {
      "name": "register",
      "in": [
        "String",
        "String"
      ],
      "out": "Number"
    },
    {
      "name": "unregister",
      "in": [
        "String"
      ],
      "out": "Number"
    }
  ],
  "serviceObj": {
    send: function(dstAddr, content, callback) {
      peer.send(dstAddr, content, function(err) {
        if(err) callback(-1);
        else callback(0);
      });
    },
    register: function(svrName, svrAddr, callback) {
      peer.register(svrName, svrAddr, function(err) {
        if(err) callback(-1);
        else callback(0);
      });
    },
    unregister: function(svrName, callback) {
      peer.unregister(svrName, function(err) {
        if(err) callback(-1);
        else callback(0);
      });
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of ipc module in your project
  this.ipc = require('../ipc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this.ipc.notify.apply(this.ipc, arguments);
};

var stub = null,
    peer = null;
exports.getStub = function(peer_) {
  if(stub == null) {
    peer = peer_;
    stub = new Stub();
  }
  return stub;
}

// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.test",
  "path": "/nodejs/webde/test",
  "name": "nodejs.webde.test",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "setVal",
      "in": [
        "String"
      ],
      "out": "Object"
    },
    {
      "name": "getVal",
      "in": [],
      "out": "Object"
    }
  ],
  "serviceObj": {
    setVal: function(val, callback) {
      /* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      v = val;
      console.log(val);
      callback({});
    },
    getVal: function(callback) {
      /* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      callback({ret: v});
    }
  }
}

var v = 'WWW';

function Stub() {
  // TODO: please replace $IPC with the real path of ipc module in your project
  this.ipc = require('../lib/ipc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this.ipc.notify.apply(this.ipc, arguments);
};

var stub = null,
    cd = null;
exports.getStub = function(proxyAddr) {
  if(stub == null) {
    // register self on communication-daemon
    if(typeof proxyAddr === 'undefined') 
      throw 'The path of proxy\'s module file we need!';
    console.log(proxyAddr);
    cd = require('../../service/commdaemon/interface/commdaemonProxy').getProxy();
    cd.register(initObj.name, proxyAddr, function(ret) {
      if(ret.err) {
        return console.log(ret.err
          , 'This service cannot be accessed from other devices since failed to register on CD');
      }
      console.log('register OK');
    });
    // register services on ipc-framework
    stub = new Stub();
  }
  return stub;
}

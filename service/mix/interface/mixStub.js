var mix = require('../implements/mix.js');
// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.mix",
  "path": "/nodejs/webde/mix",
  "name": "nodejs.webde.mix",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "getHello",
      "in": [],
      "out": "String"
    },
    {
      "name": "getHello2",
      "in": [],
      "out": "Object"
    }
  ],
  "serviceObj": {
    getHello: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      mix.getHello(function(para){
        console.log("This is in Server "+ para);
        callback(para);
      });
    },
    getHello2: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      mix.getHello2(function(pa1,pa2,pa3){
        console.log("This is in Server pa1"+ pa1);
        console.log("This is in Server pa2"+ pa2);
        console.log("This is in Server pa3"+ pa3);
        var res=[];
        res[1] = pa1;
        res[2] = pa2;
        res[3] = pa3;
        callback(res);
      });
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of ipc module in your project
  this.ipc = require('../../../nodewebkit/ipc/ipc.js').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this.ipc.notify.apply(this.ipc, arguments);
};

var stub = null,
    cd = null;
exports.getStub = function(proxyAddr) {
  if(stub == null) {
    if(typeof proxyAddr === 'undefined')
      throw 'The path of proxy\'s module file we need!';
    // TODO: replace $cdProxy to the path of commdaemonProxy
    cd = require('../../../nodewebkit/ipc/commdaemon/commdaemonProxy').getProxy();
    cd.register(initObj.name, proxyAddr, function(ret) {
      if(ret < 0)
        throw 'Fail to register online';
    });
    stub = new Stub();
  }
  return stub;
}

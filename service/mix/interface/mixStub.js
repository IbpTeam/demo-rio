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
      "in": []
    },
    {
      "name": "getHello2",
      "in": []
    },
    {
      "name": "getHello3",
      "in": []
    },
    {
      "name": "openDev",
      "in": []
    },
    {
      "name": "isLocal",
      "in": []
    }
  ],
  "serviceObj": {
    getHello: function(callback) {
      mix.getHello(function(para){
        var retObj = new Object();
        console.log("This is in Server "+ para);
        retObj.ret = para;
        callback(retObj);
      });
    },
    getHello2: function(callback) {
      mix.getHello2(function(pa1,pa2,pa3){
        console.log("This is in Server pa1"+ pa1);
        console.log("This is in Server pa2"+ pa2);
        console.log("This is in Server pa3"+ pa3);
        var res = [];
        res[0] = pa1;
        res[1] = pa2;
        res[2] = pa3;
        var retObj = new Object();
        retObj.ret = res;
        callback(retObj);
      });
    },
    getHello3: function(callback) {
      mix.getHello3(function(pa1,pa2){
        var res = new Object();
        res.para1 = pa1;
        res.para2 = pa2;
        console.log("getHello3 para1 : "+res.para1.str1);
        console.log("getHello3 para1 : "+res.para1.str2);
        console.log("getHello3 para2 : "+res.para2[0]);
        console.log("getHello3 para2 : "+res.para2[1]);
        console.log("getHello3 para2 : "+res.para2[2]);
        var retObj = new Object();
        retObj.ret = res;
        callback(retObj);
      });
    },
    openDev: function(callback) {
      mix.openDev(function(flag){
        var res = flag;
        console.log("openDev : "+res);
        var retObj = new Object();
        retObj.ret = res;
        callback(retObj);
      });
    },
    isLocal: function(callback) {
      mix.isLocal(function(flag){
        var res = flag;
        console.log("isLocal : "+res);
        var retObj = new Object();
        retObj.ret = res;
        callback(retObj);
      });
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of ipc module in your project
  this._ipc = require('../../../webde-rpc/lib/ipc.js').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
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

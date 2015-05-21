// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.hardResMgr",
  "path": "/nodejs/webde/hardResMgr",
  "name": "nodejs.webde.hardResMgr",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "getResourceList",
      "in": [
        "Object"
      ]
    },
    {
      "name": "applyResource",
      "in": [
        "Object"
      ]
    },
    {
      "name": "releaseResource",
      "in": [
        "Object"
      ]
    }
  ],
  "serviceObj": {
    getResourceList: function(Object, callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      hardResMgr.getResourceList(Object,function(err,result){
        if (err) return callback({
          err: err
        });
        callback({
          ret: result
        });
      });
    },
    applyResource: function(Object, callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      hardResMgr.applyResource(Object,function(err,result){
        if(err)return callback({err: err});
        callback({ret:result});
        stub._notifyStateChg(result,'1');
      });
    },
    releaseResource: function(Object, callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/
      hardResMgr.releaseResource(Object,function(err,result){
        if(err)return callback({err: err});
        callback({ret:result});
        stub._notifyStateChg(result,'0');
      });
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

Stub.prototype._notifyStateChg = function(items_, state_) {
  try {
    var detail=items_['detail'];
    for (var i=0;i< detail.length;i++) {
      var item =detail[i];
      if (item['option'] !== undefined) delete item['option'];
      item['state'] = state_;
    }
    stub.notify('stateChange',items_);
  } catch (e) {
    console.log('state changed notify fail');
  }
};

var stub = null,
    cd = null,
    hardResMgr=null;
var proxyPath = __dirname+'/hardResMgrProxy';
exports.getStub = function(hardResMgr_) {
  if(stub == null) {
 //   if(typeof proxyAddr_ === 'undefined')
 //     throw 'The path of proxy\'s module file we need!';
    // TODO: replace $cdProxy to the path of commdaemonProxy
    cd = require('../../commdaemon/interface/commdaemonProxy.js').getProxy();
    cd.register(initObj.name, proxyPath, function(ret) {
      if(ret.err) {
        return console.log(ret.err
          , 'This service cannot be accessed from other devices since failed to register on CD');
      }
    });
    stub = new Stub();
    hardResMgr=hardResMgr_;
  }
  return stub;
}
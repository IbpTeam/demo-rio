// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.service",
  "path": "/nodejs/webde/service",
  "name": "nodejs.webde.service.test",
  "type": "$ipcType",
  "service": true,
  "interface": [
    {
      "name": "setVal",
      "in": [
        "String"
      ]
    },
    {
      "name": "getVal",
      "in": [],
      "out": "String"
    }
  ],
  "serviceObj": {
    setVal: function(String, callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/},
    getVal: function(callback) {/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/}
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of ipc module in your project
  this.ipc = require('$IPC').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this.ipc.notify.apply(this.ipc, arguments);
};

var stub = null;
exports.getStub = function() {
  if(stub == null) stub = new Stub();
  return stub;
}

// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions

var initObj = {
  "address": "nodejs.webde.service",
  "path": "/nodejs/webde/service",
  "name": "nodejs.webde.service.test",
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
    setVal: function(val, callback) {
      /* TODO: Implement your service. Make sure that call the callback at the end of this function,\n and the parameter is the return of this service.*/
      v = val;
      console.log(val);
      callback();
    },
    getVal: function(callback) {
      /* TODO: Implement your service. Make sure that call the callback at the end of this function,\n and the parameter is the return of this service.*/
      callback(v);
    }
  }
}

var v = 'WWW';

// TODO: please replace $ipcType with one of dbus, binder and websocket
// TODO: please replace $IPC with the real path of ipc module in your project
var ipc = require('./ipc').getIPC('dbus', initObj)

exports.notify = function(msg) {
  ipc.notify(msg);
};

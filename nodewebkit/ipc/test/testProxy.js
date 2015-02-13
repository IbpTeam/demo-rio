// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions

var initObj = {
  "address": "nodejs.webde.service",
  "path": "/nodejs/webde/service",
  "name": "nodejs.webde.service.test",
  "service": false
}

// TODO: please replace $ipcType with one of dbus, binder and websocket
// TODO: please replace $IPC with the real path of ipc module in your project
var ipc = require('./ipc').getIPC('dbus', initObj)

exports.setVal = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, l - 1);
  ipc.invoke({
    name: "setVal",
    in: args,
    callback: callback
  });
};

exports.getVal = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, l - 1);
  ipc.invoke({
    name: "getVal",
    in: args,
    callback: callback
  });
};

// TODO: choose to implement interfaces of ipc
/* handle message send from service
ipc.onMsg = function(msg) {
  // TODO: your handler
}*/

/* handle the event emitted when connected succeffuly
ipc.onConnect = function() {
  // TODO: your handler
}*/

/* handle the event emitted when connection has been closed
ipc.onClose = function() {
  // TODO: your handler
}*/

/* handle the event emitted when error occured
ipc.onError = function(err) {
  // TODO: your handler
}*/

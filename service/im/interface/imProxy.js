// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.im",
  "path": "/nodejs/webde/im",
  "name": "nodejs.webde.im",
  "type": "dbus",
  "service": false
}

function Proxy() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('../../../webde-rpc').getIPC(initObj);
  this._token = 0;

  // TODO: choose to implement interfaces of ipc
  /* handle message send from service
  this._ipc.onMsg = function(msg) {
    // TODO: your handler
  }*/

  /* handle the event emitted when connected succeffuly
  this._ipc.onConnect = function() {
    // TODO: your handler
  }*/

  /* handle the event emitted when connection has been closed
  this._ipc.onClose = function() {
    // TODO: your handler
  }*/

  /* handle the event emitted when error occured
  this._ipc.onError = function(err) {
    // TODO: your handler
  }*/
}

Proxy.prototype.send = function(String, callback) {
  var l = arguments.length,
    args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'send',
    in : args,
    callback: callback
  });
};

Proxy.prototype.on = function(event, handler) {
  this._ipc.on(event, handler);
};

Proxy.prototype.off = function(event, handler) {
  this._ipc.removeListener(event, handler);
};

var proxy = null;
exports.getProxy = function() {
  if (proxy == null) {
    proxy = new Proxy();
  }
  return proxy;
};
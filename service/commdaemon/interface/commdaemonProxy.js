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
  "address": "nodejs.webde.commdaemon",
  "path": "/nodejs/webde/commdaemon",
  "name": "nodejs.webde.commdaemon",
  "type": type,
  "service": false
}

function Proxy() {
  // TODO: please replace $IPC with the real path of ipc module in your project
  this.ipc = require('webde-rpc').getIPC(initObj);
  this._token = 0;

  // TODO: choose to implement interfaces of ipc
  /* handle message send from service
  this.ipc.onMsg = function(msg) {
    // TODO: your handler
  }*/

  /* handle the event emitted when connected succeffuly
  this.ipc.onConnect = function() {
    // TODO: your handler
  }*/

  /* handle the event emitted when connection has been closed
  this.ipc.onClose = function() {
    // TODO: your handler
  }*/

  /* handle the event emitted when error occured
  this.ipc.onError = function(err) {
    // TODO: your handler
  }*/
}

Proxy.prototype.send = function(String, Object, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this.ipc.invoke({
    token: this._token++,
    name: 'send',
    in: args,
    callback: callback
  });
};

Proxy.prototype.register = function(String, String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this.ipc.invoke({
    token: this._token++,
    name: 'register',
    in: args,
    callback: callback
  });
};

Proxy.prototype.unregister = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this.ipc.invoke({
    token: this._token++,
    name: 'unregister',
    in: args,
    callback: callback
  });
};

Proxy.prototype.on = function(event, handler) {
  this.ipc.on(event, handler);
};

Proxy.prototype.off = function(event, handler) {
  this.ipc.removeListener(event, handler);
};

var proxy = null;
exports.getProxy = function() {
  if(proxy == null) {
    proxy = new Proxy();
  }
  return proxy;
};

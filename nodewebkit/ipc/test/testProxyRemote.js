// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.service",
  "path": "/nodejs/webde/service",
  "name": "nodejs.webde.service.commdeamon",
  "type": "$ipcType",
  "service": false
}

function Proxy(ip) {
  if(typeof ip !== 'undefined') {
    this.ip = ip;
  } else {
    return console.log('The remote IP is required');
  }

  // TODO: please replace $IPC with the real path of ipc module in your project
  this.ipc = require('$IPC').getIPC(initObj);

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

Proxy.prototype.setVal = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, l - 1);
  try {
    var argv = {
      func: 'setVal',
      args: args
    };
    var argvs = JSON.stringify(argv);
  } catch(e) {
    return console.log(e);
  }
  this.ipc.invoke({
    name: 'send',
    in: [this.ip, argvs],
    callback: callback
  });
};

Proxy.prototype.getVal = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, l - 1);
  try {
    var argv = {
      func: 'getVal',
      args: args
    };
    var argvs = JSON.stringify(argv);
  } catch(e) {
    return console.log(e);
  }
  this.ipc.invoke({
    name: 'send',
    in: [this.ip, argvs],
    callback: callback
  });
};

  var argvs = '{
    'func': 'on',
    'args': ''
  }';
  this.ipc.invoke({
    name: 'send',
    in: [this.ip, argvs],
    callback: callback
  });

var proxy = null;
exports.getProxy = function(ip) {
  if(proxy == null) proxy = new Proxy(ip);
  return proxy;
}

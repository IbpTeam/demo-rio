// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

function Proxy(ip) {
  if(typeof ip !== 'undefined') {
    this.ip = ip;
  } else {
    return console.log('The remote IP is required');
  }

  // TODO: replace $cdProxy to the real path
  this._cd = require('../../../nodewebkit/ipc/commdaemon/commdaemonProxy.js').getProxy();  this._token = 0;

}

Proxy.prototype.send = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  var argv = {
      action: 0,
      svr: 'nodejs.webde.im',
      func: 'send',
      args: args
    };
  this._cd.send(this.ip, argv, callback);
};

Proxy.prototype.on = function(event, handler) {
  this._cd.on(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.im',
    'func': 'on',
    'args': [event]
  };
  this._cd.send(this.ip, argvs);
};

Proxy.prototype.off = function(event, handler) {
  this._cd.off(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.im',
    'func': 'off',
    'args': [event]
  };
  this._cd.send(this.ip, argvs);
};

var proxy = null;
exports.getProxy = function(ip) {
  if(proxy == null) {
    proxy = new Proxy(ip);
  }
  return proxy;
};

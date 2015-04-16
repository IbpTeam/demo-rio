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
  this.cd = require('../../service/commdaemon/interface/commdaemonProxy').getProxy();
}

Proxy.prototype.setVal = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, l - 1);
  // try {
    var argv = {
      action: 0,
      svr: 'nodejs.webde.test',
      func: 'setVal',
      args: args
    };
    // var argvs = JSON.stringify(argv);
  // } catch(e) {
    // return console.log(e);
  // }
  this.cd.send(this.ip, argv, callback);
};

Proxy.prototype.getVal = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, l - 1);
  // try {
    var argv = {
      action: 0,
      svr: 'nodejs.webde.test',
      func: 'getVal',
      args: args
    };
    // var argvs = JSON.stringify(argv);
  // } catch(e) {
    // return console.log(e);
  // }
  this.cd.send(this.ip, argv, callback);
};

Proxy.prototype.on = function(event, handler) {
  this.cd.on(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.test',
    'func': 'on',
    'args': [event]
  };
  this.cd.send(this.ip, argvs);
};

Proxy.prototype.off = function(event, handler) {
  this.cd.off(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.test',
    'func': 'off',
    'args': [event]
  };
  this.cd.send(this.ip, argvs);
};

var proxy = null;
exports.getProxy = function(ip) {
  if(proxy == null) {
    proxy = new Proxy(ip);
  }
  return proxy;
};

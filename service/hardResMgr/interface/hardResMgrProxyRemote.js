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
  this._cd = require('../../commdaemon/interface/commdaemonProxy.js').getProxy();  this._token = 0;

}

/**
 * @description
 *    some brief introduction of this interface
 * @param
 *    parameter list. e.g. param1: description -> value type
 * @return
 *    what will return from this interface
 */
Proxy.prototype.getResourceList = function(Object, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  var argv = {
      action: 0,
      svr: 'nodejs.webde.hardResMgr',
      func: 'getResourceList',
      args: args
    };
  this._cd.send(this.ip, argv, callback);
};

/**
 * @description
 *    some brief introduction of this interface
 * @param
 *    parameter list. e.g. param1: description -> value type
 * @return
 *    what will return from this interface
 */
Proxy.prototype.applyResource = function(Object, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  var argv = {
      action: 0,
      svr: 'nodejs.webde.hardResMgr',
      func: 'applyResource',
      args: args
    };
  this._cd.send(this.ip, argv, callback);
};

/**
 * @description
 *    some brief introduction of this interface
 * @param
 *    parameter list. e.g. param1: description -> value type
 * @return
 *    what will return from this interface
 */
Proxy.prototype.releaseResource = function(Object, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  var argv = {
      action: 0,
      svr: 'nodejs.webde.hardResMgr',
      func: 'releaseResource',
      args: args
    };
  this._cd.send(this.ip, argv, callback);
};

/**
 * @description
 *    add listener for ...
 * @param
 *    param1: event to listen -> String
 *    param2: a listener function -> Function
 *      @description
 *        a callback function called when events happened
 *      @param
 *        param1: description of this parameter -> type
 * @return
 *    itself of this instance
 */
Proxy.prototype.on = function(event, handler) {
  this._cd.on(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.hardResMgr',
    'func': 'on',
    'args': [event]
  };
  this._cd.send(this.ip, argvs);
};

/**
 * @description
 *    remove listener from ...
 * @param
 *    param1: event to listen -> String
 *    param2: a listener function -> Function
 *      @description
 *        a callback function called when events happened
 *      @param
 *        param1: description of this parameter -> type
 * @return
 *    itself of this instance
 */
Proxy.prototype.off = function(event, handler) {
  this._cd.off(event, handler);
  var argvs = {
    'action': 0,
    'svr': 'nodejs.webde.hardResMgr',
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

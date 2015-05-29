// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.hardResMgr",
  "path": "/nodejs/webde/hardResMgr",
  "name": "nodejs.webde.hardResMgr",
  "type": "dbus",
  "service": false
}

function Proxy() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('webde-rpc').getIPC(initObj);
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
  this._ipc.invoke({
    token: this._token++,
    name: 'getResourceList',
    in: args,
    callback: callback
  });
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
  this._ipc.invoke({
    token: this._token++,
    name: 'applyResource',
    in: args,
    callback: callback
  });
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
  this._ipc.invoke({
    token: this._token++,
    name: 'releaseResource',
    in: args,
    callback: callback
  });
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
  this._ipc.on(event, handler);
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
  this._ipc.removeListener(event, handler);
};

var proxy = null;
exports.getProxy = function() {
  if(proxy == null) {
    proxy = new Proxy();
  }
  return proxy;
};

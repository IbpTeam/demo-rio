// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.httpserver",
  "path": "/nodejs/webde/httpserver",
  "name": "nodejs.webde.httpserver",
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
 *    start a inside http server
 * @param
 *    param1: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *          }
 * @return
 *    error or nothing
 */
Proxy.prototype.start = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'start',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    stop the inside http server
 * @param
 *    param1: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *          }
 * @return
 *    error or nothing
 */
Proxy.prototype.stop = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'stop',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    restart the inside http server
 * @param
 *    param1: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *          }
 * @return
 *    error or nothing
 */
Proxy.prototype.restart = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'restart',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    add listener for the http server 'start' or 'stop' event
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
 *    remove listener from the http server 'start' or 'stop' event
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

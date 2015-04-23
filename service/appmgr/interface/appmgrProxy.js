// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.appmgr",
  "path": "/nodejs/webde/appmgr",
  "name": "nodejs.webde.appmgr",
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
 *    This function is for starting an app
 * @param
 *    param1: info object of an app which is got from getRegisteredAppInfo() -> Object
 *    param2: a JSON string includes parameters for starting -> String
 *    param3: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *            ret: window of this started App -> String
 *          }
 * @return
 *    error or window of App got from callback
 */
Proxy.prototype.startApp = function(Object, String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'startApp',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    send a key event to a running app
 * @param
 *    param1: the window name of app -> String
 *    param2: key event to send -> String
 *    param3: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *          }
 * @return
 *    error or undefined
 */
Proxy.prototype.sendKeyToApp = function(String, String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'sendKeyToApp',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    Register a HTML5 app to system
 * @param
 *    param1: info of app to be registered -> Object
 *      {
 *        id: ${app id},
 *        path: ${path of app},
 *      }
 *    param2: options to create an app -> Object
 *      {
 *        desktop: (true|false) // create a shortcut on desktop or not
 *        dock: (true|false) // create a shortcut on dock or not
 *      }
 *    param3: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *          }
 * @return
 *    error or undefined
 */
Proxy.prototype.registerApp = function(Object, Object, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'registerApp',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    Unregister an app from system
 * @param
 *    param1: id of app to be unregistered -> String
 *    param2: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *          }
 * @return
 *    error or undefined
 */
Proxy.prototype.unregisterApp = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'unregisterApp',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    Get all registered app
 * @param
 *    param1: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *            ret: the list of app ID -> Array
 *          }
 * @return
 *    error or list of app ID
 */
Proxy.prototype.getRegisteredApp = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'getRegisteredApp',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    Get registered app info by id
 * @param
 *    param1: ID of app -> String
 *    param2: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *            ret: the info object of this app -> Object
 *          }
 * @return
 *    error or undefined
 */
Proxy.prototype.getRegisteredAppInfo = function(String, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'getRegisteredAppInfo',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    Get all app base path
 * @param
 *    param1: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *            ret: the base path of this app -> String
 *          }
 * @return
 *    error or base path of apps
 */
Proxy.prototype.getBasePath = function(callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'getBasePath',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    generate and register an HTML5 App by a URL
 * @param
 *    param1: URL of a website -> String
 *    param2: options to create an app -> Object
 *      {
 *        desktop: (true|false) // create a shortcut on desktop or not
 *        dock: (true|false) // create a shortcut on desktop or not
 *      }
 *    param3: a callback function -> Function
 *      @description
 *        a callback function for getting returns of this interface
 *      @param
 *        param1: the return object -> Object
 *          {
 *            err: err description or undefined,
 *            ret: the ID of new generated app -> String
 *          }
 * @return
 *    error or app ID
 */
Proxy.prototype.generateAppByURL = function(String, Object, callback) {
  var l = arguments.length,
      args = Array.prototype.slice.call(arguments, 0, (typeof callback === 'undefined' ? l : l - 1));
  this._ipc.invoke({
    token: this._token++,
    name: 'generateAppByURL',
    in: args,
    callback: callback
  });
};

/**
 * @description
 *    add listener for app 'register' or 'unregister' event
 * @param
 *    param1: event to listen -> String
 *    param2: a listener function -> Function
 *      @description
 *        a callback function called when events happened 
 *      @param
 *        param1: the info of register app -> Object
 *          {
 *            appID: id of app
 *            option: options to create an inside app(object)
 *              {
 *                desktop: (true|false) // create a shortcut on desktop or not
 *                dock: (true|false) // create a shortcut on desktop or not
 *              }
 *          }
 * @return
 *    itself of this instance
 */
Proxy.prototype.on = function(event, handler) {
  this._ipc.on(event, handler);
  return this;
};

/**
 * @description
 *    remove listener from app 'register' or 'unregister' event
 * @param
 *    param1: event to listen -> String
 *    param2: a listener function -> Function
 *      @description
 *        a callback function called when events happened 
 *      @param
 *        param1: the info of register app -> Object
 *          {
 *            appID: id of app
 *            option: options to create an inside app(object)
 *              {
 *                desktop: (true|false) // create a shortcut on desktop or not
 *                dock: (true|false) // create a shortcut on desktop or not
 *              }
 *          }
 * @return
 *    itself of this instance
 */
Proxy.prototype.off = function(event, handler) {
  this._ipc.removeListener(event, handler);
  return this;
};

var proxy = null;
exports.getProxy = function() {
  if(proxy == null) {
    proxy = new Proxy();
  }
  return proxy;
};


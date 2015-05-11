var config = require('../config'),
    path = require("path"),
    requireProxy = require('../sdk/lib/requireProxy').requireProxySync,
    appManager = requireProxy('appmgr');

/**
 * @method startApp
 *   根据应用ID打开应用
 *
 * @param1 callback function(err, window)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      window: APP Window object
 * @param2 appInfo object
 *   启动程序Info对象，可以通过getRegisteredAppInfo获得
 * @param3 params string
 *   启动程序参数，可以json格式封装
 */
exports.startApp = function(startAppCB, appInfo, params) {
  appManager.startApp(appInfo, params, function(ret) {
    if(ret.err) return startAppCB(ret.err);
    startAppCB(null, ret.ret);
  });
};

/**
 * @method sendKeyToApp
 *   向已打开的应用发送键盘或鼠标事件
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, true 代表是成功，false代表是失败
 * @param2 windowname
 *   string，要发送的窗口的名称（部分）
 * @param3 key
 *   string，要打开发送的键盘事件
 *    参照 grep "XK_" /usr/include/X11/keysymdef.h|sed 's/ XK_/ /g'
 *    或参照 grep "XK_" /usr/include/X11/XF86keysym.h|sed 's/XK_//g' (for 'multimedia keyboard' keysyms)
 * 注：暂时只支持部分程序操作，如PPT，因此暂时采用windowname+xdotool的方式进行控制
 */
exports.sendKeyToApp = function(sendKeyToAppCb, windowName, key) {
  appManager.sendKeyToApp(windowName, key, function(ret) {
    if(ret.err) return sendKeyToAppCb(ret.err);
    sendKeyToAppCb(null, ret.ret);
  });
}

/**
 * Register a HTML5 app to system
 * registerAppCB: function(err_)
 *    err_: error discription or null
 * appInfo_: {
 *  id: ${app id},
 *  path: ${path of app},
 * }
 * option: options to create an inside app(object)
 *    {
 *      desktop: (true|false) // create a shortcut on desktop or not
 *      dock: (true|false) // create a shortcut on dock or not
 *    }
 */
exports.registerApp = function(registerAppCB, appInfo, option) {
  appManager.registerApp(appInfo, option, function(ret) {
    if(ret.err) return registerAppCB(ret.err);
    registerAppCB(null, ret.ret);
  });
};

/**
 * Unregister a HTML5 app from system
 * unregisterAppCB: function(err_)
 *    err_: error discription or null
 * appID: id of app
 */
exports.unregisterApp = function(unregisterAppCB, appID) {
  appManager.unregisterApp(appID, function(ret) {
    if(ret.err) return unregisterAppCB(ret.err);
    unregisterAppCB(null, ret.ret);
  });
};

/**
 * Get all registered HTML5 app
 * getRegisteredAppCB: function(err, appList)
 *    err: error discription or null
 *    appList: the list of app id
 */
exports.getRegisteredApp = function(getRegisteredAppCB) {
  appManager.getRegisteredApp(function(ret) {
    if(ret.err) return getRegisteredAppCB(ret.err);
    getRegisteredAppCB(null, ret.ret);
  });
}

/**
 * Get registered app info by id
 * getRegisteredAppInfoCB: function(err, appInfo)
 *    err: error discription or null
 *    appInfo: {
 *      id: ${app id},
 *      name: ${app name},
 *      path: ${path of app},
 *      iconPath: ${icon path of app}
 *    }
 * appID: the id of app
 */
exports.getRegisteredAppInfo = function(getRegisteredAppInfoCB, appID) {
  appManager.getRegisteredAppInfo(appID, function(ret) {
    if(ret.err) return getRegisteredAppInfoCB(ret.err);
    getRegisteredAppInfoCB(null, ret.ret);
  });
}

/**
 * Get all app base path
 * getRegisteredAppCB: function(err, basePath)
 *    err: error discription or null
 *    basePath: the base path of app
 */
exports.getBasePath = function(getBasePathCB) {
  appManager.getBasePath(function(ret) {
    if(ret.err) return getBasePathCB(ret.err);
    getBasePathCB(null, ret.ret);
  });
}

/**
 * generate and register an HTML5 App by a URL
 * generateAppByURLCB: function(err, appID)
 *    err: error discription or null
 *    appID: the ID of new generated app
 * url: URL of a website
 * option: options to create an inside app(object)
 *    {
 *      desktop: (true|false) // create a shortcut on desktop or not
 *      dock: (true|false) // create a shortcut on desktop or not
 *    }
 */
exports.generateAppByURL = function(generateAppByURLCB, url, option) {
  appManager.generateAppByURL(url, option, function(ret) {
    if(ret.err) return generateAppByURLCB(ret.err);
    generateAppByURLCB(ret.ret);
  });
}

var listeners = [];
function emit(param) {
  for(var listener in listeners) {
    listener.call(this, param);
  }
}

(function eventLoopInit() {
  appManager.on('register', function(ret) {
    ret.event = 'register';
    emit(ret);
  }).on('unregister', function(ret) {
    ret.event = 'unregister';
    emit(ret);
  });
})();

/**
 * add listener for app register or unregister
 * addListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: (register|unregister)
 *      appID: id of app
 *      option: options to create an inside app(object)
 *          {
 *            desktop: (true|false) // create a shortcut on desktop or not
 *            dock: (true|false) // create a shortcut on desktop or not
 *          }
 *    }
 */
exports.addListener = function(addListenerCB, listener) {
  if(typeof listener !== 'function')
    return addListenerCB('listener must be a function');
  listeners.push(listener);
  addListenerCB(null);
}

/**
 * remove listener for app register or unregister
 * removeListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data), the listener registered before
 *    data: {
 *      event: (register|unregister)
 *      appID: id of app
 *      option: options to create an inside app(object)
 *          {
 *            desktop: (true|false) // create a shortcut on desktop or not
 *            dock: (true|false) // create a shortcut on desktop or not
 *          }
 *    }
 */
exports.removeListener = function(removeListenerCB, listener) {
  if(typeof listener !== 'function')
    return removeListenerCB('listener must be a function');
  for(var i = 0; i < listeners.length; ++i) {
    if(listener == listeners[i]) {
      listeners.splice(i, 1);
      return removeListenerCB(null);
    }
  }
  removeListenerCB('listener not regiestered');
}


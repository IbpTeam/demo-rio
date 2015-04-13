exports.getHello = function(callback){
  setTimeout(callback("Hello World"), 0);
}

exports.getHello2 = function(callback){
  setTimeout(callback("Hello", "World", 2), 0);
}

exports.getHello3 = function(callback){
  require('util').log("test require");;
  setTimeout(callback({str1:"Hello", str2:"World"}, [1, 2, "33"]), 0);
}

/**
 * @method openDev
 *   打开开发者工具
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, true 代表是打开成功，false代表是打开失败
 */
exports.openDev = function(callback){
  var gui = global.window.nwDispatcher.requireNwGui();
  gui.Window.get().showDevTools();
  setTimeout(callback(true), 0);
}

/**
 * @method isLocal
 *   判断是否是本地打开
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, true 代表是本地打开，false代表是远程打开
 */
exports.isLocal = function(callback){
  setTimeout(callback(true), 0);
}

var config = require('../../backend/config');
var appManager = require('../../backend/app/appManager');
var path = require("path");

/**
 * @method getAppList
 *   根据应用名字打开应用
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      Array of string, 返回app名称列表，失败则返回null
 *      [
 *        name1, name2, name3...
 *      ]
 */
function getAppList(getAppListCb){
  console.log("Request handler 'getAppList' was called.");
  try{
    var appArr=new Array(config.AppList.length);
    for(var i = 0; i < config.AppList.length; i++) {
      appArr[i]=config.AppList[i].name;
    }
    setTimeout(getAppListCb(appArr));
  }catch(e){
    console.log("Error happened:" + e.message);
    setTimeout(getAppListCb(null), 0);
    return;
  }
}
exports.getAppList=getAppList;

/**
 * @method startAppByName
 *   根据应用名字打开应用
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      object, 返回app对象，失败则返回null
 *      {
 *        name:APP NAME,
 *        window:APP Window object
 *      }
 * @param2 sAppName string
 *   启动程序名称
 * @param3 oParamBag string
 *   启动程序参数，可以json格式封装
 */
function startAppByName(startAppByNameCb, sAppName, sParams){
  console.log("Request handler 'startAppByName' was called. sAppName:" +sAppName + " oParamBag:" + sParams);
  try{
    // changed
    /* var runapp=null; */
    /* var app; */
    /* for(var i = 0; i < config.AppList.length; i++) { */
      // app = config.AppList[i];
      // if (app.name == sAppName) {
        // runapp=app;
        // break;
      // }
    /* } */

    var runapp = appManager.getRegisteredAppInfoByAttr('name', sAppName);
    if (runapp === null) {
      console.log("Error no app " + sAppName);
      setTimeout(startAppByNameCb(null), 0);
      return;
    }

    var twin=window.Window.create(runapp.id + '-window', runapp.name, {
      left:200,
      top:200,
      height: 500,
      width: 660,
      fadeSpeed: 500,
      animate: true,
      contentDiv: false,
      iframe: true
    });
    twin.appendHtml(path.join(config.APPBASEPATH, runapp.path, '/index.html')
        + (sParams === null ? "" : ("?" + sParams)));
    app.win=twin;
    setTimeout(startAppByNameCb({
      name: sAppName,
      window: twin
    }), 0);
  } catch(e) {
    console.log("Error happened:" + e.message);
    setTimeout(startAppByNameCb(null), 0);
    return;
  }
};
exports.startAppByName=startAppByName;

/**
 * @method startAppByID
 *   根据应用ID打开应用
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      object, 返回app对象，失败则返回null
 *      {
 *        name:APP NAME,
 *        window:APP Window object
 *      }
 * @param2 sAppID string
 *   启动程序ID
 * @param3 oParamBag string
 *   启动程序参数，可以json格式封装
 */
function startAppByID(startAppByIDCb, sAppID, sParams) {
  var info = appManager.getRegisteredAppInfo(sAppID);
  if(info) {
    startAppByName(startAppByIDCb, info.name, sParams);
  } else {
    console.log('This app hasn\'t register yet');
    startAppByIDCb(null);
  }
};
exports.startAppByID = startAppByID;

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
function sendKeyToApp(sendKeyToAppCb, windowname, key){
  console.log("Request handler 'sendKeyToApp' was called.");
  //This follow command can get windowid from a pid.
  //  pstree -pn 25372 |grep -o "([[:digit:]]*)" |grep -o "[[:digit:]]*" | while read pid ; do xdotool search --pid $pid --onlyvisible ; done 2>/dev/null
  // xdotool send key command： xdotool windowactivate --sync 46137380 & xdotool key --clearmodifiers --window 46137380 Ctrl+w
  var exec = require('child_process').exec;
  var getpid=exec("xdotool search --name \"" + windowname + "\" | sort", function (error, stdout, stderr) {
    if (error !== null) {
      console.log('stderr: ' + stderr);
      console.log('exec error: ' + error);
      sendKeyToAppCb(false);
      return;
    }
    var nTail=stdout.lastIndexOf("\n");
    var nHead=stdout.lastIndexOf("\n", stdout.length - 2);
    nHead=nHead<0?0:nHead+1;
    if(nTail != stdout.length - 1 || nHead >= nTail){
      console.log("Error: stdout is illegal! : " + stdout);
      sendKeyToAppCb(false);
      return;
    }

    var windowid=stdout.substring(nHead, nTail);
    var sendkeycommand = "xdotool windowactivate --sync " + windowid + " && xdotool key --clearmodifiers --window " + windowid + " " + key;
    exec(sendkeycommand, function (error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
        sendKeyToAppCb(false);
        return;
      }
      sendKeyToAppCb(true);
    });
  });
}
exports.sendKeyToApp = sendKeyToApp;

// Register a HTML5 app to system
// registerAppCB: function(err_)
//    err_: error discription or null
// appInfo_: {
//  id: ${app id},
//  name: ${app name},
//  path: ${path of app},
//  iconPath: ${icon path of app}
// }
exports.registerApp = function(registerAppCB, appInfo) {
  appManager.registerApp(appInfo, registerAppCB);
};

// Unregister a HTML5 app from system
// unregisterAppCB: function(err_)
//    err_: error discription or null
// appID: id of app
exports.unregisterApp = function(unregisterAppCB, appID) {
  appManager.unregisterApp(appID, unregisterAppCB);
};

// Get all registered HTML5 app
// getRegisteredAppCB: function(err, appList)
//    err: error discription or null
//    appList: the list of app id
exports.getRegisteredApp = function(getRegisteredAppCB) {
  getRegisteredAppCB(null, appManager.getRegisteredApp());
}

// Get registered app info by id
// getRegisteredAppInfoCB: function(err, appInfo)
//    err: error discription or null
//    appInfo: {
//      id: ${app id},
//      name: ${app name},
//      path: ${path of app},
//      iconPath: ${icon path of app}
//    }
// appID: the id of app
exports.getRegisteredAppInfo = function(getRegisteredAppInfoCB, appID) {
  var info = appManager.getRegisteredAppInfo(appID);
  if(info == null)
    getRegisteredAppInfoCB('App not registered');
  else 
    getRegisteredAppInfoCB(null, info);
}

// Get all app base path
// getRegisteredAppCB: function(err, basePath)
//    err: error discription or null
//    basePath: the base path of app
exports.getBasePath = function(getBasePathCB) {
  getBasePathCB(null, appManager.getBasePath());
}

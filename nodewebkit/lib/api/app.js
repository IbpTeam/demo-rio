/**
 * @method getAppDataDir
 *   获取数据路径
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      string, 返回应用数据目录
 */
function getAppDataDir(getAppDataDirCb){
  console.log("Request handler 'getAppDataDir' was called.");
  var gui = global.window.nwDispatcher.requireNwGui();
  console.log(gui.App.dataPath);
  setTimeout(getAppDataDirCb(gui.App.dataPath), 0);
}
exports.getAppDataDir = getAppDataDir;

/**
 * @method getAppArgv
 *   获取应用调用参数
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      string, 返回应用调用参数
 */
function getAppArgv(getAppArgvCb){
  console.log("Request handler 'getAppArgv' was called.");
  var gui = global.window.nwDispatcher.requireNwGui();
  console.log(gui.App.argv);
  setTimeout(getAppArgvCb(gui.App.argv), 0);
}
exports.getAppArgv = getAppArgv;

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

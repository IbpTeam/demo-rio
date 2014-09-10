//API getAppDataDir:获取数据路径
function getAppDataDir(getAppDataDirCb){
  console.log("Request handler 'getAppDataDir' was called.");
  var gui = global.window.nwDispatcher.requireNwGui();
  console.log(gui.App.dataPath);
  getAppDataDirCb(gui.App.dataPath);
}
exports.getAppDataDir = getAppDataDir;

//API getAppArgv:获取数据路径
function getAppArgv(getAppArgvCb){
  console.log("Request handler 'getAppArgv' was called.");
  var gui = global.window.nwDispatcher.requireNwGui();
  console.log(gui.App.argv);
  getAppArgvCb(gui.App.argv);
}
exports.getAppArgv = getAppArgv;


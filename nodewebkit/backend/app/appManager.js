var AppList = [];

// TODO: load installed HTML5 apps from system
exports.loadAppList = function(callback_) {
}

// TODO: save App list to system
function save(callback_) {
}
exports.saveAppList = save;

// TODO: install a HTML5 app to system
// appInfo_: {
//  name: ${app name},
//  path: ${path of app},
//  iconPath: ${icon path of app}
// }
// callback_: function(install_status_, reason_)
//    install_status_: {true|false}
//    reason_: if the status is false
exports.installApp = function(appInfo_, callback_) {
  // TODO: check whether a index.html is existed and make sure the IconPath is real
  //  if install successfully, store it.
}

// TODO: unInstall a HTML5 app from system
exports.unInstallApp = function(appName_) {
  // TODO: if uninstall successfully, store it.
}

// TODO: check an app installed or not
function installed(appName_) {
  return ((typeof AppList[appName_] === 'undefined') ? false : true);
}

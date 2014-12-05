var fs = require('fs'),
    os = require('os'),
    config = require('../config')
    AppList = {};

// load installed HTML5 apps from system
exports.loadAppList = function(callback_) {
  var cb_ = callback_ || function() {};
  if(os.type() == 'Linux') {
    fs.readFile(config.AppRegisterPath, 'utf8', function(err_, data_) {
      if(err_) return cb_('Fail to load app list: ' + err_);
      try {
        AppList = JSON.parse(data_);
        return cb_(null);
      } catch(e) {
        return cb_(e);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}

// save App list to system
function save(callback_) {
  var cb_ = callback_ || function() {};
  if(os.type() == 'Linux') {
    try {
      var data = JSON.stringify(AppList);
      fs.writeFile(config.AppRegisterPath, data, function(err_) {
        if(err_) return cb_(err_);
      });
    } catch(e) {
      return cb_(err_);
    }
  }
}
exports.saveAppList = save;

// Register a HTML5 app to system
// appInfo_: {
//  id: ${app id},
//  name: ${app name},
//  path: ${path of app},
//  iconPath: ${icon path of app}
// }
// callback_: function(err_)
//    err_: error discription or null
exports.registerApp = function(appInfo_, callback_) {
  var cb_ = callback_ || function() {};
  if(isRegistered(appInfo_.id)) return cb_('Stored already');
  AppList[appInfo_.id] = appInfo_;
  save(function(err_) {
    if(err_) return cb_('Failed to register to system: ' + err_);
    return cb_(null);
  });
}

// Unregister a HTML5 app from system
// appID: id of app
// callback_: function(err_)
//    err_: error discription or null
exports.unregisterApp = function(appID_, callback_) {
  var cb_ = callback_ || function() {};
  if(!isRegistered(appID_)) return cb_('The app has not registered');
  AppList[appID_] = null;
  delete AppList[appID_];
  save(function(err_) {
    if(err_) return cb_('Failed to unregister from system: ' + err_);
    return cb_(null);
  });
}

// check an app is registered or not
function isRegistered(appID_) {
  return ((typeof AppList[appID_] === 'undefined') ? false : true);
}

exports.getRegisteredApp = function() {
  var arr = [];
  for(var key in AppList) {
    arr.push(key);
  }
  return arr;
}

exports.getRegisteredAppInfo = function(appID_) {
  if(isRegistered(appID_)) return AppList[appID_];
  return null;
}

exports.getRegisteredAppInfoByAttr = function(key_, value_) {
  for(var key in AppList) {
    if(AppList[key][key_] == value_) return AppList[key];
  }
  return null;
}

exports.getBasePath = function() {
  return config.APPBASEPATH;
}

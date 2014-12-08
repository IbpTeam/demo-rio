var fs = require('fs'),
    os = require('os'),
    config = require('../config')
    AppList = {};

function readJSONFile(path_, callback_) {
  var cb_ = callback_ || function() {};
  fs.readFile(path_, 'utf8', function(err_, data_) {
    if(err_) return cb_('Fail to load file: ' + err_);
    try {
      json = JSON.parse(data_);
      return cb_(null, json);
    } catch(e) {
      return cb_(e);
    }
  });
}

// load installed HTML5 apps from system
exports.loadAppList = function(callback_) {
  var cb_ = callback_ || function() {};
  if(os.type() == 'Linux') {
    // TODO: initialize this list from local to global
    readJSONFile(config.AppRegisterPath, function(err_, data_) {
      if(err_) return cb_('Fail to load app list: ' + err_);
      AppList = data_;
    });
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}

// TODO: differentiate local or global
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
//  path: ${path of app},
//  local: ${true|false}(if false means try to register to global, need root authority)
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
// local: true or false(if false means try to unregister from global, need root authority)
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

// get registered app list 
// appID_: the ID of app
// callback_: function(err_, data_)
//    err_: error discription or null
//    data_: info object of app
exports.getRegisteredApp = function() {
  var arr = [];
  for(var key in AppList) {
    arr.push(key);
  }
  return arr;
}

function parsePackageJSON(path_, callback_) {
  var cb_ = callback_ || function() {};
  readJSONFile(path_, function(err_, data_) {
    if(err_) return cb_(err_);
    if(typeof data_['main'] === 'undefined'
      || typeof data_['name'] === 'undefined'
      || typeof data_['window']['icon'] === 'undefined'
      || typeof data_['window']['toolbar'] === 'undefined'
      || typeof data_['window']['frame'] === 'undefined')
      return cb_('Inllegal package.json');
    cb_(null, data_);
  });
}

// get app information by ID
// appID_: the ID of app
// callback_: function(err_, data_)
//    err_: error discription or null
//    data_: info object of app
exports.getRegisteredAppInfo = function(appID_, callback_) {
  var cb_ = callback_ || function() {};
  if(isRegistered(appID_)) {
    // change to parse package.json under AppList[appID_].path first
    //  and then return corresponding information json object.
    parsePackageJSON(AppList[appID_].path, cb_);
  }
  return cb_('App not registered');
}

// get app information by value of one attribute
// key_: the attribute to be matched
// value_: the value of this key
// callback_: function(err_, data_)
//    err_: error discription or null
//    data_: info object of app
exports.getRegisteredAppInfoByAttr = function(key_, value_, callback_) {
  var cb_ = callback_ || function() {};
  for(var key in AppList) {
    if(AppList[key][key_] == value_) {
      return parsePackageJSON(AppList[key].path, cb_);
    }
  }
  return cb_('App not registered');
}

exports.getBasePath = function() {
  return config.APPBASEPATH;
}

function createWindow(appInfo_) {
  // TODO: create a window whose attributes based on app info
}

exports.startAppByName = function(appName_, callback_) {}

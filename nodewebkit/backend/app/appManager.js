var fs = require('fs'),
    os = require('os'),
    path = require("path"),
    config = require('../config'),
    utils = require('../utils'),
    router = require('../router'),
    AppList = {},
    listeners = [];

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

// load registered HTML5 apps from system
exports.loadAppList = function(callback_) {
  var cb_ = callback_ || function() {};
  if(os.type() == 'Linux') {
    // initialize this list from local to global
    utils.series([
      {
        fn: function(pera_, callback_) {
          readJSONFile(pera_.arg0, function(err_, data_) {
            if(err_) return callback_(null);
            AppList = data_;
            for(var key in AppList) AppList[key].local = true;
            callback_(null);
          });
        },
        pera: {
          arg0: config.APP_DATA_PATH[0]
        }
      },
      {
        fn: function(pera_, callback_) {
          readJSONFile(pera_.arg0, function(err_, data_) {
            if(err_) return callback_(err_);
            for(var key in data_) {
              if(typeof AppList[key] === 'undefined') {
                AppList[key] = data_[key];
                AppList[key].local = false;
              }
            }
            callback_(null);
          });
        },
        pera: {
          arg0: config.APP_DATA_PATH[1]
        }
      }
    ], function(err_, rets_) {
      if(err_) return cb_('Fail to load app list: ' + err_);
    });
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}

// local_: boolean, save to local or global
// callback_: function(err_)
//    err_: error description or null
// save App list to system
function save(local_, callback_) {
  var cb_ = callback_ || function() {},
      lo_ = local_ || true;
  if(os.type() == 'Linux') {
    try {
      var p, d = {};
      if(lo_) {
        // save to local app list
        p = config.APP_DATA_PATH[0];
        for(var key in AppList) {
          if(AppList[key].local) {
            d[key] = {
              id: AppList[key].id,
              path: AppList[key].path
            }
          }
        }
      } else {
        // save to global app list
        p = config.APP_DATA_PATH[1];
        for(var key in AppList) {
          if(!AppList[key].local) {
            d[key] = {
              id: AppList[key].id,
              path: AppList[key].path
            }
          }
        }
      }
      var data = JSON.stringify(d, null, 2);
      fs.writeFile(p, data, function(err_) {
        if(err_) return cb_(err_);
        cb_(null);
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
//  local: ${true|false} (if false means try to register to global, need root authority;
//          default is true)
// }
// callback_: function(err_)
//    err_: error discription or null
function registerApp(appInfo_, callback_) {
  var cb_ = callback_ || function() {};
  if(isRegistered(appInfo_.id)) return cb_('This ID has been registered already');
  pathValidate(appInfo_.path, function(err_) {
    if(err_) return cb_(err_);
    AppList[appInfo_.id] = appInfo_;
    save(appInfo_.local, function(err_) {
      if(err_) {
        AppList[appInfo_.id] = null;
        delete AppList[appInfo_.id];
        return cb_('Failed to register to system: ' + err_);
      }
      emit('register', appInfo_.id);
      router.wsNotify({
        'Action': 'notify',
        'Event': 'app',
        'Data': {
          'event': 'register',
          'appID': appInfo_.id
        }
      });
      return cb_(null);
    });
  });
}
exports.registerApp = registerApp;

// Unregister a HTML5 app from system
// appID: id of app
// local: true or false(if false means try to unregister from global, need root authority)
// callback_: function(err_)
//    err_: error discription or null
exports.unregisterApp = function(appID_, callback_) {
  var cb_ = callback_ || function() {};
  if(!isRegistered(appID_)) return cb_('The app has not registered');
  var tmp = AppList[appID_];
  AppList[appID_] = null;
  delete AppList[appID_];
  save(tmp.local, function(err_) {
    if(err_) {
      AppList[appID_] = tmp;
      return cb_('Failed to unregister from system: ' + err_);
    }
    tmp = null;
    emit('unregister', appID_);
    router.wsNotify({
      'Action': 'notify',
      'Event': 'app',
      'Data': {
        'event': 'unregister',
        'appID': appID_
      }
    });
    return cb_(null);
  });
}

// check an app is registered or not
function isRegistered(appID_) {
  return ((typeof AppList[appID_] === 'undefined') ? false : true);
}

// get registered app list 
exports.getRegisteredApp = function() {
  var arr = [];
  for(var key in AppList) {
    arr.push(key);
  }
  return arr;
}

// get registered app list 
// appID_: the ID of app
exports.getRegistedInfo = function(appID_) {
  var ret = AppList[appID_] || null;
  return ret;
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
function getRegisteredAppInfo(appID_, callback_) {
  var cb_ = callback_ || function() {};
  if(isRegistered(appID_)) {
    // change to parse package.json under AppList[appID_].path first
    //  and then return corresponding information json object.
    return parsePackageJSON(path.join(config.APPBASEPATH, AppList[appID_].path, 'package.json')
        , function(err_, data_) {
          if(err_) return cb_(err_);
          var info = {
            id: appID_,
            path: AppList[appID_].path,
            iconPath: AppList[appID_].path + '/' + data_.window.icon,
            name: data_.name,
            main: data_.main,
            window: data_.window
          };
          cb_(null, info);
        });
  }
  cb_('App not registered');
}
exports.getRegisteredAppInfo = getRegisteredAppInfo;

// get app information by value of one attribute
// key_: the attribute to be matched
// value_: the value of this key
// callback_: function(err_, data_)
//    err_: error discription or null
//    data_: info object of app
function getRegisteredAppInfoByAttr(key_, value_, callback_) {
  var cb_ = callback_ || function() {};
  for(var key in AppList) {
    if(AppList[key][key_] == value_) {
      return getRegisteredAppInfo(key, cb_);
    }
  }
  cb_('App not registered');
}
exports.getRegisteredAppInfoByAttr = getRegisteredAppInfoByAttr;

exports.getBasePath = function() {
  return config.APPBASEPATH;
}

function max(a, b) {
  if(typeof a === 'undefined') return b;
  if(typeof b === 'undefined') return a;
  return ((a > b) ? a : b);
}

function min(a, b) {
  if(typeof a === 'undefined') return b;
  if(typeof b === 'undefined') return a;
  return ((a > b) ? b : a);
}

function createWindow(appInfo_) {
  // TODO: create a window whose attributes based on app info
  var title = appInfo_.window.title || appInfo_.name,
      height = appInfo_.window.height || 500,
      width = appInfo_.window.width || 660,
      left = 200,
      top = 200,
      pos = appInfo_.window.position || 'center';
  height = max(height, appInfo_.window.min_height);
  height = min(height, appInfo_.window.max_height);
  width = max(width, appInfo_.window.min_width);
  width = min(width, appInfo_.window.max_width);
  if(pos == 'center') {
    try {
      var gui = require('nw.gui'),
          win = gui.Window.get(),
          w = win.width(),
          h = win.height();
      left = max((w - width) * 0.5, 0);
      top = max((h - height) * 0.5, 0);
    } catch(e) {
      left = 200;
      top = 200;
    }
  }
  return window.Window.create(appInfo_.id + '-window', title, {
    left: left,
    top: top,
    height: height,
    width: width,
    fadeSpeed: 300,
    animate: true,
    contentDiv: false,
    iframe: true
  });
}

exports.startApp = function(appInfo_, params_, callback_) {
  var cb_ = callback_ || function() {},
      p_ = params_ || null;
  try {
    var win = createWindow(appInfo_);
    // TODO: if this app is genarate from a URL, do something
    win.appendHtml(path.join(config.APPBASEPATH, appInfo_.path, appInfo_.main)
      + (p_ === null ? "" : ("?" + p_)));
    cb_(null, win);
  } catch(e) {
    return cb_(e);
  }
}

// path validate
function pathValidate(path_, callback_) {
  var cb_ = callback_ || function() {};
  if(path_.match(/^(demo-webde|demo-rio)[\/].*/) == null) return cb_('Bad path');
  fs.exists(config.APPBASEPATH + '/' + path_ + '/package.json', function(exist) {
    if(!exist) return cb_('package.json not found');
    return cb_(null);
  });
}

function emit(event_, appID_) {
  for(var i = 0; i < listeners.length; ++i) {
    listeners[i].call(this, {
      event: event_,
      appID: appID_
    });
  }
}

exports.addListener = function(listener_, callback_) {
  var cb_ = callback_ || function() {};
  if(typeof listener_ !== 'function') return cb_('listener must be a function');
  listeners.push(listener_);
  cb_(null);
}

exports.removeListner = function(listener_, callback_) {
  var cb_ = callback_ || function() {};
  for(var i = 0; i < listeners.length; ++i) {
    if(listener_ == listeners[i]) {
      listeners.splice(i, 1);
      cb_(null);
    }
  }
  cb_('listener not regiestered');
}


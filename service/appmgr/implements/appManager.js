var fs = require('fs'),
    os = require('os'),
    path = require("path"),
    http = require('http'),
    exec = require('child_process').exec,
    config = require('../config'),
    flowctl = require('../../../sdk/utils/flowctl'),
    json4line = require('../../../sdk/utils/json4line'),
    // router = require('../router'),
    AppList = {},
    listeners = [],
    stub = null;

// load registered HTML5 apps from system
function loadAppList(callback_) {
  var cb_ = callback_ || function() {};
  if(os.type() == 'Linux') {
    // initialize this list from local to global
    flowctl.series([
      {
        fn: function(pera_, callback_) {
          json4line.readJSONFile(pera_.arg0, function(err_, data_) {
            if(err_) return callback_(null);
            AppList = data_;
            for(var key in AppList) AppList[key].local = true;
            callback_(null);
          });
        },
        pera: {
          arg0: config.APP_DATA_PATH[0] + '/App.list'
        }
      },
      {
        fn: function(pera_, callback_) {
          json4line.readJSONFile(pera_.arg0, function(err_, data_) {
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
          arg0: config.APP_DATA_PATH[1] + '/App.list'
        }
      }
    ], function(err_, rets_) {
      if(err_) return cb_('Fail to load app list: ' + err_);
    });
  } else {
    return cb_("Not a linux system! Not supported now!");
  }
}

// local_: boolean, save to local or global
// callback_: function(err_)
//    err_: error description or null
// save App list to system
function save(local_, callback_) {
  var cb_ = callback_ || function() {};
  if(os.type() == 'Linux') {
    var p, d = {};
    if(local_) {
      // save to local app list
      p = config.APP_DATA_PATH[0] + '/App.list';
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
      p = config.APP_DATA_PATH[1] + '/App.list';
      for(var key in AppList) {
        if(!AppList[key].local) {
          d[key] = {
            id: AppList[key].id,
            path: AppList[key].path
          }
        }
      }
    }
    json4line.writeJSONFile(p, d, function(err_) {
      if(err_) return cb_(err_);
      cb_(null);
    });
  }
}
exports.saveAppList = save;

// path validate
function pathValidate(path_, callback_) {
  var cb_ = callback_ || function() {};
  // if(path_.match(/^(demo-webde|demo-rio)[\/].*/) == null) return cb_('Bad path');
  fs.exists(path_ + '/package.json', function(exist) {
    if(!exist) return cb_('package.json not found');
    return cb_(null);
  });
}

// Register a HTML5 app to system
// appInfo_: {
//  id: ${app id},
//  path: ${path of app},
//  local: ${true|false} (if false means try to register to global, need root authority;
//          default is true)
// }
// callback_: function(err_)
//    err_: error discription or null
function registerApp(appInfo_, option_, callback_) {
  var cb_ = callback_ || function() {},
      op_ = {
        desktop: false,
        dock: false 
      };
  for(var key in option_) {
    op_[key] = option_[key];
  }
  if(isRegistered(appInfo_.id)) return cb_('This ID has been registered already');
  if(appInfo_.id.match(/.*[\.:]+.*/) != null)
    return cb_('Illegal characters(.|:) are included in ID');
  pathValidate(appInfo_.path, function(err_) {
    if(err_) return cb_(err_);
    AppList[appInfo_.id] = appInfo_;
    save(appInfo_.local, function(err_) {
      if(err_) {
        AppList[appInfo_.id] = null;
        delete AppList[appInfo_.id];
        return cb_('Failed to register to system: ' + err_);
      }
      emit('register', appInfo_.id, op_);
      // router.wsNotify({
        // 'Action': 'notify',
        // 'Event': 'app',
        // 'Data': {
          // 'event': 'register',
          // 'appID': appInfo_.id,
          // 'option': op_
        // }
      // });
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
    // router.wsNotify({
      // 'Action': 'notify',
      // 'Event': 'app',
      // 'Data': {
        // 'event': 'unregister',
        // 'appID': appID_
      // }
    // });
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
  json4line.readJSONFile(path_, function(err_, data_) {
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
    var p = ((AppList[appID_].local) ? (AppList[appID_].path)
              : (config.APPBASEPATH + '/' + AppList[appID_].path));
    return parsePackageJSON(path.join(p, 'package.json')
        , function(err_, data_) {
          if(err_) return cb_(err_);
          var info = {
            id: appID_,
            path: p,
            iconPath: data_.window.icon,
            name: data_.name,
            main: data_.main,
            url: data_.url,
            window: data_.window,
            notShow: data_.notShow
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
  // create a window whose attributes based on app info
  var title = appInfo_.window.title || appInfo_.name,
      height = appInfo_.window.height || 500,
      width = appInfo_.window.width || 660,
      left = appInfo_.window.left || 200,
      top = appInfo_.window.top || 200,
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
    // if this app is genarate from a URL, do something
    if(appInfo_.url) {
      win.appendHtml(appInfo_.main);
    } else {
      win.appendHtml(path.join(appInfo_.path, appInfo_.main)
        + '?id=' + appInfo_.id + (p_ === null ? "" : ("&" + p_)));
    }
    cb_(null, win);
  } catch(e) {
    return cb_(e);
  }
}

function emit(event_, appID_, option_) {
  // TODO: replace with stub.notify
  // for(var i = 0; i < listeners.length; ++i) {
    // listeners[i].call(this, {
      // event: event_,
      // appID: appID_,
      // option: option_
    // });
  // }
  stub.notify(event_, {
    appID: appID_,
    option: option_
  });
}

// exports.addListener = function(listener_, callback_) {
  // var cb_ = callback_ || function() {};
  // if(typeof listener_ !== 'function') return cb_('listener must be a function');
  // listeners.push(listener_);
  // cb_(null);
// }

// exports.removeListener = function(listener_, callback_) {
  // var cb_ = callback_ || function() {};
  // for(var i = 0; i < listeners.length; ++i) {
    // if(listener_ == listeners[i]) {
      // listeners.splice(i, 1);
      // cb_(null);
    // }
  // }
  // cb_('listener not regiestered');
// }

//  return {
//    hostname: string,
//    path: string
//  }
function parseURL(url_) {
  var tmp = url_.match(/^(http|https):\/\/(.*)/);
  if(tmp == null) return {};
  var idx = tmp[2].indexOf('/');
  return {
    hostname: tmp[2].substring(0, idx),
    path: tmp[2].substring(idx, tmp[2].length)
  };
}

// return herf of icon or null
function extractIconHref(html_) {
  var link = html_.match(/<link.*icon.*\/>/g);
  if(link == null) link = html_.match(/<link.*icon.*>/g);
  if(link == null) return null;
  for(var i = 0; i < link.length; ++i) {
    var href = link[i].match(/.*href="([^"]*).*"/);
    if(href == null) continue;
    return href[1];
  }
  return null;
}

// url_: url object get from parseURL
// dst_: where to save icon file
// callback_: function(err_)
//    err_: error discription or null
function extractIconFromURL(url_, dst_, callback_) {
  var cb_ = callback_ || function() {},
      url = url_ || {},
      data = '';
  http.request({
    hostname: url.hostname,
    port: 80,
    path: url.path
  }, function(res_) {
    res_.setEncoding('utf8');
    res_.on('data', function(chunk_) {
      data += chunk_;
    }).on('end', function() {
      var iconHref = extractIconHref(data);
      if(iconHref == null) {
        url.path = '/favicon.ico';
      } else if(iconHref.match(/^(http|https):\/\/.*/) == null) {
        var t = url.path.indexOf('#');
        if(t != -1) {
          url.path = url.path.substring(0, t) + iconHref;
        } else {
          url.path = '/' + iconHref;
        }
      } else {
        url = parseURL(iconHref);
      }
      http.request({
        hostname: url.hostname,
        port: 80,
        path: url.path
      }, function(res__) {
        res__.pipe(fs.createWriteStream(dst_));
        cb_(null);
      }).on('error', function(err_) {
        cb_(err_);
      }).end();
    });
  }).on('error', function(err_) {
    try {
      cb_(err_);
    } catch(e) {
      console.log(err_, e);
    }
  }).end();
}

// url_: url of website 
// callback_: function(err_)
//    err_: error discription or null
function generateOnlineApp(url_, callback_) {
  var cb_ = callback_ || function() {},
      url = parseURL(url_),
      dst_ = config.APP_DATA_PATH[0] + '/' + url.hostname;
  fs.mkdir(dst_, function(err_) {
    if(err_) return console.log(err_);
    var imgDir = dst_ + '/img',
        iconName = 'favicon.ico',
        pJson = {
          name: url.hostname,
          main: url_,
          window: {
            frame: true,
            toolbar: false,
            icon: 'img/' + iconName
          },
          url: true
        };
    // generate the package.json of this app
    json4line.writeJSONFile(dst_ + '/package.json', pJson, function(err_) {
      if(err_) return cb_(err_);
    });
    // generate the icon of this app
    fs.mkdir(imgDir, function(err_) {
      if(err_) return console.log(err_);
      extractIconFromURL(url, imgDir + '/' + iconName, function(err_) {
        if(err_) {
          // cp a defualt icon to this img dir
          return exec('cp ' + config.D_APP_ICON + ' ' + imgDir, function(err_, stdout_, stderr_) {
            if(err_) console.log(err_);
            cb_(null, dst_);
          });
        }
        cb_(null, dst_);
      });
    });
  });
}

exports.generateAppByURL = function(url_, option_, callback_) {
  var cb_ = callback_ || function() {};
  flowctl.series([
    {
      fn: function(pera_, callback_) {
        generateOnlineApp(url_, callback_);
      }
    }
  ], function(err_, rets_) {
    if(err_) cb_(err_);
    var path = rets_[0],
        id = path.match(/[^\/]*$/)[0].replace(/[\.:]/g, '-');
    registerApp({
      id: 'app-' + id,
      path: path,
      local: true
    }, option_, function(err_) {
      if(err_) {
        fs.rmdir(path, function(err_) {
          if(err_) console.log(err_);
        });
        cb_(err_);
      }
      cb_(null, 'app-' + id);
    });
  });
}

exports.sendKeyToApp = function(windowName_, key_, callback_) {
  console.log("Request handler 'sendKeyToApp' was called.");
  //This follow command can get windowid from a pid.
  //  pstree -pn 25372 |grep -o "([[:digit:]]*)" |grep -o "[[:digit:]]*" | while read pid ; do xdotool search --pid $pid --onlyvisible ; done 2>/dev/null
  // xdotool send key command： xdotool windowactivate --sync 46137380 & xdotool key --clearmodifiers --window 46137380 Ctrl+w
  var cb_ = callback_ || function() {},
      getpid = exec("xdotool search --name \""
        + windowname.replace(/\(/g, "\\\(").replace(/\)/g, "\\\)")
        + "\" | sort", function(error, stdout, stderr) {
          if(error) {
            return cb_(error);
          }
          var nTail = stdout.lastIndexOf("\n"),
              nHead = stdout.lastIndexOf("\n", stdout.length - 2);
          nHead = nHead < 0 ? 0 : nHead + 1;
          if(nTail != stdout.length - 1 || nHead >= nTail) {
            console.log("Error: stdout is illegal! : "
              + stdout + " from command:" + "xdotool search --name \""
              + windowname.replace(/\(/g, "\\\(").replace(/\)/g, "\\\)") + "\" | sort");
            return cb_('stdout is illegal!');
          }

          var windowid = stdout.substring(nHead, nTail),
              sendkeycommand = "xdotool windowactivate --sync "
                  + windowid + " && xdotool key --clearmodifiers --window "
                  + windowid + " " + key;
          exec(sendkeycommand, function(error, stdout, stderr) {
            if(error) {
              return cb_(error);
            }
            cb_(null);
          });
        });
}

(function Init() {
  loadAppList(function(err) {
    if(err) {
      return console.log('InitError:', err);
    }
    stub = require('../interface/appStub').getStub(exports);
    console.log('App manager start OK');
  });
})();


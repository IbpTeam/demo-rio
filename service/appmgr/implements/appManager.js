var fs = require('fs'),
    os = require('os'),
    path = require("path"),
    http = require('http'),
    exec = require('child_process').exec,
    config = require('../../../nodewebkit/backend/config'),
    flowctl = require('../../../sdk/utils/flowctl'),
    json4line = require('../../../sdk/utils/json4line');
    // router = require('../router'),

function AppMgr(ret_) {
  var ret = ret_ || {
    success: function() {},
    fail: function() {}
  };
  this._AppList = {};

  this._loadAppList(function(err) {
    if(err) {
      return ret.fail(err);
    }
    ret.success();
  })
}

// load registered HTML5 apps from system
AppMgr.prototype._loadAppList = function(callback_) {
  var cb_ = callback_ || function() {},
      self = this;
  if(os.type() == 'Linux') {
    // initialize this list from local to global
    flowctl.series([
      {
        fn: function(pera_, callback_) {
          json4line.readJSONFile(pera_.arg0, function(err_, data_) {
            if(err_) return callback_(null);
            self._AppList = data_;
            for(var key in self._AppList) self._AppList[key].local = true;
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
              if(typeof self._AppList[key] === 'undefined') {
                self._AppList[key] = data_[key];
                self._AppList[key].local = false;
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
      cb_(null);
    });
  } else {
    return cb_("Not a linux system! Not supported now!");
  }
}

// local_: boolean, save to local or global
// callback_: function(err_)
//    err_: error description or null
// save App list to system
AppMgr.prototype.saveAppList = AppMgr.prototype._save = function(local_, callback_) {
  var cb_ = callback_ || function() {},
      self = this;
  if(os.type() == 'Linux') {
    var p, d = {};
    if(local_) {
      // save to local app list
      p = config.APP_DATA_PATH[0] + '/App.list';
      for(var key in self._AppList) {
        if(self._AppList[key].local) {
          d[key] = {
            id: self._AppList[key].id,
            path: self._AppList[key].path
          }
        }
      }
    } else {
      // save to global app list
      p = config.APP_DATA_PATH[1] + '/App.list';
      for(var key in self._AppList) {
        if(!self._AppList[key].local) {
          d[key] = {
            id: self._AppList[key].id,
            path: self._AppList[key].path
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

// path validate
AppMgr.prototype._pathValidate = function(path_, callback_) {
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
AppMgr.prototype.registerApp = function(appInfo_, option_, callback_) {
  var cb_ = callback_ || function() {},
      op_ = {
        desktop: false,
        dock: false 
      },
      self = this;
  for(var key in option_) {
    op_[key] = option_[key];
  }
  if(self._isRegistered(appInfo_.id)) return cb_('This ID has been registered already');
  if(appInfo_.id.match(/.*[\.:]+.*/) != null)
    return cb_('Illegal characters(.|:) are included in ID');
  self._pathValidate(appInfo_.path, function(err_) {
    if(err_) return cb_(err_);
    self._AppList[appInfo_.id] = appInfo_;
    self._save(appInfo_.local, function(err_) {
      if(err_) {
        self._AppList[appInfo_.id] = null;
        delete self._AppList[appInfo_.id];
        return cb_('Failed to register to system: ' + err_);
      }
      self._emit('register', appInfo_.id, op_);
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

// Unregister a HTML5 app from system
// appID: id of app
// local: true or false(if false means try to unregister from global, need root authority)
// callback_: function(err_)
//    err_: error discription or null
AppMgr.prototype.unregisterApp = function(appID_, callback_) {
  var cb_ = callback_ || function() {},
      self = this;
  if(!self._isRegistered(appID_)) return cb_('The app has not registered');
  var tmp = self._AppList[appID_];
  self._AppList[appID_] = null;
  delete self._AppList[appID_];
  self._save(tmp.local, function(err_) {
    if(err_) {
      self._AppList[appID_] = tmp;
      return cb_('Failed to unregister from system: ' + err_);
    }
    tmp = null;
    self._emit('unregister', appID_);
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
AppMgr.prototype._isRegistered = function(appID_) {
  return ((typeof this._AppList[appID_] === 'undefined') ? false : true);
}

// get registered app list 
AppMgr.prototype.getRegisteredApp = function(callback_) {
  var cb_ = callback_ || function() {},
      arr = [];
  for(var key in this._AppList) {
    arr.push(key);
  }
  cb_(null, arr);
}

// get registered app list 
// appID_: the ID of app
AppMgr.prototype.getRegistedInfo = function(appID_) {
  var ret = this._AppList[appID_] || null;
  return ret;
}

AppMgr.prototype._parsePackageJSON = function(path_, callback_) {
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
AppMgr.prototype.getRegisteredAppInfo = function(appID_, callback_) {
  var cb_ = callback_ || function() {};
  if(this._isRegistered(appID_)) {
    // change to parse package.json under _AppList[appID_].path first
    //  and then return corresponding information json object.
    var p = ((this._AppList[appID_].local) ? (this._AppList[appID_].path)
              : (config.APPBASEPATH + '/' + this._AppList[appID_].path));
    return this._parsePackageJSON(path.join(p, 'package.json')
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

// get app information by value of one attribute
// key_: the attribute to be matched
// value_: the value of this key
// callback_: function(err_, data_)
//    err_: error discription or null
//    data_: info object of app
AppMgr.prototype.getRegisteredAppInfoByAttr = function(key_, value_, callback_) {
  var cb_ = callback_ || function() {};
  for(var key in this._AppList) {
    if(this._AppList[key][key_] == value_) {
      return this.getRegisteredAppInfo(key, cb_);
    }
  }
  cb_('App not registered');
}

AppMgr.prototype.getBasePath = function(callback_) {
  var cb_ = callback_ || function() {};
  cb_(null, config.APPBASEPATH);
}

AppMgr.prototype._max = function(a, b) {
  if(typeof a === 'undefined') return b;
  if(typeof b === 'undefined') return a;
  return ((a > b) ? a : b);
}

AppMgr.prototype._min = function(a, b) {
  if(typeof a === 'undefined') return b;
  if(typeof b === 'undefined') return a;
  return ((a > b) ? b : a);
}

AppMgr.prototype._createWindow = function(appInfo_) {
  // create a window whose attributes based on app info
  var title = appInfo_.window.title || appInfo_.name,
      height = appInfo_.window.height || 500,
      width = appInfo_.window.width || 660,
      left = appInfo_.window.left || 200,
      top = appInfo_.window.top || 200,
      pos = appInfo_.window.position || 'center';
  height = this._max(height, appInfo_.window.min_height);
  height = this._min(height, appInfo_.window.max_height);
  width = this._max(width, appInfo_.window.min_width);
  width = this._min(width, appInfo_.window.max_width);
  if(pos == 'center') {
    try {
      var gui = require('nw.gui'),
          win = gui.Window.get(),
          w = win.width(),
          h = win.height();
      left = this._max((w - width) * 0.5, 0);
      top = this._max((h - height) * 0.5, 0);
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

AppMgr.prototype.startApp = function(appInfo_, params_, callback_) {
  var cb_ = callback_ || function() {},
      p_ = params_ || null,
      cmd_ = 'nw ' + appInfo_.path;
  try {
    // TODO: only App in a web browser
    // var win = this._createWindow(appInfo_);
    // if this app is genarate from a URL, do something
    // if(appInfo_.url) {
      // win.appendHtml(appInfo_.main);
    // } else {
      // win.appendHtml(path.join(appInfo_.path, appInfo_.main)
        // + '?id=' + appInfo_.id + (p_ === null ? "" : ("&" + p_)));
    // }
    exec(cmd_, function(err, stdout, stderr) {
      if(err) return cb_(err);
      return cb_(null);
    })
  } catch(e) {
    return cb_(e);
  }
}

AppMgr.prototype._emit = function(event_, appID_, option_) {
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
AppMgr.prototype._parseURL = function(url_) {
  var tmp = url_.match(/^(http|https):\/\/(.*)/);
  if(tmp == null) return {};
  var idx = tmp[2].indexOf('/');
  return {
    hostname: tmp[2].substring(0, idx),
    path: tmp[2].substring(idx, tmp[2].length)
  };
}

// return herf of icon or null
AppMgr.prototype._extractIconHref = function(html_) {
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
AppMgr.prototype._extractIconFromURL = function(url_, dst_, callback_) {
  var cb_ = callback_ || function() {},
      url = url_ || {},
      data = '',
      self = this;
  http.request({
    hostname: url.hostname,
    port: 80,
    path: url.path
  }, function(res_) {
    res_.setEncoding('utf8');
    res_.on('data', function(chunk_) {
      data += chunk_;
    }).on('end', function() {
      var iconHref = self._extractIconHref(data);
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
        url = self._parseURL(iconHref);
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
AppMgr.prototype._generateOnlineApp = function(url_, callback_) {
  var cb_ = callback_ || function() {},
      url = this._parseURL(url_),
      dst_ = config.APP_DATA_PATH[0] + '/' + url.hostname,
      self = this;
  fs.mkdir(dst_, function(err_) {
    if(err_) {
      cb_(err_);
      return console.log(err_);
    }
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
      if(err_) {
        cb_(err_);
        return console.log(err_);
      }
      self._extractIconFromURL(url, imgDir + '/' + iconName, function(err_) {
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

AppMgr.prototype.generateAppByURL = function(url_, option_, callback_) {
  var cb_ = callback_ || function() {},
      self = this;
  flowctl.series([
    {
      fn: function(pera_, callback_) {
        self._generateOnlineApp(url_, callback_);
      }
    }
  ], function(err_, rets_) {
    if(err_) return cb_(err_);
    var path = rets_[0],
        id = path.match(/[^\/]*$/)[0].replace(/[\.:]/g, '-');
    self.registerApp({
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

AppMgr.prototype.sendKeyToApp = function(windowName_, key_, callback_) {
  console.log("Request handler 'sendKeyToApp' was called.");
  //This follow command can get windowid from a pid.
  //  pstree -pn 25372 |grep -o "([[:digit:]]*)" |grep -o "[[:digit:]]*" | while read pid ; do xdotool search --pid $pid --onlyvisible ; done 2>/dev/null
  // xdotool send key command： xdotool windowactivate --sync 46137380 & xdotool key --clearmodifiers --window 46137380 Ctrl+w
  var cb_ = callback_ || function() {},
      getpid = exec("xdotool search --name \""
        + windowName_.replace(/\(/g, "\\\(").replace(/\)/g, "\\\)")
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
              + windowName_.replace(/\(/g, "\\\(").replace(/\)/g, "\\\)") + "\" | sort");
            return cb_('stdout is illegal!');
          }

          var windowid = stdout.substring(nHead, nTail),
              sendkeycommand = "xdotool windowactivate --sync "
                  + windowid + " && xdotool key --clearmodifiers --window "
                  + windowid + " " + key_;
          exec(sendkeycommand, function(error, stdout, stderr) {
            if(error) {
              return cb_(error);
            }
            cb_(null);
          });
        });
}

var stub = null;
(function main() {
  var appMgr = new AppMgr({
    success: function() {
      stub = require('../interface/appmgrStub').getStub(appMgr);
      console.log('App manager start OK');
    },
    fail: function(reason) {
      appMgr = null;
      console.log('App manager start failed:', reason);
    }
  });
})();


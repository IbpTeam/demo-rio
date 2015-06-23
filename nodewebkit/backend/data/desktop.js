/**
 * @Copyright:
 *
 * @Description: API for desktop configuration.
 *
 * @author: Xiquan
 *
 * @Data:2014.10.13
 *
 * @version:0.1.1
 **/
var pathModule = require('path');
var fs = require('../fixed_fs');
var fs_extra = require('fs-extra');
var Q = require('q');
var os = require('os');
var config = require("../config");
var dataDes = require("../commonHandle/desFilesHandle");
var commonHandle = require("../commonHandle/commonHandle");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var desFilesHandle = require("../commonHandle/desFilesHandle");
var tagsHandle = require("../commonHandle/tagsHandle");
var promised = require('../commonHandle/promisedFunc');
var utils = require('../utils');
var util = require('util');
var events = require('events');
var uniqueID = require("../uniqueID");
var chokidar = require('chokidar');
var exec = require('child_process').exec;

var CATEGORY_NAME = "desktop";
var DES_NAME = "desktopDes";
var REAL_REPO_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME);
var DES_REPO_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME);
var REAL_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME, 'data');
var REAL_APP_DIR = pathModule.join(REAL_DIR, 'applications');
var DES_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME, 'data');
var DES_APP_DIR = pathModule.join(DES_DIR, 'applications');
var THEME_PATH = pathModule.join(REAL_DIR, 'Theme.conf');
var THEME_DES_PATH = pathModule.join(DES_DIR, 'Theme.conf.md');
var WIGDET_PATH = pathModule.join(REAL_DIR, 'Widget.conf');
var WIGDET_DES_PATH = pathModule.join(DES_DIR, 'Widget.conf.md');
var RESOURCEPATH = config.RESOURCEPATH;
var CONFIG_PATH = pathModule.join(config.RESOURCEPATH, "desktop");

function getnit(initType) {
  if (initType === "theme") {
    var _icontheme = {};
    _icontheme.name = 'Mint-X';
    _icontheme.active = false;
    _icontheme.pos = {};

    var _computer = {};
    _computer.name = '我的电脑';
    _computer.active = true;
    _computer.icon = 'computer';
    _computer.path = '$HOME';
    _computer.id = 'computer';
    _computer.idx = 0;
    _computer.pos = {};

    var _trash = {};
    _trash.name = 'Trash';
    _trash.active = false;
    _trash.pos = {};

    var _network = {};
    _network.name = 'Network';
    _network.active = false;
    _network.pos = {};

    var _document = {};
    _document.name = 'Document';
    _document.active = false;
    _document.pos = {};

    var result = {
      icontheme: _icontheme,
      computer: _computer,
      trash: _trash,
      network: _network,
      document: _document
    }
  } else if (initType === "widget") {
    var _clock = {};
    _clock.id = 'clock';
    _clock.path = 'img/clock.png';
    _clock.type = 'ClockPlugin';
    _clock.position = {
      x: 0,
      y: 0
    }
    var _datamgr_app = {}
    _datamgr_app.id = "datamgr-app";
    _datamgr_app.path = 'demo-rio/datamgr'; //change 'WORK_DIRECTORY' into local.
    _datamgr_app.iconPath = 'icons/datamgr.png';
    _datamgr_app.name = "数据管理器";
    _datamgr_app.type = "inside-app";

    var _launcher_app = {}
    _launcher_app.id = "launcher-app";
    _launcher_app.path = "demo-webde/nw";
    _launcher_app.iconPath = "img/launcher.png";
    _launcher_app.name = "应用启动器";
    _launcher_app.type = "inside-app";
    _launcher_app.idx = 0;

    var _login_app = {}
    _login_app.id = "login-app";
    _login_app.path = "demo-webde/nw";
    _login_app.iconPath = "img/Login-icon.png";
    _login_app.name = "登录";
    _login_app.type = "inside-app";
    _login_app.idx = 1;

    var _flash_app = {}
    _flash_app.id = "flash-app";
    _flash_app.path = "demo-webde/nw/app/flash";
    _flash_app.iconPath = "img/video.png";
    _flash_app.name = "视频播放器";
    _flash_app.type = "inside-app";
    _flash_app.idx = 2;


    var _test_app = {}
    _test_app.id = "test-app";
    _test_app.path = "demo-webde/nw/app/test-app";
    _test_app.iconPath = "img/test-app2.png";
    _test_app.name = "新浪NBA";
    _test_app.type = "inside-app";
    _test_app.idx = -1;

    var _wiki_app = {}
    _wiki_app.id = "wiki-app";
    _wiki_app.path = "demo-webde/nw/app/wiki-app";
    _wiki_app.iconPath = "img/icon.jpg";
    _wiki_app.name = "维基百科";
    _wiki_app.type = "inside-app";
    _wiki_app.idx = -1;

    var result = {}
    result.layout = {
      "type": "grid",
      "num": 3,
      "main": 0,
      "widget": [{
        "plugin": {
          "clock": _clock
        },
        "dentry": {},
        "insideApp": {
          "datamgr-app": _datamgr_app,
          "launcher-app": _launcher_app,
          "login-app": _login_app,
          "flash-app": _flash_app,
        }
      }, {
        "insideApp": {
          "test-app": _test_app
        },
        "plugin": {},
        "dentry": {}
      }, {
        "insideApp": {
          "wiki-app": _wiki_app
        },
        "plugin": {},
        "dentry": {}
      }]
    }
    result.dock = {
      "launcher-app": _launcher_app,
      "login-app": _login_app
    }
  }
  return result;
}


function initDesktop() {
  var systemType = os.type();
  var path = REAL_DIR;
  var pathDesk = path + "/desktop";
  var pathDock = path + "/dock";
  var pathApp = path + "/applications";
  return promised.ensure_dir(path)
    .then(function() {
      return promised.ensure_dir(pathDesk);
    })
    .then(function() {
      return promised.ensure_dir(pathDock);
    })
    .then(function() {
      return promised.ensure_dir(pathApp);
    })
    .then(function() {
      return promised.ensure_dir(config.APP_DATA_PATH[0]);
    })
    .then(function() {
      return buildConfFile();
    })
    .then(function() {
      return buildDesktopInfo();
    })
}
exports.initDesktop = initDesktop;

function buildConfFile() {
  var tmpThemw = getnit("theme");
  var tmpWidget = getnit("widget");
  var pathTheme = pathModule.join(REAL_DIR, "Theme.conf");
  var pathWidget = pathModule.join(REAL_DIR, "Widget.conf");
  var sItemTheme = JSON.stringify(tmpThemw, null, 4);
  var sItemWidget = JSON.stringify(tmpWidget, null, 4);
  return promised.open(pathTheme, 'r')
    .then(function(fd_) {
      return promised.close(fd_);
    }, function(err) {
      return promised.output_file(pathTheme, sItemTheme)
        .then(function() {
          return promised.output_file(pathWidget, sItemWidget);
        });
    });
}

function buildDesktopInfo() {
  return buildLocalDesktopFile()
    .then(function() {
      return buildAppMethodInfo('defaults.list');
    })
    .then(function() {
      return buildAppMethodInfo('mimeinfo.cache');
    })
}


/** 
 * @Method: readJSONFile
 *    read a json file, so far including *.conf, *.list, *.cache in local
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "read Theme config file error!"
 *
 *    @param2: result,
 *        object, the result in object
 *
 *
 **/
// function readJSONFile(filePath, desFilePath, callback) {
//   var systemType = os.type();
//   if (systemType === "Linux") {
//     fs.readFile(filePath, 'utf8', function(err, data) {
//       if (err) {
//         console.log("read config file error!");
//         console.log(err);
//         var _err = "readThemeConf : read config file error!";
//         return callback(_err, null);
//       }
//       var json = JSON.parse(data);
//       callback(null, json);
//     });
//   } else {
//     console.log("Not a linux system! Not supported now!");
//   }
// }

function readJSONFile(filePath) {
  return promised.read_file(filePath, 'utf8')
    .then(function(file_content_) {
      return JSON.parse(file_content_);
    })
}

/** 
 * @Method: readThemeConf
 *    read file Theme.conf
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "read Theme config file error!"
 *
 *    @param2: result,
 *        object, the result in object
 *
 *
 **/
function writeJSONFile(filePath, desFilePath, oTheme, callback) {
  var systemType = os.type();
  if (systemType === "Linux") {
    fs.readFile(filePath, 'utf-8', function(err, data) {
      if (err) {
        console.log(err);
        var _err = "write config file error!";
        callback(_err, null);
      }
      var oData = JSON.parse(data);
      var isModify = false;
      for (var k in oTheme) {
        if (oData[k] !== oTheme[k]) {
          isModify = true;
        }
        oData[k] = oTheme[k];
      }
      if (!isModify) {
        var _result = "Data Not Change!";
        return callback(null, _result);
      }
      var sThemeModified = JSON.stringify(oData, null, 4);
      fs.writeFile(filePath, sThemeModified, function(err) {
        if (err) {
          console.log("write config file error!");
          console.log(err);
          callback(err, null);
        } else {
          var op = 'modify';
          updateDesFile(op, desFilePath, function(err, result) {
            if (err) {
              console.log('update theme des file error!\n', err);
              callback(err, null);
            } else {
              resourceRepo.repoCommitBoth('ch', REAL_REPO_DIR, DES_REPO_DIR, [filePath], [desFilePath], function(err, result) {
                if (err) {
                  return callback(err, null);
                }
                callback(null, 'success');
              })
            }
          });
        }
      });
    });
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}

/** 
 * @Method: readConf
 *    read file Widget.conf
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error info.
 *
 *    @param2: result,
 *        object, the result in object
 *
 *    result example:
 *    {
 *       "icontheme": {
 *           "name": "Mint-X",
 *           "active": true,
 *           "icon": null,
 *           "path": "$HOME",
 *           "id": "computer",
 *           "pos": {
 *               "x": null,
 *               "y": null
 *           }
 *       },
 *     "computer": {
 *           ...
 *           }
 *          ...
 *    }
 *
 *  @param2: sFileName
 *    string, a short file name.
 *            for now we only have 2 type: 'Theme.conf', 'Widget.conf'.
 *
 *
 **/
function readConf(callback, filename) {
  var systemType = os.type();
  var _list = {
    'Theme.conf': THEME_PATH,
    'Widget.conf': WIGDET_PATH,
    'Default.conf': config.BEFORELOGIN
  }
  var _file_path = _list[filename];
  return readJSONFile(_file_path);
}

/** 
 * @Method: writeConf
 *    modify a file .conf
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error info.
 *
 *    @param2: result,
 *        object, the result in object
 *
 *    result example:
 *    {
 *       "icontheme": {
 *           "name": "Mint-X",
 *           "active": true,
 *           "icon": null,
 *           "path": "$HOME",
 *           "id": "computer",
 *           "pos": {
 *               "x": null,
 *               "y": null
 *           }
 *       },
 *     "computer": {
 *           ...
 *           }
 *          ...
 *    }
 *
 **/
function writeConf(callback, sFileName, oContent) {
  var systemType = os.type();
  if (systemType === "Linux") {
    if (sFileName === 'Theme.conf') {
      var sFileDir = THEME_PATH;
      var sDesFileDir = THEME_DES_PATH;
    } else if (sFileName === 'Widget.conf') {
      var sFileDir = WIGDET_PATH;
      var sDesFileDir = WIGDET_DES_PATH;
    } else {
      var _err = 'Error: Bad .conf file!';
      console.log(_err)
      return callback(_err, null);
    }
    writeJSONFile(sFileDir, sDesFileDir, oContent, function(err, result) {
      callback(err, result);
    })
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}


/** 
 * @Method: readAppMethod
 *    read .list/.cache file
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain a specific error info.
 *
 *    @param2: result,
 *        object, the result in json object.
 *         (see object example above in comment of buildAppMethodInfo())
 *
 *  @param2: sFileName
 *     string, a short file name as "defaults.list".
 *
 *
 **/
function readAppMethod(callback, sFileName) {
  var sFilePath = pathModule.join(REAL_APP_DIR, sFileName);
  readJSONFile(sFilePath, null, function(err, result) {
    callback(err, result);
  })
}

/** 
 * @Method: readDesktopFile
 *   find a desktop file with name of sFilename
 *   exmple: var sFileName = 'cinnamon';
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "readDesktopFile : desktop file NOT FOUND!"
 *                parse file error : "readDesktopFile : parse desktop file error!"
 *
 *    result example:
 *  {
 *
 *    [Desktop Entry]:{
 *        Type: Application
 *        Name: Cinnamon
 *        Comment: Window management and application launching
 *        Exec: /usr/bin / cinnamon - launcher
 *        X - GNOME - Bugzilla - Bugzilla: GNOME
 *        X - GNOME - Bugzilla - Product: cinnamon
 *        X - GNOME - Bugzilla - Component: general
 *        X - GNOME - Bugzilla - Version: 1.8.8
 *        Categories: GNOME;GTK;System;Core;
 *        OnlyShowIn: GNOME;
 *        NoDisplay: true
 *        X - GNOME - Autostart - Phase: WindowManager
 *        X - GNOME - Provides: panel;windowmanager;
 *        X - GNOME - Autostart - Notify: true
 *        X - GNOME - AutoRestart: true
 *    },
 *    [Desktop Action Compose]:{
 *              ...
 *    }
 *          ...
 *  }
 *
 * @param2: sFileName
 *    string,name of target file ,postfix is required
 *    example: var sFileName = 'cinnamon.desktop';
 *
 **/
// function readDesktopFile(callback, sFileName) {
//   var systemType = os.type();
//   if (systemType === "Linux") {
//     function findDesktopFileCb(err, result) {
//       if (err) {
//         console.log("find desktop file error!", err);
//         var _err = "readDesktopFile : find desktop file error!";
//         return callback(_err, null);
//       }

//       function parseDesktopFileCb(err, attr) {
//         if (err) {
//           console.log(err);
//           var _err = "readDesktopFile : parse desktop file error!";
//           return callback(err, null);
//         }
//         callback(null, attr);
//       }
//       var sPath = result;
//       parseDesktopFile(parseDesktopFileCb, sPath);
//     }
//     findDesktopFile(findDesktopFileCb, sFileName);
//   } else {
//     console.log("Not a linux system! Not supported now!");
//   }
// }

function readDesktopFile(callback, sFileName) {
  function findDesktopFileCb(err, result) {
    if (err) {
      console.log("find desktop file error!", err);
      var _err = "readDesktopFile : find desktop file error!";
      return callback(_err, null);
    }

    function parseDesktopFileCb(err, attr) {
      if (err) {
        console.log(err);
        var _err = "readDesktopFile : parse desktop file error!";
        return callback(err, null);
      }
      callback(null, attr);
    }
    var sPath = result;
    parseDesktopFile(parseDesktopFileCb, sPath);
  }
  findDesktopFile(findDesktopFileCb, sFileName);
}


/** 
 * @Method: parseDesktopFile
 *    parse Desktop File into json object
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                parse file error : "parseDesktopFile : read desktop file error"
 *                entry match error : "parseDesktopFile : desktop file entries not match!";
 *
 *    @param2: result
 *        object,
 *
 *    result example:
 *  {
 *
 *    [Desktop Entry]:{
 *        Type: Application
 *        Name: Cinnamon
 *        Comment: Window management and application launching
 *        Exec: /usr/bin / cinnamon - launcher
 *        X - GNOME - Bugzilla - Bugzilla: GNOME
 *        X - GNOME - Bugzilla - Product: cinnamon
 *        X - GNOME - Bugzilla - Component: general
 *        X - GNOME - Bugzilla - Version: 1.8.8
 *        Categories: GNOME;GTK;System;Core;
 *        OnlyShowIn: GNOME;
 *        NoDisplay: true
 *        X - GNOME - Autostart - Phase: WindowManager
 *        X - GNOME - Provides: panel;windowmanager;
 *        X - GNOME - Autostart - Notify: true
 *        X - GNOME - AutoRestart: true
 *    },
 *    [Desktop Action Compose]:{
 *              ...
 *    }
 *          ...
 *  }
 *
 *
 **/
function parseDesktopFile(callback, sPath) {
  var deferred = Q.defer();
  fs.readFile(sPath, 'utf-8', function(err, data) {
    if (err) {
      console.log("read desktop file error", sPath);
      console.log(err);
      var _err = new Error("parseDesktopFile : read desktop file error");
      deferred.reject(_err);
    } else {
      var re_head = /\[{1}[a-z,\s,A-Z,\d,\-]*\]{1}[\r,\n, ]{1}/g; //match all string like [***]
      var re_rn = /\n|\r|\r\n/g
      var re_comment = new RegExp('#');
      var re_letter = /\w/i;
      var re_eq = new RegExp('=');
      var desktopHeads = [];
      var oAllDesktop = {};
      try {
        data = data.replace(re_head, function() {
          var headEntry = (RegExp.lastMatch).toString();
          headEntry = headEntry.replace(re_rn, "");
          desktopHeads.push(headEntry); //once get a match, strore it
          return "$";
        })
        data = data.split('$');
        if (re_comment.test(data[0]) || !re_letter.test(data[0])) {
          data.shift(); //the first element is a "" or has #, remove it
        }
      } catch (err_inner) {
        console.log(err_inner);
        var _err = new Error();
        _err.name = 'headEntry';
        _err.message = headEntry;
        deferred.reject(_err);
      }
      if (desktopHeads.length === data.length) {
        for (var i = 0; i < data.length; i++) {
          if (!re_letter.test(data[i])) {
            continue;
          }
          try {
            var lines = data[i].split('\n');
          } catch (err_inner) {
            console.log(err_inner);
            var _err = new Error();
            _err.name = 'headContent';
            _err.message = data[i];
            deferred.reject(_err);
          }
          var attr = {};
          for (var j = 0; j < lines.length; ++j) {
            if (re_comment.test(lines[j]) || !re_eq.test(lines[j])) {
              continue;
            } else {
              try {
                var tmp = lines[j].split('=');
                attr[tmp[0]] = tmp[1].replace(re_rn, "");
              } catch (err_inner) {
                console.log(err_inner);
                var _err = new Error();
                _err.name = 'contentSplit';
                _err.message = tmp;
                console.log(test)
                deferred.reject(_err);
              }
              for (var k = 2; k < tmp.length; k++) {
                try {
                  attr[tmp[0]] += '=' + tmp[k].replace(re_rn, "");
                } catch (err_inner) {
                  console.log(err_inner);
                  var _err = new Error();
                  _err.name = 'contentAddition';
                  _err.message = tmp;
                  deferred.reject(_err);
                }
              }
            }
          }
          oAllDesktop[desktopHeads[i]] = attr;
        }
        if (oAllDesktop == undefined) {
          var _err = new Error("empty desktop content ...");
          deferred.reject(_err);
        } else {
          deferred.resolve(oAllDesktop);
        }
      } else {
        console.log(sPath, "desktop file entries not match!");
        var _err = new Error("parseDesktopFile : desktop file entries not match!");
        deferred.reject(_err);
      }
    }
  });
}


/** 
 * @Method: deParseDesktopFile
 *    To deparse a Desktop File json object back into a .desktop file. The input
 *    object should contain complete information of this file
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                input error : "deParseDesktopFile : input is not an object!"
 *                input error : "deParseDesktopFile : input is empty!"
 *
 *    @param2: result
 *        string, the result is in string good for fs.writeFile() to write back
 *                .desktop file.
 *
 * @param2: oDesktop
 *    object, this object should contain complete info of it's .desktop file
 *
 *    object example:
 *  {
 *
 *    [Desktop Entry]:{
 *        Type: Application
 *        Name: Cinnamon
 *        Comment: Window management and application launching
 *        Exec: /usr/bin / cinnamon - launcher
 *        X - GNOME - Bugzilla - Bugzilla: GNOME
 *        X - GNOME - Bugzilla - Product: cinnamon
 *        X - GNOME - Bugzilla - Component: general
 *        X - GNOME - Bugzilla - Version: 1.8.8
 *        Categories: GNOME;GTK;System;Core;
 *        OnlyShowIn: GNOME;
 *        NoDisplay: true
 *        X - GNOME - Autostart - Phase: WindowManager
 *        X - GNOME - Provides: panel;windowmanager;
 *        X - GNOME - Autostart - Notify: true
 *        X - GNOME - AutoRestart: true
 *    },
 *    [Desktop Action Compose]:{
 *              ...
 *    }
 *          ...
 *  }
 *
 *
 **/
function deParseDesktopFile(callback, oDesktop) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  if (typeof oDesktop !== 'object') {
    +
    console.log("error : oDesktop is not an object!");
    var _err = "deParseDesktopFile : input is not an object!";
    callback(_err, null);
  } else if (oDesktop === {}) {
    console.log("error : oDesktop is empty!");
    var _err = "deParseDesktopFile : input is empty!";
    callback(_err, null);
  } else {
    var sDesktop = "";
    for (var head in oDesktop) {
      sDesktop = sDesktop + head + '\n';
      var oContent = oDesktop[head];
      for (var entry in oContent) {
        var sEntry = entry + '=' + oContent[entry] + '\n';
        sDesktop = sDesktop + sEntry;
      }
      sDesktop = sDesktop + '\n';
    }
    callback(null, sDesktop);
  }
}


/** 
 * @Method: findDesktopFile
 *    To find a desktop file with name of sFilename. Since we maintain all .des-
 *    -ktopfile here, the searching path would be /.desktop/applications.
 *
 * @param1: callback
 *    @result
 *    string, a full path string,
 *            as: '/usr/share/applications/cinnamon.desktop'
 *
 * @param2: sFileName
 *    string, a short file name, a posfix is reauqired
 *    exmple: var sFileName = 'cinnamon.desktop';
 *
 **/
function findDesktopFile(callback, filename) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var systemType = os.type();
  if (systemType === "Linux") {
    var sFileName = filename;
    var xdgDataDir = [];
    var sAppPath = pathModule.join(REAL_DIR, 'applications', sFileName);
    fs.open(sAppPath, 'r', function(err, fd) {
      if (err) {
        var _err = sFileName + ' not found ...';
        return callback(_err, null);
      }
      if (fd) {
        fs.closeSync(fd);
      }
      return callback(null, sAppPath);
    })
  } else {
    var _err = "Not a linux system! Not supported now!";
    console.log(_err);
    callback(_err);
  }
}

/** 
 * @Method: deParseListFile
 *    To transe a .list/.cache file into a json object. The result would store
 *    in the object output
 *
 *  @param1: output
 *    object, this input object stores the reulst for multiple use.
 *
 * @param1: filepath
 *    string, a full path string,
 *            as: '/usr/share/applications/defaults.list'
 *
 * @param2: callabck
 *    callback without return anything
 *
 **/
function deParseListFile(file_content_) {
  var _result = {};
  file_content_ = file_content_.toString();
  var data_ = file_content_.split('\n');
  data_.shift();
  for (var i = 0; i < data_.length; i++) {
    var item = data_[i];
    if (item !== '') {
      try {
        item = item.split('/');
      } catch (err_inner) {
        var _err = new Error();
        _err.name = 'dataEntry';
        _err.message = item;
        throw _err;
      }
      var entry_fir = item[0];
      var content_fir = item[1];
      try {
        content_fir = content_fir.split('=');
      } catch (_err) {
        var _err = new Error();
        _err.name = 'content_fir';
        _err.message = content_fir;
        console.log(_err)
        throw _err;
      }
      var entry_sec = content_fir[0];
      var content_sec = content_fir[1];
      try {
        content_sec = content_sec.split(';');
      } catch (_err) {
        var _err = new Error();
        _err.name = 'content_sec';
        _err.message = content_sec;
        throw _err;
      }
      try {
        if (content_sec[content_sec.length - 1] == '') {
          content_sec.pop();
        }
      } catch (_err) {
        var _err = new Error();
        _err.name = 'content_sec'
        _err.message = content_sec;
        throw _err;
      }
      if (!_result[entry_fir]) {
        _result[entry_fir] = {};
        _result[entry_fir][entry_sec] = content_sec;
      } else if (!_result[entry_fir][entry_sec]) {
        _result[entry_fir][entry_sec] = content_sec;
      } else {
        for (var j = 0; j < content_sec.length; j++) {
          var content_sec_ = content_sec[j];
          if (!utils.isExist(content_sec_, _result[entry_fir][entry_sec])) {
            _result[entry_fir][entry_sec].push(content_sec_);
          }
        }
      }
    }
  }
  return _result;
}

/** 
 * @Method: buildAppMethodInfo
 *    To write a .list/.cache file into a json file. File name would remain at
 *    and the file content would a in json.
 *
 *    content example as below:
 *
 *    {
 *     "application": {
 *        "glade-3.desktop": [
 *          "x-glade"
 *        ],
 *        "gnumeric.desktop": [
 *          "x-gnumeric"
 *        ]
 *      },
 *      "image": {
 *
 *        "totem.desktop": [
 *          "vnd.rn-realpix"
 *        ],
 *        "gimp.desktop": [
 *          "x-psd"
 *        ]
 *      },
 *      "inode": {
 *        "nemo.desktop": [
 *          "directory"
 *        ],
 *        "caja.desktop": [
 *          "directory"
 *        ]
 *      }
 *    }
 *
 *
 * @param1: targetFile
 *    string, a file name, should be eihter 'defaults.list' or 'mimeinfo.cache'
 *
 * @param2: callabck
 *    Callback would return err if err occurs;otherwise return null.
 *
 **/
// function buildAppMethodInfo(targetFile, callback) {
//   var deferred = Q.defer();
//   var list = ['/usr/share/applications/' + targetFile, '/usr/local/share/applications/' + targetFile];
//   var lens = list.length;
//   var count = 0;
//   var listContent_ = {};

//   function done(listContent_) {
//     var outPutPath = pathModule.join(REAL_APP_DIR, targetFile);
//     var sListContent = JSON.stringify(listContent_, null, 4);
//     fs.writeFile(outPutPath, sListContent, function(err) {
//       if (err) {
//         console.log(err);
//         deferred.reject(new Error(err));
//       } else {
//         deferred.resolve();
//       }
//     })
//   }

//   function dobuild(listContent, filepath, _isEnd) {
//     fs.stat(filepath, function(err, stats) {
//       if (err || stats.size == 0) {
//         console.log('pass .list or .cache file ...', filepath);
//         if (_isEnd) {
//           return done(listContent);
//         }
//       } else {
//         deParseListFile(listContent, filepath, function(err) {
//           if (err) {
//             deferred.reject(new Error(err));
//           } else {
//             if (_isEnd) {
//               return done(listContent, callback);
//             }
//           }
//         })
//       }
//     })
//   }
//   for (var i = 0; i < lens; i++) {
//     var item = list[i];
//     var isEnd = (i == lens - 1);
//     dobuild(listContent_, item, isEnd);
//   }
// }

function buildAppMethodInfo(targetFile) {
  var _list = ['/usr/share/applications/' + targetFile,
    '/usr/local/share/applications/' + targetFile
  ];
  return promised.read_file(_list[0])
    .then(function(file_content_) {
      return doBuildAppMethodInfo(targetFile, file_content_);
    }, function(err) {
      return promised.read_file(_list[1])
        .then(function(file_content_) {
          return doBuildAppMethodInfo(targetFile, file_content_);
        })
    });
}

function doBuildAppMethodInfo(target_file_, file_content_) {
  return Q.fcall(function() {
      return deParseListFile(file_content_);
    })
    .then(function(resolve_content_) {
      var _out_path = pathModule.join(REAL_APP_DIR, target_file_);
      var _str_content = JSON.stringify(resolve_content_, null, 4);
      return promised.write_file(_out_path, _str_content)
    })
}


/** 
 * @Method: buildDesFile
 *    This function is only for building des file for desktop file
 *
 **/
function buildDesFile(fileName, postfix, newFilePath, callback) {
  fs.stat(newFilePath, function(err, stat) {
    if (err) {
      console.log(err);
      return;
    }
    var mtime = stat.mtime;
    var ctime = stat.ctime;
    var size = stat.size;
    uniqueID.getFileUid(function(uri) {
      var itemInfo = {
        URI: uri + "#" + CATEGORY_NAME,
        category: CATEGORY_NAME,
        postfix: postfix,
        filename: fileName,
        size: size,
        path: newFilePath,
        createTime: ctime,
        lastModifyTime: mtime,
        lastAccessTime: ctime,
        createDev: config.uniqueID,
        lastModifyDev: config.uniqueID,
        lastAccessDev: config.uniqueID
      }
      var sDesDir = DES_DIR;
      if (postfix == 'desktop') {
        sDesDir = pathModule.join(DES_DIR, 'applications');
      }
      fs_extra.ensureDir(sDesDir, function() {
        if (err) {
          console.log(err);
          return;
        }
        desFilesHandle.createItem(itemInfo, sDesDir, function() {
          callback();
        });
      })
    });
  });
}

function updateDesFile(sOp, sFilePath, callback) {
  fs.stat(sFilePath, function(err, stat) {
    if (err) {
      console.log(err);
      return;
    }
    var currentTime = (new Date());
    var size = stat.size;
    if (sOp == 'modify') {
      var itemInfo = {
        size: size,
        lastModifyTime: currentTime,
        lastAccessTime: currentTime,
        createDev: config.uniqueID,
        lastModifyDev: config.uniqueID,
        lastAccessDev: config.uniqueID
      };
    } else if (sOp == 'access') {
      var itemInfo = {
        size: size,
        lastAccessTime: currentTime,
        createDev: config.uniqueID,
        lastAccessDev: config.uniqueID
      };
    }
    desFilesHandle.updateItem(sFilePath, itemInfo, function(result) {
      if (result == 'success') {
        return callback(null, 'success');
      }
      var _err = 'update des file error!';
      return callback(_err, null);
    })
  })
}


/** 
 * @Method: findAllDesktopFiles
 *    To find all .desktop files from system. It would echo $XDG_DATA_DIRS
 *    to get all related dirs first, then sreach in those dirs.
 *
 * @param: callback
 *    @result
 *    object, an array of all desktop file's full path
 *
 *    example:
 *        [
 *         "/usr/share/xfce4/helpers/urxvt.desktop",
 *         "/usr/share/xfce4/helpers/lynx.desktop",
 *         "/usr/share/xfce4/helpers/rodent.desktop",
 *         "/usr/share/xfce4/helpers/icecat.desktop",
 *         "/usr/share/xfce4/helpers/pcmanfm.desktop",
 *         "/usr/share/xfce4/helpers/mozilla-browser.desktop"
 *        ]
 *
 **/
function findAllDesktopFiles() {
  var _filelist = [];
  var _reg_desktop = /\.desktop$/;
  var _path_local_share = '/usr/local/share/applications';
  var _path_share = '/usr/share/applications';
  return nextSearch(_path_local_share)
    .then(function(local_share_list_) {
      _filelist = _filelist.concat(local_share_list_);
      return nextSearch(_path_share)
        .then(function(share_list_) {
          _filelist = _filelist.concat(share_list_);
        })
    })
    .fail(function() {
      return nextSearch(_path_share)
        .then(function(share_list_) {
          _filelist = _filelist.concat(share_list_);
          return _filelist;
        });
    })

  function nextSearch(_path) {
    return promised.read_dir(_path)
      .then(function(file_list_) {
        return resolveDesktopFile(_path, file_list_);
      });
  }

  function resolveDesktopFile(pre_dir_, file_list_) {
    var _result = [];
    for (var i = 0, l = file_list_.length; i < l; i++) {
      if (_reg_desktop.test(file_list_[i])) {
        _result.push(pathModule.join(pre_dir_, file_list_[i]));
      }
    }
    return _result;
  }
}
exports.findAllDesktopFiles = findAllDesktopFiles;

function buildLocalDesktopFile() {
  return findAllDesktopFiles()
    .then(function(file_list_) {
      for (var i = 0, l = file_list_.length; i < l; i++) {
        var _filenanme = pathModule.basename(file_list_[i]);
        var _new_path = pathModule.join(REAL_APP_DIR, _filenanme);
        fs_extra.copySync(file_list_[i], _new_path);
      }
    })
}

/** 
 * @Method: writeDesktopFile
 *    modify a desktop file
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error   : "writeDesktopFile : desktop file NOT FOUND!"
 *                write error  : "writeDesktopFile : write desktop file error!"
 *                parse error  : "writeDesktopFile : parse desktop file error!"
 *                parse error  : "writeDesktopFile : deparse desktop file error!"
 *                input  error : "writeDesktopFile : entry content empty!"
 *
 *    @param2: result
 *        string, retrieve 'success' when success
 *
 * @param2: sFileName
 *    string, a file name
 *    exmple: var sFileName = 'cinnamon';
 *
 * @param3: oEntries
 *    object, this object indludes those entries that you want
 *            to change in this desktop file.
 *
 *    example:
 *    var oEntries = {
 *      "[Desktop Entry]": {
 *        "Name": "Videos",
 *        "Name[zh_CN]": "test",
 *        "Comment": "test",
 *        "Comment[zh_CN]": "test",
 *        "Keywords": "test",
 *        "Exec": "test",
 *        "Icon": "test",
 *        "Terminal": "false",
 *        "Type": "test",
 *        "Categories": "test",
 *      },
 *      "[Desktop Action Play]": {
 *        "Name": "test/test",
 *        "Exec": "test --play-pause",
 *        "OnlyShowIn": "test;"
 *      },
 *      "[Desktop Action Next]": {
 *        "Name": "test",
 *        "Exec": "test --next",
 *        "OnlyShowIn": "Unity;"
 *      }
 *    }
 *
 **/
function writeDesktopFile(callback, sFileName, oEntries) {
  var systemType = os.type();
  if (systemType === "Linux") {
    function findDesktopFileCb(err, result_find) {
      if (err) {
        console.log("find desktop file err!", err);
        return callback(err, null);
      }
      var sPath = result_find;

      function parseDesktopFileCb(err, attr) {
        if (err) {
          console.log(err);
          var _err = "writeDesktopFile : parse desktop file error!";
          return callback(_err, null);
        }
        var isModify = false;
        for (var entry in oEntries) {
          if (oEntries[entry]) {
            for (var element in oEntries[entry]) {
              if (attr[entry][element] !== oEntries[entry][element]) {
                isModify = true;
              }
              attr[entry][element] = oEntries[entry][element];
            }
          } else {
            console.log("entry content empty!");
            var _err = "writeDesktopFile : entry content empty!";
            return callback(_err, null);
          }
        }
        if (!isModify) {
          var _result = "Data Not Change!";
          return callback(null, _result);
        }

        function deParseDesktopFileCb(err, result_deparse) {
          if (err) {
            console.log(err);
            var _err = "writeDesktopFile : deparse desktop file error!";
            return callback(err, null);
          }
          var sWritePath = result_find;
          console.log(sWritePath);
          fs.writeFile(sWritePath, result_deparse, function(err) {
            if (err) {
              console.log(err);
              var _err = "writeDesktopFile : write desktop file error!";
              return callback(err, null);
            }
            var op = 'modify';
            var re = new RegExp('/desktop/');
            var desFilePath = sWritePath.replace(re, '/desktopDes/') + '.md';
            updateDesFile(op, desFilePath, function() {
              if (err) {
                console.log('update ' + sFileName + ' des file error!\n', err);
                return callback(err, null);
              }
              resourceRepo.repoCommitBoth('ch', REAL_REPO_DIR, DES_REPO_DIR, [sWritePath], [desFilePath], function(err, result) {
                if (err) {
                  return callback(err, null);
                }
                callback(null, "success");
              })
            });
          });
        }
        deParseDesktopFile(deParseDesktopFileCb, attr);
      }
      parseDesktopFile(parseDesktopFileCb, sPath);
    }
    findDesktopFile(findDesktopFileCb, sFileName)
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}

/** 
 *
 * @Method: getAllDesktopFile
 *    get all .desktop files in local
 *
 * @param: callback
 *    @result
 *    object, an array of all desktop file's name
 *
 *    example:
 *        [
 *         "urxvt.desktop",
 *         "lynx.desktop",
 *         "rodent.desktop",
 *         "icecat.desktop",
 *         "pcmanfm.desktop",
 *         "mozilla-browser.desktop",
 *        ]
 *
 **/
// function getAllDesktopFile(callback) {
//   if (typeof callback !== 'function')
//     throw 'Bad type for callback';
//   var systemType = os.type();
//   if (systemType === "Linux") {
//     var xdgDataDir = [];
//     var sAllDesktop = "";
//     var sTarget = pathModule.join(RESOURCEPATH, "desktop", "data", "applications");
//     var sBoundary = '.desktop';
//     var sLimits = ' | grep ' + sBoundary;
//     var sCommand = 'ls ' + sTarget + sLimits;
//     exec(sCommand, function(err, stdout, stderr) {
//       if (err) {
//         console.log(stderr);
//         console.log(err, stdout, stderr);
//         return callback(err, null);
//       }
//       stdout = stdout.split('\n')
//       var result = {};
//       var count = 0;
//       var lens = stdout.length;
//       for (var i = 0; i < lens; i++) {
//         var item = stdout[i];
//         if (item !== '') {
//           (function(_item) {
//             var _dir = pathModule.join(REAL_APP_DIR, _item);
//             fs.stat(_dir, function(err, stat) {
//               if (err) {
//                 console.log(err);
//                 return callback(err, null);
//               }
//               result[_item] = stat.ino;
//               var isEnd = (count === lens - 1);
//               if (isEnd) {
//                 callback(null, result);
//               }
//               count++;
//             })
//           })(item);
//         } else {
//           count++;
//         }
//       }
//     })
//   } else {
//     console.log("Not a linux system! Not supported now!")
//   }
// }
// exports.getAllDesktopFile = getAllDesktopFile;

function getAllDesktopFile(callback) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var systemType = os.type();
  if (systemType === "Linux") {
    var xdgDataDir = [];
    var sAllDesktop = "";
    var sTarget = pathModule.join(RESOURCEPATH, "desktop", "data", "applications");
    var sBoundary = '.desktop';
    var sLimits = ' | grep ' + sBoundary;
    var sCommand = 'ls ' + sTarget + sLimits;
    exec(sCommand, function(err, stdout, stderr) {
      if (err) {
        console.log(stderr);
        console.log(err, stdout, stderr);
        return callback(err, null);
      }
      stdout = stdout.split('\n')
      var result = {};
      var count = 0;
      var lens = stdout.length;
      for (var i = 0; i < lens; i++) {
        var item = stdout[i];
        if (item !== '') {
          (function(_item) {
            var _dir = pathModule.join(REAL_APP_DIR, _item);
            fs.stat(_dir, function(err, stat) {
              if (err) {
                console.log(err);
                return callback(err, null);
              }
              result[_item] = stat.ino;
              var isEnd = (count === lens - 1);
              if (isEnd) {
                callback(null, result);
              }
              count++;
            })
          })(item);
        } else {
          count++;
        }
      }
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}
exports.getAllDesktopFile = getAllDesktopFile;



/** 
 * @Method: readDesktopConfig
 *    To read desktop config file. Including .conf, .desktop, .list and . cache
 *
 * @param1: sFileName
 *    string, a short name as 'cinnamon.desktop', the postfix is required.
 *
 * @param2: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error info.
 *
 *    @param2: result,
 *        object, result in json, more detail example in specifc function commn-
 *                ent.
 *
 **/
function readDesktopConfig(sFileName, callback) {
  var postfix = pathModule.extname(sFileName);
  switch (postfix) {
    case ".conf":
      {
        return readConf(callback, sFileName);
      }
      break;
    case ".desktop":
      {
        return readDesktopFile(callback, sFileName);
      }
      break;
    case ".list":
      {
        return readAppMethod(callback, sFileName);
      }
      break;
    case ".cache":
      {
        return readAppMethod(callback, sFileName);
      }
      break;
    default:
      {
        var _err = 'Error: bad file name or type not supported! ' + sFileName;
        return callback(_err, null);
      }
  }
}
exports.readDesktopConfig = readDesktopConfig;

/** 
 * @Method: writeDesktopConfig
 *    To modify desktop config file. Including .conf, .desktop, .list and . cac-
 *    he
 *
 * @param1: sFileName
 *    string, a short name as 'cinnamon.desktop', the postfix is required.
 *
 * @param2: oContent
 *    object, content to modify, should a object, more detail example in specifc
 *            function commnent.
 *
 * @param3: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error info.
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 **/
function writeDesktopConfig(sFileName, oContent, callback) {
  var postfix = pathModule.extname(sFileName);
  switch (postfix) {
    case ".conf":
      {
        return writeConf(callback, sFileName, oContent);
      }
      break;
    case ".desktop":
      {
        return writeDesktopFile(callback, sFileName, oContent);
      }
      break;
    default:
      {
        var _err = 'Error: bad file name or type not supported!';
        return callback(_err, null);
      }
  }
}
exports.writeDesktopConfig = writeDesktopConfig;

/** 
 * @Method: shellExec
 *    execute a shell command
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                exec error   : "shellExec : [specific err info]"
 *
 *    @param2: result,
 *        string, stdout info in string as below
 *                '/usr/share/cinnamon:/usr/share/gnome:/usr/local/share/:/usr/-
 *                -share/:/usr/share/mdm/'
 
 *
 * @param2: command
 *    string, a shell command
 *    exmple: var command = 'echo $XDG_DATA_DIRS'
 *
 *
 **/
function shellExec(callback, command) {
  var systemType = os.type();
  if (systemType === "Linux") {
    exec(command, function(err, stdout, stderr) {
      if (err) {
        console.log(stderr, err);
        var _err = 'shellExec : ' + err;
        callback(_err, null);
      } else {
        console.log("exec: " + command);
        console.log(stdout);
        callback(null, stdout);
      }
    })
  }
}
exports.shellExec = shellExec;

/** 
 * @Method: moveFile
 *    To move a file or dir from oldPath to newPath.
 *    Path is limited under /desktop.
 *    !!!The dir CAN have content and contend would be move to new dir as well.
 *    !!!Notice that if you are moving a dir, the newPath has to be a none exist
 *    !!!new dir, otherwise comes error.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                echo error : 'moveFile : echo $HOME error'
 *                move error : 'moveFile : move error'
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 * @param2: oldPath
 *    string, a dir under user path
 *    exmple: var oldPath = '/test.txt'
 *    (compare with a full path: '/home/xiquan/.resources/DesktopConf/Theme.conf')
 *
 * @param3: newPath
 *    string, a dir under user path
 *    exmple: var newPath = '/testDir/test.txt'
 *    (compare with a full path: '/home/xiquan/.resources/DesktopConf/BadTheme.conf')
 *
 **/
function moveFile(callback, oldPath, newPath) {
  var oldFullpath = pathModule.join(REAL_DIR, 'desktop', oldPath);
  var newFullpath = pathModule.join(REAL_DIR, 'desktop', newPath);
  fs_extra.move(oldFullpath, newFullpath, function(err) {
    if (err) {
      console.log(err);
      var _err = 'moveFile : move error';
      callback(_err, null);
    } else {
      console.log('move ', oldPath, ' to ', newPath);
      callback(null, 'success');
    }
  })
}
exports.moveFile = moveFile;

/** 
 * @Method: renameDesktopFile
 *    To rename a desktop file
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                write error : 'renameDesktopFile : specific error'
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 * @param2: oldName
 *    string, file name of specific file you need to rename
 *    exmple: var oldName = 'exampleName.desktop'
 *
 * @param3: newName
 *    string, a new name that you want to set
 *    example: var newName = 'newName'
 *
 **/
function renameDesktopFile(callback, oldName, newName) {
  var sFilename = oldName + '.desktop';
  var sDesFilePath = pathModule.join(DES_APP_DIR, oldName + '.desktop.md');
  var sNewDesFilePath = pathModule.join(DES_APP_DIR, newName + '.desktop.md');
  var oEntries = {
    '[Desktop Entry]': {
      'Name': newName,
      'Name[zh_CN]': newName
    }
  }
  var oDesEntries = {
    filename: newName
  }

  function writeDesktopFileCb(err, result) {
    if (err) {
      console.log(err);
      var _err = 'renameDesktopFile: ' + err;
      callback(_err);
    } else {
      desFilesHandle.updateItem(sDesFilePath, oDesEntries, function(result) {
        if (result === "success") {
          fs_extra.move(sDesFilePath, sNewDesFilePath, function(err) {
            if (err) {
              console.log(err);
              return callback(err, null);
            }
            callback(null, result);
          })
        }
      })
    }
  }
  writeDesktopFile(writeDesktopFileCb, sFilename, oEntries);
}
exports.renameDesktopFile = renameDesktopFile;


function openDataByRawPath(callback, filePath) {
  var sCommand = 'xdg-open ' + filePath;
  exec(sCommand, function(err, stdout, stderr) {
    if (err) {
      console.log(err, stdout, stderr);
      return callback(err);
    }
    callback('success')
  })
}
exports.openDataByRawPath = openDataByRawPath;


/** 
 * @Method: linkAppToDesktop
 *    Make a soft link from a desktop file to /desktop or /dock
 *
 * @param2: sApp
 *    string, file name of specific file you need to rename
 *    exmple: var oldName = 'exampleName.desktop'
 *
 * @param3: sType
 *    string, only 2 choices: 'desktop', 'dock'
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain error info as below
 *                write error : 'renameDesktopFile : specific error'
 *
 *    @param: result,
 *        string, retrieve success when success.
 *
 **/
function linkAppToDesktop(sApp, sType, callback) {
  if (sType !== 'desktop' && sType !== 'dock') {
    var _err = "Error: bad dir type!";
    return callback(_err, null);
  }
  var sSrc = pathModule.join(REAL_APP_DIR, sApp);
  var sDes = pathModule.join(REAL_DIR, sType, sApp);
  fs.symlink(sSrc, sDes, function(err) {
    if (err) {
      console.log(err, sSrc, sDes)
      return callback(err, null);
    }
    callback(null, 'success');
  })
}
exports.linkAppToDesktop = linkAppToDesktop;

/** 
 * @Method: unlinkApp
 *    Unlink from a desktop file to /desktop or /dock
 *
 * @param2: sDir
 *    string, a link short path as /desktop/test.desktop.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain error info as below
 *                write error : 'renameDesktopFile : specific error'
 *
 *    @param: result,
 *        string, retrieve success when success.
 *
 **/
function unlinkApp(sDir, callback) {
  var sTarget = pathModule.join(REAL_DIR, sDir);
  fs.unlink(sTarget, function(err) {
    if (err) {
      console.log(err, sTarget)
      return callback(err, null);
    }
    callback(null, 'success');
  })
}
exports.unlinkApp = unlinkApp;

/** 
 * @Method: moveToDesktop
 *    To drag a file from any where to desktop.
 *
 * @param2: sFilePath
 *    string, a target file path, should be a full path.
 *            example: '/home/xiquan/somedir/somefile.txt'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        array, the file info of target after load into local db.
 *        example:
 *        var fileInfo = [sFilePath, stats.ino];
 *
 **/
function moveToDesktopSingle(sFilePath, callback) {
  if (!sFilePath || sFilePath == '') {
    var _err = 'Error: bad sFilePath!';
    console.log(_err);
    return callback(_err, null);
  }
  var reg_isLocal = /\/[a-z]+\/[a-z]+\/resource\/[a-z]+\/data\//gi;
  var category = utils.getCategoryByPath(sFilePath).category;
  if (reg_isLocal.test(sFilePath)) { //target file is from local
    var sCondition = ["path = '" + sFilePath + "'"];
    commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
      if (err) {
        var _err = "Error: find " + sFilePath + " in db error!"
        return callback(_err, null);
      }
      var item = result[0];
      var oTags = result.others.split(',');
      if (utils.isExist('$desktop$', oTags)) {
        console.log('Oh,Sorry, ' + sFilePath + ' Exists on desktop!');
        return callback(null, 'exist');
      }

      function setTagsCb(err) {
        if (err) {
          var _err = 'Error: set tags error!';
          console.log(_err);
          return callback(err, null);
        }
        fs.stat(sFilePath, function(err, stats) {
          if (err) {
            console.log(sFilePath, err);
            return callback(err, null);
          }
          var fileInfo = [sFilePath, stats.ino];
          callback(null, fileInfo);
        })
      }
      var sUri = item.URI;
      tagsHandle.setTagByUri(setTagsCb, ['$desktop$'], sUri);
    })
  } else { //target file is from out of our data frame
    utils.isNameExists(sFilePath, function(err, result) {
      if (err) {
        console.log('isNameExists error!');
        return callback(err, null);
      }
      if (result) { //target's name is aready exist in db
        /*TODO: To be continue: when name exists, we need rename function */
        // var _err = result + ': File Name Exists! Please Change it!';
        // console.log(_err);
        // return callback(_err, null);
        console.log('target name is aready exist in db', result);
        var data = new Date();
        var surfix = 'duplicate_at_' + data.toLocaleString().replace(' ', '_') + '_';
        var sNewName = surfix + result;
        var sNewFilePath = pathModule.join(pathModule.dirname(sFilePath), sNewName);
        utils.copyFile(sFilePath, sNewFilePath, function(err) {
          if (err) {
            console.log(err, 'copy file', sFilePath, ' error!');
            return callback(err, null);
          }
          doCreateData(sNewFilePath, category, function(err, result) {
            if (err) {
              console.log(err, 'create data error!', sNewFilePath);
              return callback(err, null);
            }
            exec('rm ' + sNewFilePath, function(err, stdout, stderr) {
              if (err) {
                console.log(err, stdout, stderr);
                return callback(err, null);
              }
              fs.stat(result, function(err, stats) {
                if (err) {
                  console.log(sFilePath, err);
                  return callback(err, null);
                }
                var fileInfo = [result, stats.ino];
                callback(null, fileInfo);
              })
            })
          });
        })
      } else { //target's name is unique
        console.log('target name is unique');
        doCreateData(sFilePath, category, function(err, result) {
          if (err) {
            console.log(err, 'create data error!', sFilePath);
            return callback(err, null);
          }
          fs.stat(sFilePath, function(err, stats) {
            if (err) {
              console.log(sFilePath, err);
              return callback(err, null);
            }
            var fileInfo = [result, stats.ino];
            callback(null, fileInfo);
          })
        })
      }
    })
  }
}
exports.moveToDesktopSingle = moveToDesktopSingle;

/*TODO: sqlite bug, not complete*/
/** 
 * @Method: moveToDesktop
 *    To drag multiple files from any where to desktop.
 *
 * @param2: oFilePath
 *    string, array of file path, should be a full path.
 *            example: ['/home/xiquan/somedir/somefile.txt'].
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, the path of target after load into local db.
 *
 **/
function moveToDesktop(oFilePath, callback) {
  var count = 0;
  var lens = oFilePath.length;
  var resultFiles = [];
  for (var i = 0; i < lens; i++) {
    var item = oFilePath[i];
    (function(_filePath) {
      moveToDesktopSingle(_filePath, function(err, result) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        resultFiles.push(result);
        var isEnd = (count === lens - 1);
        if (isEnd) {
          callback(null, resultFiles);
        }
        count++;
      })
    })(item);
  };
}
exports.moveToDesktop = moveToDesktop;

function doCreateData(sFilePath, category, callback) {
  var cate = utils.getCategoryObject(category);
  cate.createData(sFilePath, function(err, resultFile) {
    if (err) {
      console.log(err, resultFile);
      return callback(err, null);
    }
    var sCondition = ["path = '" + resultFile + "'"];
    commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
      if (err) {
        var _err = "Error: find " + sFilePath + " in db error!";
        return callback(_err, null);
      }
      var item = result[0];

      function setTagsCb(err) {
        if (err) {
          var _err = 'Error: set tags error!';
          console.log(_err);
          return callback(err, null);
        }
        callback(null, resultFile);
      }
      var sUri = item.URI;
      tagsHandle.setTagByUri(setTagsCb, ['$desktop$'], sUri);
    })
  });
}

/** 
 * @Method: removeFileFromDB
 *   To remove a file from desktop. This action will remove this file from data
 *   frame also.
 *
 * @param2: sFilePath
 *    string, file path, should be a full path in local.
 *            example: '/home/xiquan/.resource/document/data/somefile.txt'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, retrieve 'success' when success.
 *
 **/
function removeFileFromDB(sFilePath, callback) {
  var category = utils.getCategoryByPath(sFilePath).category;
  var cate = utils.getCategoryObject(category);
  var sCondition = ["path = '" + sFilePath + "'"];
  commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    } else if (result == [] || result == '') {
      var _err = 'file ' + sFilePath + ' not found in db!';
      console.log(_err);
      return callback(_err, null);
    }
    var sUri = result[0].URI;
    var sFullName = result[0].filename + result[0].postfix;
    cate.removeByUri(sUri, function(err, result) {
      if (err) {
        console.log('removeByUri error', err);
        return callback(err, null);
      }
      tagsHandle.rmInTAGS(null, sUri, function(err) {
        if (err) {
          return callback(err, null);
        }
        var dataDir = utils.getRealDir(category);
        var desDataDir = pathModule.join(utils.getDesDir(category), sFullName + '.md');
        fs_extra.ensureDir(dataDir, function(err) {
          if (err) {
            console.log(err, 'ensureDir error!');
            return callback(err, null);
          }
          fs_extra.ensureDir(desDataDir, function(err) {
            if (err) {
              console.log(err, 'ensureDir error!');
              return callback(err, null);
            }
          })
          callback(null, 'success');
        })
      })
    })
  })
}
exports.removeFileFromDB = removeFileFromDB;

/** 
 * @Method: removeFileFromDesk
 *   To remove a file from desktop. This action will only remove this file from
 *   desktop.
 *
 * @param2: sFilePath
 *    string, file path, should be a full path in local.
 *            example: '/home/xiquan/.resource/document/data/somefile.txt'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, retrieve 'success' when success.
 *
 **/
function removeFileFromDesk(sFilePath, callback) {
  var category = utils.getCategoryByPath(sFilePath).category;
  var sCondition = ["path = '" + sFilePath + "'"];
  commonDAO.findItems(['uri'], [category], sCondition, null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    } else if (result == [] || result == '') {
      var _err = 'file ' + sFilePath + ' not found in db!';
      console.log(_err);
      return callback(_err, null);
    }
    var sUri = result[0].URI;

    function rmTagsByUriCb(result) {
      if (result !== 'commit') {
        var _err = 'rmTagsByUri error!';
        console.log(_err);
        return callback(_err, null);
      }
      callback(null, 'success');
    }
    tagsHandle.rmTagsByUri(rmTagsByUriCb, ['$desktop$'], sUri)
  })
}
exports.removeFileFromDesk = removeFileFromDesk;


/** 
 * @Method: getFilesFromDesk
 *   To get all files on desktop.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, array of file info,
 *                as [{filePath: '/home/xiquan/a.txt',
 *                     inode:    '1902384109',
 *                     tags:     '$desktop$aa$bb$'
 *                   }]
 *
 **/
function getFilesFromDesk(callback) {
  function getFilesByTagsCb(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    }
    var oInfo = [];
    var reg_desktop = /^[\$]{1}desktop[\$]{1}/;
    var count = 0;
    var lens = result.length;
    for (var i = 0; i < lens; i++) {
      var item = result[i];
      (function(_item) {
        var sPath = _item.path;
        fs.stat(sPath, function(err, stat) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          var oTags = item.others.split(',');
          for (var j = 0; j < oTags.length; j++) {
            if (reg_desktop.test(oTags[j])) {
              var sTag = oTags[j];
              break;
            }
          }
          var tmpInfo = {
            filepath: sPath,
            inode: stat.ino,
            tags: sTag
          }
          oInfo.push(tmpInfo);
          var isEnd = (count === lens - 1);
          if (isEnd) {
            callback(null, oInfo);
          }
          count++;
        })
      })(item)
    }
  }
  var oTags = ['$desktop$'];
  tagsHandle.getFilesByTags(getFilesByTagsCb, oTags);
}
exports.getFilesFromDesk = getFilesFromDesk;

/** 
 * @Method: getAllVideo
 *   To get all vidoe files.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, array of file info, as [filePath,inode]
 *
 **/
function getAllVideo(callback) {
  commonDAO.findItems(null, ['video'], null, null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    } else if (result == [] || result == '') {
      var _err = 'no videos found in db!';
      console.log(_err);
      return callback(_err, null);
    }
    var oInfoResult = {};
    var count = 0;
    var lens = result.length;
    for (var i = 0; i < lens; i++) {
      var item = result[i];
      (function(_item) {
        var sPath = _item.path;
        fs.stat(sPath, function(err, stat) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          var sInode = stat.ino;
          oInfoResult[sInode] = sPath;
          var isEnd = (count == lens - 1);
          if (isEnd) {
            callback(null, oInfoResult);
          }
          count++;
        })
      })(item)
    }
  })
}
exports.getAllVideo = getAllVideo;

/** 
 * @Method: getAllMusic
 *   To get all music files.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, of all music file info as{inode:oFileInfo}.
 *                more detail in document.
 **/
function getAllMusic(callback) {
  commonDAO.findItems(null, ['Music'], null, null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    } else if (result == [] || result == '') {
      var _err = 'no Musics found in db!';
      console.log(_err);
      return callback(_err, null);
    }
    var oInfoResult = {};
    var count = 0;
    var lens = result.length;
    for (var i = 0; i < lens; i++) {
      var item = result[i];
      (function(_item) {
        var sPath = _item.path;
        fs.stat(sPath, function(err, stat) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          var sInode = stat.ino;
          oInfoResult[sInode] = _item;
          var isEnd = (count == lens - 1);
          if (isEnd) {
            console.log(oInfoResult)
            callback(null, oInfoResult);
          }
          count++;
        })
      })(item)
    }
  })
}
exports.getAllMusic = getAllMusic;

/*TODO: To be continue...*/
/** 
 * @Method: getIconPath
 *   To get icon path.
 *
 * @param1: iconName_
 *    string, a short icon path.
 *
 * @param2: size_
 *    num, size of icon
 *
 * @param3: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, array of icon path.
 *
 **/
function getIconPath(iconName_, size_, callback) {
  //get theme config file
  //get the name of current icon-theme
  //1. search $HOME/.icons/icon-theme_name/subdir(get from index.theme)
  //2. if not found, search $XDG_DATA_DIRS/icons/icon-theme_name
  //   /subdir(get from index.theme)
  //3. if not found, search /usr/share/pixmaps/subdir(get from index.theme)
  //4. if not found, change name to current theme's parents' recursively 
  //   and repeat from step 1 to 4
  //5. if not found, return default icon file path(hicolor)
  //
  if (typeof callback !== "function")
    throw "Bad type of callback!!";

  function readConfCb(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    }
    var iconTheme = result['icontheme']['name'];

    getIconPathWithTheme(iconName_, size_, iconTheme, function(err_, iconPath_) {
      if (err_) {
        getIconPathWithTheme(iconName_, size_, "hicolor", function(err_, iconPath_) {
          if (err_) {
            exec('locate ' + iconName_ + ' | grep -E \"\.(png|svg)$\"', function(err, stdout, stderr) {
              if (err || stdout == '') return callback('Not found');
              return callback(null, stdout.replace(/\n$/, '').split('\n').reverse());
            });
          } else {
            callback(null, iconPath_);
          }
        });
      } else {
        callback(null, iconPath_);
      }
    });
  }
  readConf(readConfCb, 'Theme.conf');
}
exports.getIconPath = getIconPath;

function getIconPathWithTheme(iconName_, size_, themeName_, callback) {
  if (typeof callback != 'function')
    throw 'Bad type of function';
  var HOME_DIR_ICON = pathModule.join(utils.getHomeDir(), "/.local/share/icons/");
  var XDG_DATA_DIRS = utils.getXdgDataDirs();
  var _iconSearchPath = [];
  _iconSearchPath.push(HOME_DIR_ICON);
  for (var i = 0; i < XDG_DATA_DIRS.length; i++) {
    var item = pathModule.join(XDG_DATA_DIRS[i], "/icons/");
    _iconSearchPath.push(item);
  }
  _iconSearchPath.push("/usr/share/pixmaps")

  var findIcon = function(index_) {
    if (index_ == _iconSearchPath.length) {
      return callback('Not found');
    }
    var _path = _iconSearchPath[index_];
    if (index_ < _iconSearchPath.length - 1) _path += themeName_;
    fs.exists(_path, function(exists_) {
      if (exists_) {
        var tmp = 'find ' + _path + ' -regextype \"posix-egrep\" -regex \".*' + ((index_ < _iconSearchPath.length - 1) ? size_ : '') + '.*/(.*/)*' + iconName_ + '\.(svg|png)$\"';
        exec(tmp, function(err, stdout, stderr) {
          if (err) {
            console.log(err, stdout, stderr);
            return;
          }
          if (stdout == '') {
            fs.readFile(_path + '/index.theme', 'utf-8', function(err, data) {
              var _parents = [];
              if (err) {
                //console.log(err);
              } else {
                var lines = data.split('\n');
                for (var i = 0; i < lines.length; ++i) {
                  if (lines[i].substr(0, 7) == "Inherits") {
                    attr = lines[i].split('=');
                    _parents = attr[1].split(',');
                  }
                }
              }
              //recursive try to find from parents
              var findFromParent = function(index__) {
                if (index__ == _parents.length) return;
                getIconPathWithTheme(iconName_, size_, _parents[index__], function(err_, iconPath_) {
                  if (err_) {
                    findFromParent(index__ + 1);
                  } else {
                    callback(null, iconPath_);
                  }
                });
              };
              findFromParent(0);
              //if not fonud
              findIcon(index_ + 1);
            });
          } else {
            callback(null, stdout.split('\n'));
          }
        });
      } else {
        findIcon(index_ + 1);
      }
    });
  };
  findIcon(0);
}

/** 
 * @Method: createFile
 *   To create a txt file on desktop.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, file info of the new file, as [filePath, stats.ino].
 *
 **/
function createFile(sContent, callback) {
  var date = new Date();
  var filename = 'newFile_' + date.toLocaleString().replace(' ', '_') + '.txt';
  var desPath = '/tmp/' + filename;
  exec("touch " + desPath, function(err, stdout, stderr) {
    if (err) {
      console.log(err, stdout, stderr);
      return callback(err);
    }
    if (sContent == '' || sContent == null) {
      sContent = '';
    }
    fs.writeFile(desPath, sContent, function(err) {
      if (err) {
        return callback(err);
      }
      var cate = utils.getCategoryObject('document');
      cate.createData(desPath, function(err, resultFile) {
        if (err) {
          console.log(err, stdout, stderr);
          return callback(err);
        }
        exec("rm " + desPath, function(err, stdout, stderr) {
          if (err) {
            console.log(err, stdout, stderr);
            return callback(err);
          }
          console.log(resultFile);
          var sCondition = ["path = '" + resultFile + "'"];
          commonDAO.findItems(['uri'], ['document'], sCondition, null, function(err, result) {
            if (err) {
              var _err = "Error: find " + resultFile + " in db error!";
              return callback(_err, null);
            } else if (result == '' || result == []) {
              var _err = "Error: not find " + resultFile + " in db!";
              return callback(_err, null);
            }

            function setTagsCb(err) {
              if (err) {
                var _err = 'Error: set tags error!';
                return callback(err, null);
              }
              fs.stat(resultFile, function(err, stats) {
                if (err) {
                  return callback(err, null);
                }
                var result = [resultFile, stats.ino];
                callback(null, result);
              })
            }
            var sUri = result[0].URI;
            tagsHandle.setTagByUri(setTagsCb, ['$desktop$'], sUri);
          });
        });
      });
    });
  });
}
exports.createFile = createFile;

/** 
 * @Method: rename
 *   To rename a file on desktop. Front end needs to control that the postfix c-
 *   not be change.
 *
 * @param1: oldName
 *    @string, origin name of the file, as 'good_file.txt'
 *
 * @param2: newName
 *    @string, new name of the file, as 'bad_file.txt'
 *
 * @param3: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, would return 'EXIST' when new file name exists in db; otherwi-
 *                se, return 'success'.
 *
 **/
function rename(oldName, newName, callback) {
  if (newName === oldName) {
    return callback(null, 'success');
  }
  var category = utils.getCategoryByPath('test/' + oldName).category;
  var oldPath = pathModule.join(utils.getRealDir(category), oldName);
  var newPath = pathModule.join(utils.getRealDir(category), newName);
  utils.isNameExists(newPath, function(err, result) {
    if (err) {
      return callback(err, null);
    } else if (result) {
      return callback(null, 'EXIST');
    }
    var sCondition = ["path = '" + oldPath + "'"];
    commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
      if (err) {
        var _err = "Error: find " + oldPath + " in db error!";
        return callback(_err, null);
      } else if (result == '' || result == []) {
        var _err = "Error: not find " + oldPath + " in db!";
        return callback(_err, null);
      }
      var sUri = result[0].URI;
      commonHandle.renameDataByUri(category, sUri, newName, function(err, result) {
        if (err) {
          return callback(err, null);
        }
        callback(null, result);
      });
    });
  });
}
exports.rename = rename;
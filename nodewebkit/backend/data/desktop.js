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
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var dataDes = require("../commonHandle/desFilesHandle");
var commonHandle = require("../commonHandle/commonHandle");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var desFilesHandle = require("../commonHandle/desFilesHandle");
var tagsHandle = require("../commonHandle/tagsHandle");
var utils = require('../utils');
var util = require('util');
var events = require('events');
var uniqueID = require("../uniqueID");
var chokidar = require('chokidar');
var exec = require('child_process').exec;
var configPath = config.RESOURCEPATH + "/desktop";

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

function newInit(initType) {
  var initTheme = {
    name: 'undefined',
    active: 'undefined',
    icon: 'undefined',
    path: 'undefined',
    id: 'undefined',
    pos: {
      x: 'undefined',
      y: 'undefined'
    }
  }
  var initWidget = {
    id: 'undefined',
    path: 'undefined',
    position: {
      x: 'undefined',
      y: 'undefined'
    }
  }
  if (initType === "theme") {
    return initTheme;
  } else if (initType === "widget") {
    return initWidget;
  }
}

function getnit(initType) {
  if (initType === "theme") {
    var _icontheme = newInit(initType);
    _icontheme.name = 'Mint-X';
    _icontheme.active = false;

    var _computer = newInit(initType);
    _computer.name = 'Computer';
    _computer.active = true;
    _computer.path = '$HOME';
    _computer.id = 'computer';

    var _trash = newInit(initType);
    _trash.name = 'Trash';
    _trash.active = false;

    var _network = newInit(initType);
    _network.name = 'Network'
    _network.active = false;

    var _document = newInit(initType);
    _document.name = 'Document';
    _document.active = false;

    var result = {
      icontheme: _icontheme,
      computer: _computer,
      trash: _trash,
      network: _network,
      document: _document
    }
  } else if (initType === "widget") {
    var _clock = newInit(initType);
    _clock.name = 'clock';
    _clock.path = '$img/clock.png'
    _clock.position = {
      x: 0,
      y: 0
    }
    var result = {
      clock: _clock
    }
  }
  return result;
}


/** 
 * @Method: initDesktop
 *    init desktop config dir & files. Those files are all maintained in /.desktop
 *    including Theme.comf, Widget.conf, and all .desktop files.
 *
 * @param: callback
 *        @result
 *            string, retrieve 'success' when success
 *
 **/
function initDesktop(callback) {
  var systemType = os.type();
  if (systemType === "Linux") {
    var path = REAL_DIR;
    fs_extra.ensureDir(path, function(err) {
      if (err) {
        console.log(err);
        return;
      }
      var tmpThemw = getnit("theme");
      var pathTheme = path + "/Theme.conf";
      var sItemTheme = JSON.stringify(tmpThemw, null, 4);
      fs_extra.outputFile(pathTheme, sItemTheme, function(err) {
        if (err) {
          console.log("init Theme config file error!");
          console.log(err);
          return;
        }
        buildDesFile('Theme', 'conf', pathTheme, function() {
          var sThemeDesDir = pathModule.join(DES_DIR, 'Theme.conf.md');
          var sWidgetDesDir = pathModule.join(DES_DIR, 'Widget.conf.md');
          var tmpWidget = getnit("widget");
          var pathWidget = path + "/Widget.conf";
          var sItemWidget = JSON.stringify(tmpWidget, null, 4);
          fs_extra.outputFile(pathWidget, sItemWidget, function(err) {
            if (err) {
              console.log("init Widget config file error!");
              console.log(err);
              return;
            }
            buildDesFile('Widget', 'conf', pathWidget, function() {
              var sRealDir = [pathTheme, pathWidget];
              var sDesDir = [sThemeDesDir, sWidgetDesDir];
              resourceRepo.repoCommitBoth('add', REAL_REPO_DIR, DES_REPO_DIR, sRealDir, sDesDir, function(err, result) {
                var pathDesk = path + "/desktop";
                fs_extra.ensureDir(pathDesk, function(err) {
                  if (err) {
                    console.log("init desktop config file error!");
                    console.log(err);
                    return;
                  }
                  console.log("init /desktop success!");
                  var pathDock = path + "/dock";
                  fs_extra.ensureDir(pathDock, function(err) {
                    if (err) {
                      console.log("init dock config file error!");
                      console.log(err);
                      return;
                    }
                    console.log("init /dock success!");
                    var pathApp = path + "/applications";
                    fs_extra.ensureDir(pathApp, function(err) {
                      if (err) {
                        console.log("init application config file error!");
                        console.log(err);
                        return;
                      }
                      console.log("init /applications success!");
                      buildLocalDesktopFile(function() {
                        console.log("build local desktop file success!");
                        buildAppMethodInfo('defaults.list', function(err, result) {
                          if (err) {
                            console.log(err);
                            return;
                          }
                          console.log("init defaults.list success!");
                          buildAppMethodInfo('mimeinfo.cache', function(err, result) {
                            if (err) {
                              console.log(err);
                              return;
                            }
                            console.log("init mimeinfo.cache success!");
                            console.log(result);
                            console.log('build local desktop file success');
                            callback("success");
                          })
                        })
                      })
                    });
                  });
                });
              })
            });
          });
        });
      });
    });
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}
exports.initDesktop = initDesktop;


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
function readJSONFile(filePath, desFilePath, callback) {
  var systemType = os.type();
  if (systemType === "Linux") {
    fs.readFile(filePath, 'utf8', function(err, data) {
      if (err) {
        console.log("read config file error!");
        console.log(err);
        var _err = "readThemeConf : read config file error!";
        return callback(_err, null);
      }
      if (!desFilePath) {
        var json = JSON.parse(data);
        return callback(null, json);
      }
      var json = JSON.parse(data);
      callback(null, json);
    });
  } else {
    console.log("Not a linux system! Not supported now!");
  }
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
              resourceRepo.repoCommitBoth('ch', REAL_DIR, DES_REPO_DIR, [filePath], [desFilePath], function(err, result) {
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
function readConf(callback, sFileName) {
  var systemType = os.type();
  if (systemType === "Linux") {
    if (sFileName === 'Theme.conf') {
      var sFileDir = THEME_PATH;
      var sDesFileDir = THEME_DES_PATH;
      console.log('reading Theme.conf!');
    } else if (sFileName === 'Widget.conf') {
      var sFileDir = WIGDET_PATH;
      var sDesFileDir = WIGDET_DES_PATH;
      console.log('reading Widget.conf!');
    } else {
      var _err = 'Error: Not a .conf file!';
      console.log(_err)
      return callback(_err, null);
    }
    readJSONFile(sFileDir, sDesFileDir, function(err, result) {
      callback(err, result);
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }
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
      console.log('writing Theme.conf!');
    } else if (sFileName === 'Widget.conf') {
      var sFileDir = WIGDET_PATH;
      var sDesFileDir = WIGDET_DES_PATH;
      console.log('writing Widget.conf!');
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
function readDesktopFile(callback, sFileName) {
  var systemType = os.type();
  if (systemType === "Linux") {
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
          return callback(_err, null);
        }
        console.log("readDesktopFile success!");
        callback(null, attr);
      }
      var sPath = result;
      parseDesktopFile(parseDesktopFileCb, sPath);
    }
    findDesktopFile(findDesktopFileCb, sFileName);
  } else {
    console.log("Not a linux system! Not supported now!");
  }
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
  if (typeof callback !== 'function')
    throw 'Bad type of callback!!';
  var systemType = os.type();
  if (systemType === "Linux") {
    fs.readFile(sPath, 'utf-8', function(err, data) {
      if (err) {
        console.log("read desktop file error", sPath);
        console.log(err);
        var _err = "parseDesktopFile : read desktop file error";
        callback(_err, null);
      } else {
        var re_head = /[\[]{1}[a-z, ,A-Z]*\]{1}\n|[\[]{1}[a-z, ,A-Z]*\]{1}\r/g; //match all string like [***]
        var re_rn = /\n|\r|\r\n/g
        var re_comment = /#/g;
        var desktopHeads = [];
        var oAllDesktop = {};
        data = data.replace(re_head, function() {
          var headEntry = (RegExp.lastMatch).toString();
          headEntry = headEntry.replace(re_rn, "");
          desktopHeads.push(headEntry); //once get a match, strore it
          return "$";
        })
        data = data.split('$');
        if (data[0] === "" | data[0] === "\r" | data[0] === "\n" | re_comment.test(data[0])) {
          data.shift(); //the first element is a "", remove it
        }
        if (desktopHeads.length === data.length) {
          for (var i = 0; i < data.length; i++) {
            var lines = data[i].split('\n');
            var attr = {};

            for (var j = 0; j < lines.length - 1; ++j) {
              if (lines[j] !== "" && !re_comment.test(lines[j])) {
                var tmp = lines[j].split('=');
                try {
                  attr[tmp[0]] = tmp[1].replace(re_rn, "");
                  for (var k = 2; k < tmp.length; k++) {
                    attr[tmp[0]] += '=' + tmp[k].replace(re_rn, "");
                  }
                } catch (e) {
                  console.log(e);
                  console.log(lines[j])
                  return;
                }
              }
            }
            oAllDesktop[desktopHeads[i]] = attr;
          }
        } else {
          console.log(sPath, "desktop file entries not match!");
          var _err = "parseDesktopFile : desktop file entries not match!";
          callback(_err, null);
        }
        console.log("Get desktop file success!");
        callback(null, oAllDesktop);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!");
  }
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
    var sAppPath = REAL_DIR + '/applications';
    var sBoundary = sAppPath + ' -name ';
    var sCommand = 'find ' + sBoundary + sFileName;

    exec(sCommand, function(err, stdout, stderr) {
      if (err) {
        console.log('find ' + sFileName + ' error!');
        console.log(err, stderr, stdout);
        return callback(err, null);
      }
      if (stdout == '') {
        console.log('Not Found in Local!');
        utils.findFilesFromSystem(sFileName, function(err, result) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          var desktopFilePath = result[0];
          var sNewFilePath = pathModule.join(sAppPath, sFileName);
          console.log("find desktop file: ", desktopFilePath);
          fs_extra.copy(desktopFilePath, sNewFilePath, function(err) {
            if (err) {
              console.log('copy file error!\n', err);
              return callback(err, null);
            }
            filename = filename.replace(/.desktop/, '');
            buildDesFile(filename, 'desktop', sNewFilePath, function() {
              console.log('find ' + sFileName + ' success!');
              return callback(null, sNewFilePath);
            });
          });
        });
      } else {
        console.log('find ' + sFileName + ' success!');
        var result = stdout.split('\n');
        return callback(null, result[0]);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!");
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
function deParseListFile(output, filepath, callback) {
  fs.readFile(filepath, function(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    data = data.toString();
    var data_ = data.split('\n');
    data_.shift();
    for (var i = 0; i < data_.length; i++) {
      var item = data_[i];
      if (item !== '') {
        item = item.split('/');
        var entry_fir = item[0];
        var content_fir = item[1];
        content_fir = content_fir.split('=');
        var entry_sec = content_fir[0];
        var content_sec = content_fir[1];
        content_sec = content_sec.split(';');
        if (content_sec[content_sec.length - 1] == '') {
          content_sec.pop();
        }
        if (!output[entry_fir]) {
          output[entry_fir] = {};
          output[entry_fir][entry_sec] = content_sec;
        } else if (!output[entry_fir][entry_sec]) {
          output[entry_fir][entry_sec] = content_sec;
        } else {
          for (var j = 0; j < content_sec.length; j++) {
            var content_sec_ = content_sec[j];
            if (!utils.isExist(content_sec_, output[entry_fir][entry_sec])) {
              output[entry_fir][entry_sec].push(content_sec_);
            }
          }
        }
      }
    }
    callback();
  })
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
function buildAppMethodInfo(targetFile, callback) {
  utils.findFilesFromSystem(targetFile, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    }
    if (result[result.length - 1] == '') {
      result.pop();
    }
    var result_ = {};
    var lens = result.length;
    var count = 0;
    var reg = /\/.resources\//g;
    for (var i = 0; i < lens; i++) {
      var item = result[i];
      if (!reg.test(item)) {
        (function(listContent, filepath) {
          deParseListFile(listContent, filepath, function() {
            var isEnd = (count === lens - 1);
            if (isEnd) {
              console.log(result);
              var outPutPath = pathModule.join(REAL_APP_DIR, targetFile);
              var sListContent = JSON.stringify(listContent, null, 4);
              fs.writeFile(outPutPath, sListContent, function(err) {
                if (err) {
                  console.log(err);
                  return callback(err, null);
                }
                callback(null, 'success');
              })
            }
            count++;
          })
        })(result_, item);
      } else {
        count++;
      }
    }
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
function findAllDesktopFiles(callback) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var systemType = os.type();
  if (systemType === "Linux") {
    var xdgDataDir = [];
    var sAllDesktop = "";
    var sTarget = '*.desktop';
    var sBoundary = "'/usr/share/applications|/usr/local/share/applications'";
    var sLimits = ' | egrep ' + sBoundary
    var sCommand = 'locate ' + sTarget + sLimits;
    console.log('runnnnnnnnnnnnnnn: ' + sCommand)
    var optional = {
      maxBuffer: 1000 * 1024
    };
    exec(sCommand, function(err, stdout, stderr) {
      if (err) {
        console.log(stderr);
        console.log(err, stdout, stderr);
        return callback(err, null);
      }
      //stdout = stdout.split('\n')
      console.log(stdout)
      callback(null, stdout);
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}
exports.findAllDesktopFiles = findAllDesktopFiles;

function buildLocalDesktopFile(callback) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  findAllDesktopFiles(function(err, result) {
    if (err) {
      console.log(err);
      return;
    }
    var oFiles = result.split('\n');
    var count = 0;
    var lens = oFiles.length;
    var oRealFiles = [];
    var oDesFiles = [];
    for (var i = 0; i < lens; i++) {
      var sFileOriginPath = oFiles[i];
      (function(_sFileOriginPath) {
        if (_sFileOriginPath !== '') {
          var sFileName = pathModule.basename(_sFileOriginPath, '.desktop');
          var newPath = pathModule.join(REAL_APP_DIR, sFileName + '.desktop');
          fs_extra.copy(_sFileOriginPath, newPath, function(err) {
            if (err) {
              console.log(sFileName + ', file copy error!');
              count++;
            } else {
              oRealFiles.push(newPath);
              oDesFiles.push(newPath.replace(/\/desktop\//, '/desktopDes/') + '.md')
              buildDesFile(sFileName, 'desktop', newPath, function() {
                var isEnd = (count === lens - 1);
                if (isEnd) {
                  /*TODO: some desktop files are links, so git won't touch them. Needs to be done */
                  // resourceRepo.repoCommitBoth('add', REAL_REPO_DIR, DES_REPO_DIR, oRealFiles, oDesFiles, function(err, result) {
                  //   if (err) {
                  //     console.log('git commit error!');
                  //     return;
                  //   }
                  callback();
                  //})
                }
                count++;
              })
            }
          })
        } else {
          count++;
        }
      })(sFileOriginPath)
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
        callback(err, null);
      } else {
        var sPath = result_find;

        function parseDesktopFileCb(err, attr) {
          if (err) {
            console.log(err);
            var _err = "writeDesktopFile : parse desktop file error!";
            callback(_err, null);
          } else {
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
                callback(_err, null);
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
                callback(_err, null);
              } else {
                var sWritePath = result_find;
                console.log(sWritePath);
                fs.writeFile(sWritePath, result_deparse, function(err) {
                  if (err) {
                    console.log(err);
                    var _err = "writeDesktopFile : write desktop file error!";
                    callback(_err, null);
                  } else {
                    var op = 'modify';
                    var re = new RegExp('/desktop/');
                    var desFilePath = sWritePath.replace(re, '/desktopDes/') + '.md';
                    updateDesFile(op, desFilePath, function() {
                      if (err) {
                        console.log('update ' + sFileName + ' des file error!\n', err);
                        callback(err, null);
                      } else {
                        resourceRepo.repoCommitBoth('ch', REAL_REPO_DIR, DES_REPO_DIR, [sWritePath], [desFilePath], function(err, result) {
                          if (err) {
                            return callback(err, null);
                          }
                          console.log("write file success!");
                          callback(null, "success");
                        })
                      }
                    });
                  }
                });
              }
            }
            deParseDesktopFile(deParseDesktopFileCb, attr);
          }
        }
        parseDesktopFile(parseDesktopFileCb, sPath);
      }
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
function getAllDesktopFile(callback) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var systemType = os.type();
  if (systemType === "Linux") {
    var xdgDataDir = [];
    var sAllDesktop = "";
    var sTarget = process.env["HOME"] + "/.resources/desktop/data/applications";
    var sBoundary = '.desktop';
    var sLimits = ' | grep ' + sBoundary;
    var sCommand = 'ls ' + sTarget + sLimits;
    console.log('runnnnnnnnnnnnnnn: ' + sCommand)
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

//COPY from /WORK_DIRECTORY/app/demo-webde/nw/js/common.js by guanyu
//modified by xiquan
//Base Class for every class in this project!!
//
function Class() {}

//COPY from /WORK_DIRECTORY/app/demo-webde/nw/js/common.js by guanyu
//modified by xiquan
//Use extend to realize inhrietion
//
Class.extend = function extend(props) {
  var prototype = new this();
  var _super = this.prototype;

  for (var name in props) {
    //if a function of subclass has the same name with super
    //override it, not overwrite
    //use this.callSuper to call the super's function
    //
    if (typeof props[name] == "function" && typeof _super[name] == "function") {
      prototype[name] = (function(super_fn, fn) {
        return function() {
          var tmp = this.callSuper;
          this.callSuper = super_fn;

          var ret = fn.apply(this, arguments);

          this.callSuper = tmp;

          if (!this.callSuper) {
            delete this.callSuper;
          }

          return ret;
        }
      })(_super[name], props[name])
    } else {
      prototype[name] = props[name];
    }
  }

  var SubClass = function() {};

  SubClass.prototype = prototype;
  SubClass.prototype.constructor = SubClass;

  SubClass.extend = extend;
  //Use create to replace new
  //we need give our own init function to do some initialization
  //
  SubClass.create = SubClass.prototype.create = function() {
    var instance = new this();

    if (instance.init) {
      instance.init.apply(instance, arguments);
    }

    return instance;
  }

  return SubClass;
}

//COPY from /WORK_DIRECTORY/app/demo-webde/nw/js/common.js by guanyu
//modified by xiquan
//Event base Class
//Inherited from Node.js' EventEmitter
//
var Event = Class.extend(require('events').EventEmitter.prototype);

//COPY from /WORK_DIRECTORY/app/demo-webde/nw/js/common.js by guanyu
//modified by xiquan
//watch  dir :Default is desktop
//dir_: dir is watched 
// ignoreInitial_:
var DirWatcher = Event.extend({
  init: function(dir_, ignore_, callback) {
    if (typeof dir_ == 'undefined' || dir_ == "") {
      dir_ = '/data/desktop';
    };
    this._prev = 0;
    this._watchDir = dir_;
    this._oldName = null;
    this._watcher = null;
    this._evQueue = [];
    this._timer = null;
    this._ignore = ignore_ || /\.goutputstream/;

    this._fs = fs;
    this._chokidar = chokidar;
    this._exec = require('child_process').exec;

    var _this = this;
    this._exec('echo $HOME', function(err, stdout, stderr) {
      if (err) {
        var _err = 'CreatWatcher : echo $HOME error!';
        console.log(_err);
        callback(_err);
      } else {
        var _dir = config.RESOURCEPATH + '/desktop' + _this._watchDir;
        _this._fs.readdir(_dir, function(err, files) {
          if (err) {
            console.log("readdir error!")
            console.log(err);
            var _err = 'CreatWatcher : readdir error!';
            callback(_err);
          } else {
            for (var i = 0; i < files.length; ++i) {
              _this._prev++;
            }
            var optional = {
              ignored: _this._ignore,
              ignoreInitial: true
            }

            _this._watcher = _this._chokidar.watch(_dir, optional);
            var evHandler = function() {
              _this._watcher.on('add', function(path) {
                console.log('add', path);
                _this._evQueue.push(path);
              });
              _this._watcher.on('unlink', function(path) {
                console.log('unlink', path);
                _this._evQueue.push(path);
              });
              _this._watcher.on('change', function(path, stats) {
                console.log('change', path, stats);
              });
              _this._watcher.on('addDir', function(path) {
                console.log('addDir', path);
                _this._evQueue.push(path);
              });
              _this._watcher.on('unlinkDir', function(path) {
                console.log('unlinkDir', path);
                _this._evQueue.push(path);
              });
              _this._watcher.on('error', function(err) {
                console.log('watch error', err);
                var _err = 'CreatWatcher : watch error!';
                _this.emit('error', _err);
              });
            };
            evHandler();
            var evDistributor = function() {
              var filepath = _this._evQueue.shift();
              _this._fs.readdir(_dir, function(err, files) {
                var cur = 0;
                for (var i = 0; i < files.length; ++i) {
                  cur++;
                }
                if (_this._prev < cur) {
                  _this._fs.stat(filepath, function(err, stats) {
                    _this.emit('add', filepath, stats);
                  });
                  _this._prev++;
                } else if (_this._prev > cur) {
                  _this.emit('delete', filepath);
                  _this._prev--;
                } else {
                  if (_this._oldName == null) {
                    _this._oldName = filepath;
                    return;
                  }
                  if (_this._oldName == filepath) {
                    return;
                  }
                  _this.emit('rename', _this._oldName, filepath);
                  _this._oldName = null;
                }
                if (_this._evQueue.length != 0) evDistributor();
              });
            }
            _this._timer = setInterval(function() {
              if (_this._evQueue.length != 0) {
                evDistributor();
              }
            }, 200);
            callback();
          }
        });
      }
    });
  },

  //get dir 
  getBaseDir: function() {
    return REAL_REPO_DIR + this._watchDir;
  },

  //close watch()
  close: function() {
    this._watcher.close();
    clearInterval(this._timer);
  }
});


/** 
 * @Method: CreateWatcher
 *    To create a wacther with a dir. This wacther would listen on 3 type of ev-
 *    -ent:
 *      'add'   : a new file or dir is added;
 *      'delete': a file or dir is deleted;
 *      'rename': a file is renamed;
 *      'error' : something wrong with event.
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error   : "CreateWatcher : echo $HOME error!"
 *                read error   : "CreateWatcher : readdir error!"
 *
 *                A watcher on linstening would catch this type of err:
 *                _watcher.on('error',function(err){});
 *                watch error  :'CreateWatcher : watch error!'
 *
 * @param2: watchDir
 *    string, a dir under user path
 *    exmple: var watchDir = '=/desktop/desktopadwd'
 *    (compare with a full path: '/home/xiquan/.resources/desktop/desktopadwd')
 *
 *
 **/
function CreateWatcher(callback, watchDir) {
  var _watcher = DirWatcher.create(watchDir, null, function(err) {
    if (err) {
      console.log('create Watcher failed!')
      console.log(err);
      callback(err, null);
    } else {
      console.log('create Watcher success!');
      callback(null, _watcher);
    }
  });
}
exports.CreateWatcher = CreateWatcher;


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
 * @Method: copyFile
 *    To copy a file or dir from oldPath to newPath.
 *    !!!The dir CAN have content,just like command cp -r.!!!
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                echo error : 'copyFile : echo $HOME error'
 *                copy error : 'copyFile : copy error'
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 * @param2: oldPath
 *    string, a dir under user path
 *    exmple: var oldPath = '/.resources/desktop/Theme.conf'
 *    (compare with a full path: '/home/xiquan/.resources/desktop/Theme.conf')
 *
 * @param3: newPath
 *    string, a dir under user path
 *    exmple: var newPath = '/.resources/desktop/BadTheme.conf'
 *    (compare with a full path: '/home/xiquan/.resources/desktop/BadTheme.conf')
 *
 **/
function copyFile(callback, oldPath, newPath) {
  var oldFullpath = configPath + oldPath;
  var newFullpath = configPath + newPath;
  console.log(oldFullpath, newFullpath);
  fs_extra.copy(oldFullpath, newFullpath, function(err) {
    if (err) {
      console.log(err);
      var _err = 'copyFile : copy error';
      callback(_err, null);
    } else {
      console.log('copy file success!');
      callback(null, 'success');
    }
  })
}
exports.copyFile = copyFile;

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
            console.log('rename desktop file success!');
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
 * @Method: dragToDesktop
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
 *        string, the path of target after load into local db.
 *
 **/
function dragToDesktopSingle(sFilePath, callback) {
  if (!sFilePath || sFilePath == '') {
    var _err = 'Error: bad sFilePath!';
    console.log(_err);
    return callback(_err, null);
  }
  var reg_isLocal = /\/[a-z]+\/[a-z]+\/.resources\/[a-z]+\/data\//gi;
  var category = utils.getCategoryByPath(sFilePath).category;
  if (reg_isLocal.test(sFilePath)) { //target file is from local
    var sCondition = ["path = '" + sFilePath + "'"];
    commonDAO.findItems(null, [category], sCondition, null, function(result) {
      if (result === "error") {
        var _err = "Error: find " + sFilePath + " in db error!"
        return callback(_err, null);
      }
      var item = result[0];
      var oTags = result.others.split(',');
      if (utils.isExist('$desktop$', oTags)) {
        console.log('Oh,Sorry, ' + sFilePath + ' Exists on desktop!');
        return callback(null, 'exist');
      }

      function setTagsCb(result) {
        if (result != 'commit') {
          var _err = 'Error: set tags error!';
          console.log(_err);
          return callback(_err, null);
        }
        callback(null, sFilePath);
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
        var _err = result + ': File Name Exists! Please Change it!';
        console.log(_err);
        return callback(_err, null);
        /*TODO: To be continue: when name exists, we need rename function */
        console.log('target name is aready exist in db', result);
        var data = new Date();
        var surfix = 'duplicate_at_' + data.toLocaleString().replace(' ', '_') + '_';
        var sNewName = surfix + result;
        var sNewFilePath = pathModule.join(pathModule.dirname(sFilePath), sNewName);
        fs_extra.copy(sFilePath, sNewFilePath, function(err) {
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
              console.log('drag', sNewFilePath, ' success!');
              callback(null, result);
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
          callback(null, result);
        })
      }
    })
  }
}
exports.dragToDesktopSingle = dragToDesktopSingle;

/*TODO: sqlite bug, not complete*/
/** 
 * @Method: dragToDesktopCb
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
function dragToDesktop(oFilePath, callback) {
  var count = 0;
  var lens = oFilePath.length;
  var resultFiles = [];
  for (var i = 0; i < lens; i++) {
    var item = oFilePath[i];
    (function(_filePath) {
      dragToDesktopSingle(_filePath, function(err, result) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        resultFiles.push(result);
        var isEnd = (count === lens - 1);
        if (isEnd) {
          console.log('drag files success!');
          callback(null, resultFiles);
        }
        count++;
      })
    })(item);
  };
}
exports.dragToDesktop = dragToDesktop;

function doCreateData(sFilePath, category, callback) {
  var cate = utils.getCategoryObject(category);
  cate.createData(sFilePath, function(err, result, resultFile) {
    if (err) {
      console.log(err, resultFile, result);
      return callback(err, null);
    }
    var sCondition = ["path = '" + resultFile + "'"];
    commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
      if (err) {
        var _err = "Error: find " + sFilePath + " in db error!";
        return callback(_err, null);
      }
      var item = result[0];

      function setTagsCb(result) {
        if (result != 'commit') {
          var _err = 'Error: set tags error!';
          console.log(_err);
          return callback(_err, null);
        }
        callback(null, resultFile);
      }
      var sUri = item.URI;
      tagsHandle.setTagByUri(setTagsCb, ['$desktop$'], sUri);
    })
  });
}

/** 
 * @Method: removeFile
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
    cate.removeByUri(sUri, function(err) {
      if (err) {
        console.log('removeByUri error', err);
        return callback(err, null);
      }
      console.log('remove file success!');
      callback(null, 'success');
    })
  })
}
exports.removeFileFromDB = removeFileFromDB;

/** 
 * @Method: removeFile
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
function removeFileFromDesk(sFilePath, callback) {
  var category = utils.getCategoryByPath(sFilePath).category;
  var cate = utils.getCategoryObject(category);
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
    //cate.
  })
}
exports.removeFileFromDB = removeFileFromDB;

function getFilesFromDesk() {

}
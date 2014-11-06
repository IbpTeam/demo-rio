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
var path = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var dataDes = require("../commonHandle/desFilesHandle");
var commonHandle = require("../commonHandle/commonHandle");
var resourceRepo = require("../commonHandle/repo");
var util = require('util');
var events = require('events');
var uniqueID = require("../uniqueID");
var chokidar = require('chokidar');
var exec = require('child_process').exec;
var configPath = config.RESOURCEPATH + "/desktop";

function newInit(initType) {
  var initTheme = {
    name: null,
    active: null,
    icon: null,
    path: null,
    id: null,
    pos: {
      x: null,
      y: null
    }
  }
  var initWidget = {
    id: null,
    path: null,
    position: {
      x: null,
      y: null
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
    _icontheme.active = true;
    _icontheme.path = '$HOME';
    _icontheme.id = 'computer';

    var _computer = newInit(initType);
    _computer.name = 'Computer';
    _computer.active = false;

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

    return result;
  } else if (initType === "widget") {

    var result = {
      cat: newInit(initType),
      book: newInit(initType),
      boat: newInit(initType),
      book1: newInit(initType),
      totem_dock: newInit(initType),
      firefox_dock: newInit(initType)
    }
    return result;
  }

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
    var path = configPath + '/data';
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
        var tmpWidget = getnit("widget");
        var pathWidget = path + "/Widget.conf";
        var sItemWidget = JSON.stringify(tmpWidget, null, 4);
        fs_extra.outputFile(pathWidget, sItemWidget, function(err) {
          if (err) {
            console.log("init Widget config file error!");
            console.log(err);
            return;
          }
          var pathDesk = path + "/desktop";
          fs_extra.ensureDir(pathDesk, function(err) {
            if (err) {
              console.log("init desktop config file error!");
              console.log(err);
              return;
            }
            var pathDock = path + "/dock";
            fs_extra.ensureDir(pathDock, function(err) {
              if (err) {
                console.log("init dock config file error!");
                console.log(err);
                return;
              }
              var pathApp = path + "/applications";
              fs_extra.ensureDir(pathApp, function(err) {
                if (err) {
                  console.log("init application config file error!");
                  console.log(err);
                  return;
                }

                function buildLocalDesktopFileCb(result) {
                  if (result === "success") {
                    callback("success");
                  } else {
                    console.log("build desktop error");
                    return;
                  }
                }
                buildLocalDesktopFile(buildLocalDesktopFileCb);
              });
            });
          });
        });
      });
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}
exports.initDesktop = initDesktop;

/** 
 * @Method: buildHelper
 *    only help buildLocalDesktopFile() to combine specif param, in order to
 *    make it have correct param in a loop
 *
 **/
function buildHelper(callback, sAppPath, sOriginPath, isEnd) {
  if (sOriginPath === "") {
    console.log("error : path is empty!");
    return;
  } else {
    function fsCopyCb(err) {
      if (err) {
        console.log(err);
        console.log(sOriginPath)
        return;
      }
      if (isEnd) {
        console.log('build local desktop file ends');
        callback("success");
      }
    }
    fs_extra.copy(sOriginPath, sAppPath + sOriginPath, fsCopyCb);
  }
}

/** 
 * @Method: buildLocalDesktopFile
 *    copy all .desktop file into local /.desktop for maintainace
 *
 * @param: callback
 *    @result
 *        string, retrive 'success' when success
 *
 **/
function buildLocalDesktopFile(callback) {
  if (typeof callback !== 'function')
    throw 'Bad type of callback!!';
  console.log("==== start building local desktop files! ====");
  var sAppPath = configPath + '/data/applications';
  var tag = 0;

  function findAllDesktopFilesCb(oAllDesktopFiles) {
    for (var i = 0; i < oAllDesktopFiles.length; i++) {
      var sOriginPath = oAllDesktopFiles[i];
      var isEnd = (tag == oAllDesktopFiles.length - 1);
      buildHelper(callback, sAppPath, sOriginPath, isEnd);
      tag++;
    }
  }
  findAllDesktopFiles(findAllDesktopFilesCb);
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
 *                read error  : "readThemeConf : read Theme config file error!"
 *
 *    @param2: result,
 *        object, the result in object
 *
 *    object example:
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
function readThemeConf(callback) {
  var systemType = os.type();
  if (systemType === "Linux") {
    var ThemeConfPath = configPath + "/data/Theme.conf";
    fs.readFile(ThemeConfPath, 'utf8', function(err, data) {
      if (err) {
        console.log("read Theme config file error!");
        console.log(err);
        var _err = "readThemeConf : read Theme config file error!";
        callback(_err, null);
      } else {
        var json = JSON.parse(data);
        callback(null, json);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}
exports.readThemeConf = readThemeConf;



/** 
 * @Method: writeThemeConf
 *    modify file Theme.conf
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "writeThemeConf : read Theme.conf error!"
 *                write error : "writeThemeConf : write Theme config file error!"
 *
 *    @param2: result,
 *        string, retrieve success when success
 *
 * @param: oTheme
 *    object, only content that needs to be modified
 *
 *    oThem example:
 *    var oTheme =
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
 *
 **/
function writeThemeConf(callback, oTheme) {
  var systemType = os.type();
  if (systemType === "Linux") {
    var ThemeConfPath = configPath + "/data/Theme.conf";
    var itemDesPath = config.RESOURCEPATH + "Des";
    fs.readFile(ThemeConfPath, 'utf-8', function(err, data) {
      if (err) {
        console.log(err);
        var _err = "writeThemeConf : read Theme.conf error!";
        callback(_err, null);
      }
      var oData = JSON.parse(data);
      for (var k in oTheme) {
        oData[k] = oTheme[k];
      }
      var sThemeModified = JSON.stringify(oData, null, 4);
      fs.writeFile(ThemeConfPath, sThemeModified, function(err) {
        if (err) {
          console.log("write Theme config file error!");
          console.log(err);
          var _err = "writeThemeConf : write Theme config file error!";
          callback(_err, null);
        } else {
          var currentTime = (new Date());
          config.riolog("time: " + currentTime);
          var attrs = {
            lastAccessTime: currentTime,
            lastModifyTime: currentTime,
            lastAccessDev: config.uniqueID
          }
          var chItem = ThemeConfPath;
          //var itemDesPath = path.replace(/\/resources\//, '/resources/.des/');
          // dataDes.updateItem(chItem, attrs, itemDesPath, function() {
          callback(null, "success");
          // });
        }
      });
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}
exports.writeThemeConf = writeThemeConf;

/** 
 * @Method: readWidgetConf
 *    read file Widget.conf
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "readWidgetConf : read Theme config file error!"
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
function readWidgetConf(callback) {
  var systemType = os.type();
  if (systemType === "Linux") {
    var WidgetConfPath = configPath + "/data/Widget.conf";
    fs.readFile(WidgetConfPath, 'utf8', function(err, data) {
      if (err) {
        console.log("read Theme config file error!");
        console.log(err);
        var _err = "readWidgetConf : read Theme config file error!";
        callback(_err, null);
      } else {
        var oJson = JSON.parse(data);
        callback(null, oJson);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!")
  }

}
exports.readWidgetConf = readWidgetConf;

/** 
 * @Method: writeThemeConf
 *    modify file Theme.conf
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "writeWidgetConf : read Widget.conf error!"
 *                write error : "writeWidgetConf : write Widget config file error!"
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
function writeWidgetConf(callback, oWidget) {
  var systemType = os.type();
  if (systemType === "Linux") {
    var sWidgetConfPath = configPath + "/data/Widget.conf";
    var sPath = configPath;
    fs.readFile(sWidgetConfPath, 'utf-8', function(err, data) {
      if (err) {
        console.log(err);
        var _err = "writeWidgetConf : read Widget.conf error!";
        callback(_err, null);
      }
      var oData = JSON.parse(data);
      for (var k in oWidget) {
        oData[k] = oWidget[k];
      }
      var sWidgetModfied = JSON.stringify(oData, null, 4);
      fs.writeFile(sWidgetConfPath, sWidgetModfied, function(err) {
        if (err) {
          console.log("write Widget config file error!");
          console.log(err);
          var _err = "writeWidgetConf : write Widget config file error!";
          callback(_err, null);
        } else {
          var currentTime = (new Date());
          config.riolog("time: " + currentTime);
          var attrs = {
              lastAccessTime: currentTime,
              lastModifyTime: currentTime,
              lastAccessDev: config.uniqueID
            }
            //var chItem = sWidgetConfPath;
            //var itemDesPath = sPath.replace(/\/resources\//, '/resources/.des/');
            // dataDes.updateItem(chItem, attrs, itemDesPath, function() {
               callback(null, "success");
            // });
        }
      });
    })
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}
exports.writeWidgetConf = writeWidgetConf;

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
 *    {
 *      Type: Application
 *      Name: Cinnamon
 *      Comment: Window management and application launching
 *      Exec: /usr/bin / cinnamon - launcher
 *      X - GNOME - Bugzilla - Bugzilla: GNOME
 *      X - GNOME - Bugzilla - Product: cinnamon
 *      X - GNOME - Bugzilla - Component: general
 *      X - GNOME - Bugzilla - Version: 1.8.8
 *      Categories: GNOME;GTK;System;Core;
 *      OnlyShowIn: GNOME;
 *      NoDisplay: true
 *      X - GNOME - Autostart - Phase: WindowManager
 *      X - GNOME - Provides: panel;windowmanager;
 *      X - GNOME - Autostart - Notify: true
 *      X - GNOME - AutoRestart: true
 *    }
 *
 * @param2: sFileName
 *    string,name of target file ,suffix is not required
 *    example: var sFileName = 'cinnamon';
 *
 **/
function readDesktopFile(callback, sFileName) {
  var systemType = os.type();
  if (systemType === "Linux") {
    function findDesktopFileCb(result) {
      if (result === "Not found" || result === "") {
        console.log("desktop file NOT FOUND!");
        var _err = "readDesktopFile : desktop file NOT FOUND!";
        callback(_err, null);
      } else {
        function parseDesktopFileCb(err, attr) {
          if (err) {
            console.log(err);
            var _err = "readDesktopFile : parse desktop file error!";
            callback(_err, null);
          } else {
            console.log("readDesktopFile success!");
            callback(null, attr);
          }
        }
        var sPath = result;
        parseDesktopFile(parseDesktopFileCb, sPath);
      }
    }
    var sFullName = sFileName + ".desktop";
    findDesktopFile(findDesktopFileCb, sFullName)
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}
exports.readDesktopFile = readDesktopFile;

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
        console.log("read desktop file error");
        console.log(err);
        var _err = "parseDesktopFile : read desktop file error";
        callback(_err, null);
      } else {
        var re = /[\[]{1}[a-z, ,A-Z]*\]{1}\n/g; //match all string like [***]
        var desktopHeads = [];
        var oAllDesktop = {};
        data = data.replace(re, function() {
          var headEntry = (RegExp.lastMatch).toString();
          headEntry = headEntry.replace(/\n/g, "");
          desktopHeads.push(headEntry); //once get a match, strore it
          return "$";
        })
        data = data.split('$');
        if (data[0] === "") {
          data.shift(); //the first element is a "", remove it
        }
        if (desktopHeads.length === data.length) {
          for (var i = 0; i < data.length; i++) {
            var lines = data[i].split('\n');
            var attr = {};
            for (var j = 0; j < lines.length - 1; ++j) {
              if (lines[j] !== "") {
                var tmp = lines[j].split('=');
                attr[tmp[0]] = tmp[1];
                for (var k = 2; k < tmp.length; k++) {
                  attr[tmp[0]] += '=' + tmp[k];
                }
              }
            }
            oAllDesktop[desktopHeads[i]] = attr;
          }
        } else {
          console.log("desktop file entries not match!");
          var _err = "parseDesktopFile : desktop file entries not match!";
          callback(_err, null);
        }
        console.log("Get desktop file success!");
        callback(null, oAllDesktop);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!")
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
 *    string, a file name
 *    exmple: var sFileName = 'cinnamon.desktop';
 *
 **/
function findDesktopFile(callback, sFileName) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var systemType = os.type();
  if (systemType === "Linux") {
    var xdgDataDir = [];
    var sBoundary = configPath + '/data/applications -name ';
    var sCommand = 'find ' + sBoundary + sFileName;
    exec(sCommand, function(err, stdout, stderr) {
      if (err) {
        console.log(stderr);
        console.log(err);
        return;
      }
      if (stdout == '') {
        console.log('Not Found!');
        callback("Not found");
      } else {
        var result = stdout.split('\n');
        callback(result[0]);
      }
    })
  } else {
    console.log("Not a linux system! Not supported now!");
  }
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
    exec('echo $XDG_DATA_DIRS', function(err, stdout, stderr) {
      if (err) {
        console.log(stderr)
        console.log(err);
        return;
      } else {
        xdgDataDir = stdout.substr(0, stdout.length - 1).split(':');
        for (var i = 0; i < xdgDataDir.length; ++i) {
          xdgDataDir[i] = xdgDataDir[i].replace(/[\/]$/, '');
        }
        console.log(xdgDataDir);

        function tryInThisPath(callback, index) {
          if (index == xdgDataDir.length) {
            var oAllDesktop = sAllDesktop.split('\n');
            oAllDesktop.pop();
            callback(oAllDesktop);
          } else {
            var sTarget = '*.desktop';
            var sBoundary = xdgDataDir[index] + ' -name ';
            var sCommand = 'sudo find ' + sBoundary + sTarget;
            var optional = {
              maxBuffer: 1000 * 1024
            };
            exec(sCommand, function(err, stdout, stderr) {
              if (err) {
                console.log(stderr);
                console.log(err);
                return;
              }
              sAllDesktop = sAllDesktop + stdout;
              tryInThisPath(callback, index + 1);
            })
          }
        };
        tryInThisPath(callback, 0);
      }
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}
exports.findAllDesktopFiles = findAllDesktopFiles;


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
    function findDesktopFileCb(result_find) {
      if (result_find === "Not found" || result_find === "") {
        console.log("desktop file NOT FOUND!");
        var _err = "writeDesktopFile : desktop file NOT FOUND!";
        callback(_err, null);
      } else {
        function parseDesktopFileCb(err, attr) {
          if (err) {
            console.log(err);
            var _err = "writeDesktopFile : parse desktop file error!";
            callback(_err, null);
          } else {
            for (var entry in oEntries) {
              if (oEntries[entry]) {
                for (var element in oEntries[entry]) {
                  attr[entry][element] = oEntries[entry][element];
                }
                //attr[entry] = oEntries[entry];
              } else {
                console.log("entry content empty!");
                var _err = "writeDesktopFile : entry content empty!";
                callback(_err, null);
              }
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
                    console.log("write file success!");
                    callback(null, "success");
                  }
                })
              }
            }
            deParseDesktopFile(deParseDesktopFileCb, attr);
          }
        }
        var sPath = result_find;
        parseDesktopFile(parseDesktopFileCb, sPath);
      }
    }
    var sFullName = sFileName + ".desktop";
    findDesktopFile(findDesktopFileCb, sFullName)
  } else {
    console.log("Not a linux system! Not supported now!");
  }
}
exports.writeDesktopFile = writeDesktopFile;

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
    return this._baseDir + this._watchDir;
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
 *    exmple: var oldPath = '/.resources/DesktopConf/Theme.conf'
 *    (compare with a full path: '/home/xiquan/.resources/DesktopConf/Theme.conf')
 *
 * @param3: newPath
 *    string, a dir under user path
 *    exmple: var newPath = '/.resources/DesktopConf/BadTheme.conf'
 *    (compare with a full path: '/home/xiquan/.resources/DesktopConf/BadTheme.conf')
 *
 **/
function moveFile(callback, oldPath, newPath) {
  var oldFullpath = configPath + oldPath;
  var newFullpath = configPath + newPath;
  console.log(oldFullpath, newFullpath);
  fs_extra.move(oldFullpath, newFullpath, function(err) {
    if (err) {
      console.log(err);
      var _err = 'moveFile : move error';
      callback(_err, null);
    } else {
      console.log('move file success!');
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
 *    exmple: var oldName = 'exampleName'
 *
 * @param3: newName
 *    string, a new name that you want to set
 *    example: var newName = 'newName'
 *
 **/
function renameDesktopFile(callback, oldName, newName) {
  var sFilename = oldName;
  var oEntries = {
    '[Desktop Entry]': {
      'Name': newName
    }
  }

  function writeDesktopFileCb(err, result) {
    if (err) {
      console.log(err);
      var _err = 'renameDesktopFile: ' + err;
      callback(_err);
    } else {
      console.log('rename desktop file success!');
      callback(null, result);
    }
  }
  writeDesktopFile(writeDesktopFileCb, sFilename, oEntries);
}
exports.renameDesktopFile = renameDesktopFile;
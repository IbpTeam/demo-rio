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
var os = require('os');
var config = require("../config");
var dataDes = require("../FilesHandle/desFilesHandle");
var resourceRepo = require("../FilesHandle/repo");
var util = require('util');
var events = require('events');
var uniqueID = require("../uniqueID");
var fs_extra = require('fs-extra');


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
 * @Method: initConf
 *    init desktop config dir & files. Those files are all maintained in /.desktop
 *    including Theme.comf, Widget.conf, and all .desktop files.
 *
 * @param: callback
 *        @result
 *            string, retrieve 'success' when success
 *
 **/
function initConf(callback) {
  var systemType = os.type();
  if (systemType === "Linux") {
    var path = config.RESOURCEPATH + "/.desktop";
    fs.mkdir(path, function(err) {
      if (err) {
        console.log(err);
        return;
      }
      var tmpThemw = getnit("theme");
      var pathTheme = path + "/Theme.conf";
      var sItemTheme = JSON.stringify(tmpThemw, null, 4);
      fs.writeFile(pathTheme, sItemTheme, function(err) {
        if (err) {
          console.log("init Theme config file error!");
          console.log(err);
          return;
        }
        var tmpWidget = getnit("widget");
        var pathWidget = path + "/Widget.conf";
        var sItemWidget = JSON.stringify(tmpWidget, null, 4);
        fs.writeFile(pathWidget, sItemWidget, function(err) {
          if (err) {
            console.log("init Widget config file error!");
            console.log(err);
            return;
          }
          var pathDesk = path + "/desktop";
          fs.mkdir(pathDesk, function(err) {
            if (err) {
              console.log("init desktop config file error!");
              console.log(err);
              return;
            }
            var pathDock = path + "/dock";
            fs.mkdir(pathDock, function(err) {
              if (err) {
                console.log("init dock config file error!");
                console.log(err);
                return;
              }
              var pathApp = path + "/applications";
              fs.mkdir(pathApp, function(err) {
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
  var sAppPath = config.RESOURCEPATH + '/.desktop/applications';
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
 *        string, contain error info
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
    var ThemeConfPath = config.RESOURCEPATH + "/.desktop/Theme.conf";
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
 *        string, contain error info
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
    var ThemeConfPath = config.RESOURCEPATH + "/.desktop/Theme.conf";
    var path = config.RESOURCEPATH + "/.desktop";
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
          var itemDesPath = path.replace(/\/resources\//, '/resources/.des/');
          dataDes.updateItem(chItem, attrs, itemDesPath, function() {
            callback(null, "success");
          });
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
 *        string, contain error info
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
    var WidgetConfPath = config.RESOURCEPATH + "/.desktop/Widget.conf";
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
 *        string, contain error info
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
    var WidgetConfPath = config.RESOURCEPATH + "/.desktop/Widget.conf";
    var path = config.RESOURCEPATH + "/.desktop";
    fs.readFile(WidgetConfPath, 'utf-8', function(err, data) {
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
      fs.writeFile(WidgetConfPath, sWidgetModfied, function(err) {
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
          var chItem = WidgetConfPath;
          var itemDesPath = path.replace(/\/resources\//, '/resources/.des/');
          dataDes.updateItem(chItem, attrs, itemDesPath, function() {
            callback(null, "success");
          });
        }
      });
    })
  } else {
    console.log("Not a linux system! Not supported now!")
  }

}
exports.writeWidgetConf = writeWidgetConf;

/** 
 * @Method: readDesktopFile
 *   find a desktop file with name of sFilename
 *
 * @param1: callback
 *    @result
 *        object
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
      if (result === "Not found" || result == "") {
        console.log("desktop file NOT FOUND!");
        var _err = "readDesktopFile : desktop file NOT FOUND!"
        callback(_err, null);
      } else {
        function parseDesktopFileCb(err, attr) {
          if (err) {
            console.log(err);
            var _err = "readDesktopFile : parse desktop file error!"
            callback(_err, null);
          } else {
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
    console.log("Not a linux system! Not supported now!")
  }

}
exports.readDesktopFile = readDesktopFile;

/** 
 * @Method: parseDesktopFile
 *    parse Desktop File into json object
 *
 * @param1: sPath
 *    string, taget .desktop file path
 *            as: '/usr/share/applications/cinnamon.desktop'
 *
 * @param2: callback
 *    @result
 *        object
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
        callback(_err,null);
      } else {
        var re = /[\[]{1}[a-z, ,A-Z]*\]{1}\n/g; //match all string like [Desktop Entry]
        var desktopHeads = [];
        var oAllDesktop = {};
        data = data.replace(re, function() {
          var headEntry = (RegExp.lastMatch).toString();
          headEntry = headEntry.replace(/\n/g, "");
          desktopHeads.push(headEntry);
          return "$";
        })
        data = data.split('$');
        data.shift();
        if (desktopHeads.length === data.length) {
          for (var i = 0; i < data.length; i++) {
            var lines = data[i].split('\n');
            var attr = {};
            for (var j = 0; j < lines.length - 1; ++j) {
              var tmp = lines[j].split('=');
              attr[tmp[0]] = tmp[1];
              for (var k = 2; k < tmp.length; k++) {
                attr[tmp[0]] += '=' + tmp[k];
              }
            }
            oAllDesktop[desktopHeads[i]] = attr;
          }
        }else{
          console.log("desktop file entries not match!");
          var _err = "parseDesktopFile : desktop file entries not match!";
          callback(_err,null);
        }
        console.log("Get desktop file success!");
        callback(null,oAllDesktop);
      }
    });
  } else {
    console.log("Not a linux system! Not supported now!")
  }
}


/** 
 * @Method: findDesktopFile
 *    To find a desktop file with name of sFilename. Since we maintain all .desktopfile
 *    here, the searching path would be /.desktop/applications.
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
    var exec = require('child_process').exec;
    var sCommand = 'find ' + config.RESOURCEPATH + '/.desktop/applications -name ' + sFileName;
    exec(sCommand, function(err, stdout, stderr) {
      if (err) {
        console.log(stderr);
        console.log(err);
        return;
      }
      if (stdout == '') {
        console.log('Not Found!');
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
 *    To find all .desktop files from system. First, it would echo $XDG_DATA_DIRS
 *    to get all related dirs. Then sreacing in those dirs.
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
 *         "/usr/share/xfce4/helpers/mozilla-browser.desktop",
 *        ]
 *
 **/
function findAllDesktopFiles(callback) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var systemType = os.type();
  if (systemType === "Linux") {
    var xdgDataDir = [];
    var exec = require('child_process').exec;
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

        function tryInThisPath(callback, index) {
          if (index == xdgDataDir.length) {
            var oAllDesktop = sAllDesktop.split('\n');
            oAllDesktop.pop();
            callback(oAllDesktop);
          } else {
            var sTarget = '*.desktop';
            var sCommand = 'sudo find ' + xdgDataDir[index] + ' -name ' + sTarget;
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
 *    @result
 *    string, a full path string,
 *            as: '/usr/share/applications/cinnamon.desktop'
 *
 * @param2: sFileName
 *    string, a file name
 *    exmple: var sFileName = 'cinnamon.desktop';
 *
 * @param3: oEntries
 *    object, this object indludes those entries that you want
 *            to change in this desktop file.
 *
 *    example:
 *    var oEntries =
 *    {
 *      Comment: Window management and application launching of Mac OX X,
 *      NoDisplay: false
 *    }
 *
 **/
/*
//TODO:
//This part is not completed,the logic needs to be modified.
function writeDesktopFile(callback, sFileName, oEntries) {
  if (typeof callback !== 'function')
    throw 'Bad type of callback!!';

  function findDesktopFileCb(result) {
    function parseDesktopFileCb(attr) {
      attr = JSON.stringify(attr, null, 4);
      fs.writeFileSync('/home/xiquan/testFile/testWrite.txt', attr);
      callback(attr);
    }
    var sPath = result;
    parseDesktopFile(parseDesktopFileCb, sPath);
  }
  findDesktopFile(findDesktopFileCb, sFileName)
}
exports.writeDesktopFile = writeDesktopFile;*/
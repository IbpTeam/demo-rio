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
var os = require('os');
var config = require("../config");
var dataDes = require("../FilesHandle/desFilesHandle");
var resourceRepo = require("../FilesHandle/repo");
var util = require('util');
var events = require('events');
var uniqueID = require("../uniqueID");

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
    var _icontheme = newInit("theme");
    _icontheme.name = 'Mint-X';
    _icontheme.active = true;
    _icontheme.path = '$HOME';
    _icontheme.id = 'computer';

    var _computer = newInit("theme");
    _computer.name = 'Computer';
    _computer.active = false;

    var _trash = newInit("theme");
    _trash.name = 'Trash';
    _trash.active = false;

    var _network = newInit("theme");
    _network.name = 'Network'
    _network.active = false;

    var _document = newInit("theme");
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
      cat: {},
      book: {},
      boat: {},
      book1: {},
      totem_dock: {},
      firefox_dock: {}
    }
    return result;
  }

}


/** 
 * @Method: initConf
 *    init desktop config dir
 *
 * @param: callback
 *    result as a json object
 **/
function initConf(callback) {
  var path = config.RESOURCEPATH + "/.desktop";
  fs.mkdir(path, function(err) {
    if (err) {
      console.log(err);
      return;
    }
    var pathApp = path + "/apllication";
    var pathDesk = path + "/desktop";
    var pathDock = path + "/dock";
    var pathTheme = path + "/Theme.conf";
    var pathWidget = path + "/Widget.conf"

    var tmpThemw = getnit("theme");
    var tmpWidget = getnit("Widget");
    var sItemTheme = JSON.stringify(tmpThemw, null, 4);
    var sItemWidget = JSON.stringify(tmpWidget, null, 4);

    fs.writeFile(pathTheme, sItemTheme, function(err) {
      if (err) {
        console.log("init Theme config file error!");
        console.log(err);
      }
      callback("success_init_theme");
    });
    fs.writeFile(pathWidget, sItemWidget, function(err) {
      if (err) {
        console.log("init Widget config file error!");
        console.log(err);
      }
      callback("success_init_Widget");
    });
    fs.mkdir(pathApp, function(err) {
      if (err) {
        console.log(err);
      }
      callback("success_app");
    });
    fs.mkdir(pathDesk, function(err) {
      if (err) {
        console.log(err);
      }
      callback("success_desk");
    });
    fs.mkdir(pathDock, function(err) {
      if (err) {
        console.log(err);
      }
      callback("success_dock");
    });
  })
}
exports.initConf = initConf;

/** 
 * @Method: readThemeConf
 *    read file Theme.conf
 *
 * @param: callback
 *    @result
 *        object
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
function readThemeConf(callback) {
  var ThemeConfPath = config.RESOURCEPATH + "/.desktop/Theme.conf";
  fs.readFile(ThemeConfPath, 'utf8', function(err, data) {
    if (err) {
      console.log("read Theme config file error!");
      console.log(err);
      return;
    } else {
      var json = JSON.parse(data);
      console.log(json);
      callback(json);
    }
  });
}
exports.readThemeConf = readThemeConf;

/** 
 * @Method: writeThemeConf
 *    modify file Theme.conf
 *
 * @param: callback
 *      @result
 *      string, retrive "success" when success
 *
 * @param: oTheme
 *    object, content of Widget.conf after modified
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
  var sTheme = JSON.stringify(oTheme, null, 4);
  var ThemeConfPath = config.RESOURCEPATH + "/.desktop/Theme.conf";
  var path = config.RESOURCEPATH + "/.desktop";
  fs.writeFile(ThemeConfPath, sTheme, function(err) {
    if (err) {
      console.log("write Theme config file error!");
      console.log(err);
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
        callback("success");
      });
    }
  });
}
exports.writeThemeConf = writeThemeConf;

/** 
 * @Method: readWidgetConf
 *    read file Widget.conf
 *
 * @param: callback
 *    @restult
 *        object
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
  var WidgetConfPath = config.RESOURCEPATH + "/.desktop/Widget.conf";
  fs.readFile(WidgetConfPath, 'utf8', function(err, data) {
    if (err) {
      console.log("read Theme config file error!");
      console.log(err);
      return;
    } else {
      var oJson = JSON.parse(data);
      console.log(oJson);
      callback(oJson);
    }
  });
}
exports.readWidgetConf = readWidgetConf;

/** 
 * @Method: writeThemeConf
 *    modify file Theme.conf
 *
 * @param: callback
 *    @result
 *        string, Retrive "success" when success
 *
 * @param: oTheme
 *    object, content of Widget.conf after modified
 *
 **/
function writeWidgetConf(callback, oWidget) {
  var sWidget = JSON.stringify(oWidget, null, 4);
  var WidgetConfPath = config.RESOURCEPATH + "/.desktop/Widget.conf";
  var path = config.RESOURCEPATH + "/.desktop";
  fs.writeFile(WidgetConfPath, sWidget, function(err) {
    if (err) {
      console.log("write Widget config file error!");
      console.log(err);
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
        callback("success");
      });
    }
  });
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
 *      Categories: GNOME;
 *      GTK;
 *      System;
 *      Core;
 *      OnlyShowIn: GNOME;
 *      NoDisplay: true
 *      X - GNOME - Autostart - Phase: WindowManager
 *      X - GNOME - Provides: panel;
 *      windowmanager;
 *      X - GNOME - Autostart - Notify: true
 *      X - GNOME - AutoRestart: true
 *    }
 *
 * @param2: sFileName
 *    string,name of target file
 *    example: var sFileName = 'cinnamon.desktop';
 *
 **/
function readDesktopFile(callback, sFileName) {
  function findDesktopFileCb(result) {
    if (result === "Not found" || result == "") {
      console.log("desktop file NOT FOUND!");
      return;
    } else {
      function parseDesktopFileCb(attr) {
        callback(attr);
      }
      var sPath = result;
      console.log(sPath);
      parseDesktopFile(parseDesktopFileCb, sPath);
    }
  }
  findDesktopFile(findDesktopFileCb, sFileName)
}
exports.readDesktopFile = readDesktopFile;

/** 
 * @Method: parseDesktopFile
 *    parse Desktop File into json object
 *
 * @param1: sPath
 *    string, taget .desktop file path as: '/usr/share/applications/cinnamon.desktop'
 *
 * @param2: callback
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
 *      Categories: GNOME;
 *      GTK;
 *      System;
 *      Core;
 *      OnlyShowIn: GNOME;
 *      NoDisplay: true
 *      X - GNOME - Autostart - Phase: WindowManager
 *      X - GNOME - Provides: panel;
 *      windowmanager;
 *      X - GNOME - Autostart - Notify: true
 *      X - GNOME - AutoRestart: true
 *    }
 *    
 *
 **/
function parseDesktopFile(callback, sPath) {
  if (typeof callback !== 'function')
    throw 'Bad type of callback!!';

  fs.readFile(sPath, 'utf-8', function(err, data) {
    if (err) {
      console.log("read desktop file error");
      console.log(err);
      return;
    } else {
      data = data.replace(/[\[]{1}[a-z, ,A-Z]*\]{1}\n/g, '$').split('$');
      var lines = data[1].split('\n');
      var attr = [];
      for (var i = 0; i < lines.length - 1; ++i) {
        var tmp = lines[i].split('=');
        attr[tmp[0]] = tmp[1];
        for (var j = 2; j < tmp.length; j++)
          attr[tmp[0]] += '=' + tmp[j];
      }
      console.log("Get desktop file successfully");
      callback(attr);
    }
  });
}


/** 
 * @Method: findDesktopFile
 *    find a desktop file with name of sFilename
 *
 * @param1: callback
 *    @result
 *    string, a full path string, as: '/usr/share/applications/cinnamon.desktop'
 *
 * @param2: sFileName
 *    string, a file name
 *    exmple: var sFileName = 'cinnamon.desktop';
 *
 **/
function findDesktopFile(callback, sFileName) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var xdgDataDir = [];
  var exec = require('child_process').exec;
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

      function tryInThisPath(callback, xdgDataDir, index) {
        if (index == xdgDataDir.length) {
          callback('Not found');
          return;
        }
        console.log(index + " : " + xdgDataDir[index] + " : " + sFileName);

        exec('sudo find ' + xdgDataDir[index] + ' -name ' + sFileName, function(err, stdout, stderr) {
          console.log('find ' + xdgDataDir[index] + ' -name ' + sFileName)
          if (err) {
            console.log(stderr);
            console.log(err);
            return;
          }
          if (stdout == '') {
            tryInThisPath(callback, xdgDataDir, index + 1);
          } else {
            var result = stdout.split('\n');
            console.log(result[0])
            callback(result[0]);
          }
        })
      };
      tryInThisPath(callback, xdgDataDir, 0);
    }
  })
}



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
var ThemeConfPath = config.RESOURCEPATH + "/.desktop/Theme.conf";
var WidgetConfPath = config.RESOURCEPATH + "/.desktop/Widget.conf";


/** 
 * @Method: readThemeConf
 *    read file Theme.conf
 *
 * @param: callback
 *    result as a json object
 **/
function readThemeConf(callback) {
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
 *    Retrive "success" when success
 *
 * @param: oTheme
 *    json object, modified content of Theme.conf
 *
 **/
function writeThemeConf(callback, oTheme) {
  var sTheme = JSON.stringify(oTheme, null, 4);
  fs.open(ThemeConfPath, "w", 0644, function(err, fd) {
    if (err) {
      console.log("open Theme config file error!");
      console.log(err);
      return;
    } else {
      fs.write(fd, sTheme, 0, 'utf8', function(err) {
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
          var itemDesPath = config.RESOURCEPATH+"/.des/.desktop/";
          dataDes.updateItem(chItem, attrs, itemDesPath, function() {
            callback("success");
          });
        }
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
 *    result as a json object
 **/
function readWidgetConf(callback) {
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
 *    Retrive "success" when success
 *
 * @param: oTheme
 *    json object, modified content of Widget.conf
 *
 **/
function writeWidgetConf(callback, oWidget) {
  var oTheme = JSON.stringify(oTheme, null, 4);
  fs.open(WidgetConfPath, "w", 0644, function(err, fd) {
    if (err) {
      console.log("open oWidget config file error!");
      console.log(err);
      return;
    } else {
      fs.write(fd, sItem, 0, 'utf8', function(err) {
        if (err) {
          console.log("write oWidget config file error!");
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
          var itemDesPath = WidgetConfPath.replace(/\/resources\//, '/resources/.des/') + ".md";
          dataDes.updateItem(chItem, attrs, itemDesPath, function() {
            callback("success");
          });
        }
      });
    }
  });
}
exports.writeWidgetConf = writeWidgetConf;

/** 
 * @Method: readDesktopEntries
 *    read file Widget.conf
 *
 * @param1: callback
 *    result as a json object
 *
 * @param2: fileName
 *    name of target file
 *
 **/
function readDesktopEntries(callback, sFileName) {
  var sPath = config.RESOURCEPATH + "/.des/.desktop/application/" + sFileName;

  function parseDesktopFileCb(attr) {
    callback(attr);
  }
  parseDesktopFile(sPath, parseDesktopFileCb);
}
exports.readDesktopEntries = readDesktopEntries;

function parseDesktopFile(sPath, callback) {
  if (typeof callback !== 'function')
    throw 'Bad type of callback!!';

  var fs = require('fs');
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
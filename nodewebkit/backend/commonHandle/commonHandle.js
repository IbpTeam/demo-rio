/**
 * @Copyright:
 *
 * @Description: API for common handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.10.28
 *
 * @version:0.1.1
 **/

var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var dataDes = require("./desFilesHandle");
var desktopConf = require("../data/desktop");
var commonDAO = require("./CommonDAO");
var resourceRepo = require("./repo");
var device = require("./data/devices");
var util = require('util');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandles = require("./tagsHandle");

var writeDbNum = 0;
var dataPath;

function getCategory(path) {
  var pointIndex = path.lastIndexOf('.');
  if (pointIndex == -1) {
    var itemPostfix = "none";
    var nameindex = path.lastIndexOf('/');
    var itemFilename = path.substring(nameindex + 1, path.length);
  } else {
    var itemPostfix = path.substr(pointIndex + 1);
    var nameindex = path.lastIndexOf('/');
    var itemFilename = path.substring(nameindex + 1, pointIndex);
  }
  if (itemPostfix == 'none' ||
    itemPostfix == 'ppt' ||
    itemPostfix == 'pptx' ||
    itemPostfix == 'doc' ||
    itemPostfix == 'docx' ||
    itemPostfix == 'wps' ||
    itemPostfix == 'odt' ||
    itemPostfix == 'et' ||
    itemPostfix == 'txt' ||
    itemPostfix == 'xls' ||
    itemPostfix == 'xlsx' ||
    itemPostfix == 'ods' ||
    itemPostfix == 'zip' ||
    itemPostfix == 'sh' ||
    itemPostfix == 'gz' ||
    itemPostfix == 'html' ||
    itemPostfix == 'et' ||
    itemPostfix == 'odt' ||
    itemPostfix == 'pdf' ||
    itemPostfix == 'html5ppt') {
    return {
      category: "Documents",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'jpg' || itemPostfix == 'png') {
    return {
      category: "Pictures",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'mp3' || itemPostfix == 'ogg') {
    return {
      category: "Music",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'conf' || itemPostfix == 'desktop') {
    return {
      category: "Configuration",
      filename: itemFilename,
      postfix: itemPostfix
    };
  }
}

function copyFile(oldPath, newPath, callback) {
  var repeat = 0;
  console.log(newPath);
  fs.exists(newPath, function(isExists) {
    if (isExists) {
      console.log('exiiiiiiiiiiiists', newPath);
      var pointIndex = newPath.lastIndexOf('.');
      var nameindex = newPath.lastIndexOf('/');
      if (pointIndex == -1) {
        var itemPostfix = "none";
        var itemFilename = newPath.substring(nameindex + 1, newPath.length);
      } else {
        var itemPostfix = newPath.substr(pointIndex + 1);
        var itemFilename = newPath.substring(nameindex + 1, pointIndex);
      }
      repeat++;
      var newName = itemFilename + '(' + repeat + ')';
      newPath = newPath.substr(0, nameindex) + newName + itemPostfix;
      copyFile(oldPath, newPath, callback);
    } else {
      fs_extra.copy(oldPath, newPath, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        callback('success');
      })
    }
  })
}

/**
 * @method createData
 *    To create des file, dataBase resocrd and git commit for single data. This
 *    method is only for single data input at a time.
 *
 * @param1: item
 *    object, inlcudes all info about the input data
 *    examplt:
 *    var itemInfo = {
 *               id: "",
 *               URI: uri + "#" + category,
 *               category: category,
 *                is_delete: 0,
 *                others: someTags.join(","),
 *                filename: itemFilename,
 *                postfix: itemPostfix,
 *                size: size,
 *                path: itemPath,
 *                project: '上海专项',
 *                createTime: ctime,
 *                lastModifyTime: mtime,
 *                lastAccessTime: ctime,
 *                createDev: config.uniqueID,
 *                lastModifyDev: config.uniqueID,
 *                lastAccessDev: config.uniqueID
 *              }
 *
 * @param2: callback
 *    @result
 *    string, retrieve 'success' when success
 *
 */
function createData(item, callback) {
  var itemPath = item.path;
  var itemFilename = item.filename + item.postfix;
  var category = item.category;
  var resourcesPath = config.RESOURCEPATH + '/' + category.toLowerCase();
  var dest = resourcesPath + '/data/' + itemFilename;
  var desPath = resourcesPath + 'Des';
  var desDest = desPath + '/' + itemFilename + '.md';
  copyFile(itemPath, dest, function(result) {
    if (result !== 'success') {
      console.log(result);
      return;
    }
    var itemDesPath = resourcesPath + 'Des/';
    dataDes.createItem(item, itemDesPath, function() {
      commonDAO.createItem(item, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        resourceRepo.repoAddsCommit(resourcesPath, [dest], function() {
          resourceRepo.repoAddsCommit(desPath, [desDest], function() {
            callback('success');
          })
        });
      })
    });
  });
}
exports.createData = createData;


/**
 * @method createDataAll
 *    To create des file, dataBase resocrd and git commit for all data input. T-
 *    -his is only for array data input.
 *
 * @param1: items
 *    object, inlcudes all info about the input data
 *    examplt:
 *    var items = [itemInfo_1,itemInfo_2,itemInfo_3];
 *    var itemInfo = {
 *               id: "",
 *               URI: uri + "#" + category,
 *               category: category,
 *                is_delete: 0,
 *                others: someTags.join(","),
 *                filename: itemFilename,
 *                postfix: itemPostfix,
 *                size: size,
 *                path: itemPath,
 *                project: '上海专项',
 *                createTime: ctime,
 *                lastModifyTime: mtime,
 *                lastAccessTime: ctime,
 *                createDev: config.uniqueID,
 *                lastModifyDev: config.uniqueID,
 *                lastAccessDev: config.uniqueID
 *              }
 *
 * @param2: callback
 *    @result
 *    string, retrieve 'success' when success
 *
 */
function createDataAll(items, callback) {
  if (typeof items !== 'object') {
    console.log('input error: items should be an object!');
    return;
  }
  var count = 0;
  var lens = items.length;
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    var itemPath = item.path;
    var itemFilename = item.filename + item.postfix;
    var category = item.category;
    var resourcesPath = config.RESOURCEPATH + '/' + category.toLowerCase();
    var dest = resourcesPath + '/data/' + itemFilename;
    var desPath = resourcesPath + 'Des';
    var desDest = desPath + '/' + itemFilename + '.md';
    var allItems = [];
    var allItemPath = [];
    var allDesPath = [];
    copyFile(itemPath, dest, function(result) {
      if (result !== 'success') {
        console.log(result);
        return;
      }
      var itemDesPath = resourcesPath + 'Des/';
      dataDes.createItem(item, itemDesPath, function() {
        allItems.push(item);
        allItemPath.push(dest);
        allDesPath.push(desPath + '/data/' + itemFilename + '.md');
        var isEnd = (count === lens);
        if (isEnd) {
          commonDAO.createItems(allItems, function() {
            resourceRepo.repoAddsCommit(resourcesPath, allItemPath, function() {
              resourceRepo.repoAddsCommit(resourceRepo, allDesPath, function() {
                console.log('create data all success!');
                callback('success');
              })
            });
          })
        }
        count++;
      });
    });
  }
}
exports.createDataAll = createDataAll;
/**
 * @Copyright:
 *
 * @Description: API for common handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.10.28
 *
 * @version:0.3.0
 **/

var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var dataDes = require("./desFilesHandle");
var desktopConf = require("../data/desktop");
var commonDAO = require("./CommonDAO");
var resourceRepo = require("./repo");
var device = require("../data/device");
var util = require('util');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandles = require("./tagsHandle");
var utils = require("../utils")

var writeDbNum = 0;
var dataPath;


function copyFile(oldPath, newPath, callback) {
  var repeat = 0;
  fs_extra.copy(oldPath, newPath, function(err) {
    if (err) {
      console.log(err);
      callback(err);
    } else {
      callback('success');
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
  var allItems = [];
  var allItemPath = [];
  var allDesPath = [];
  var itemsRename = utils.renameExists(items);
  for (var i = 0; i < itemsRename.length; i++) {
    var item = itemsRename[i];
    (function(_item) {
      var itemPath = _item.path;
      var itemFilename = _item.filename + '.' + _item.postfix;
      var category = _item.category;
      var resourcesPath = config.RESOURCEPATH + '/' + category.toLowerCase();
      var dest = resourcesPath + '/data/' + itemFilename;
      _item.path = dest;
      var desPath = resourcesPath + 'Des';
      var desDest = desPath + '/' + itemFilename + '.md';
      copyFile(itemPath, dest, function(result) {
        if (result !== 'success') {
          console.log(result);
          return;
        }
        var itemDesPath = resourcesPath + 'Des/data';
        dataDes.createItem(_item, itemDesPath, function() {
          allItems.push(_item);
          allItemPath.push(dest);
          allDesPath.push(itemDesPath + '/' + itemFilename + '.md');
          var isEnd = (count === lens - 1);
          if (isEnd) {
            commonDAO.createItems(allItems, function() {
              resourceRepo.repoAddsCommit(resourcesPath, allItemPath, function() {
                resourceRepo.repoAddsCommit(desPath, allDesPath, function() {
                  console.log('create data all success!');
                  callback('success');
                })
              });
            })
          }
          count++;
        });
      });
    })(item)
  }
}
exports.createDataAll = createDataAll;

var commonDao = require("./CommonDAO");
var utils = require("../utils");
var repo = require("./repo");


exports.getItemByUri = function(category, uri, callback) {
  var conditions = ["URI = " + "'" + uri + "'"];
  commonDAO.findItems(null, category, conditions, null, callback);
}

function deleteItemByUri(category, uri, callback) {
  var aConditions = ["URI = " + "'" + uri + "'"];
  var oItem = {
    category: category,
    conditions: aConditions
  };
  commonDAO.deleteItem(oItem, callback);
}
exports.deleteItemByUri = deleteItemByUri;

exports.removeFile = function(category, item, callback) {
  //TODO delete desFile
  var sFullName = path.basename(item.path);
  var sDesFullName = sFullName + ".md";
  var sDesPath = utils.getDesPath(category, sFullName);
  fs.unlink(sDesPath, function(err) {
    if (err)
      console.log(err);
    //TODO delete data from db
    deleteItemByUri(category, item.URI, function(isSuccess) {
      if (isSuccess == "rollback") {
        callback("error");
        return;
      }
      //TODO git commit
      var aRealFiles = [sFullName];
      var sRealDir = utils.getRealDir(category);
      repo.repoRmsCommit(sRealDir, aRealFiles, function() {
        var aDesFiles = [sDesFullName];
        var sDesDir = utils.getDesDir(category);
        repo.repoRmsCommit(sDesDir, aDesFiles, callback);
      });
    });
  });
};

exports.getAllCate = function(getAllCateCb) {
  function getCategoriesCb(err, items) {
    if (err) {
      console.log(err);
      return;
    }
    var cates = new Array();
    items.forEach(function(each) {
      cates.push({
        URI: each.id,
        version: each.version,
        type: each.type,
        path: each.logoPath,
        desc: each.desc
      });
    });
    getAllCateCb(cates);
  }
  commonDAO.findItems(null, "category", null, null, getCategoriesCb);
}

exports.getAllDataByCate = function(getAllDataByCateCb, cate) {
  console.log("Request handler 'getAllDataByCate' was called.");

  function getAllByCaterotyCb(err, items) {
    if (err) {
      console.log(err);
      return;
    }
    var cates = new Array();
    items.forEach(function(each) {
      cates.push({
        URI: each.URI,
        version: each.version,
        filename: each.filename,
        postfix: each.postfix,
        path: each.path
      });
    });
    getAllDataByCateCb(cates);
  }

  function getAllDevicesCb(err, items) {
    if (err) {
      console.log(err);
      return;
    }
    getAllDataByCateCb(items);
  }
  if (cate == "Devices") {
    commonDAO.findItems(null, cate, null, null, getAllDevicesCb);
  } else {
    var conditions = ["is_delete = 0"];
    commonDAO.findItems(null, cate, conditions, null, getAllByCaterotyCb);
  }
}

function getRecentAccessData(category, getRecentAccessDataCb, num) {
  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return getRecentAccessDataCb(err,null);
    }
    var DataByNum = utils.getRecent(items, num);
    getRecentAccessDataCb(null,DataByNum);
    for (var k in DataByNum) {
      console.log(DataByNum[k].lastAccessTime);
    }
  }
  var sCondition = " order by date(lastAccessTime) desc,  time(lastAccessTime) desc limit " + "'" + num + "'";
  commonDAO.findItems(null, category, null, [sCondition], findItemsCb);
}
exports.getRecentAccessData = getRecentAccessData;

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
var fs = require('../fixed_fs');
//var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var desktopConf = require("../data/desktop");
var commonDAO = require("./CommonDAO");
//var device = require("../data/device");
var util = require('util');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandles = require("./tagsHandle");
var utils = require("../utils")
var chokidar = require('chokidar'); 

var writeDbNum = 0;
var dataPath;



// @const
var DATA_PATH = "data";

function watcherStart(category,callback){
  var dataPath=utils.getRealDir(category);
  var cateModule=utils.getCategoryObject(category);
  console.log("monitor "+dataPath);
  cateModule.watcher = chokidar.watch(dataPath, {ignoreInitial: true});
  cateModule.watcher.on('all', function(event, path) {
    //console.log('Raw event info:', event, path);
    callback(path,event);
  });
}
exports.watcherStart = watcherStart;

function watcherStop(category,callback){
  var cateModule=utils.getCategoryObject(category);
  cateModule.watcher.close();
  callback();
}
exports.watcherStop = watcherStop;




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
  var sOriginPath = item.path;
  var sFileName = utils.renameExists([item.filename + '.' + item.postfix])[0];
  var category = item.category;
  var sRealDir = utils.getRealDir(category);
  var sFilePath = path.join(sRealDir, sFileName);
  item.path = sFilePath;
  utils.copyFileSync(sOriginPath, sFilePath, function(err) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    commonDAO.createItem(item, function(err) {
      if (err) {
        console.log(err);
        return callback(err);
      }
      if (item.others != '') {
        var oTags = item.others.split(',');
        tagsHandles.addInTAGS(oTags, item.URI, function(err) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          callback('success', sFilePath);
        })
      } else {
        callback('success', sFilePath);
      }
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
  var allTagsInfo = [];
  var existsFils = [];
  var itemsRename = utils.renameExists(items);

  function doCreate(_item) {
    utils.isNameExists(_item.path, function(err, result) {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      if (result) {
        var data = new Date();
        var surfix = 'duplicate_at_' + data.toLocaleString().replace(' ', '_') + '_';
        _item.filename = surfix + _item.filename;
        console.log('file ' + result + ' exists ...');
        existsFils.push({
          origin_path: _item.path,
          old_name: result,
          re_name: surfix + _item.filename + '.' + _item.postfix
        })
      }
      var sOriginPath = _item.path;
      var sFileName = (_item.postfix === 'none') ? _item.filename : _item.filename + '.' + _item.postfix;
      var category = _item.category;
      var sRealDir = utils.getRealDir(category);
      var sFilePath = path.join(sRealDir, sFileName);
      _item.path = sFilePath;
      utils.copyFileSync(sOriginPath, sFilePath, function(err) {
        if (err) {
          console.log(err);
          return callback(err);
        }
        allItems.push(_item);
        allItemPath.push(sFilePath);
        if (_item.others) {
          var oTags = _item.others.split(',');
          for (var i = 0; i < oTags.length; i++) {
            var oItem = {
              category: 'tags',
              tag: oTags[i],
              file_URI: _item.URI
            }
            allItems.push(oItem);
          }
        }
        var isEnd = (count === lens - 1);
        if (isEnd) {
          commonDAO.createItems(allItems, function(result) {
            if (result === "rollback") {
              var _err = 'create tags info in data base rollback ...';
              return callback(_err, null);
            }
            callback(null, existsFils);
          });
        }
        count++;
      });
    })
  }
  for (var i = 0; i < itemsRename.length; i++) {
    var item = itemsRename[i];
    doCreate(item);
  }
}
exports.createDataAll = createDataAll;

exports.getItemByUri = function(category, uri, callback) {
  var conditions = ["URI = " + "'" + uri + "'"];
  commonDAO.findItems(null, category, conditions, null, function(err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      callback(result);
    }
  });
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
  deleteItemByUri(category, item.URI, function(isSuccess) {
    if (isSuccess == "rollback") {
      callback("error");
      return;
    }
    callback(null,"success");
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
  commonDAO.findItems(null, cate, null, null, getAllDevicesCb);
}

exports.getRecentAccessData = function(category, getRecentAccessDataCb, num) {
  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return getRecentAccessDataCb(err, null);
    }
    var DataByNum = utils.getRecent(items, num);
    getRecentAccessDataCb(null, DataByNum);
  }
  var sCondition = " order by date(lastAccessTime) desc,  time(lastAccessTime) desc ";
  commonDAO.findItems(null, category, null, [sCondition], findItemsCb);
}

function renameDataByUri(category, sUri, sNewName, callback) {
  var sCondition = "URI = '" + sUri + "'";
  commonDAO.findItems(null, [category], [sCondition], null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    } else if (result == '' || result == null) {
      var _err = 'not found in database ...';
      return callback(_err, null);
    }
    var item = result[0];
    var sOriginPath = item.path;
    var sOriginName = path.basename(sOriginPath);
    var sNewPath = path.dirname(sOriginPath) + '/' + sNewName;
    if (sNewName === sOriginName) {
      return callback(null, 'success');
    }
    utils.isNameExists(sNewPath, function(err, result) {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      if (result) {
        var _err = 'new file name ' + sNewName + ' exists...';
        console.log(_err);
        return callback(_err, null);
      }
      fs_extra.move(sOriginPath, sNewPath, function(err) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        var currentTime = (new Date());
        console.log(item);
        var sUri = item.URI;
        var oUpdataInfo = {
          URI: sUri,
          category: category,
          filename: utils.getFileNameByPathShort(sNewPath),
          postfix: utils.getPostfixByPathShort(sNewPath),
          lastModifyTime: currentTime,
          lastAccessTime: currentTime,
          lastModifyDev: config.uniqueID,
          lastAccessDev: config.uniqueID,
          path: sNewPath
        }
        commonDAO.updateItem(oUpdataInfo, function(err) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          callback(null, "success");
        });
      });
    });
  });
}
exports.renameDataByUri = renameDataByUri;

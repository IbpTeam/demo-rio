var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var commonDAO = require("./CommonDAO");
var resourceRepo = require("./repo");
var util = require('util');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandles = ('../commonHandle/tagsHandles');
var commonHandle = require('../commonHandle/commonHandle');


/**
 * @method createData
 *    To create des file, dataBase resocrd and git commit for all data input. T-
 *    -his is only for array or string data input. The proccess would be copy f-
 *    -rst, then create the des file, after all des file done, then write into
 *    data base, final step is commit git.
 *
 * @param1: items
 *    object, an array or string of data full path.
 *    examplt:
 *    var items = '/home/xiquan/resource/documents/test.txt', or
 *    var items = ['/home/xiquan/resource/documents/test1.txt',
 *                 '/home/xiquan/resource/documents/test2.txt'
 *                 '/home/xiquan/resource/documents/test3.txt'].
 *
 * @param2: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                error: "createData: commonHandle createData error"
 *                error: "createData: items should be an array"
 *                error: "createData: commonHandle createData all error"
 *                error: "createData: input error"
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 */
function createData(items, callback) {
  if (typeof items === 'string') {
    fs.stat(items, function(err, stat) {
      if (err) {
        console.log(err);
        return;
      }
      var mtime = stat.mtime;
      var ctime = stat.ctime;
      var size = stat.size;
      var cate = commonHandle.getCategory(itemPath);
      var category = 'Documents';
      var itemFilename = cate.filename;
      var itemPostfix = cate.postfix;
      var someTags = tagsHandles.getTagsByPath(itemPath);
      var resourcesPath = config.RESOURCEPATH + '/' + category;
      uniqueID.getFileUid(function(uri) {
        var itemInfo = {
          id: null,
          URI: uri + "#" + category,
          category: category,
          is_delete: 0,
          others: someTags.join(","),
          filename: itemFilename,
          postfix: itemPostfix,
          size: size,
          path: itemPath,
          project: '上海专项',
          createTime: ctime,
          lastModifyTime: mtime,
          lastAccessTime: ctime,
          createDev: config.uniqueID,
          lastModifyDev: config.uniqueID,
          lastAccessDev: config.uniqueID
        };
        commonHandle.createData(itemInfo, function(result) {
          if (result === 'success') {
            callback(null, result);
          } else {
            var _err = 'createData: commonHandle createData error!';
            console.log('createData error!');
            callback(_err, null);
          }
        })
      })
    })
  } else if (typeof items === 'object') {
    if (!items.length) {
      console.log('create data input error!');
      var _err = 'createData: items should be an array!';
      callback(_err, null);
    } else {
      var itemInfoAll[];
      var count = 0;
      var lens = items.length;
      for (var i = 0; i < lens; i++) {
        var item = items[i];
        fs.stat(items, function(err, stat) {
          if (err) {
            console.log(err);
            var _err = err;
            callback(_err, null);
          } else {
            var mtime = stat.mtime;
            var ctime = stat.ctime;
            var size = stat.size;
            var cate = commonHandle.getCategory(itemPath);
            var category = 'Documents';
            var itemFilename = cate.filename;
            var itemPostfix = cate.postfix;
            var someTags = tagsHandles.getTagsByPath(itemPath);
            var resourcesPath = config.RESOURCEPATH + '/' + category;
            uniqueID.getFileUid(function(uri) {
              var itemInfo = {
                id: null,
                URI: uri + "#" + category,
                category: category,
                is_delete: 0,
                others: someTags.join(","),
                filename: itemFilename,
                postfix: itemPostfix,
                size: size,
                path: itemPath,
                project: '上海专项',
                createTime: ctime,
                lastModifyTime: mtime,
                lastAccessTime: ctime,
                createDev: config.uniqueID,
                lastModifyDev: config.uniqueID,
                lastAccessDev: config.uniqueID
              };
              itemInfoAll.push(itemInfo);
              var isEnd = (count === lens);
              if (isEnd) {
                commonHandle.createDataAll(itemInfoAll, function(result) {
                  if (result === 'success') {
                    callback(null, result);
                  } else {
                    var _err = 'createData: commonHandle createData all error!';
                    console.log('createData error!');
                    callback(_err, null);
                  }
                })
              }
              count++;
            })
          }
        })
      }
    }
  } else {
    console.log('input error: items is undefined!');
    var _err = 'createData: input error';
    callback(_err, null);
  }
}
exports.createData = createData;
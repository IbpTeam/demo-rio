var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var util = require('util');
var utils = require('../utils');
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
 *    @result
 *    string, retrieve 'success' when success
 *
 */
function createData(items, callback) {
  console.log(items);
  if (typeof items == 'string') {
    fs.stat(items, function(err, stat) {
      if (err) {
        console.log(err);
        return;
      }
      var mtime = stat.mtime;
      var ctime = stat.ctime;
      var size = stat.size;
      var cate = utils.getCategory(items);
      var category = 'Pictures';
      var itemFilename = cate.filename;
      var itemPostfix = cate.postfix;
      var someTags = tagsHandles.getTagsByPath(items);
      var resourcesPath = config.RESOURCEPATH + '/' + category;
      uniqueID.getFileUid(function(uri) {
        var itemInfo = {
          URI: uri + "#" + category,
          category: category,
          is_delete: 0,
          /*
           * TODO: something wrong the tagsHandles, will fix it later
           */
          others: []; //someTags.join(","),
          postfix: itemPostfix,
          filename: itemFilename,
          id: null,
          size: size,
          path: items,
          location: "Mars",
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
  } else if (typeof items == 'object') {
    if (!items.length) {
      console.log('create data input error!');
      var _err = 'createData: items should be an array!';
      callback(_err, null);
    } else {
      var itemInfoAll = [];
      var count = 0;
      var lens = items.length;
      for (var i = 0; i < lens; i++) {
        var item = items[i];
        (function(_item) {
          fs.stat(_item, function(err, stat) {
            console.log(_item)
            if (err) {
              console.log(err);
              var _err = err;
              callback(_err, null);
            } else {
              var mtime = stat.mtime;
              var ctime = stat.ctime;
              var size = stat.size;
              var cate = utils.getCategory(_item);
              var category = 'Pictures';
              var itemFilename = cate.filename;
              var itemPostfix = cate.postfix;
              /*
               * TODO: something wrong the tagsHandles, will fix it later
               */
              var someTags = []; //tagsHandles.getTagsByPath(_item);
              var resourcesPath = config.RESOURCEPATH + '/' + category;
              uniqueID.getFileUid(function(uri) {
                var itemInfo = {
                  URI: uri + "#" + category,
                  category: category,
                  is_delete: 0,
                  others: someTags.join(","),
                  postfix: itemPostfix,
                  filename: itemFilename,
                  id: null,
                  size: size,
                  path: _item,
                  location: "Mars",
                  createTime: ctime,
                  lastModifyTime: mtime,
                  lastAccessTime: ctime,
                  createDev: config.uniqueID,
                  lastModifyDev: config.uniqueID,
                  lastAccessDev: config.uniqueID
                };
                itemInfoAll.push(itemInfo);
                var isEnd = (count === lens - 1);
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
        })(item)
      }
    }
  } else {
    console.log('input error: items is undefined!');
    var _err = 'createData: input error';
    callback(_err, null);
  }
}
exports.createData = createData;
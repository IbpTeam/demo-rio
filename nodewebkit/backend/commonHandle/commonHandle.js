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
var device = require("../data/device");
var util = require('util');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandles = require("./tagsHandle");
var utils = require("../utils")
var repo = require("./repo");
var transfer = require('../Transfer/msgTransfer');
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

function copyFile(oldPath, newPath, callback) {
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
  var sOriginPath = item.path;
  var sFileName = utils.renameExists([item.filename + '.' + item.postfix])[0];
  var category = item.category;
  var sRealRepoDir = utils.getRepoDir(category);
  var sDesRepoDir = utils.getDesRepoDir(category);
  var sRealDir = utils.getRealDir(category);
  var sDesDir = utils.getDesDir(category);
  var sFilePath = path.join(sRealDir, sFileName);
  var sDesFilePath = path.join(sDesDir, sFileName + '.md');
  item.path = sFilePath;
  copyFile(sOriginPath, sFilePath, function(result) {
    if (result !== 'success') {
      console.log(result);
      return;
    }
    dataDes.createItem(item, sDesDir, function() {
      commonDAO.createItem(item, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        repo.repoCommitBoth('add', sRealRepoDir, sDesRepoDir, [sFilePath], [sDesFilePath], function(err, result) {
          if (err) {
            console.log(result);
            return callback(null);
          }
          if (item.others != '') {
            var oTags = item.others.split(',');
            tagsHandles.addInTAGS(oTags, item.URI, function(err) {
              if (err) {
                console.log(err);
                return callback(err, null);
              }

            })
          } else {
            callback('success', sFilePath);
          }
        })
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
  var allTagsInfo = [];
  var itemsRename = utils.renameExists(items);
  for (var i = 0; i < itemsRename.length; i++) {
    var item = itemsRename[i];
    (function(_item) {
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
        }
        var sOriginPath = _item.path;
        var sFileName = _item.filename + '.' + _item.postfix;
        var category = _item.category;
        var sRealRepoDir = utils.getRepoDir(category);
        var sDesRepoDir = utils.getDesRepoDir(category);
        var sDesDir = utils.getDesDir(category);
        var sRealDir = utils.getRealDir(category);
        var sFilePath = path.join(sRealDir, sFileName);
        var sDesFilePath = path.join(sDesDir, sFileName + '.md');
        _item.path = sFilePath;
        copyFile(sOriginPath, sFilePath, function(result) {
          if (result !== 'success') {
            console.log(result);
            return;
          }
          dataDes.createItem(_item, sDesDir, function() {
            allItems.push(_item);
            allItemPath.push(sFilePath);
            allDesPath.push(sDesFilePath);
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
                repo.repoCommitBoth('add', sRealRepoDir, sDesRepoDir, allItemPath, allDesPath, function(err, result) {
                  if (result !== 'success') {
                    console.log(err);
                    return callback(null);
                  }
                  callback('success');
                })
              })
            }
            count++;
          });
        });
      })
    })(item)
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
      repo.repoCommitBoth('rm',
        utils.getRepoDir(category),
        utils.getDesRepoDir(category), [path.join(utils.getRealDir(category), sFullName)], [path.join(utils.getDesDir(category), sDesFullName)],
        callback);
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
  commonDAO.findItems(null, cate, null, null, getAllDevicesCb);
}

/** 
 * @Method: repoReset
 *    To reset git repo to a history commit version. This action would also res-
 *    -des file repo
 *
 * @param1: repoResetCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, retieve 'success' when success
 *
 * @param2: category
 *    string, a category name, as 'document'
 *
 * @param3: commitID
 *    string, a history commit id, as '9a67fd92557d84e2f657122e54c190b83cc6e185'
 *
 **/
exports.getRecentAccessData = function(category, getRecentAccessDataCb, num) {
  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return getRecentAccessDataCb(err, null);
    }
    var DataByNum = utils.getRecent(items, num);
    getRecentAccessDataCb(null, DataByNum);
  }
  var sCondition = " order by date(lastAccessTime) desc,  time(lastAccessTime) desc limit " + "'" + num + "'";
  commonDAO.findItems(null, category, null, [sCondition], findItemsCb);
}

exports.updateDB = function(category, updateDBCb) {
  var desRepoDir = utils.getDesDir(category);
  fs.readdir(desRepoDir, function(err, files) {
    if (err) {
      console.log(err);
      updateDBCb({
        'commonHandle': err
      }, null);
    } else {
      var allFileInfo = [];
      var count = 0;
      var lens = files.length;
      for (var i = 0; i < lens; i++) {
        var fileItem = path.join(utils.getDesDir(category), files[i]);
        var isEnd = (count === lens - 1);
        (function(_fileItem, _isEnd) {
          fs.readFile(_fileItem, 'utf8', function(err, data) {
            try {
              var oFileInfo = JSON.parse(data);
            } catch (e) {
              console.log(data)
              throw e;
            }
            allFileInfo.push(oFileInfo);
            if (_isEnd) {
              var items = [{
                category: category
              }];
              commonDAO.deleteItems(items, function(result) {
                if (result == 'commit') {
                  commonDAO.createItems(allFileInfo, function(result) {
                    if (result == 'commit') {
                      updateDBCb(null, 'success');
                    } else {
                      var _err = {
                        'commonHandle': 'create items error!'
                      }
                      updateDBCb(_err, null);
                    }
                  })
                } else {
                  var _err = {
                    'commonHandle': 'delete items error!'
                  }
                  updateDBCb(_err, null);
                }
              })
            }
          })
          count++;
        })(fileItem, isEnd)
      }
    }
  })
}

/**
 * @method pullRequest
 *    Fetch from remote and merge.
 * @param category
 *    Category.
 * @param deviceId
 *    Remote device id.
 * @param deviceIp
 *    Remote device ip.
 * @param deviceAccount
 *    Remote device account.
 * @param repoPath
 *    Repository path.
 * @param desRepoPath
 *    Des repository path.
 * @param callback
 *    Callback.
 */
function pullRequest(category, deviceId, address, account, repoPath, desRepoPath, callback) {
  //First pull real file
  //Second pull des file
  //console.log("==============================" + repoPath);
  //console.log("==============================" + desRepoPath);
  repo.haveBranch(repoPath, deviceId, function(result) {
    if (result == false) {
      //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% no branch " + deviceId);
      repo.addBranch(deviceId, address, account, repoPath, function(branchName) {
        if (branchName != deviceId) {
          console.log("addBranch error");
        } else {
          repo.pullFromOtherRepo(repoPath, deviceId, function(realFileNames) {
            repo.haveBranch(desRepoPath, deviceId, function(result) {
              if (result == false) {
                repo.addBranch(deviceId, address, account, desRepoPath, function(branchName) {
                  if (branchName != deviceId) {
                    console.log("addBranch error");
                  } else {
                    repo.pullFromOtherRepo(desRepoPath, deviceId, function(desFileNames) {
                      var aFilePaths = new Array();
                      var sDesPath = utils.getDesRepoDir(category);
                      desFileNames.forEach(function(desFileName) {
                        aFilePaths.push(path.join(sDesPath, desFileName));
                      });
                      //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% des file paths: " + aFilePaths);
                      //TODO base on files, modify data in db
                      dataDes.readDesFiles(category, aFilePaths, function(desObjs) {
                        dataDes.writeDesObjs2Db(desObjs, function(status) {
                          callback(deviceId, address, account);
                        });
                      });
                    });
                  }
                });
              } else {
                repo.pullFromOtherRepo(desRepoPath, deviceId, function(desFileNames) {
                  var aFilePaths = new Array();
                  var sDesPath = utils.getDesRepoDir(category);
                  desFileNames.forEach(function(desFileName) {
                    aFilePaths.push(path.join(sDesPath, desFileName));
                  });
                  //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% des file paths: " + aFilePaths);
                  //TODO base on files, modify data in db
                  dataDes.readDesFiles(category, aFilePaths, function(desObjs) {
                    dataDes.writeDesObjs2Db(desObjs, function(status) {
                      callback(deviceId, address, account);
                    });
                  });
                });
              }
            });
          });
        }
      });
    } else {
      //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% have branch " + deviceId);
      repo.pullFromOtherRepo(repoPath, deviceId, function(realFileNames) {
        repo.haveBranch(desRepoPath, deviceId, function(result) {
          if (result == false) {
            repo.addBranch(deviceId, address, account, desRepoPath, function(branchName) {
              if (branchName != deviceId) {
                console.log("addBranch error");
              } else {
                repo.pullFromOtherRepo(desRepoPath, deviceId, function(desFileNames) {
                  var aFilePaths = new Array();
                  var sDesPath = utils.getDesRepoDir(category);
                  desFileNames.forEach(function(desFileName) {
                    aFilePaths.push(path.join(sDesPath, desFileName));
                  });
                  //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% des file paths: " + aFilePaths);
                  //TODO base on files, modify data in db
                  dataDes.readDesFiles(category, aFilePaths, function(desObjs) {
                    dataDes.writeDesObjs2Db(desObjs, function(status) {
                      callback(deviceId, address, account);
                    });
                  });
                });
              }
            });
          } else {
            repo.pullFromOtherRepo(desRepoPath, deviceId, function(desFileNames) {
              var aFilePaths = new Array();
              var sDesPath = utils.getDesRepoDir(category);
              desFileNames.forEach(function(desFileName) {
                aFilePaths.push(path.join(sDesPath, desFileName));
              });
              //console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%% des file paths: " + aFilePaths);
              //TODO base on files, modify data in db
              dataDes.readDesFiles(category, aFilePaths, function(desObjs) {
                dataDes.writeDesObjs2Db(desObjs, function(status) {
                  callback(deviceId, address, account);
                });
              });
            });
          }
        });
      });
    }
  });
}
exports.pullRequest = pullRequest;

function renameDataByUri(category, sUri, sNewName, callback) {
  var sCondition = "URI = '" + sUri + "'";
  commonDAO.findItems(null, [category], [sCondition], null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    }
    var item = result[0];
    var sOriginPath = item.path;
    var sOriginName = path.basename(sOriginPath);
    var sNewPath = path.dirname(sOriginPath) + '/' + sNewName;
    if (sNewName === sOriginName) {
      return callback(null, 'success');
    }
    utils.isNameExists(sOriginPath, function(err, result) {
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
        var reg_path = new RegExp('/' + category + '/');
        var sOriginDesPath = sOriginPath.replace(reg_path, '/' + category + 'Des/') + '.md';
        var sNewDesPath = path.dirname(sOriginDesPath) + '/' + sNewName + '.md';
        fs_extra.move(sOriginDesPath, sNewDesPath, function(err) {
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
            dataDes.updateItem(sNewDesPath, oUpdataInfo, function(result) {
              if (result === "success") {
                var sRepoPath = utils.getRepoDir(category);
                var sRepoDesPath = utils.getDesRepoDir(category);
                repo.repoRenameCommit(sOriginPath, sNewPath, sRepoPath, sRepoDesPath, function() {
                  callback(null, result);
                })
              }
            })
          })
        })
      })
    })
  })
}
exports.renameDataByUri = renameDataByUri;
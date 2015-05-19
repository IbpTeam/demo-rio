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
var fs = require('../fixed_fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var dataDes = require("./desFilesHandle");
var desktopConf = require("../data/desktop");
var commonDAO = require("./CommonDAO");
var util = require('util');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require("./tagsHandle");
var utils = require("../utils")
var repo = require("./repo");
var transfer = require('../Transfer/msgTransfer');
var chokidar = require('chokidar'); 
var rdfHandle = require("./rdfHandle");
var DEFINED_PROP = require('../data/default/rdfTypeDefine').property;

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
function createData(fileInfo, callback) {
  var _TRIPLES = [];
  var _callback = callback;
  for (var i = 0; i < fileInfo.length; i++) {
    var _item = fileInfo[i];
    var _isEnd = (i == (fileInfo.length - 1));

    function doCreate_RDF(item, isEnd, callback) {
      rdfHandle.tripleGenerator(item, function(err, triples) {
        if (err) {
          return callback(err);
        }
        _TRIPLES = _TRIPLES.concat(triples);
        if (isEnd) {
          return addTriples(_TRIPLES, callback);
        }
      })
    }
    doCreate_RDF(_item, _isEnd, _callback)
  }
}
exports.createData = createData;



function addTriples(triples, callback) {
  var db = rdfHandle.dbOpen();
  rdfHandle.dbPut(db, triples, function(err) {
    if (err) {
      return callback(err);
    }
    rdfHandle.dbClose(db, function() {
      return callback();
    })

  })
}

function baseInfo(itemPath, callback) {
  fs.stat(itemPath, function(err, stat) {
    if (err) {
      return callback(err);
    }
    var _mtime = stat.mtime;
    var _ctime = stat.ctime;
    var _size = stat.size;
    var _cate = utils.getCategoryByPath(itemPath);
    var _category = _cate.category;
    var _filename = _cate.filename;
    var _postfix = _cate.postfix;
    var _tags = tagsHandle.getTagsByPath(itemPath);
    uniqueID.getFileUid(function(_uri) {
      var _base = {
        URI: _uri,
        filename: _filename,
        postfix: _postfix,
        category: _category,
        size: _size,
        path: itemPath,
        tags: _tags,
        createTime: _ctime,
        lastModifyTime: _mtime,
        lastAccessTime: _ctime,
        createDev: config.uniqueID,
        lastModifyDev: config.uniqueID,
        lastAccessDev: config.uniqueID,
      }
      return callback(null, _base);
    })
  })
}
exports.baseInfo = baseInfo;

function dataStore(items, extraCallback, callback) {
  if (items.length == 0) {
    return callback();
  } else if (!items.length) {
    var items = [items];
  }
  var _file_info = [];

  function doCreate(isEnd, item, callback) {
    baseInfo(item, function(err, _base) {
      if (err) {
        return callback(err);
      }
      var _newPath = path.join(config.RESOURCEPATH, _base.category, 'data', _base.filename) + '.' + _base.postfix;
      _base.path = _newPath;
      fs_extra.copy(item, _newPath, function(err) {
        if (err) {
          console.log(err);
        }
        extraCallback(_item, function(err, result) {
          var item_info = {
            subject: _base.URI,
            base: _base,
            extra: result
          }
          _file_info.push(item_info);
          if (isEnd) {
            createData(_file_info, function(err) {
              if (err) {
                return callback(err);
              }
              callback();
            })
          }
        })
      })
    })
  }
  for (var i = 0; i < items.length; i++) {
    var _isEnd = (i == (items.length - 1));
    var _item = items[i];
    doCreate(_isEnd, _item, function(err) {
      if (err) {
        return callback(err)
      }
      return callback();
    });
  }
}
exports.dataStore = dataStore;


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
  var allDesPath = [];
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
      var sRealRepoDir = utils.getRepoDir(category);
      var sDesRepoDir = utils.getDesRepoDir(category);
      var sDesDir = utils.getDesDir(category);
      var sRealDir = utils.getRealDir(category);
      var sFilePath = path.join(sRealDir, sFileName);
      var sDesFilePath = path.join(sDesDir, sFileName + '.md');
      _item.path = sFilePath;
      utils.copyFileSync(sOriginPath, sFilePath, function(err) {
        if (err) {
          console.log(err);
          return callback(err);
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
                if (err) {
                  console.log(err);
                  return callback(err, null);
                }
                callback(null, existsFils);
              })
            })
          }
          count++;
        });
      });
    })
  }
  for (var i = 0; i < itemsRename.length; i++) {
    var item = itemsRename[i];
    doCreate(item);
  }
}
exports.createDataAll = createDataAll;

function getTriplesByProperty(options, callback) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP[options._type][options._property],
    object: options._value
  }, {
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      throw err;
    }
    return callback(null, result);
  });
}

exports.getItemByProperty = function(options, callback) {
  getTriplesByProperty(options, function(err, result) {
    if (err) {
      return callback(err);
    } else if (result == []) {
      var _err = new Error("ITEM NOT FOUND!");
      return callback(_err);
    }
    rdfHandle.decodeTripeles(result, function(err, info) {
      if (err) {
        return callback(err);
      }
      var items = [];
      for (var item in info) {
        if (info.hasOwnProperty(item)) {
          items.push(info[item]);
        }
      }
      return callback(null, items);
    })
  })
}

function getTriples(options, callback) {
  getTriplesByProperty(options, function(err, result) {
    if (err) {
      return callback(err);
    }
    var _info = {
      triples: result
    };
    //get path and category from triples
    for (var i = 0, l = result.length; i < l; i++) {
      if (result[i].predicate === "http://example.org/property/base#category") {
        _info.category = result[i].object;
      }
      if (result[i].predicate === "http://example.org/property/base#path") {
        _info.path = result[i].object;
      }
    }
    return callback(null, _info);
  })
}

exports.removeItemByProperty = function(options, callback) {
  var _db = rdfHandle.dbOpen();
  getTriples(options, function(err, result) {
    if (err) {
      return callback(err);
    }
    //delete all realted triples in leveldb
    rdfHandle.dbDelete(_db, result.triples, function(err) {
      if (err) {
        return callback(err);
      }
      //if no path or category found, them the file should not exist in by now.
      if (result.category === undefined && result.path === undefined) {
        return callback();
      }
      //if type is contact, then it is done for now.
      if (result.category === "contact") {
        _db.close(function() {
          return callback();
        });
      } else {
        //delete file itself
        fs.unlink(result.path, function(err) {
          if (err) {
            return callback(err);
          }
          _db.close(function() {
            return callback();
          });
        })
      }
    })
  })
}


exports.getAllCate = function(getAllCateCb) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: "http://www.w3.org/2000/01/rdf-schema#subClassOf",
    object: 'http://example.org/category#base'
  }, {
    subject: _db.v('filename'),
    predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
    object: _db.v('subject')
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      throw err;
    }
    rdfHandle.dbClose(_db, function() {
      getAllCateCb(result);
    })
  });
}

exports.getAllDataByCate = function(getAllDataByCateCb, cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: cate
  }, {
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      throw err;
    }
    rdfHandle.dbClose(_db, function() {
      rdfHandle.decodeTripeles(result, function(err, info) {
        if (err) {
          return getAllDataByCateCb(err);
        }
        var items = [];
        for (var item in info) {
          if (info.hasOwnProperty(item)) {
            items.push({
              URI: info[item].URI,
              version: "",
              filename: info[item].filename,
              postfix: info[item].postfix,
              path: info[item].path,
              tags: info[item].tags
            })
          }
        }
        return getAllDataByCateCb(null, items);
      })
    })
  });
}

/** 
 * @Method: getRecentAccessData
 *    To get recent accessed data.
 *
 * @param2: category
 *    string, a category name, as 'document'
 *
 * @param1: getRecentAccessDataCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        array, of file info object, by nember num
 *
 * @param3: num
 *    integer, number of file you want to get
 *
 **/
exports.getRecentAccessData = function(category, getRecentAccessDataCb, num) {
  console.log("Request handler 'getRecentAccessData' was called.");
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"][category],
    object: category
  }, {
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      throw err;
    }
    rdfHandle.dbClose(_db, function() {
      rdfHandle.decodeTripeles(result, function(err, info) {
        if (err) {
          return getRecentAccessDataCb(err);
        }
        var items = [];
        for (var item in info) {
          if (info.hasOwnProperty(item)) {
            items.push(info[item]);
          }
        }
        items = items.sort(function(a, b) {
          var _a = new Date(a.lastAccessTime);
          var _b = new Date(b.lastAccessTime);
          return _b - _a;
        });
        var _result = (items.length > num) ? items.slice(0, num - 1) : items;
        return getRecentAccessDataCb(null, _result);
      })
    })
  });
}

function updateTriples(_db, originTriples, newTriples, callback) {
  rdfHandle.dbDelete(_db, originTriples, function(err) {
    if (err) {
      return callback(err);
    }
    rdfHandle.dbPut(_db, newTriples, function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    })
  })
}

function resolveTriples(chenges, triple) {
  var _predicate = triple.predicate;
  var _reg_property = new RegExp("#" + chenges._property);
  if (_reg_property.test(_predicate)) {
    var _new_triple = {
      subject: triple.subject,
      predicate: triple.predicate,
      object: triple.object
    }
    _new_triple["object"] = chenges._value;

    return {
      _origin: triple,
      _new: _new_triple
    }
  }
  return null;
}

/** 
 * @Method: updatePropertyValue
 *    To update data property value.
 *
 * @param2: property
 *    object, contain modification info as below,
 *
 *        var property = {
 *          _uri: "",
 *          _changes:[
 *                              {
 *                                _property:"filename",
 *                                _value:"aaa"
 *                              },
 *                              {
 *                                _property:"postfix",
 *                                _value:"txt"
 *                              },
 *                            ]
 *        }
 *
 * @param1: updatePropertyValueCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *
 **/
function updatePropertyValue(property, updatePropertyValueCb) {
  var _options = {
    _type: "base",
    _property: "URI",
    _value: property._uri
  }
  getTriplesByProperty(_options, function(err, result) {
    var _new_triples = [];
    var _origin_triples = [];
    for (var i = 0, l = result.length; i < l; i++) {
      for(var j=0,k=property._changes.length;j<k;j++){
        var _resolved = resolveTriples(property._changes[j], result[i]);
        if (_resolved) {
          _origin_triples.push(_resolved._origin);
          _new_triples.push(_resolved._new);
        }
      }
    }
    var _db = rdfHandle.dbOpen();
    updateTriples(_db, _origin_triples, _new_triples, function(err) {
      if (err) {
        return updatePropertyValueCb(err);
      }
      return updatePropertyValueCb();
    })
  })
}
exports.updatePropertyValue = updatePropertyValue;

exports.openData = function(uri, openDataCb) {
  var currentTime = (new Date());
  var property = {
    _uri: uri,
    _changes: [{
      _property: "lastAccessTime",
      _value: currentTime
    }, {
      _property: "lastAccessDev",
      _value: config.uniqueID
    }, ]
  }
  updatePropertyValue(property, function(err) {
    if (err) {
      throw err;
    }
    openDataCb();
  })
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

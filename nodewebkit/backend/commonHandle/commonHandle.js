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
var Q = require('q');

//let Q trace long stack
Q.longStackSupport = true;

// @const
var DATA_PATH = "data";


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
function writeTriples(fileInfo) {
  var _triples_result = [];
  return Q.all(fileInfo.map(rdfHandle.Q_tripleGenerator))
    .then(function(triples_) {
      for (var i = 0, l = triples_.length; i < l; i++) {
        _triples_result = _triples_result.concat(triples_[i]);
      }
      var _db = rdfHandle.dbOpen();
      return rdfHandle.Q_dbPut(_db, _triples_result);
    })
}
exports.writeTriples = writeTriples;

function Q_copy(filePath, newPath) {
  var deferred = Q.defer();
  fs_extra.copy(filePath, newPath, function(err) {
    //drop into reject only when error is not "ENOENT"
    if (err && err[0].code !== "ENOENT") {
      deferred.reject(new Error(err));
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}

function baseInfo(itemPath, callback) {
  var Q_fsStat = Q.nfbind(fs.stat);
  var Q_uriMaker = function(stat){
    var _mtime = stat.mtime;
    var _ctime = stat.ctime;
    var _size = stat.size;
    var _cate = utils.getCategoryByPath(itemPath);
    var _category = _cate.category;
    var _filename = _cate.filename;
    var _postfix = _cate.postfix;
    var _tags = tagsHandle.getTagsByPath(itemPath);
    return uniqueID.Q_getFileUid().then(function(_uri){
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
        lastAccessDev: config.uniqueID
      }
      return _base;
    })
  }
  return Q_fsStat(itemPath).then(Q_uriMaker);
}
exports.baseInfo = baseInfo;

function dataStore(items, extraCallback, callback) {

  function doCreate(item, callback) {
    return baseInfo(item)
      .then(function(_base) {
        var _newPath = path.join(config.RESOURCEPATH, _base.category, 'data', _base.filename) + '.' + _base.postfix;
        _base.path = _newPath;
        return Q_copy(item, _newPath)
          .then(function() {
            return extraCallback(item)
              .then(function(result) {
                var item_info = {
                  subject: _base.URI,
                  base: _base,
                  extra: result
                }
                return item_info;
              })
          })
      })
  }

  if (items == "") {
    return Q.fcall(function() {
      return null;
    })
  } else {
    var _file_info = [];
    return Q.all(items.map(doCreate))
      .then(function(result) {
        for (var i = 0, l = result.length; i < l; i++) {
          _file_info.push(result[i]);
        }
        return writeTriples(_file_info);
      });
  }
}
exports.dataStore = dataStore;


function getTriplesByProperty(options) {
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
  return rdfHandle.Q_dbSearch(_db, _query);
}


exports.getItemByProperty = function(options) {
  var itemsMaker = function(info){
    var items = [];
    for (var item in info) {
      if (info.hasOwnProperty(item)) {
        items.push(info[item]);
      }
    }
    return items;
  }
  return getTriplesByProperty(options)
    .then(rdfHandle.Q_decodeTripeles)
    .then(itemsMaker);
}

function getTriples(options) {
  var TriplesMaker = function(result){
    var _info = {
      triples: result
    };
    //get path and category from triples
    for (var i = 0, l = result.length; i < l; i++) {
      if (result[i].predicate === DEFINED_PROP["base"]["category"]) {
        _info.category = result[i].object;
      }
      if (result[i].predicate === DEFINED_PROP["base"]["path"]) {
        _info.path = result[i].object;
      }
    }
    return _info;
  }
  return getTriplesByProperty(options)
    .then(TriplesMaker);
}

exports.removeItemByProperty = function(options) {
  var _db = rdfHandle.dbOpen();
  var FilesRemove = function(result){
    //if no path or category found, them the file should not exist in by now.
    if (result.category === undefined && result.path === undefined) {
    }
    //if type is contact, then it is done for now.
    if (result.category === "contact") {
      //_db.close(function() {
      //});
    } else {
      //delete file itself
      var Q_unlink = Q.nfbind(fs.unlink);
      Q_unlink(result.path);
    }
    return result;
  }
  var TriplesRemove = function(result){
    //delete all realted triples in leveldb
    rdfHandle.Q_dbDelete(_db, result.triples);
    return result;
  }
  return getTriples(options).then(TriplesRemove).then(FilesRemove);
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

function getAllDataByCate(cate) {
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
  var dataMaker = function(info) {
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
    return items;
  };

  return rdfHandle.Q_dbSearch(_db, _query)
    .then(rdfHandle.Q_decodeTripeles)
    .then(dataMaker);
}
exports.getAllDataByCate = getAllDataByCate;

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
 exports.getRecentAccessData = function(category, num) {
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
  var itemsMaker = function(info){
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
    return _result;
  }
  return rdfHandle.Q_dbSearch(_db, _query)
    .then(rdfHandle.Q_decodeTripeles)
    .then(itemsMaker)
}

function updateTriples(_db, originTriples, newTriples) {
  return rdfHandle.Q_dbDelete(_db, originTriples)
    .then(rdfHandle.Q_dbPut(_db, newTriples));
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
function updatePropertyValue(property) {
  var _options = {
    _type: "base",
    _property: "URI",
    _value: property._uri
  }
  var updateMaker = function(result){
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
    return updateTriples(_db, _origin_triples, _new_triples);
  }
  return getTriplesByProperty(_options)
    .then(updateMaker);
}
exports.updatePropertyValue = updatePropertyValue;

exports.openData = function(uri) {
  var currentTime = (new Date());
  var property = {
    _uri: uri,
    _changes: [{
      _property: "lastAccessTime",
      _value: currentTime
    }, {
      _property: "lastAccessDev",
      _value: config.uniqueID
    }]
  }
  return updatePropertyValue(property);
}


/*TODO: rewrite */
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

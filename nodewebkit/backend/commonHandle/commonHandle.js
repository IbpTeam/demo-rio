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
var path = require('path');
var fs = require('../fixed_fs');
var fs_extra = require('fs-extra');
var config = require("../config");
var desktopConf = require("../data/desktop");
var util = require('util');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require("./tagsHandle");
var utils = require("../utils")
var repo = require("./repo");
var transfer = require('../Transfer/msgTransfer');
var chokidar = require('chokidar');
var rdfHandle = require("./rdfHandle");
var typeHandle = require("./typeHandle");
var Q = require('q');

//let Q trace long stack
Q.longStackSupport = true;

// @const
var DATA_PATH = "data";
var DEFINED_PROP = require('../data/default/rdfTypeDefine').property;


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
 * @return Promise
 *    event state，which resolves with no values if sucess;
 *    otherwise, return reject with Error object 
 *
 */

function dataStore(items, extraCallback) {

  function doCreate(item) {
    return baseInfo(item)
      .then(function(_base) {
        var _newPath = path.join(config.RESOURCEPATH, _base.category, 'data', _base.filename) + '.' + _base.postfix;
        _base.path = _newPath;
        return Q_copy(item, _newPath)
          .then(function(result) {
            if (result === "ENOENT") {
              //return null when file exists
              return null;
            } else {
              return extraCallback(item)
                .then(function(result) {
                  var item_info = {
                    subject: _base.URI,
                    base: _base,
                    extra: result
                  }
                  return item_info;
                });
            }
          });
      });
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
          //if (result[i] !== "") {
            _file_info.push(result[i]);
          //}
        }
        return writeTriples(_file_info);
      });
  }
}
exports.dataStore = dataStore;


function writeTriples(fileInfo) {
  var _triples_result = [];
  return Q.all(fileInfo.map(rdfHandle.tripleGenerator))
    .then(function(triples_) {
      for (var i = 0, l = triples_.length; i < l; i++) {
        if (triples_[i] !== null) {
          _triples_result = _triples_result.concat(triples_[i]);
        }
      }
      var _db = rdfHandle.dbOpen();
      return rdfHandle.dbPut(_db, _triples_result);
    });
}
exports.writeTriples = writeTriples;


function Q_copy(filePath, newPath) {
  var deferred = Q.defer();
  fs_extra.copy(filePath, newPath, function(err) {
    //drop into reject only when error is not "ENOENT"
    if (err && err[0].code !== "ENOENT") {
      deferred.reject(new Error(err));
    } else if (err && err[0].code === "ENOENT") {
      //when file exists, consider it should be resolved  
      deferred.resolve("ENOENT");
    } else {
      deferred.resolve();
    }
  });
  return deferred.promise;
}


function baseInfo(itemPath) {
  var Q_fsStat = Q.nfbind(fs.stat);
  var Q_uriMaker = function(stat) {
    var _mtime = (stat.mtime).toString();
    var _ctime = (stat.ctime).toString();
    var _size = stat.size;
    var _postfix = path.extname(itemPath);
    var _filename = path.basename(itemPath, _postfix);
    if (_postfix[0] === ".") {
      _postfix = _postfix.substr(1);
    }
    var _tags = tagsHandle.getTagsByPath(itemPath);
    var _base = {
      URI: null,
      filename: _filename,
      postfix: _postfix,
      category: null,
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
    return uniqueID.Q_getFileUid()
      .then(function(_uri) {
        _base.URI = _uri
      })
      .then(function() {
        return typeHandle.getTypeNameByPostfix(_postfix)
          .then(function(category_) {
            _base.category = category_;
            return _base;
          })
      })
  }
  return Q_fsStat(itemPath).then(Q_uriMaker);
}
exports.baseInfo = baseInfo;


/** 
 * @Method: getItemByProperty
 *    To get an Item by property.
 *       @At first, make query from any property
 *       @Secondly, search from dataBase
 *
 * @param1: options
 *    string, a property name, as 'author'
 *
 * @return Promise
 *    event state，which resolves with an array of sorted file infomation if sucess;
 *    otherwise, return reject with Error object 
 *
 **/
function getItemByProperty (options) {
  var itemsMaker = function(info) {
    var items = [];
    for (var item in info) {
      if (info.hasOwnProperty(item)) {
        items.push(info[item]);
      }
    }
    return items;
  }
  return getTriplesByProperty(options)
    .then(rdfHandle.decodeTripeles)
    .then(itemsMaker);
}
exports.getItemByProperty = getItemByProperty;


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
  return rdfHandle.dbSearch(_db, _query);
}


/*TODO: rewrite*/
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


/** 
 * @Method: getAllDataByCate
 *    To get data by categry.
 *       @At first, make query from any property
 *       @Secondly, search from dataBase by query, and got the Triples
 *       @Thirdly, decode Tripeles to informations
 *       @Finnally, push information in a stack
 * @param1: cate
 *    string, a category name, as 'doucument'
 *
 * @return Promise
 *    event state，which resolves with a stack of data infomation if sucess;
 *    otherwise, return reject with Error object 
 *
 **/
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

  return rdfHandle.dbSearch(_db, _query)
    .then(rdfHandle.decodeTripeles)
    .then(dataMaker);
}
exports.getAllDataByCate = getAllDataByCate;


/** 
 * @Method: getRecentAccessData
 *    To get recent accessed data.
 *
 * @param1: category
 *    string, a category name, as 'document'
 *
 * @param2: num
 *    integer, number of file you want to get
 * @return Promise
 *    event state，which resolves with an array of sorted file infomation if sucess;
 *    otherwise, return reject with Error object 
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
  var itemsMaker = function(info) {
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
  return rdfHandle.dbSearch(_db, _query)
    .then(rdfHandle.decodeTripeles)
    .then(itemsMaker);
}



/** 
 * @Method: updatePropertyValue
 *    To update data property value.
 *
 * @param1: property
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
 *
 * @return Promise
 *    event state, repesent onfulfilled state with no values if sucess;
 *    otherwise, return reject with Error object
 *
 **/
function updatePropertyValue(property) {
  var _options = {
    _type: "base",
    _property: "URI",
    _value: property._uri
  }
  var doUpdate = function(result) {
    var _new_triples = [];
    var _origin_triples = [];
    for (var i = 0, l = result.length; i < l; i++) {
      for (var j = 0, k = property._changes.length; j < k; j++) {
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
    .then(doUpdate);
}
exports.updatePropertyValue = updatePropertyValue;


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


function updateTriples(_db, originTriples, newTriples) {
  return rdfHandle.dbDelete(_db, originTriples)
    .then(rdfHandle.dbPut(_db, newTriples));
}


/** 
 * @Method: openData
 *    To find data by uri, an application of Method updatePropertyValue
 *
 * @param1: uri
 *
 * @return
 *    Promise, event state，which resolves with an array of sorted file infomation if sucess;
 *             otherwise, return reject with Error object 
 *
 *
 **/
exports.openData = function(uri) {
  var currentTime = (new Date()).toString();
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
/** 
 * @Method: renameDataByUri
 *    @ find FILE NAME Tripeles
 *    @ updatePropertyValue()
 *    @ file Copy Renamed
 *
 * @param1: uri
 *
 * @param1: sUri
 *
 * @param1: sNewName
 *
 * @return Promise
 *    event state，which resolves with an array of sorted file infomation if sucess;
 *    otherwise, return reject with Error object 
 *
 *
 **/
function renameDataByUri(sUri, sNewName) {
  var _options = {
    _type: "base",
    _property: "URI",
    _value: sUri
  }
  var reName = function(Item){
    if(Item === null){
      throw new Error("Items do not exists!");
    }
    if(Item.length === 0){
      throw new Error("Items are empty by this Uri!");
    }
    var arr = Item[0];
    if(arr.hasOwnProperty("path")){
      var filepath = arr.path;
    }
    else
      throw new Error("NOPath");
    if(arr.hasOwnProperty("path")){
      var postfix = arr.postfix;
    }
    else{
      throw new Error("NOPostfix");
    }
    var newPath = filepath.substr(0,filepath.lastIndexOf('/')) 
                    +'/'+ sNewName + "." + postfix;
    var _changeItem = {
      _uri:sUri,
      _changes:[
        {
          _property:"filename",
          _value:sNewName
        },
        {
          _property:"path",
          _value:newPath
        },
        {
          _property:"lastModifyTime",
          _value:(new Date()).toString()
        }
      ]
    }
    var Q_fsRaname = Q.nfbind(fs.rename);
    return Q_fsRaname(filepath,newPath)
              .then(updatePropertyValue(_changeItem));
  }
  return getItemByProperty(_options)
          .then(reName);
}
exports.renameDataByUri = renameDataByUri;


/** 
 * @Method: removeItemByProperty
 *    To remove an Item by recent accessed data.
 *
 * @param1: options
 *    string, a property name, as 'author'
 *
 * @param2: num
 *    integer, number of file you want to get
 * @return Promise
 *    event state，which resolves with an array of sorted file infomation if sucess;
 *    otherwise, return reject with Error object 
 *
 **/
exports.removeItemByProperty = function(options) {
  var _db = rdfHandle.dbOpen();
  var FilesRemove = function(result) {
    //if no path or category found, them the file should not exist in by now.
    if (result.category === undefined && result.path === undefined) {}
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
  var TriplesRemove = function(result) {
    //delete all realted triples in leveldb
    rdfHandle.dbDelete(_db, result.triples);
    return result;
  }
  return getTriples(options).then(TriplesRemove).then(FilesRemove);
}

function getTriples(options) {
  var TriplesMaker = function(result) {
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


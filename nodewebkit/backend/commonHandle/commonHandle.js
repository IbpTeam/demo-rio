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
var config = require("systemconfig");
var uniqueID = require("../uniqueID");
var tagsHandle = require("./tagsHandle");
var rdfHandle = require("./rdfHandle");
var typeHandle = require("./typeHandle");
var promised = require('./promisedFunc');
var Q = require('q');

//let Q trace long stack
Q.longStackSupport = true;

// @const
var DATA_PATH = "data";
var DEFINED_PROP = rdfHandle.DEFINED_PROP

function createData(items) {
  return dataStore(items);
}
exports.createData = createData;


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
  if (!items) {
    return Q.fcall(function() {
      return null;
    })
  } else {
    var _file_info = [];
    var _file_path = [];
    return Q.all(items.map(doCreate))
      .then(function(result) {
        for (var i = 0, l = result.length; i < l; i++) {
          _file_info.push(result[i]);
          _file_path.push(result[i].path);
        }
        return writeTriples(_file_info)
          .then(function() {
            return _file_path;
          })
      });
  }
}


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
            return extraInfo(item, _base.category)
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


function extraInfo(item, category) {
  return typeHandle.getTypeMethod(category)
    .then(function(type_object_) {
      return Q.nfcall(type_object_.getPropertyInfo, item);
    })
    .then(function(result_) {
      return typeHandle.getProperty(category)
        .then(function(property_list_) {
          for (var _property in property_list_) {
            property_list_[_property] = result_[_property] || "undefined";
          }
          return property_list_;
        });
    })
}

/** 
 * @Method: importDataBase
 *    To import MetaData to Target DataBase from Source DataBase
 *       @At first, search all tripples from Source DataBase
 *       @Secondly, put tripples into Target DataBase
 *
 * @param1: 
 *    database, backup DataBase
 *
 * @param2: 
 *    database, user's DataBase
 *
 * @return Promise
 *    event state，which no returns with reslove state if sucess;
 *    otherwise, return reject with Error object 
 *
 **/
var importDataBase = function(sourceDB, targetDB){
  var _query = [{
    subject: sourceDB.v('subject'),
    predicate: sourceDB.v('predicate'),
    object: sourceDB.v('object')
  }];
  return rdfHandle.dbSearch(sourceDB, _query)
    .then(function(triples){
      console.log(triples);
      return rdfHandle.dbPut(targetDB, triples);
    });
};


/** 
 * @Method: importMetaData
 *    To import MetaData to Target DataBase from Source DataBase
 *       @linkto : importDataBase
 *
 * @param1: 
 *    String, backup DataBase Path
 *
 * @return Promise
 *    event state，which no returns with reslove state if sucess;
 *    otherwise, return reject with Error object 
 *
 **/
function importMetaData(sPath){
  var targetDB = rdfHandle.dbOpen();
  var sourceDB = rdfHandle.backupDBOpen(sPath);
  return importDataBase(sourceDB, targetDB);
}
exports.importMetaData = importMetaData;



function copy(src, dst){
  // fs.createReadStream(scr)
    // .pipe(fs.createWriteStream(dst));
  var deferred = Q.defer();
  var rs = fs.createReadStream(src);
  var ws = fs.createWriteStream(dst);
  rs.on('data', function(chunk){
    if(ws.write(chunk) === false){
      rs.pause;
    }
  });

  rs.on('end',function(err){
    if(err){
      deferred.reject();
    }
    else{
      ws.end();
    }
  });
  rs.on('drain',function(err){
    if(err){
      deferred.reject();
    }
    else{
      rs.resume();
    }
  });
  deferred.resolve();
  return deferred.promise;
}

function folderPathWalk(src, des, floor, handleFile) {
  var deferred = Q.defer();
  handleFile(src, des, floor);
  floor++;
  fs.readdir(src, function(err, files) {
    if (err) {
      deferred.reject();
      console.log('read dir error');
    } else {
      files.forEach(function(item) {
        var tmpSrc = src + '/' + item;
        var tmpDes = des + '/' + item;
        fs.stat(tmpSrc, function(err1, stats) {
          if (err1) {
            deferred.reject();
            console.log('stat error');
          } else {
            if (stats.isDirectory()) {
              folderPathWalk(tmpSrc, tmpDes, floor, handleFile);
            } else {
              handleFile(tmpSrc, tmpDes, floor);
            }
          }
        })
      });

    }
  });
  deferred.resolve();
  return deferred.promise; 
}


function handleFile(src, des, floor) {
  var deferred = Q.defer();
  var blankStr = '';
  for (var i = 0; i < floor; i++) {
    blankStr += '    ';
  }
  fs.stat(src, function(err1, stats) {
    if (err1) {
      deferred.reject();
      console.log('stat error');
    } else {
      if (stats.isDirectory()) {
        console.log('+' + blankStr + src);
        if (!fs.existsSync(des)) {
          fs.mkdirSync(des);
        }
      } else {
        console.log('-' + blankStr + src);
        copy(src, des);
      }
    }
  });
  deferred.resolve();
  return deferred.promise; 
}

function folderExtractor(src, des){
  var deferred = Q.defer();
  var buffer = new Buffer('eJzT0yMAAGTvBe8=', 'base64');
  var input = fstream.Reader({    path: src   });
  zlib.Deflate(input)
    .pipe(zlib.Unzip(buffer)) /* Compress the .tar file */
    .pipe(tar.Extract({path: des })); /* Convert the directory to a .tar file */
  deferred.resolve();
  return deferred.promise;
}

function folderPackage(src,des){
  var deferred = Q.defer();
  fstream.Reader({
    path: src,
     type: 'Directory'
    }) /* Read the source directory */
    .pipe(tar.Pack()) /* Convert the directory to a .tar file */
    .pipe(zlib.Gzip()) /* Compress the .tar file */
    .pipe(fstream.Writer({
      path: des
    })); /* Give the output file name */
  deferred.resolve();
  return deferred.promise;
}


function mkdirsSync(dirPath) { 
  var deferred = Q.defer();
  if (!fs.existsSync(dirPath)) {
      var pathTmp;
      dirPath.split(path.sep).forEach(function(dirName) {
          if (pathTmp) {
              pathTmp = path.join(pathTmp, dirName);
          }
          else {
              pathTmp = dirName;
          }
          if (!fs.existsSync(pathTmp)) {
              if (!fs.mkdirSync(pathTmp)) {
                  deferred.reject();
              }
          }
      });
  }
  deferred.resolve();
  return deferred.promise; 
}

//
//function delDirSync(sPath){
//  var deferred = Q.defer();
//  var folder_exists = fs.existsSync(sPath);
//  if(folder_exists === true)
//  {
//    var dirList = fs.readdirSync(sPath);
//    dirList.forEach(function(fileName)
//    {
//      fs.unlinkSync(sPath + fileName);
//    });
//  }
//  deferred.resolve();
//  return deferred.promise;
//}

function exportData(sDes){
  var sSrc = "/home/xwh/.custard";
  return folderPathWalk(sSrc, sDes, 0, handleFile)
    .then(folderPackage(sDes, sDes+".tar.gz"));
}
exports.exportData = exportData;


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
function getItemByProperty(options) {
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
          size: info[item].size,
          lastModifyTime: info[item].lastModifyTime,
          createTime: info[item].createTime,
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
      var res =  _b.getTime() - _a.getTime();
      return res;
    });
    var _result = (items.length > num) ? items.slice(0, num ) : items;
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

  var reName = function(Item) {
    if (Item === null) {
      throw new Error("Items do not exists!");
    }
    if (Item.length === 0) {
      throw new Error("Items are empty by this Uri!");
    }
    var arr = Item[0];
    if (arr.hasOwnProperty("path")) {
      var filepath = arr.path;
    } else
      throw new Error("NOPath");
    if (arr.hasOwnProperty("path")) {
      var postfix = arr.postfix;
    } else {
      throw new Error("NOPostfix");
    }
    var newPath = filepath.substr(0, filepath.lastIndexOf('/')) + '/' + sNewName + "." + postfix;
    return {
      _newpath: newPath,
      _oldpath: filepath
    };
  }

  var _options = {
    _type: "base",
    _property: "URI",
    _value: sUri
  }
  return getItemByProperty(_options)
    .then(reName)
    .then(function(result_) {
      var _changeItem = {
        _uri: sUri,
        _changes: [{
          _property: "filename",
          _value: sNewName
        }, {
          _property: "path",
          _value: result_._newpath
        }, {
          _property: "lastModifyTime",
          _value: (new Date()).toString()
        }]
      }
      return updatePropertyValue(_changeItem)
        .then(function() {
          return promised.rename(result_._oldpath, result_._newpath);
        });
    })
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

exports.getTmpPath = function(getTmpPathCb) {
  getTmpPath(config.TMPPATH);
  
}
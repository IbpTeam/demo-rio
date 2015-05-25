/**
 * @Copyright:
 *
 * @Description: Functions dealing wit RDF are presented here.
 *
 * @author: Xiquan
 *
 * @Data:2015.4.16
 *
 * @version:0.0.1
 **/

var fs_extra = require('fs-extra');
var fs = require('fs');
var config = require('../config');
var levelgraph = require('levelgraph');
var utils = require('../utils');
var DEFINED_TYPE = require('../data/default/rdfTypeDefine').vocabulary;
var DEFINED_PROP = require('../data/default/rdfTypeDefine').property;
var DEFINED_VOC = require('../data/default/rdfTypeDefine').definition;
var __db = levelgraph(config.LEVELDBPATH);
var Q = require('q');

/**
 * @method dbInitial
 *   Initalize the levelgraph database. This step would put the RDF Schema of type defin-
 *   ition triples into database, including base properties.
 *
 */
function dbInitial(callback) {
  var db = dbOpen();
  var allTriples = [];
  for (var i in DEFINED_TYPE) {
    if (DEFINED_TYPE.hasOwnProperty(i)) {
      allTriples = allTriples.concat(DEFINED_TYPE[i]);
    }
  }
  db.put(allTriples, function(err) {
    if (err) {
      return callback(err);
    };
    db.close(function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  });
}
exports.dbInitial = dbInitial;

var deferred = Q.defer();

function Q_dbInitial() {
  var db = dbOpen();
  var allTriples = [];

  for (var i in DEFINED_TYPE) {
    if (DEFINED_TYPE.hasOwnProperty(i)) {
      allTriples = allTriples.concat(DEFINED_TYPE[i]);
    }
  }
  db.put(allTriples, function(err) {
    if (err) {
      deferred.reject(new Error(err));
    };
    db.close(function(err) {
      if (err) {
        deferred.reject(new Error(err));
      }
      deferred.resolve();
    });
  });
  return deferred.promise;
}
exports.Q_dbInitial = Q_dbInitial;

/**
 * @method dbClear
 *   delete the whole database
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 *
 */
function dbClear(callback) {
  fs_extra.remove(config.LEVELDBPATH, function(err) {
    if (err) {
      callback(err);
    };
    return callback(null);
  });
}
exports.dbClear = dbClear;


function Q_dbClear(callback) {
  var deferred = Q.defer();
  fs_extra.remove(config.LEVELDBPATH, function(err) {
    if (err) {
      deferred.reject(new Error(err));
    } else
      deferred.resolve();
  });
  return deferred.promise;
}
exports.Q_dbClear = Q_dbClear;
/**
 * @method dbOpen
 *   open the levegraph database; would return a database object
 *
 */
function dbOpen() {
  /*TODO: need to find a suitable time to close database*/
  // if (__db.isOpen()) {
  //  return  __db;// = levelgraph(config.LEVELDBPATH);
  // }
  return __db
}
exports.dbOpen = dbOpen;

/**
 * @method dbClose
 *   close the levegraph database
 *
 */
function dbClose(db, callback) {
  /*TODO: need to find a suitable time to close database*/
  //setImmediate(function() {
  //db.close(function() {
  callback();
  //})
  //})
}
exports.dbClose = dbClose;

function Q_dbClose(db) {
  var deferred = Q.defer;
  // if (err) {
  //   deferred.reject(new Error(err));
  // }
  // else
    
  return Q.fcall(function(){});
}
exports.Q_dbClose = Q_dbClose;


/**
 * @method dbPut
 *   put triples into database
 *
 * @param1 metadata
 *      object，should be an object or array as examples below
 *
 *  exmaple:
 *  var metadata_object =
 *  {
 *     subject: fullNameUrl,
 *        predicate: 'http://example.org/property/contact#Email',
 *        object: '"' + 'EmailAddr' + '"'
 *      }
 *
 *   var metadata_array =
 *    [{
 *        subject: fullNameUrl,
 *        predicate: 'http://example.org/property/contact#Phone',
 *        object: '"' + 'phoneNum' + '"'
 *      }, {
 *        subject: fullNameUrl,
 *        predicate: 'http://example.org/property/contact#createTime',
 *        object: '"' + currentTime + '"'
 *      }, {
 *        subject: fullNameUrl,
 *        predicate: 'http://example.org/property/contact#lastModifyTime',
 *        object: '"' + currentTime + '"'
 *    }]
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 *
 */
function dbPut(db, triples, callback) {
  if (typeof triples !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    return callback(_err)
  }
  db.put(triples, function(err) {
    if (err) {
      return callback(err);
    }
    return callback();
  });
}
exports.dbPut = dbPut;

function Q_dbPut(db, triples) {
  var deferred = Q.defer();
  if (typeof triples !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    console.log(triples)
    deferred.reject(_err);
  } else {
    db.put(triples, function(err) {
      if (err) {
        deferred.reject(new Error(err));
      } else {
        deferred.resolve();
      }
    });
  }
  return deferred.promise;
}
exports.Q_dbPut = Q_dbPut;

function dbDelete(db, triples, callback) {
  if (typeof triples !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    return callback(_err)
  }
  db.del(triples, function(err) {
    if (err) {
      return callback(err)
    }
    return callback()
  })
}
exports.dbDelete = dbDelete;

function Q_dbDelete(db, triples) {
  var deferred = Q.defer();
  if (typeof triples !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    deferred.reject(_err);
  }
  db.del(triples, function(err) {
    if (err)
      deferred.reject(err);
    else
      deferred.resolve();
  })
  return deferred.promise;
}
exports.Q_dbDelete = Q_dbDelete;

/**
 * @method dbSearch
 *   put triples into database
 *
 * @param1 query
 *      array，of one or more triples that could indicate the relations of target data.
 *      As the example shows below, the "x", "y" would be the target that are being
 *      searching.
 *
 *  exmaple:
 *   var query =
 *    [{
 *        subject: "matteo",
 *        predicate: "friend",
 *        object: db.v("x")
 *      }, {
 *        subject: db.v("x"),
 *        predicate: "friend",
 *        object: db.v("y")
 *      }, {
 *        subject: db.v("y"),
 *        predicate: "friend",
 *        object: "davide"
 *      }]
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 *
 */
function dbSearch(db, query, callback) {
  if (typeof query !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    return callback(_err);
  }
  db.search(query, function(err, results) {
    if (err) {
      console.log(err);
      return callback(err)
    }
    return callback(null, results);
  });
}
exports.dbSearch = dbSearch;

function Q_dbSearch(db, query) {
  var deferred = Q.defer();
  if (typeof query !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    deferred.reject(new Error(_err));
  }
  db.search(query, function(err, results) {
    if (err) {
      console.log(err);
      deferred.reject(new Error(err));
    } else
      deferred.resolve(results);
  });

  return deferred.promise;
}
exports.Q_dbSearch = Q_dbSearch;

/**
 * @method TripleGenerator
 *   generate triples from file infomation object
 *
 * @param1 info
 *      object, contain infomastion of the file as below
 *
 *  exmaple:
 *    var info = {
 *      subject:"example",
 *      base: {
 *        URI: "exapmle",
 *        createTime: "exapmle",
 *        lastModifyTime: "exapmle",
 *        lastAccessTime: "exapmle",
 *        createDev: "exapmle",
 *        lastModifyDev: "exapmle",
 *        lastAccessDev: "exapmle",
 *        createDev: "exapmle",
 *        filename: "exapmle",
 *        postfix: "exapmle",
 *        category: "exapmle",
 *        size: "exapmle",
 *        path: "exapmle",
 *        tags: "exapmle"
 *      },
 *      extra: {
 *        project: '上海专项',
 *      }
 *    }
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 *
 */
function tripleGenerator(info, callback) {
  var _triples = [];
  try {
    var _base = info.base;
    var _subject = 'http://example.org/category#' + info.subject;
    var _object_defined = DEFINED_VOC.category[_base.category];
    _triples.push({
      subject: _subject,
      predicate: DEFINED_VOC.rdf._type,
      object: _object_defined
    });
    for (var entry in _base) {
      //tags needs specific process 
      if (entry === "tags") {
        var _tags = _base[entry];
        for (var i = 0, l = _tags.length; i < l; i++) {
          var _subject_tag = 'http://example.org/tags#' + _tags[i];
          //define tags for getAllTags()
          var _tag_triple_define = {
            subject: _subject_tag,
            predicate: DEFINED_VOC.rdf._type,
            object: DEFINED_PROP["base"]["tags"]
          };
          //define domain for getTagsInCatedory()
          var _tag_triple_domain = {
            subject: _subject_tag,
            predicate: DEFINED_VOC.rdf._domain,
            object: _object_defined
          };
          //define triples for tag searching
          var _tag_triple = {
            subject: _subject,
            predicate: DEFINED_PROP["base"]["tags"],
            object: _subject_tag
          };
          _triples.push(_tag_triple_define);
          _triples.push(_tag_triple_domain);
          _triples.push(_tag_triple);
        }
      } else {
        var _triple_base = {
          subject: _subject,
          predicate: DEFINED_PROP["base"][entry],
          object: _base[entry]
        };
        _triples.push(_triple_base);
      }
    }
  } catch (err) {
    return callback(err);
  }
  try {
    var _extra = info.extra;
    if (_extra == {}) {
      return callback(null, _triples);
    }
    for (var entry in _extra) {
      var _triple_extra = {
        subject: _subject,
        predicate: DEFINED_PROP[_base.category][entry],
        object: _extra[entry]
      };
      _triples.push(_triple_extra);
    }
  } catch (err) {
    return callback(err);
  }
  callback(null, _triples);
}
exports.tripleGenerator = tripleGenerator;

function Q_tripleGenerator(info, callback) {
  var _triples = [];
  var deferred = Q.defer();
  try {
    var _base = info.base;
    var _subject = 'http://example.org/category#' + info.subject;
    var _object_defined = DEFINED_VOC.category[_base.category];
    _triples.push({
      subject: _subject,
      predicate: DEFINED_VOC.rdf._type,
      object: _object_defined
    });
    for (var entry in _base) {
      //tags needs specific process 
      if (entry === "tags") {
        var _tags = _base[entry];
        for (var i = 0, l = _tags.length; i < l; i++) {
          var _subject_tag = 'http://example.org/tags#' + _tags[i];
          //define tags for getAllTags()
          var _tag_triple_define = {
            subject: _subject_tag,
            predicate: DEFINED_VOC.rdf._type,
            object: DEFINED_PROP["base"]["tags"]
          };
          //define domain for getTagsInCatedory()
          var _tag_triple_domain = {
            subject: _subject_tag,
            predicate: DEFINED_VOC.rdf._domain,
            object: _object_defined
          };
          //define triples for tag searching
          var _tag_triple = {
            subject: _subject,
            predicate: DEFINED_PROP["base"]["tags"],
            object: _subject_tag
          };
          _triples.push(_tag_triple_define);
          _triples.push(_tag_triple_domain);
          _triples.push(_tag_triple);
        }
      } else {
        var _triple_base = {
          subject: _subject,
          predicate: DEFINED_PROP["base"][entry],
          object: _base[entry]
        };
        _triples.push(_triple_base);
      }
    }

    var _extra = info.extra;
    if (_extra == {}) {
      deferred.resolve();
    } else {
      for (var entry in _extra) {
        var _triple_extra = {
          subject: _subject,
          predicate: DEFINED_PROP[_base.category][entry],
          object: _extra[entry]
        };
        _triples.push(_triple_extra);
      }
      deferred.resolve(_triples);
    }

  } catch (err) {
    console.log(info)
    deferred.reject(new Error(err));
  }
  return deferred.promise;
}
exports.Q_tripleGenerator = Q_tripleGenerator;

/**
 * @method decodeTripeles
 *   translate triples into info object,just a backward process of methond tripleGener-
 *    ator
 *
 * @param1 triples
 *      object, the seach result of leveldb.
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 *
 */
function decodeTripeles(triples, callback) {
  var info = {};
  for (var i = 0, l = triples.length; i < l; i++) {
    try {
      var _item = triples[i];
      var _predicate = utils.getTitle(_item.predicate);
      var _subject = _item.subject;
      var _object = _item.object;
      if (info.hasOwnProperty(_subject)) {
        if (_predicate === "tags") {
          var _tag = utils.getTitle(_object);
          if ((info[_subject]).hasOwnProperty(_predicate)) {
            (info[_subject])[_predicate].push(_tag);
          } else {
            (info[_subject])[_predicate] = [_tag];
          }
        } else {
          (info[_subject])[_predicate] = _object;
        }
      } else {
        if (_predicate === "tags") {
          var itemInfo = {};
          itemInfo[_predicate] = [_object];
          info[_subject] = itemInfo;
        } else {
          var itemInfo = {};
          itemInfo[_predicate] = _object;
          info[_subject] = itemInfo;
        }
      }
    } catch (err) {
      console.log(_item);
      return callback(err);
    }
  }
  return callback(null, info);
}
exports.decodeTripeles = decodeTripeles;

function Q_decodeTripeles(triples) {
  var info = {};
  var deferred = Q.defer();
  try {
    for (var i = 0, l = triples.length; i < l; i++) {
      var item = triples[i];
      var title = utils.getTitle(item.predicate)
      if (info.hasOwnProperty(item.subject)) {
        (info[item.subject])[title] = item.object;
      } else {
        var itemInfo = {};
        itemInfo[title] = item.object;
        info[item.subject] = itemInfo;
      }
    }
    deferred.resolve(info);
  } catch (err) {
    deferred.reject(new Error(err));
  }
  return deferred.promise;
}
exports.Q_decodeTripeles = Q_decodeTripeles;

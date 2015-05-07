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

/**
 * @method dbOpen
 *   open the levegraph database; would return a database object
 *
 *
 */
function dbOpen() {
  var db = levelgraph(config.LEVELDBPATH);
  return db;
}
exports.dbOpen = dbOpen;

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
      return callback(err)
    }
    return callback(null, results);
  });
}
exports.dbSearch = dbSearch;

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
  var _namespace_subject = 'http://example.org/category/';
  var _namespace_predicate = 'http://example.org/property/';
  var _triples = [];
  try {
    var _base = info.base;
    _triples.push({
      subject: _namespace_subject + _base.category + '#' + info.subject,
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://example.org/category#' + _base.category
    });
    for (var entry in _base) {
      var _triple_base = {
        subject: _namespace_subject + '#' + info.subject,
        predicate: _namespace_predicate + 'base#' + entry,
        object: _base[entry]
      };
      _triples.push(_triple_base);
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
        subject: _namespace_subject + '#' + info.subject,
        predicate: _namespace_predicate + _base.category + '#' + entry,
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
  } catch (err) {
    return callback(err);
  }
  return callback(null, info);
}
exports.decodeTripeles = decodeTripeles;
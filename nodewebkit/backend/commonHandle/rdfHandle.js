var fs_extra = require('fs-extra');
var config = require('../config');
var levelgraph = require('levelgraph');

/**
 * @method dbInitial
 *   Initalize the levelgraph database. This step would put the RDF Schema of type defin-
 *   ition triples into database, including base properties.
 *
 */
function dbInitial(callback) {
  var triples_base_type =
    [{
      subject: 'http://example.org/category#Base',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Class'
    }, {
      subject: 'http://example.org/property/base#createTime',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Property'
    }, {
      subject: 'http://example.org/property/base#createTime',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
      object: 'http://example.org/category#Base'
    }, {
      subject: 'http://example.org/property/base#lastModifyTime',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Property'
    }, {
      subject: 'http://example.org/property/base#lastModifyTime',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
      object: 'http://example.org/category#Base'
    }, {
      subject: 'http://example.org/property/base#lastAccessTime',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Property'
    }, {
      subject: 'http://example.org/property/base#lastAccessTime',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
      object: 'http://example.org/category#Base'
    }, {
      subject: 'http://example.org/property/base#createDev',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Property'
    }, {
      subject: 'http://example.org/property/base#createDev',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
      object: 'http://example.org/category#Base'
    }, {
      subject: 'http://example.org/property/base#lastModifyDev',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Property'
    }, {
      subject: 'http://example.org/property/base#lastModifyDev',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
      object: 'http://example.org/category#Base'
    }, {
      subject: 'http://example.org/property/base#lastAccessDev',
      predicate: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
      object: 'http://www.w3.org/2000/01/rdf-schema#Property'
    }, {
      subject: 'http://example.org/property/base#lastAccessDev',
      predicate: 'http://www.w3.org/2000/01/rdf-schema#domain',
      object: 'http://example.org/category#Base'
    }];
  var db = dbOpen();
  db.put(triples_base_type, function(err) {
    if (err) {
      db.close();
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
function dbPut(db, metadata, callback) {
  if (typeof metadata !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    return callback(_err)
  }
  db.put(metadata, function(err) {
    if (err) {
      console.log(err)
      return callback(err);
    }
    return callback();
  });
}
exports.dbPut = dbPut;

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
    callback(null, results);
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
  var _triples = [];
  var _namespace_subject = 'http://example.org/category/';
  var _namespace_predicate = 'http://example.org/property/';
  try {
    var _base = info.base;
    for (var entry in _base) {
      var _triple_base = {
        subject: _namespace_subject + _base.category + '#' + info.subject,
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
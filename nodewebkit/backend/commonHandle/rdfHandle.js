var fs_extra = require('fs-extra');
var config = require('../config');
var levelgraph = require('levelgraph');

/**
 * @method dbInitial
 *   Initalize the levelgraph database. This step would put the RDF Schema of type defin-
 *   ition triples into database, including base properties.
 *
 */
function dbInitial() {
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
  dbOpen(function(err, db) {
    if (err) {
      console.log(err)
      throw err;
    }
    db.put(triples_base_type, function(err) {
      if (err) {
        db.close();
        throw err;
      };
      return db.close();
    })
  })
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
  dbOpen(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.close();
    fs_extra.remove(config.LEVELDBPATH, function(err) {
      if (err) {
        callback(err);
      };
      return callback(null);
    })
  })
}
exports.dbClear = dbClear;

/**
 * @method dbOpen
 *   open the levegraph database
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 *
 *   @result
 *      object，the database object
 *
 */
function dbOpen(callback) {
  var db = levelgraph(config.LEVELDBPATH);
  console.log(db.isOpen());
  if (!db.isOpen()) {
    var _err = new Error("DATABASE NOT FOUND!");
    return callback(_err);
  }
  return callback(null, db);
}

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
function dbPut(metadata, callback) {
  if (typeof metadata !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    return callback(_err)
  }
  dbOpen(function(err, db) {
    if (err) {
      return callback(err);
    }
    db.put(metadata, function(err) {
      if (err) {
        db.close();
        return callback(err);
      }
      db.close();
      return callback(null);
    })
  })
}
exports.dbPut = dbPut;

/**
 * @method dbPut
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
function dbSearch(query, callback) {
  if (typeof query !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    return callback(_err);
  }
  dbOpen(function(err, db) {
    if (err) {
      return callback(err)
    }
    db.search(query, function(err, results) {
      if (err) {
        return callback(err)
      }
      callback(null, results);
    });
  })
}
exports.dbSearch = dbSearch;
/**
 * @Copyright:
 *
 * @Description: Functions dealing with RDF are presented here.
 *
 * @author: Xiquan
 *
 * @Data:2015.4.16
 *
 * @version:0.0.1
 **/
var fs_extra = require('fs-extra');
var fs = require('fs');
var pathModule = require('path');
var config = require('../config');
var levelgraph = require('levelgraph');
var utils = require('../utils');
var typeHandle = require('./typeHandle');
var DEFINED_TYPE = require('../data/default/rdfTypeDefine').vocabulary;
var DEFINED_PROP = require('../data/default/rdfTypeDefine').property;
var DEFINED_VOC = require('../data/default/rdfTypeDefine').definition;
var TYPEDEFINEDIR = config.TYPEDEFINEDIR;
var __db = levelgraph(config.LEVELDBPATH);
var Q = require('q');


var _rdf = {
  _type: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type',
  _domain: 'http://www.w3.org/2000/01/rdf-schema#domain',
  _property: 'http://www.w3.org/2000/01/rdf-schema#Property',
  _subClaseOf: 'http://www.w3.org/2000/01/rdf-schema#subClassOf',
  _Class: 'http://www.w3.org/2000/01/rdf-schema#Class'
}
exports.RDFVOC = _rdf;



/**
 * @method dbClear
 *   delete the whole database
 *
 * @param1 callback
 *   @err
 *      error，return 'null' if sucess;otherwise return err
 * @return Promise
 *      event state，which resolves with no values if sucess;
 *      otherwise, return reject with Error object
 *
 */
function dbClear() {
  var deferred = Q.defer();
  fs_extra.remove(config.LEVELDBPATH, function(err) {
    if (err) {
      deferred.reject(new Error(err));
    } else
      deferred.resolve();
  });
  return deferred.promise;
}
exports.dbClear = dbClear;


/**
 * @method dbOpen
 *   open the levegraph database; would return a database object
 * @return
 *      Ojbject, levelgraph DataBase;
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
 * @param1 db
 *      object，represent an writable DataBase
 * @return Promise
 *      event state，which resolves with no values if sucess;
 *      otherwise, return reject with Error object
 */
function dbClose(db) {
  var deferred = Q.defer;
  return Q.fcall(function() {});
}
exports.dbClose = dbClose;


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
 * @return
 *      Promise , an event state，which present onfulfilled with no returns if sucess;
 *                otherwise, return reject with Error object
 */
function dbPut(db, triples) {
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
exports.dbPut = dbPut;


function dbDelete(db, triples) {
  var deferred = Q.defer();
  if (typeof triples !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    deferred.reject(_err);
  } else {
    db.del(triples, function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    })
  }
  return deferred.promise;
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
 * @return Promise
 *      an event state，which is a query jason of information from Triplese if sucess;
 *      otherwise, return reject with Error object
 */
function dbSearch(db, query) {
  var deferred = Q.defer();
  if (typeof query !== 'object') {
    var _err = new Error("INPUT TYPE ERROR!");
    deferred.reject(new Error(_err));
  } else {
    db.search(query, function(err, results) {
      if (err) {
        console.log(err);
        deferred.reject(new Error(err));
      } else {
        deferred.resolve(results);
      }
    });
  }
  return deferred.promise;
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
 * @return Promise
 *    an event state，which is an arry of triple if sucess;
 *    otherwise, return reject with Error object;    
 *
 */
function tripleGenerator(info) {
  var _triples = [];
  var deferred = Q.defer();
  try {
    if (info === null) {
      deferred.resolve(null);
    } else {
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
    deferred.reject(new Error(err));
  }
  return deferred.promise;
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
 * @return Promise
 *    an event state，which is a stack of information from Triplese if sucess;
 *    otherwise, return reject with Error object
 *
 */
function decodeTripeles(triples) {
  var info = {};
  var deferred = Q.defer();
  try {
    for (var i = 0, l = triples.length; i < l; i++) {

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
    }
    deferred.resolve(info);
  } catch (err) {
    console.log(_item);
    deferred.reject(new Error(err));
  }
  return deferred.promise;
}
exports.decodeTripeles = decodeTripeles;


function defTripleGenerator(info) {
  var _triples = [];
  for (var item in info) {
    var _type_item = info[item];
    _triples.push({
      subject: _type_item.subject,
      predicate: _rdf._type,
      object: _rdf._Class
    });
    for (var _property in _type_item) {
      _triples.push({
        subject: _type_item[_property],
        predicate: _rdf._type,
        object: _rdf._property
      });
      _triples.push({
        subject: _type_item[_property],
        predicate: _rdf._domain,
        object: _type_item.subject
      });
    }
  }
  return _triples;
}
exports.defTripleGenerator = defTripleGenerator;


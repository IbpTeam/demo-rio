var fs = require('fs');
var config = require('../config');
var TYPEFILEDIR = config.TYPEFILEDIR;
var TYPECONFPATH = config.TYPECONFPATH;
var pathModule = require('path');
var config = require('../config.js');
var rdfHandle = require('./rdfHandle');
var Q = require('q');

//some promised method
var Q_read_dir = Q.nbind(fs.readdir);
var Q_read_file = Q.nbind(fs.readFile);
var Q_write_file = Q.nbind(fs.writeFile);


/**
 * @method dbInitial
 *   Initalize the levelgraph database. This step would put the RDF Schema of type defin-
 *   ition triples into database, including base properties.
 *
 */
function initTypeDef() {
  var allTriples = [];
  return getDefinedTypeProperty()
    .then(rdfHandle.defTripleGenerator)
    .then(function(triples_) {
      var _db = rdfHandle.dbOpen();
      rdfHandle.dbPut(_db, triples_);
      return triples_;
    });
}
exports.initTypeDef = initTypeDef;



function getDefinedTypeProperty() {

  function resolveProperty(fileList) {
    var _property = {};
    var _postfix = {};
    var _category = {};
    for (var i = 0, l = fileList.length; i < l; i++) {
      var _name = pathModule.basename(fileList[i], '.type');
      var _file_path = pathModule.join(TYPEFILEDIR, fileList[i]);
      var _raw_content = fs.readFileSync(_file_path, 'utf8');
      var _content = JSON.parse(_raw_content);
      //info for type define triples
      _property[_name] = _content.property;
      _property[_name]["subject"] = "'http://example.org/category#" + _name;
    }
    return refreshConfFile();
  }
  return Q_read_dir(TYPEFILEDIR)
    .then(resolveProperty);
}
exports.getDefinedTypeProperty = getDefinedTypeProperty;


/**
 * @method getProperty
 *   get property info object of obne kind of category
 *
 * @param1 category
 *   @string
 *      a type category name
 *
 */
function getProperty(category) {
  return readConfFile()
    .then(function(_type_conf) {
      if (_type_conf["property"][category]) {
        return readTypeFile(_type_conf["property"][category])
      } else {
        throw new Error("TYPE NOT REGISTERED");
      }
    });
}
exports.getProperty = getProperty;


/**
 * @method readTypeFile
 *   read the content of typeDefine.conf
 *   return the result of string
 *
 *   a *.type file would contain an object as below:
 *   {
 *      "property":{},
 *      "postfix":{}
 *    }
 *
 * @param1 path
 *   @string
 *      a full path string of *.type file
 *
 */
function readTypeFile(path) {
  return Q_read_file(path)
    .then(function(content_) {
      return JSON.parse(content_);
    });
}


/**
 * @method readConfFile
 *   read the content of typeDefine.conf
 *   return the result of string
 *
 */
function readConfFile() {
  return Q_read_file(TYPECONFPATH)
    .then(function(content_) {
      return JSON.parse(content_);
    });
}

/**
 * @method readConfFile
 *   rewrite the typeDefine.conf based on current *.type file
 *
 */
function refreshConfFile() {
  var _combination = [];
  var _property = {};
  return Q_read_dir(TYPEFILEDIR)
    .then(function(file_list_) {
      for (var i = 0, l = file_list_.length; i < l; i++) {
        var _file_path = pathModule.join(TYPEFILEDIR, file_list_[i]);
        var _name = pathModule.basename(file_list_[i], '.type');
        _property[_name] = _file_path;
        _combination.push(readTypeFile(_file_path));
      }
      return Q.all(_combination)
        .then(function(result) {
          var _postfix = {}
          for (var j = 0, m = result.length; j < m; j++) {
            for (var item_ in result[j]["postfix"]) {
              _postfix[item_] = result[j]["postfix"][item_];
            }
          }
          var _type_info = {
            property: _property,
            postfix: _postfix
          }
          return Q_write_file(TYPECONFPATH, JSON.stringify(_type_info, null, 2));
        })
    })
}
exports.refreshConfFile = refreshConfFile;
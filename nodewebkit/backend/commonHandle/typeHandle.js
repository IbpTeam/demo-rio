var fs = require('fs');
var config = require('../config');
var TYPEDEFINEDIR = config.TYPEDEFINEDIR;
var TYPECONFPATH = config.TYPECONFPATH;
var pathModule = require('path');
var config = require('../config.js');
var rdfHandle = require('./rdfHandle');
var Q = require('q');

//some promised method
var Q_read_dir = Q.nbind(fs.readdir);
var Q_read_file = Q.nbind(fs.readFile);


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
    var _category = {};
    for (var i = 0, l = fileList.length; i < l; i++) {
      var _name = pathModule.basename(fileList[i], '.type');
      var _file_path = pathModule.join(TYPEDEFINEDIR, fileList[i]);
      var _raw_content = fs.readFileSync(_file_path, 'utf8');
      var _content = JSON.parse(_raw_content);
      _property[_name] = _content;
      _property[_name]["subject"] = "'http://example.org/category#" + _name;
      _category[_name] = _file_path;
    }
    var _content_type_define = JSON.stringify(_category, null, 4);
    fs.writeFileSync(TYPECONFPATH, _content_type_define);
    return _property;
  }
  return Q_read_dir(TYPEDEFINEDIR)
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
      if (_type_conf[category]) {
        return readTypeFile(_type_conf[category])
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
 * @param1 path
 *   @string
 *      a full path string of *.type file
 *
 */
function readTypeFile(path) {
  return Q_read_file(path)
    .then(function(content_) {
      return content_.toString();
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
var fs = require('fs');
var config = require('../config');
var TYPEDEFINEDIR = config.TYPEDEFINEDIR;
var TYPECONFPATH = config.TYPECONFPATH;
var pathModule = require('path');
var config = require('../config.js');
var rdfHandle = require('./rdfHandle');
var Q = require('q');


/**
 * @method dbInitial
 *   Initalize the levelgraph database. This step would put the RDF Schema of type defin-
 *   ition triples into database, including base properties.
 *
 */
function initTypeDef() {
  var allTriples = [];
  getDefinedTypeProperty(TYPEDEFINEDIR)
    .then(rdfHandle.defTripleGenerator)
    .then(function(triples_) {
      var _db = rdfHandle.dbOpen();
      rdfHandle.dbPut(_db, triples_);
    })
    .fail(function(err) {
      throw err
    })
    .done();
}
exports.initTypeDef = initTypeDef;


function getDefinedTypeProperty(dir) {
  var Q_read_dir = Q.nbind(fs.readdir);

  function resolveProperty(fileList) {
    var _property = {};
    var _category = {};
    for (var i = 0, l = fileList.length; i < l; i++) {
      var _name = pathModule.basename(fileList[i], '.type');
      var _file_path = pathModule.join(dir, fileList[i]);
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
  return Q_read_dir(dir)
    .then(resolveProperty);
}
exports.getDefinedTypeProperty = getDefinedTypeProperty;
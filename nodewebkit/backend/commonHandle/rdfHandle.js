var config = require('../config');
var levelgraph = require('levelgraph');
var db = levelgraph(config.LEVELDBPATH);

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

  db.put(triples_base_type, function(err) {
    if (err) throw err;
    return;
  })
}
exports.dbInitial = dbInitial;
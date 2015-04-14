/**
 * @Copyright:
 *
 * @Description: test n3 for data search.
 *
 * @author: Xiquan
 *
 * @Data:2015.4.14
 *
 * @version:0.1
 **/

var fs = require('fs');
var rdfstore = require('rdfstore');
var levelgraph = require('levelgraph');
var levelgraphN3 = require('levelgraph-n3');
var db = levelgraph("yourdb");

/*search in memory***************************************************************/
fs.readFile('./default.n3', function(err, data) {
  if (err) throw err;
  var turtleString = data.toString();
  rdfstore.create(function(err, store) {
    //var startTime = new Date();
    store.load("text/turtle", turtleString, function(err, results) {
      if (err) throw err;

      var str_sparql = "SELECT ?createTime WHERE { <http://example.org/item/contact#FullName0> <http://example.org/property/contact#createTime> ?createTime }";
      //var str_sparql = "SELECT * { ?s ?p ?o}";
      var startTime = new Date();
      store.execute(str_sparql, function(err, results) {
        if (!err) {
          // process results         
          var endTime = new Date();
          var timeSpan = endTime.getTime() - startTime.getTime();
          return console.log("search inmemory time span: " + timeSpan);
          //return console.log(results);
        }
      });
    });
  });
});


/*search in db********************************************************************/
var obj_triple = {
  subject: "http://example.org/item/contact#FullName0",
  predicate: "http://example.org/property/contact#createTime",
  object: db.v('z')
}
// var obj_triple = {
//   subject: db.v('x'),
//   predicate: db.v('y'),
//   object: db.v('z')
// }
var startTime = new Date();
db.search([obj_triple], function(err, results) {
  var endTime = new Date();
  var timeSpan = endTime.getTime() - startTime.getTime();
  return console.log("search levedb time span: " + timeSpan);
});

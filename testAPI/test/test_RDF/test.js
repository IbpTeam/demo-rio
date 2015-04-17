/**
 * @Copyright:
 *
 * @Description: test n3 for data generate.
 *
 * @author: Xiquan
 *
 * @Data:2015.4.14
 *
 * @version:0.1
 **/

var fs = require('fs');
var n3_write_orign = require('./n3Effi3.js');
var levelgraph = require('levelgraph');
var levelgraphN3 = require('levelgraph-n3');
var db = levelgraphN3(levelgraph('yourdb'));

n3_write_orign.test_N3(function callback(err, time) {
  if (err) {
    return console.log(err);
  }
  var cbCalled = false;
  var stream = fs.createReadStream("./default.n3")
    .pipe(db.n3.putStream());

  stream.on("error", function(err) {
    done(err);
  })
  stream.on("finish", function() {
    done(null, time);
  });

  function done(err, result) {
    if (!cbCalled) {
      return;
      cbCalled = true;
    }
  }

})

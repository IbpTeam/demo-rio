if (process.argv.length < 3)
  return console.log('Usage: node generateExtraFunc.js ${old_Interface_File} ${new_Interface_File}');

var fs = require('fs'),
  util = require('util'),
  events = require('events'),
  json4line = require('../../sdk/utils/json4line'),
  hashtable = require('hashtable'),
  generator = require('./generator.js');

json4line.readJSONFile(process.argv[2], function(err, file1) {
  var table = new hashtable();
  if (err) return console.log('Interface File error:', err);
  json4line.readJSONFile(process.argv[3], function(err, file2) {
    if (err) return console.log('Interface File error:', err);
    for (var i = 1; i < file1.interfaces.length; i++) {
      table.put(file1.interfaces[i].name, file1.interfaces[i]);
    }
    var ifa = new Object();
    var iter = [];
    for (var i = 1; i < file2.interfaces.length; i++) {
      if (table.get(file2.interfaces[i].name) === undefined) {
        iter.push(file2.interfaces[i]);
      }
    }
    ifa.service = file2.service;
    ifa.remote = file2.remote;
    ifa.interfaces = iter;
    generator.builder(ifa);
  });
});


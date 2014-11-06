var run = require('tape').test;
var stream = require('file-stream');
var fs = require('fs');
var http = require('http');
var request = require('request');
var HashTable = require('hashtable');
var serverModule = require('./server');
var client = require('./client');

var pathMap = new HashTable();

function addPath(key, path, callback) {
  console.log('add path----------------' + key + ' ' + path);
  pathMap.put(key, path);
  callback(pathMap);
}
exports.addPath = addPath;

function transferFile(server, ltnServer, callback) {
  if (server === undefined) {
    console.log('------no server!!!!');
    server = http.createServer(function(req, res) {
      var key = req.url.substring(1);
      if (key === undefined) {
        console.log('no such a file');
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('no such a file ' + key + '\n');
      } else {
        var info = pathMap.get(key);
        if (info === undefined) {
          console.log('file info error');
          pathMap.remove(key);
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('file info error ' + key + '\n');
        } else {
          console.log('info----' + info);
          if (!stream(info, req, res)) {
            res.statusCode = 404;
            res.setHeader('Content-Type', 'text/plain');
            res.end('unable to stream ' + info + '\n');   
          } else {
            console.log('path:' + info);               
          }
        }
      }
    }).listen(0);
    serverModule.startServer(0, function(myServer) {
      console.log('' + myServer.address().port);
      callback(false, 'init ok', server, myServer);
    });
  } else {
    console.log('exist  server==========');
    callback(false, 'init ok', server, ltnServer);
  }
}
exports.transferFile = transferFile;
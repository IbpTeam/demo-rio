var run = require('tape').test;
var stream = require('file-stream');
var fs = require('fs');
var http = require('http');
var request = require('request');
var HashTable = require('hashtable');
var serverModule = require('./server');
var client=require('./client');

var pathMap=new HashTable();  

function addPath(key,path,callback){
  console.log('add path----------------'+key+' '+path);
//  var pathInfo=path;//{path:path};
  pathMap.put(key,path);
  callback(pathMap);
}
exports.addPath=addPath;

function transferFile(server,callback){
  if(server===undefined){
    console.log('------no server!!!!');
    server = http.createServer(function(req, res) {
      var key=req.url.substring(1);
      if(key===undefined){
  console.log('no such a file');  
  res.statusCode = 404;      
  res.setHeader('Content-Type', 'text/plain');     
  res.end('no such a file ' + key + '\n');
//  callback(true,'no such a file',server);
      }else{
  var info=pathMap.get(key);
        if(info===undefined){
    console.log('file info error');
    pathMap.remove(key);
    res.statusCode = 404;      
    res.setHeader('Content-Type', 'text/plain');     
    res.end('file info error ' + key + '\n');
//    callback(true,'file info error',server);
  }else{
    console.log('info----'+info);      
    if (!stream(info, req, res)) {          
      res.statusCode = 500;       
      res.setHeader('Content-Type', 'text/plain');        
      res.end('unable to stream ' + info + '\n');      
  //      callback(true,'file transfer error',server);            
    }else{        
      console.log('path:'+info);
  //      callback(false,'file transfer ok',server);
        // console.log(util.inspect(res));                      
    } 
  }
      }
    }).listen(0);
    callback(false,'init ok',server);
  }else{
    console.log('exist  server==========');
    setTimeout(callback(false,'init ok',server), 0);
  }
}
exports.transferFile=transferFile;
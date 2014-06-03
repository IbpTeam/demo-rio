var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");

var PORT = 8888,
    mimeTypes = {
     "html": "text/html",
     "jpeg": "image/jpeg",
     "jpg": "image/jpeg",
     "png": "image/png",
     "js": "text/javascript",
     "css": "text/css",
     "txt": "text/plain"
};



function walk(path,fileList){  
  var dirList = fs.readdirSync(path);
  dirList.forEach(function(item){
    if(fs.statSync(path + '/' + item).isDirectory()){
      walk(path + '/' + item);
    }
    else{
      fileList.push(path + '/' + item);
    }
  });
}

 
function syncDb()
{
  var fileList = new Array();
        fileList.push("aaaaaa");
  //walk('/home/v1/demo-resources',fileList);
  console.log(fileList); 
}

exports.syncDb = syncDb;

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = url.parse(request.url).pathname;
     
    console.log("Request for " + pathname + " received.");

    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+ postDataChunk + "'.");
    });
    request.addListener("end", function() {
      route(handle, pathname, response, postData);
    });

  }

  http.createServer(onRequest).listen(PORT);
  console.log("Server has started.");
}

exports.start = start;


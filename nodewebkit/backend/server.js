var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
//var categoryDAO = require("../../DAO/CategoryDAO");

/*
var data
function findAllCallBack(err, rows){
  var category = new Array();
  rows.forEach(function (row){
    category.push({
      id:row.id,
      type:row.type,
      desc:row.desc
    });
  });
  console.log(category);
  
}
*/
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
    //categoryDAO.findAll(findAllCallBack);
    request.addListener("end", function() {
      route(handle, pathname, response, postData);
    });

  }

  http.createServer(onRequest).listen(PORT);
  console.log("Server has started.");
}

exports.start = start;


var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");

var PORT = 8888;

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
        console.log(url.parse(request.url));
    var pathname = url.parse(request.url).pathname;
    var absolute = url.parse(request.url).query;

    console.log("Request for " + pathname + " received.");
    console.log("Request for " + absolute );
    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+ postDataChunk + "'.");
    });
    request.addListener("end", function() {
      route(handle, pathname, absolute, response, postData);
    });

  }

  http.createServer(onRequest).listen(PORT);
  console.log("Server has started.");
  filesHandle.monitorFiles('/home/wangtan/resources');
}

exports.start = start;

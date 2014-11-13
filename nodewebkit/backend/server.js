var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var filesHandle = require("./filesHandle");
var util = require('util');
var cp = require('child_process');
var now= new Date();  

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
    var pathname = decodeURIComponent(url.parse(request.url).pathname);

    config.riolog("Request for " + pathname + " received.");
    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      config.riolog("Received POST data chunk '"+ postDataChunk + "'.");
    });
    request.addListener("end", function() {
      route(handle, pathname, response, postData);
    });
  }
  http.createServer(onRequest).listen(config.SERVERPORT);
  config.riolog("Server has started.");
}

exports.start = start;


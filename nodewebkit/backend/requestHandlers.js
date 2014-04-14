var querystring = require("querystring");
var fs = require('fs');
var categoryDAO = require("../DAO/CategoryDAO");

function start(response, postData) {
  console.log("Request handler 'start' was called.");
  
}

function getall(response, postData) {

  console.log("Request handler 'getall' was called.");
  
  if(postData == '{"func":"getall","arg":"null"}'){
    categoryDAO.findAll();
    categoryDAO.getEmitter().once('findAll', function(data){
      response.writeHead(200, {"Content-Type": "application/json"});
      var json=JSON.stringify(data);
      response.write(json);
      response.end();
    });
  }
  else{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
}



exports.start = start;
exports.getall = getall;

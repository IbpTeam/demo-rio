var querystring = require("querystring");
var api = require("./api");
var fs = require('fs');
var res;
var categoryDAO = require("../DAO/CategoryDAO");

function start(response, postData) {
  console.log("Request handler 'start' was called.");
  
}

function upload(response, postData) {
  console.log("Request handler 'upload' was called.");
  res=response;
  categoryDAO.findAll();
  categoryDAO.getEmitter().on('findAll', function(category){
    console.log('+++++++++++++++++++++++++++++');
    console.log(category);
  });
  //var json=JSON.parse(postData);
  if(postData == '{"func":"getall","arg":"null"}'){
    
  }else{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("File list : "+ postData);
    response.end();
  }
}



exports.start = start;
exports.upload = upload;

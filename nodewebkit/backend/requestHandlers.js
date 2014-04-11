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
  if(postData == '{"func":"getall","arg":"null"}'){

  if(postData == '{"func":"getall","arg":"null"}'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    var str='{"postfix":"jpg", "filename":"girl1","id":"2", "path":"./demo-rion", "time":2014}';
    var json=JSON.parse(str);
    var text=JSON.stringify(json);
    response.write(text);
    response.end();
  }else{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
}



exports.start = start;
exports.upload = upload;

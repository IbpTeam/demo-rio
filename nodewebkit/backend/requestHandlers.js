var querystring = require("querystring");
var api = require("./api");
var fs = require('fs');
var categoryDAO = require("../DAO/CategoryDAO");

function start(response, postData) {
  console.log("Request handler 'start' was called.");
  
}

function getall(response, postData) {

  console.log("Request handler 'getall' was called.");

  categoryDAO.findAll();
  categoryDAO.getEmitter().on('findAll', function(data){
 
    
    if(postData == '{"func":"getall","arg":"null"}'){
    response.writeHead(200, {"Content-Type": "application/json"});
//    var str='{"postfix":"jpg", "filename":"girl1","id":"2", "path":"./demo-rion", "time":2014}';
//    var json=JSON.parse(str);
//    var text=JSON.stringify(json);
//    console.log("$$$$$$$$$$$$$$$$$$$$$$$$");
//    console.log(data);
//    console.log("############################3");
//    var json=JSON.parse(data[0]);
      var json=JSON.stringify(data);
      response.write(json);
      response.end();
    }else{
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write("error func");
      response.end();
  }
    
    
  });
//  if(postData == '{"func":"getall","arg":"null"}'){

  
}



exports.start = start;
exports.getall = getall;

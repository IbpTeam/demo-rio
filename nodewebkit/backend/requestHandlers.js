var querystring = require("querystring");
var api = require("./api");
var fs = require('fs');
var res;
var categoryDAO = require("../../DAO/CategoryDAO");
categoryDAO.findAll(findAllCallBack);

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
  res.writeHead(200, {"Content-Type": "text/plain"});
  res.write("File list : "+ category);
  res.end();
  
}

function start(response, postData) {
  console.log("Request handler 'start' was called.");
  
}

function upload(response, postData) {
  console.log("Request handler 'upload' was called.");
  res=response;
  //var json=JSON.parse(postData);
  if(postData == '{"func":"getall","arg":"null"}'){
    categoryDAO.findAll(findAllCallBack);

    //response.writeHead(200, {"Content-Type": "text/plain"});
    //response.write("File list : "+ postData);
    //response.end();
  }else{
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("File list : "+ postData);
    response.end();
  }
}



exports.start = start;
exports.upload = upload;

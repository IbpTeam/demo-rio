var querystring = require("querystring");
var fs = require('fs');
var categoryDAO = require("./DAO/CategoryDAO");
var commonDAO = require("./DAO/CommonDAO");

function start(response, postData) {
  console.log("Request handler 'start' was called.");
  
}
exports.start = start;

function getAllCateInHttpServer(response, postData) {

  console.log("Request handler 'getAllCateInHttpServer' was called.");
  
  if(postData == '{"func":"getAllCate","arg":"null"}'){
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
exports.getAllCateInHttpServer = getAllCateInHttpServer;

function getAllDataByCateInHttpServer(response, postData) {

  console.log("Request handler 'getAllDataByCateInHttpServer' was called.");
    console.log(postData);
    postDataJson=JSON.parse(postData);
     console.log('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getAllDataByCate'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getAllByCaterotyCb(data)
    {
      var cates = new Array();
      data.forEach(function (each){
        cates.push({
          filename:each.filename,
          source:"./resource/video.png"
        });
      });
      var json=JSON.stringify(cates);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
    commonDAO.getAllByCateroty(getAllByCaterotyCb,postDataJson.arg);
/*    commonDAO.getAllByCateroty(getAllByCaterotyCb,cate);
    switch(postDataJson.arg){
      case 'Contacts' :{
        contactsDAO.findAll();
        contactsDAO.getEmitter().once('findAll', function(data){
        response.writeHead(200, {"Content-Type": "application/json"});
//        var json=JSON.stringify(data);
        response.write(data[0].name);
        response.end();
      }); 
      }
      break;
      
      case 'Pictures' :{
        picturesDAO.findAll();
        picturesDAO.getEmitter().once('findAll', function(data){
        response.writeHead(200, {"Content-Type": "application/json"});
//        var json=JSON.stringify(data);
        response.write(data);
        response.end();
      }); 
      }
      break;
      
      case 'Videos' :{
        videosDAO.findAll();
        videosDAO.getEmitter().once('findAll', function(data){
        response.writeHead(200, {"Content-Type": "application/json"});
//        var json=JSON.stringify(data);
        response.write(data);
        response.end();
      });
      }
      break; 
    }
  }
/*  if(postData == '{"func":"getAllDataByCate","arg":"contacts"}'){
    contactsDAO.findAll();
    contactsDAO.getEmitter().once('findAll', function(data){
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
  }*/
}
}
exports.getAllDataByCateInHttpServer = getAllDataByCateInHttpServer;

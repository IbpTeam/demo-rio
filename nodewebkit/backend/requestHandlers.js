var querystring = require("querystring");
var fs = require('fs');
var categoryDAO = require("../DAO/CategoryDAO");
var contactsDAO = require("../DAO/ContactsDAO");
var picturesDAO = require("../DAO/PicturesDAO");
var videosDAO = require("../DAO/VideosDAO");

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
    switch(postDataJson.arg){
      case 'Contacts' :{
        contactsDAO.findAll();
        contactsDAO.getEmitter().once('findAll', function(data){
        response.writeHead(200, {"Content-Type": "application/json"});
        var json=JSON.stringify(data);
        response.write(json);
        response.end();
      }); 
      }
      break;
      
      case 'Pictures' :{
        picturesDAO.findAll();
        picturesDAO.getEmitter().once('findAll', function(data){
        response.writeHead(200, {"Content-Type": "application/json"});
        var json=JSON.stringify(data);
        response.write(json);
        response.end();
      }); 
      }
      break;
      
      case 'Videos' :{
        videosDAO.findAll();
        videosDAO.getEmitter().once('findAll', function(data){
        response.writeHead(200, {"Content-Type": "application/json"});
        var json=JSON.stringify(data);
        response.write(json);
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
exports.getAllDataByCateInHttpServer = getAllDataByCateInHttpServer;

var querystring = require("querystring");
var fs = require('fs');
var categoryDAO = require("./DAO/CategoryDAO");
var commonDAO = require("./DAO/CommonDAO");
var server = require("./server");

function start(response, postData) {
  console.log("Request handler 'start' was called.");
  
}
exports.start = start;

function loadResourcesInHttpServer(response, postData) {
  console.log("Request handler 'loadResourcesInHttpServer' was called.");
    console.log(postData);
    postDataJson=JSON.parse(postData);
     console.log('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'loadResources'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function loadResourcesCb(result)
    {
      var json=JSON.stringify(result);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
    server.syncDb(loadResourcesCb,postDataJson.arg);
  }
}
exports.loadResourcesInHttpServer = loadResourcesInHttpServer;

function getAllCateInHttpServer(response, postData) {
  console.log("Request handler 'getAllCateInHttpServer' was called.");
  if(postData == '{"func":"getAllCate","arg":"null"}'){
    function getCategoriesCb(data)
    {
      var cates = new Array();
      data.forEach(function (each){
        cates.push({
          id:each.id,
          type:each.type,
          path:each.logoPath
        });
      });
      var json=JSON.stringify(cates);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
    commonDAO.getCategories(getCategoriesCb);
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
          id:each.id,
          filename:each.filename,
          postfix:each.postfix,
          path:each.path
        });
      });
      console.log('####'+cates[1].id);
      console.log('####'+cates[1].filename);
      console.log('####'+cates[1].source);
      var json=JSON.stringify(cates);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
    commonDAO.getAllByCateroty(postDataJson.arg,getAllByCaterotyCb);
  }
}
exports.getAllDataByCateInHttpServer = getAllDataByCateInHttpServer;

function getAllContactsInHttpServer(response, postData) {

  console.log("Request handler 'getAllContactsInHttpServer' was called.");
    console.log(postData);
    postDataJson=JSON.parse(postData);
     console.log('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getAllContacts'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getAllByCaterotyCb(data)
    {
      var contacts = new Array();
      data.forEach(function (each){
        contacts.push({
          id:each.id,
          name:each.name,
          photoPath:each.photoPath
        });
      });
      console.log('####'+contacts[1].id);
      console.log('####'+contacts[1].name);
      console.log('####'+contacts[1].photoPath);
      var json=JSON.stringify(contacts);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
    commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
  }
}
exports.getAllContactsInHttpServer = getAllContactsInHttpServer;

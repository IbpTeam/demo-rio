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
          path:each.logoPath,
          desc:each.desc
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
      var cates = new Array();
      data.forEach(function (each){
        cates.push({
          id:each.id,
          name:each.name,
          photoPath:each.photoPath
        });
      });
      var json=JSON.stringify(cates);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
    commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
  }
}
exports.getAllContactsInHttpServer = getAllContactsInHttpServer;

function rmDataByIdInHttpServer(response, postData) {

  console.log("Request handler 'rmDataByIdInHttpServer' was called.");
    console.log(postData);
    postDataJson=JSON.parse(postData);
     console.log('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'rmDataById'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getItemByIdCb(item){
      if(item == null){
        var json=JSON.stringify('success');
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(json);
        response.end();
      }
      else{
        console.log("delete : "+ item.path);
        function ulinkCb(result){
          function rmDataByIdCb(result){
            console.log("delete result:"+result);
            var json=JSON.stringify(result);
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(json);
            response.end();
          }
          if(result==null){
            result='success';
            commonDAO.deleteItemById(postDataJson.arg,server.deleteItemCb,rmDataByIdCb);
          }
          else{
            console.log("delete result:"+result);
            var json=JSON.stringify('error');
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(json);
            response.end();
          }
        }
        fs.unlink(item.path,ulinkCb);
      }
    }
    commonDAO.getItemById(postDataJson.arg,getItemByIdCb);
  }
}
exports.rmDataByIdInHttpServer = rmDataByIdInHttpServer;

function getDataByIdInHttpServer(response, postData) {

  console.log("Request handler 'getDataByIdInHttpServer' was called.");
    console.log(postData);
    postDataJson=JSON.parse(postData);
     console.log('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getDataById'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getItemByIdCb(item){
      console.log("delete result:"+item);
      var json=JSON.stringify(item);
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write(json);
      response.end();
    }
    commonDAO.getItemById(postDataJson.arg,getItemByIdCb);
  }
}
exports.getDataByIdInHttpServer = getDataByIdInHttpServer;

function getDataSourceByIdInHttpServer(response, postData) {

  console.log("Request handler 'getDataSourceByIdInHttpServer' was called.");
    console.log(postData);
    postDataJson=JSON.parse(postData);
     console.log('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getDataSourceById'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getItemByIdCb(item){
      console.log("read data : "+ item.path);
      var path='http://localhost:8888'+item.path+'?query=absolute';
      var source={
        openmethod:'direct',
        content:path
      };
      var json=JSON.stringify(source);
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write(json);
      response.end();
    }
    commonDAO.getItemById(postDataJson.arg,getItemByIdCb);
  }
}
exports.getDataSourceByIdInHttpServer = getDataSourceByIdInHttpServer;

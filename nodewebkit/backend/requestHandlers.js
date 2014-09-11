var querystring = require("querystring");
var fs = require('fs');
var categoryDAO = require("./DAO/CategoryDAO");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var config = require('./config');


function rmDataByUriInHttpServer(response, postData) {

  config.riolog("Request handler 'rmDataByUriInHttpServer' was called.");
    config.riolog(postData);
    postDataJson=JSON.parse(postData);
     config.riolog('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'rmDataByUri'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getItemByUriCb(item){
      if(item == null){
        var json=JSON.stringify('success');
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(json);
        response.end();
      }
      else{
        config.riolog("delete : "+ item.path);
        function ulinkCb(result){
          function rmDataByUriCb(result){
            config.riolog("delete result:"+result);
            var json=JSON.stringify(result);
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(json);
            response.end();
          }
          if(result==null){
            result='success';
            commonDAO.deleteItemByUri(postDataJson.arg,server.deleteItemCb,rmDataByUriCb);
          }
          else{
            config.riolog("delete result:"+result);
            var json=JSON.stringify('error');
            response.writeHead(200, {"Content-Type": "application/json"});
            response.write(json);
            response.end();
          }
        }
        fs.unlink(item.path,ulinkCb);
      }
    }
    commonDAO.getItemByUri(postDataJson.arg,getItemByUriCb);
  }
}
exports.rmDataByUriInHttpServer = rmDataByUriInHttpServer;

function getDataByUriInHttpServer(response, postData) {

  config.riolog("Request handler 'getDataByUriInHttpServer' was called.");
    config.riolog(postData);
    postDataJson=JSON.parse(postData);
     config.riolog('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getDataByUri'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getItemByUriCb(item){
      config.riolog("delete result:"+item);
      var json=JSON.stringify(item);
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write(json);
      response.end();
    }
    commonDAO.getItemByUri(postDataJson.arg,getItemByUriCb);
  }
}
exports.getDataByUriInHttpServer = getDataByUriInHttpServer;

function getDataSourceByUriInHttpServer(response, postData) {

  config.riolog("Request handler 'getDataSourceByIdInHttpServer' was called.");
    config.riolog(postData);
    postDataJson=JSON.parse(postData);
     config.riolog('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getDataSourceByUri'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getItemByUriCb(item){
      if(item==null){
        source=null;
        var json=JSON.stringify(source);
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(json);
        response.end();
      }
      else{
        config.riolog("read data : "+ item.path);
        if(item.postfix==null){
          var source={
            openmethod:'direct',
            content:'http://'+config.SERVERIP+':'+config.SERVERPORT+item.path+'?query=absolute'
          };
          var json=JSON.stringify(source);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(json);
          response.end();
        }
        else if(item.postfix=='jpg'||item.postfix=='png'||item.postfix=='txt'||item.postfix=='ogg'){
          var source={
            openmethod:'direct',
            content:'http://'+config.SERVERIP+':'+config.SERVERPORT+item.path+'?query=absolute'
          };
          var json=JSON.stringify(source);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(json);
          response.end();
        }
        else if(item.postfix == 'ppt' || item.postfix == 'pptx'|| item.postfix == 'doc'|| item.postfix == 'docx'|| item.postfix == 'wps'|| item.postfix == 'odt'|| item.postfix == 'et'||  item.postfix == 'xls'|| item.postfix == 'xlsx'){
          item.path = decodeURIComponent(item.path);
          filesHandle.openFileByPath(item.path,function(port){
          var source={
            openmethod:'remote',
            content:port
          };
          var json=JSON.stringify(source);
          response.writeHead(200, {"Content-Type": "text/plain"});
          response.write(json);
          response.end();
        });
        }

        var currentTime = (new Date()).getTime();
        
        config.riolog("time: "+ currentTime);
        function updateItemValueCb(uri,version,cbItem,result){
          config.riolog("update DB: "+ result);
          if(result!='successfull'){
            commonDAO.updateItemValue(uri,version,cbItem,updateItemValueCb);
          }
          else{
            var index=id.indexOf('#');
            var tableId=id.substring(0,index);
            var dataId=id.substr(index+1);
            var tableName;
            switch(tableId){
              case '1' :{
                tableName='contacts';
              }
              break;
              case '2' :{
                tableName='pictures';
              }
              break;
              case '3' :{
                tableName='videos';
              }
              break;
              case '4' :{
                tableName='documents';
              }
              break;
              case '5' :{
                tableName='music';
              }
              break;                                    
            }
            function updateRecentTableCb(tableName,dataId,time,result){
              config.riolog("update recent table: "+ result);
              if(result!='successfull'){
                filesHandle.sleep(1000);
                commonDAO.updateRecentTable(tableName,dataId,parseInt(currentTime),updateRecentTableCb);
              }
            }
            commonDAO.updateRecentTable(tableName,dataId,parseInt(currentTime),updateRecentTableCb);
          }
        }
        var updateItem = {
          lastAccessTime:parseInt(currentTime)
        };
        commonDAO.updateItemValue(item.URI,item.version,updateItem,updateItemValueCb);
      }
    }
    commonDAO.getItemByUri(postDataJson.arg,getItemByUriCb);
  }
}
exports.getDataSourceByUriInHttpServer = getDataSourceByUriInHttpServer;

function updateDataValueInHttpServer(response, postData) {

  config.riolog("Request handler 'updateDataValueInHttpServer' was called.");
    config.riolog(postData);
    var arg3String = postData.substring(postData.indexOf("arg3")+7, postData.length-2);
    var postDataSub = postData.substring(0, postData.indexOf("arg3")-2);
    postDataSub += "}";
    postDataJson=JSON.parse(postDataSub);
    config.riolog('$$$$$$'+postDataJson.arg1);
  if(postDataJson.func != 'updateDataValue'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function updateItemValueCb(uri,version,item,result){
      config.riolog("update DB: "+ result);
      if(result!='successfull'){
        filesHandle.sleep(1000);
        commonDAO.updateItemValue(uri,version,item,updateItemValueCb);
      }
      else{
        var json=JSON.stringify('success');
        response.writeHead(200, {"Content-Type": "text/plain"});
        response.write(json);
        response.end();
      }
    }
    commonDAO.updateItemValue(postDataJson.arg1,postDataJson.arg2,JSON.parse(arg3String),updateItemValueCb);
  }
}
exports.updateDataValueInHttpServer = updateDataValueInHttpServer;

function getRecentAccessDataInHttpServer(response, postData) {

  config.riolog("Request handler 'getRecentAccessDataInHttpServer' was called.");
    config.riolog(postData);
    postDataJson=JSON.parse(postData);
     config.riolog('$$$$$$'+postDataJson.arg);
  if(postDataJson.func != 'getRecentAccessData'){
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else{
    function getRecentByOrderCb(result){
      if(result[0]==null){
        return;
      }
      while(result.length>postDataJson.arg){
        result.pop();
      }
      var data = new Array();
      function getItemByUriCb(result){
        //console.log(result);
        if(result){       
          data.push(result);
          if(data.length==postDataJson.arg){
            var json=JSON.stringify(data);
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(json);
            response.end();
          }
          else{
            commonDAO.getItemByUri(uri,getItemByUriCb);
          }
        }
      }
      commonDAO.getItemByUri(uri,getItemByUriCb);
    }
    commonDAO.getRecentByOrder(getRecentByOrderCb);
  }
}
exports.getRecentAccessDataInHttpServer = getRecentAccessDataInHttpServer;

// close vncserver and websockifyserver on server
function closeVNCandWebsockifyServerInHttpServer(response, postData){
    console.log("Request handler 'closeVNCandWebsockifyServerInHttpServer' was called");
    console.log("postData");
    postDataJson=JSON.parse(postData);
    console.log("arg:****** "+postDataJson.arg);
    if (postDataJson.func != 'closeVNCandWebsockifyServer') {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write("error func");
      response.end();
    }
    else {
      websockifyPort = postDataJson.arg;
      filesHandle.closeVNCandWebsockifyServer(websockifyPort,function(state){
        var json = JSON.stringify(state);
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(json);
        response.end();
      });
    }
}
exports.closeVNCandWebsockifyServerInHttpServer = closeVNCandWebsockifyServerInHttpServer;

function getServerAddressInHttpServer(response, postData){
    console.log("Request handler 'getServerAddressInHttpServer' was called");
    console.log("postData");
    postDataJson=JSON.parse(postData);
    console.log("arg:****** "+postDataJson.arg);
    if (postDataJson.func != 'getServerAddress') {
      response.writeHead(200, {"Content-Type": "text/plain"});
      response.write("error func");
      response.end();
    }
    else {
      var address={
        ip:config.SERVERIP,
        port:config.SERVERPORT
      };
      var json = JSON.stringify(address);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    }
}
exports.getServerAddressInHttpServer = getServerAddressInHttpServer;

//wangyu: add function for getting data dir
function getDataDirInHttpServer(response, postData){
  console.log("Request handler 'getDataDirInHttpServer' was called");
  console.log("postData");
  postDataJson=JSON.parse(postData);
  console.log("arg:****** "+postDataJson.arg);
  if (postDataJson.func != 'getDataDir') {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write("error func");
    response.end();
  }
  else {
    var cp = require('child_process');
    cp.exec('echo $USER',function(error,stdout,stderr){
      var usrname=stdout.replace("\n","");
      var data = require('/home/'+usrname+'/.demo-rio/config');
      var json = JSON.stringify(data.dataDir);
      response.writeHead(200, {"Content-Type": "application/json"});
      response.write(json);
      response.end();
    });
  }
}
exports.getDataDirInHttpServer = getDataDirInHttpServer;

//add function for file transfer 
//2014.7.21 by xiquan
function sendFileInHttp(path,adress){
  //var address = config.SERVERIP;//"http:localhost";
  fileTranfer.sendfile(path,address);
}
exports.sendFileInHttp = sendFileInHttp;

//add function for file transfer 
//2014.7.21 by xiquan
function receiveFileInHttp(){
  fileTranfer.receivefile(path);
}
exports.receiveFileInHttp = receiveFileInHttp;

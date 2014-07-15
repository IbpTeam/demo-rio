var config = require("./backend/config");
var server = require("./backend/server");
var router = require("./backend/router");
var requestHandlers = require("./backend/requestHandlers");
var util = require('util');
var os = require('os');

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/getAllCate"] = requestHandlers.getAllCateInHttpServer;
handle["/getAllDataByCate"] = requestHandlers.getAllDataByCateInHttpServer;
handle["/getAllContacts"] = requestHandlers.getAllContactsInHttpServer;
handle["/loadResources"] = requestHandlers.loadResourcesInHttpServer;
handle["/rmDataById"] = requestHandlers.rmDataByIdInHttpServer;
handle["/getDataById"] = requestHandlers.getDataByIdInHttpServer;
handle["/getDataSourceById"] = requestHandlers.getDataSourceByIdInHttpServer;
handle["/updateDataValue"] = requestHandlers.updateDataValueInHttpServer;
handle["/getRecentAccessData"] = requestHandlers.getRecentAccessDataInHttpServer;
handle["/closeVNCandWebsockifyServer"] = requestHandlers.closeVNCandWebsockifyServerInHttpServer;
handle["/getServerAddress"] = requestHandlers.getServerAddressInHttpServer;

function getAddr(){
  var IPv4;
  for(var i=0;i<os.networkInterfaces().eth0.length;i++){
    if(os.networkInterfaces().eth0[i].family=='IPv4'){
      IPv4=os.networkInterfaces().eth0[i].address;
    }
  }
  return IPv4;
}

config.SERVERIP=getAddr();
config.SERVERNAME = os.hostname()+'('+config.SERVERIP+')';
server.start(router.route, handle);
server.listen();
server.advertise();



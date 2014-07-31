var config = require("./backend/config");
var server = require("./backend/server");
var router = require("./backend/router");
var msgTransfer = require("./backend/msgtransfer");
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
handle["/fileSend"] = requestHandlers.sendFileInHttp;//By xiquan 2014.7.21
handle["/fileReceive"] = requestHandlers.receiveFileInHttp;//By xiquan 2014.7.21


config.SERVERIP=config.getAddr();
config.SERVERNAME = os.hostname()+'('+config.SERVERIP+')';
server.start(router.route, handle);
msgTransfer.initServer();
server.advertise();

var cp = require('child_process');
cp.exec('./node_modules/netlink/netlink ./var/.netlinkStatus');




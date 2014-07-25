var server = require("./backend/server");
var router = require("./backend/router");
var requestHandlers = require("./backend/requestHandlers");

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


server.start(router.route, handle);

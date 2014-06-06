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


server.start(router.route, handle);

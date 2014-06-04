var server = require("./backend/server");
var router = require("./backend/router");
var requestHandlers = require("./backend/requestHandlers");

var handle = {}
handle["/"] = requestHandlers.start;
handle["/start"] = requestHandlers.start;
handle["/getAllCate"] = requestHandlers.getAllCateInHttpServer;
handle["/getAllDataByCate"] = requestHandlers.getAllDataByCateInHttpServer;
handle["/getAllContacts"] = requestHandlers.getAllContactsInHttpServer;

server.syncDb();
server.start(router.route, handle);

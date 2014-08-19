var config = require("./backend/config");
var server = require("./backend/server");
var router = require("./backend/router");
var msgTransfer = require("./backend/msgtransfer");
var requestHandlers = require("./backend/requestHandlers");
var fileHandle = require("./backend/filesHandle");
var util = require('util');
var os = require('os');
var fs = require('fs');

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
msgTransfer.initServer();
server.start(router.route, handle);

var cp = require('child_process');
cp.exec('./node_modules/netlink/netlink ./var/.netlinkStatus');
cp.exec('echo $USER',function(error,stdout,stderr){
  var usrname=stdout.replace("\n","");
  util.log('mkdir /home/'+usrname+'/.demo-rio');
  fileHandle.mkdirSync('/home/'+usrname+'/.demo-rio', 0755,function(e){
  	config.USERCONFIGPATH='/home/'+usrname+'/.demo-rio/';
  	fs.exists(config.USERCONFIGPATH+"config.js", function (exists) {
      util.log(config.USERCONFIGPATH+"config.js "+ exists);
      if(exists==false){
        util.log("No data");
      }
      else{
        var dataDir=require(config.USERCONFIGPATH+"config.js").dataDir;
        util.log("monitor : "+dataDir);
        fileHandle.monitorFiles(dataDir,fileHandle.monitorFilesCb);
      }
    });

    if(e){
        util.log('mkdir /home/'+usrname+'/.demo-rio fail');
    }else{
        util.log('mkdir /home/'+usrname+'/.demo-rio sucess');
    }
  });
 });




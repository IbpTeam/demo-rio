var commonDAO = require("./DAO/CommonDAO");
var msgTransfer = require("./Transfer/msgTransfer");
var config = require("./config");
var mdns = require('../lib/api/device.js');

var devicesList=new Array();
exports.devicesList = devicesList;

function getDeviceList(){
  commonDAO.findItems(null,["devices"],null,function(err,items){
    if(err){
      console.log(err);  
    }
    else{
      items.forEach(function(item){
        item.online=false;
        //console.log("device_id= "+item.device_id);
        devicesList[item.device_id]=item;
        //console.log("devicesList add ");
         //console.log(devicesList[item.device_id]);
      });
      console.log("----------------------devicesList:-----------------------");
      for (var i in devicesList) {  
        console.log(devicesList[i]);
      }  
      console.log("---------------------------------------------------------");
    }
  });
}
exports.getDeviceList = getDeviceList;

//API getServerAddress:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getServerAddress(getServerAddressCb){
  console.log("Request handler 'getServerAddress' was called.");
  var address={
    ip:config.SERVERIP,
    port:config.SERVERPORT
  };
  getServerAddressCb(address);
}
exports.getServerAddress = getServerAddress;

function addDevice(device){
  if(device.device_id in devicesList){
    devicesList[device.device_id].online=true;
    console.log("OLD device");
      console.log("----------------------devicesList:-----------------------");
      for (var i in devicesList) {  
        console.log(devicesList[i]);
      }  
      console.log("**********************************************************");
  }
  else{
    console.log("NEW device");
    device.category = "devices";
    commonDAO.createItem(device,function(result){
      device.online=true;
      devicesList[device.device_id]=device;
            console.log("----------------------devicesList:-----------------------");
      for (var i in devicesList) {  
        console.log(devicesList[i]);
      }  
      console.log("**********************************************************");
    });
  }
}
exports.addDevice = addDevice;

function rmDevice(device){
    console.log("device.device_id:"+device.device_id);
  console.log("devicesList[device.device_id]:");
  console.log(devicesList[device.device_id]);
  devicesList[device.device_id].online=false;
        console.log("----------------------devicesList:-----------------------");
      for (var i in devicesList) {  
        console.log(devicesList[i]);
      }  
      console.log("**********************************************************");
}
exports.addDevice = addDevice;

function startDeviceDiscoveryService(){
  console.log("start Device Discovery Service ");
//  var io = require('socket.io').listen(config.SOCKETIOPORT);
//  io.sockets.on('connection', function (socket) {
    getDeviceList();
    mdns.addDeviceListener(function (signal, args){
      if(args.txt[0]=="demo-rio"){
        var device={
          device_id:args.txt[1],
          name:args.txt[2],
          branchName:args.txt[2],
          resourcePath:args.txt[3],
          ip:args.txt[4],
          account:args.txt[5]
        };
        switch(signal){
          case 'ItemNew':{
            //socket.emit('mdnsUp', args);
            console.log(args);
            addDevice(device);
            msgTransfer.serviceUpCb(device);
          }       
          break;
          case 'ItemRemove':{
            //socket.emit('mdnsDown', args);
            console.log(args);  
            rmDevice(device);        
          }
          break;
        }
      }
    });
    mdns.createServer(function(){
      var name = config.SERVERNAME;
      var port = config.MDNSPORT;
      var txtarray = ["demo-rio",config.uniqueID,config.SERVERNAME,config.RESOURCEPATH,config.SERVERIP,config.ACCOUNT];
      mdns.entryGroupCommit(name,  port, txtarray);
    });
//  });
}
exports.startDeviceDiscoveryService = startDeviceDiscoveryService;
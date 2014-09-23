var commonDAO = require("./DAO/CommonDAO");
var config = require("./config");
var mdns = require('../lib/api/device.js');

var devicesList=new Array();
exports.devicesList = devicesList;

function getDeviceList(){
  var device={
    deviceId:"11111111111111",
    name:"HP",
    branchName:"HP",
    resourcePath:"/home/v1/resources",
    ip:"192.168.160.72"
  };
  devicesList.push(device);
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
  if(device in devicesList){

  }
  else{
    device.category = "devices";
    commonDAO.createItem(device,function(result){
      console.log("New device!!!");
      console.log(result);
    });
  }
}
exports.getDeviceList = getDeviceList;

function startDeviceDiscoveryService(){
  console.log("start Device Discovery Service ");
//  var io = require('socket.io').listen(config.SOCKETIOPORT);
//  io.sockets.on('connection', function (socket) {
    mdns.addDeviceListener(function (signal, args){
      if(args.txt[0]=="demo-rio"){
        var device={
          device_id:args.txt[1],
          name:args.txt[2],
          branchName:args.txt[2],
          resourcePath:args.txt[3],
          ip:args.txt[4]
        };
        switch(signal){
          case 'ItemNew':{
            //socket.emit('mdnsUp', args);
            console.log('A new device is add: ');
            console.log(args);
            addDevice(device);
          }       
          break;
          case 'ItemRemove':{
            //socket.emit('mdnsDown', args);
            console.log('A device is removed: ');
            console.log(args);          
          }
          break;
        }
      }
    });
    mdns.createServer(function(){
      var name = config.SERVERNAME;
      var port = config.MDNSPORT;
      var txtarray = ["demo-rio",config.uniqueID,config.SERVERNAME,config.RESOURCEPATH,config.SERVERIP];
      mdns.entryGroupCommit(name,  port, txtarray);
    });
//  });
}
exports.startDeviceDiscoveryService = startDeviceDiscoveryService;
var commonDAO = require("./DAO/CommonDAO");
var config = require("./config");

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
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
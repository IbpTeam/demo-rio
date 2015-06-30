var msgTransfer = require("../Transfer/msgTransfer");
// var config = require("../config");
var config = require('systemconfig');
// var ds = require("../../lib/api/device_service");
var ds = require('api').devDetect();

var devicesList=new Array();
exports.devicesList = devicesList;

function getDeviceList(callback){
  ds.getDeviceByAccount(function(deviceList){
//    console.log("----------------------devicesList:-----------------------");
    for (var i in deviceList) {  
//      console.log(deviceList[i]);
    }  
//    console.log("---------------------------------------------------------");
    callback(deviceList);
  },config.ACCOUNT);
}
exports.getDeviceList = getDeviceList;

//API getServerAddress:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getServerAddress(getServerAddressCb){
  console.log("Request handler 'getServerAddress' was called.");
  var address={
    ip:config.getIPAddress(),
    port:config.SERVERPORT
  };
  getServerAddressCb(address);
}
exports.getServerAddress = getServerAddress;

function addDevice(device){
  if(device.device_id in devicesList){
    devicesList[device.device_id].online=true;
    devicesList[device.device_id].sync=false;
    var changeAttr={};
    var changeFlag=0;
    for(var attr in device){
      if(devicesList[device.device_id][attr]!=device[attr]){
        console.log("change "+attr+" to "+device[attr]);
        devicesList[device.device_id][attr]=device[attr];
        changeAttr[attr]=device[attr];
        changeFlag=1;
      }
    }
    if(changeFlag==1){
      changeAttr.conditions=["device_id='"+device.device_id+"'"];
      changeAttr.category="devices";
      console.log(changeAttr);
    }
    /*console.log("OLD device");
    console.log("----------------------devicesList:-----------------------");
    for (var i in devicesList) {  
      console.log(devicesList[i]);
    }  
    console.log("**********************************************************");*/
  }
  else{
    console.log("NEW device");
    device.category = "devices";
    device.online=true;
    device.sync=false;
    devicesList[device.device_id]=device;
      /*console.log("----------------------devicesList:-----------------------");
      for (var i in devicesList) {  
        console.log(devicesList[i]);
      }  
      console.log("**********************************************************");*/
  }
}
exports.addDevice = addDevice;

function rmDevice(device){
  console.log("device.device_id:"+device.device_id);
  console.log("devicesList[device.device_id]:");
  console.log(devicesList[device.device_id]);
  if(devicesList[device.device_id].online==undefined){
    return;
  }
  devicesList[device.device_id].online=false;
  if(devicesList[device.device_id].sync==undefined){
    return;
  }
  devicesList[device.device_id].sync=false;
  /*console.log("----------------------devicesList:-----------------------");
  for (var i in devicesList) {  
    console.log(devicesList[i]);
  }  
  console.log("**********************************************************");*/
}
exports.addDevice = addDevice;

/**
 * @method listenDeviceCallback
 *    Callback for device linstener.
 * @param callback
 *    This callback.
 */
function listenDeviceCallback(deviceObj){ 
  var device={
    device_id:deviceObj.info.txt[2],
    name:deviceObj.info.host,
    resourcePath:config.RESOURCEPATH,
    ip:deviceObj.info.address,
    account:deviceObj.info.txt[1]
  };
  if(deviceObj.flag === "up"){
    console.log("device up:", device);
    addDevice(device);
    msgTransfer.serviceUp(device);
  }
  if(deviceObj.flag === "down"){
    console.log("device down:", device);  
    rmDevice(device);
  }
}

function startDeviceDiscoveryService(){
  //getDeviceList();
  ds.addListenerByAccount(listenDeviceCallback, config.ACCOUNT);
  //Start device service
  ds.startMdnsService(function(state) {
    if (state === true) {
      console.log('start MDNS service successful!');
    };
  });
}
exports.startDeviceDiscoveryService = startDeviceDiscoveryService;


function deviceInfo(callback) {
  try {
    var oInfo = {
      resources_path: config.RESOURCEPATH,
      server_ip: config.getIPAddress(),
      server_name: config.SERVERNAME,
      local_account: config.ACCOUNT,
      local_id: config.uniqueID
    }
  } catch (e) {
    if (e) {
      return callback(e, null);
    }
  }
  callback(null, oInfo);
}
exports.deviceInfo = deviceInfo;






//API gileSend
function fileSend(host){
  console.log("Request handler 'fileSend' was called.");
  if(isLocal()){     
    console.log('You are in local '); 
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.sendFileFromLocal(host);
  }
  else{
    console.log('You are in remote '); 
    sendFileFromHttp(host);
    //
  }
}

//API fileReceiver
function fileReceive(path){
  console.log("Request handler 'fileSend' was called.");
  if(isLocal()){     
    console.log('You are in local '); 
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.receiveFileFromLocal(path);
  }
  else{
    console.log('You are in remote '); 
    receiveFileFromHttp(path);
    //
  }
}

//API getDeviceDiscoveryService:使用设备发现服务
//参数分别为设备发现和设备离开的回调函数
var SOCKETIOPORT=8891;
function getDeviceDiscoveryService(deviceUpCb,deviceDownCb){
  console.log("Request handler 'getDeviceDiscoveryService' was called.");
  function getServerAddressCb(result){
    var add='ws://'+result.ip+':'+SOCKETIOPORT+'/';
    var socket = io.connect(add);  
    socket.on('mdnsUp', function (data) { //接收来自服务器的 名字叫server的数据
      deviceUpCb(data);
    });
    socket.on('mdnsDown', function (data) { //接收来自服务器的 名字叫server的数据
      deviceDownCb(data);
    });
  }
  getServerAddress(getServerAddressCb);
}


/*
//API demoDataSync
function demoDataSync(deviceName,deviceId,deviceAddress){
  console.log("Start demoDataSync !");
  function getServerAddressCb(result){
    var add='ws://'+result.ip+':'+SOCKETIOPORT+'/';
    var socket = io.connect(add);  
    socket.on('mdnsUp', function (data) { //接收来自服务器的 名字叫server的数据
      deviceUpCb(data);
      var dataSync =  require("./backend/DataSync.js");
      dataSync.syncRequest(deviceName,deviceId,deviceAddress);
    });
    socket.on('mdnsDown', function (data) { //接收来自服务器的 名字叫server的数据
      deviceDownCb(data);
    });
  }
  getServerAddress(getServerAddressCb);
}*/

//API repoMergeForFirstTime:获取remote repo
function repoMergeForFirstTime(name,branch,address,path){
  console.log("Request handler 'repoMergeForFirstTime' was called.");
  if(isLocal()){     
    console.log('You are in local '); 
    var repo = require("./backend/repo");
    repo.repoMergeForFirstTime(name,branch,address,path);
  }
  else{
    console.log('You are in remote '); 
  }
}

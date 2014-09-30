/**
 * @Copyright:
 * 
 * @Description: Message transfer.
 *
 * @author: Yuanzhe
 *
 * @Data:2014.9.22
 *
 * @version:0.2.1
 **/

var WebSocketServer = require('ws').Server;
var WebSocket = require('ws');
var config = require('../config');
var repo = require("../FilesHandle/repo");

// @Enum sync state
var syncState = {
  SYNC_IDLE:0,
  SYNC_REQUEST:1,
  SYNC_START:2,
  SYNC_COMPLETE:3
};
// @Enum message type
var msgType = {
	TYPE_REQUEST:"syncRequest",
	TYPE_RESPONSE:"syncResponse",
	TYPE_COMPLETE:"syncComplete"
};

var iCurrentState = syncState.SYNC_IDLE;
var syncList = new Array();

/**
 * @method initServer
 *    Message transfer server initialize.
 */
exports.initServer = function(){
/*  var server = new WebSocketServer({port: config.MSGPORT});
  // Add listener on event connection.
  server.on('connection',connServer);*/
}

/**
 * @method connServer
 *    Callback on server connect.
 * @param socket
 *    Socket object.
 */
function connServer(socket){
  var sRemoteAddress = socket._socket.remoteAddress;
  var sRemotePort = socket._socket.remotePort;
  console.log('messages ' + sRemoteAddress + ' : ' + sRemotePort + ' connected!');

  socket.on('message', function(sMessage) {
    //console.log(sMessage)
    console.log('data from :' + sRemoteAddress+ ': ' + sRemotePort+ ' ' + sMessage);
    var oMessage = JSON.parse(sMessage);
    console.log('data from :' + sRemoteAddress+ ': ' + sRemotePort+ ' ' + oMessage.type);

    switch(oMessage.type){
	  case msgType.TYPE_REQUEST: {
	    syncRequestCb(oMessage, sRemoteAddress);
	  }
	  break;
	  case msgType.TYPE_RESPONSE: {
	    console.log("=========================================syncStart");
	    syncResponseCb(oMessage, sRemoteAddress);
	  }
	  break;
	  case msgType.TYPE_COMPLETE: {
	    syncCompleteCb(false, oMessage.isComplete,oMessage.deviceId,sRemoteAddress);
	  }
	  break;
	  default: {
	    console.log("this is in default switch on data");
        //do version control stuff
      }
    }
  });

  socket.on('close',function(){
	console.log('Client ' + sRemoteAddress +  ' : ' + sRemotePort + ' disconnected!');
  });

  socket.on('error',function(err){
	console.log('Unexpected Error!' + err);
  });
}

/**
 * @method sendMsg
 *    Send msg to specific address.
 * @param address
 *    Specific ip address.
 * @param msgObj
 *    Message object.
 */
function sendMsg(address,msgObj){
  console.log("--------------------------"+address);
  var msgStr = JSON.stringify(msgObj);
  var socket = new WebSocket('http://'+address+':'+config.MSGPORT);
  if (address == config.SERVERIP) {
	console.log("Input IP is localhost!");
	return;
  };

  socket.on('open', function() {
	socket.send(msgStr);
  });
  socket.on('error',function(err){
	console.log("Error: "+err.code+" on "+err.syscall+" !  IP : " + address);
	socket.close();
  });
}

/**
 * @method serviceUpCb
 *    Service up callback.
 * @param device
 *    Device object,include device id,name,ip and so on.
 */
exports.serviceUpCb = function(device){
  var sDeviceId = device.device_id;
  if(sDeviceId.localeCompare(config.uniqueID) <= 0)
    return;
  switch(iCurrentState){
  	case syncState.SYNC_IDLE:{
  	  syncList.unshift(sDeviceId);
  	  requestMsg = {
  	  	type:msgType.TYPE_REQUEST,
  	  	ip:config.SERVERIP,
  	  	path:config.RESOURCEPATH,
  	  	account:config.ACCOUNT,
  	  	deviceId:config.uniqueID
  	  };
  	  sendMsg(device.ip,requestMsg);
  	  iCurrentState = syncState.SYNC_REQUEST;
  	  break;
  	}
  	case syncState.SYNC_REQUEST:{
  	  syncList.push(sDeviceId);
  	  break;
  	}
  	case syncState.SYNC_START:{
  	  syncList.push(sDeviceId);
  	  break;
  	}
  	case syncState.SYNC_COMPLETE:{
  	  syncList.push(sDeviceId);
  	  break;
  	}
  }
}

/**
 * @method syncRequestCb
 *    Sync request callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncRequestCb(msgObj,remoteAddress){
  switch(iCurrentState){
  	case syncState.SYNC_IDLE:{
      var responseMsg = {
      	type:msgtype.TYPE_RESPONSE,
      	deviceId:config.uniqueID,
  	  	path:config.RESOURCEPATH,
      	account:config.ACCOUNT,
      	ip:config.SERVERIP
      };
      sendMsg(remoteAddress,responseMsg);
      syncList.unshift(msgObj.deviceId);
      iCurrentState = syncState.SYNC_START;

      //Start to sync
      repo.pullFromOtherRepo(remoteAddress,msgObj.path,function(){
        iCurrentState = syncState.SYNC_COMPLETE;
        var completeMsg = {
  	  	  type:msgType.TYPE_COMPLETE,
  	  	  ip:config.SERVERIP
        };
        sendMsg(remoteAddress,completeMsg);
      });
      break;
  	}
    case syncState.SYNC_REQUEST:{
      syncList.push(msgObj.deviceId);
      break;
    }
  	case syncState.SYNC_START:{
  	  syncList.push(msgObj.deviceId);
  	  break;
  	}
  	case syncState.SYNC_COMPLETE:{
  	  syncList.push(msgObj.deviceId);
  	  break;
  	}
  }
}

/**
 * @method syncResponseCb
 *    Sync response callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncResponseCb(msgObj,remoteAddress){
  switch(iCurrentState){
  	case syncState.SYNC_IDLE:{
  	  console.log("SYNC ERROR: current state is not request!");
      break;
  	}
    case syncState.SYNC_REQUEST:{
      if(syncList[0] != msgObj.deviceId){
    	console.log("SYNC ERROR: current sync device is wrong!")
      }else{
    	iCurrentState = syncState.SYNC_START;

        //Start to sync
        repo.pullFromOtherRepo(remoteAddress,msgObj.path,function(){
          iCurrentState = syncState.SYNC_COMPLETE;
          var completeMsg = {
  	  		type:msgType.TYPE_COMPLETE,
  	  		ip:config.SERVERIP
          };
          sendMsg(remoteAddress,completeMsg);
        });
      }
      break;
    }
  	case syncState.SYNC_START:{
  	  console.log("SYNC ERROR: current state is not request!");
  	  break;
  	}
  	case syncState.SYNC_COMPLETE:{
  	  console.log("SYNC ERROR: current state is not request!");
  	  break;
  	}
  }
}

/**
 * @method syncCompleteCb
 *    Sync complete callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncCompleteCb(msgObj,remoteAddress){
  switch(iCurrentState){
  	case syncState.SYNC_IDLE:{
  	  console.log("SYNC completed!");
      break;
  	}
    case syncState.SYNC_REQUEST:{
      console.log("SYNC ERROR: current sync device is start/complete!")
      break;
    }
  	case syncState.SYNC_START:{
  	  console.log("Remote device sync completed...wait for us");
  	  break;
  	}
  	case syncState.SYNC_COMPLETE:{
  	  var completeMsg = {
  	  	type:msgType.TYPE_COMPLETE,
  	  	ip:config.SERVERIP
  	  };
  	  sendMsg(remoteAddress,completeMsg);
  	  iCurrentState = syncState.SYNC_IDLE;
  	  break;
  	}
  }
}
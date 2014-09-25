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

/**
 * @method initServer
 *    Message transfer server initialize.
 */
exports.initServer = function(){
  var server = new WebSocketServer({port: config.MSGPORT});
  // Add listener on event connection.
  server.on('connection',connServer);
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
	  case 'syncRequest': {
	    syncRequest(oMessage, sRemoteAddress);
	  }
	  break;
	  case 'syncResponse': {
	    console.log("=========================================syncStart");
	    syncResponse(oMessage, sRemoteAddress);
	  }
	  break;
	  case 'syncComplete': {
	    syncComplete(false, oMessage.isComplete,oMessage.deviceId,sRemoteAddress);
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
 * @param msgStr
 *    Message string.
 */
function sendMsg(address,msgStr){
  console.log("--------------------------"+address);
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
  //

}
//msg.js
var WebSocketServer = require('ws').Server;
var WebSocket = require('ws');
var config = require('../config');


function initServer(){
	var server = new WebSocketServer({port: config.MSGPORT});

	server.on('connection',function(socket) {

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
					dataSync.syncResponse(oMessage, sRemoteAddress);
				}
				break;
				case 'syncResponse': {
					console.log("=========================================syncStart");
					dataSync.syncStart(oMessage, sRemoteAddress);
				}
				break;
				case 'syncComplete': {
					dataSync.syncComplete(false, oMessage.isComplete,oMessage.deviceId,sRemoteAddress);
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

		socket.on('error',function(){
			console.log('Unexpected Error!');
		});
	});
}


function sendMsg(IP,sMessage){
	console.log("--------------------------"+IP);

	var socket = new WebSocket('http://'+IP+':'+config.MSGPORT);

	if (IP == config.SERVERIP) {
		console.log("Input IP is localhost!");
		return;
	};

	socket.on('open', function() {
		socket.send(sMessage);
	});

	socket.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall+" !  IP : " + IP);
		socket.close();
	});
}

exports.initServer=initServer;
exports.sendMsg=sendMsg;

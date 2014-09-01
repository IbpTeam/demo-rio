//msg.js

var WebSocketServer = require('ws').Server;
var WebSocket = require('ws');
//var net = require('net');
//var server = require('socket.io')();
//var io = require('socket.io/node_modules/socket.io-client');
var config = require('./config');
var dataSync = require('./DataSync');


function initServer(){
	server = new WebSocketServer({port: config.MSGPORT});

	server.on('connection',function(c) {
		console.log('messages ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
		var remoteAD = c._socket.remoteAddress;
		var remotePT = c._socket.remotePort;

		c.on('message', function(msgStr) {
			console.log(msgStr)

			console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + msgStr);
			var msgObj = JSON.parse(msgStr);
			console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + msgObj.type);
			switch(msgObj.type){
				case 'syncRequest': {
				//console.log("=========================================");
				dataSync.syncResponse(msgObj, remoteAD);
			}
			break;
			case 'syncResponse': {
				console.log("=========================================syncStart");
				dataSync.syncStart(msgObj, remoteAD);
			}
			break;
//          case 'syncStart': {
//				//console.log("=========================================");
//				dataSync.syncStart(msgObj, remoteAD);
//			}
//			break;

			case 'syncComplete': {
				//console.log("=========================================");
				dataSync.syncComplete(false, msgObj.isComplete,msgObj.deviceId,remoteAD);
			}
			break;
			default: {
				console.log("this is in default switch on data");
				//console.log(data);
			}
		}
	});

		c.on('close',function(){
			console.log('Client ' + remoteAD +  ' : ' + remotePT + ' disconnected!');
		});

		c.on('error',function(){
			console.log('Unexpected Error!');
		});
	});
}


function sendMsg(IP,MSG){
	console.log("--------------------------"+IP);

	var ws = new WebSocket('http://'+IP+':'+config.MSGPORT);

	if (IP == config.SERVERIP) {
		console.log("Input IP is localhost!");
		return;
	};

	ws.on('open', function() {
		ws.send(MSG);
	});

	ws.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall+" !  IP : " + IP);
		ws.close();
	});
}

exports.initServer=initServer;
exports.sendMsg=sendMsg;

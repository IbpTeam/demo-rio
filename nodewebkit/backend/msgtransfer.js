var net = require('net');
var config = require('./config');
var dataSync = require('./DataSync');


function initServer(){
	var server =  net.createServer(function(c) {
		console.log('Client ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
		var remoteAD = c.remoteAddress;
		var remotePT = c.remotePort;

	c.on('data', function(msgStr) {
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
				console.log("=========================================");
				//dataSync.syncResponse(msgObj, remoteAD);
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
	c.write('Hello!\r\n');

	c.on('error',function(){
			console.log('Unexpected Error!');
	});
//	c.pipe(c);
	});



	server.listen(config.MSGPORT, function(){
		console.log('Server Binded! '+ config.MSGPORT);
	});
}


function sendMsg(IP,MSG){
//	console.log("--------------------------"+IP);
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};
//	console.log("=========================="+config.SERVERIP)
	if (IP == config.SERVERIP) {
		console.log("Input IP is localhost!");
		return;
	};
	var  client = new net.Socket();
	client.connect(config.MSGPORT,IP,function(){
		client.write(MSG,function(){
			client.end();
		});
	});

	client.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall+" !  IP : " + IP);
		client.end();
	});
}

exports.initServer=initServer;
exports.sendMsg=sendMsg;

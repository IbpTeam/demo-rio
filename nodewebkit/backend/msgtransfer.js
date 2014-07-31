var net = require('net');
var config = require('./config');
var dataSync = require('./DataSync');


function initServer(){
	var server =  net.createServer(function(c) {
		console.log('Client ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
		var remoteAD = c.remoteAddress;
		var remotePT = c.remotePort;

	c.on('data', function(data) {
		console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + data);
//			var str1= JSON.parse(data);
//			console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + str1.param);
		switch(data+""){
			case 'syncUpdate': {
				console.log("=========================");
				dataSync.prepUpdate();
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
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};
	console.log("=========================="+config.SERVERIP)
	console.log("--------------------------"+IP);
	var  client = new net.Socket();
	client.connect(config.MSGPORT,IP,function(){
		client.write(MSG,function(){
			client.end();
		});
	});
}

exports.initServer=initServer;
exports.sendMsg=sendMsg;

var net = require('net')
var config = require('./config')

function initServer(){
	var server =  net.createServer(function(c) {
		console.log('Client ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
		var remoteAD = c.remoteAddress;
		var remotePT = c.remotePort;

	c.on('data', function(data) {
			console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + data);
//			var str1= JSON.parse(data);
//			console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + str1.param);
		});

	c.on('close',function(){
			console.log('Client ' + remoteAD +  ' : ' + remotePT + ' disconnected!');
		});
	c.write('Hello!\r\n');
//	c.pipe(c);
	});

	server.listen(config.MSGPORT, function(){
		console.log('Server Binded! '+ config.MSGPORT);
	});
}

function sendMSG(IP,MSG){
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};
	var  client = new net.Socket();
	client.connect(config.MSGPORT,IP,function(){
		client.write(MSG,function(){
			client.end();
		});
	});
}

exports.initServer=initServer;
exports.sendMSG=sendMSG;
var net = require('net');
var hashtable = require('hashtable');


function initIMServer(){
	var server =  net.createServer(function(c) {
		console.log('Remote ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
		var remoteAD = c.remoteAddress;
		var remotePT = c.remotePort;

	c.on('data', function(msgStr) {
		console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + msgStr);
		var msgObj = JSON.parse(msgStr);
		console.log('MSG type:' + msgObj[0].type);
		switch(msgObj[0].type){
			case 'Chat': {
				console.log(msgObj[0].message);
				//console.log("=========================================");
				//output message and save to database
				//return success
			}
			break;
			case 'Reply': {
				//console.log("=========================================");
				//sender received message, sesson end
			}
			break;
			default: {
				console.log("this is in default switch on data");
				//console.log(data);
			}
		}
	});

	c.on('close',function(){
			console.log('Remote ' + remoteAD +  ' : ' + remotePT + ' disconnected!');
		});
//	c.write('Hello!\r\n');

	c.on('error',function(){
			console.log('Unexpected Error!');
	});
//	c.pipe(c);
	});



	server.listen(8892, function(){
		console.log('IMServer Binded! '+ 8892);
	});
}

function sendIMMsg(IP,PORT,MSG){
//	console.log("--------------------------"+IP);
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};
//	console.log("=========================="+config.SERVERIP)
	var  client = new net.Socket();
	client.connect(PORT,IP,function(){
		client.write(MSG,function(){
			client.end();
		});
	});

	client.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall+" !  IP : " + IP);
		client.end();
	});
}

function encapsuMSG(MSG,TYPE,FROM,TO)
{
	var MESSAGE = [];
	var tmp = {};
	switch(TYPE)
	{
		case'Chat':{
			tmp["from"] = FROM;
			tmp["to"] = TO;
			tmp["message"] = MSG;
			tmp['type'] = TYPE;
			MESSAGE.push(tmp);
			var send = JSON.stringify(MESSAGE);
			return send;
		}
		break;
		default:{

		}
	}
}

function createAccountTable()
{
	var accounttable = new hashtable();
	return accounttable;
}

function insertAccount(TABLE,ACCOUNT,IP)
{
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};
	TABLE.put(ACCOUNT,IP);
	return TABLE;
}

function getIP(TABLE,ACCOUNT)
{
	var ip = TABLE.get(ACCOUNT);
	if (typeof ip == "undefined" ) 
	{
		console.log('Get Account IP Error')
		return;
	};
	return ip;
}

function clearTable(TABLE)
{
	return TABLE.clear();
}

function removeAccount(TABLE,ACCOUNT)
{
	return TABLE.remove(ACCOUNT);
}

exports.initIMServer = initIMServer;
exports.sendIMMsg = sendIMMsg;
exports.encapsuMSG = encapsuMSG;
exports.createAccountTable = createAccountTable;
exports.insertAccount = insertAccount;
exports.getIP = getIP;
exports.clearTable = clearTable;
exports.removeAccount = removeAccount;
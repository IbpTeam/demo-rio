var net = require('net');
var hashtable = require('hashtable');
var crypto = require('crypto');
var dboper = require('./DAO/IMChatDao.js');

function MD5(str, encoding)
{
	return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}


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
				var msgtime = new Date();
				msgtime.setTime(msgObj[0].time);
				console.log(msgtime);
				//console.log("=========================================");
				//output message and save to database
				//return success
				dboper.dbrecvInsert(msgObj[0].from,msgObj[0].to,msgObj[0].message,msgObj[0].type,msgObj[0].time,function(){
					console.log("insert into db success!");
				});
				var tp = encapsuMSG(MD5(msgObj[0].message),"Reply","A","B");
				c.write(tp);
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

	server.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall);
	});

	server.listen(8892, function(){
		console.log('IMServer Binded! '+ 8892);
	});
}

function sendIMMsg(IP,PORT,MSG){
	var count = 0;
	var id =0;

	var  pat = JSON.parse(MSG);

	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};

	var  client = new net.Socket();
	client.connect(PORT,IP,function(){
		client.write(MSG,function(){
		});
	});

	id =  setInterval(function(C,MSG){
	if (count <5) 
	{
		C.write(MSG);
		count++;
	}else
	{
		clearInterval(id);
		console.log("Send message error: no reply ");
	};
	
	},1000,client,MSG);

	client.on('data',function(RPLY){
		console.log("remote data arrived! "+client.remoteAddress+" : "+ client.remotePort);
		var  msg = JSON.parse(RPLY);
		switch(msg[0].type)
		{
			case 'Reply': 
			{
				if (msg[0].message == MD5(pat[0].message))
				{
					var msgtp = JSON.parse(MSG);
					console.log('msg rply received: '+ msg[0].message);
					dboper.dbsentInsert(msgtp[0].from,msgtp[0].to,msgtp[0].message,msgtp[0].type,msgtp[0].time,function(){
						console.log("sent message insert into db success!");
					});
					clearInterval(id);
					client.end();
				};
			}
			break;
		}
	});
	//client.end();

	client.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall+" !  IP : " + IP);
		clearInterval(id);
		client.end();
	});
}

function encapsuMSG(MSG,TYPE,FROM,TO)
{
	var MESSAGE = [];
	var tmp = {};
	var now = new Date();

	switch(TYPE)
	{
		case'Chat':{
			tmp["from"] = FROM;
			tmp["to"] = TO;
			tmp["message"] = MSG;
			tmp['type'] = TYPE;
			tmp['time'] = now.getTime();
			MESSAGE.push(tmp);
			var send = JSON.stringify(MESSAGE);
			return send;
		}
		break;
		case'Reply':{
			tmp["from"] = FROM;
			tmp["to"] = TO;
			tmp["message"] = MSG;
			tmp["type"] = TYPE;
			tmp['time'] = now.getTime();
			MESSAGE.push(tmp);
			var rply = JSON.stringify(MESSAGE);
			return rply;
		}
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

	var ipset = TABLE.get(ACCOUNT);
	
	if (typeof ipset == "undefined")
	 {
	 	var tmp = [];
	 	tmp.push(IP);
	 	TABLE.put(ACCOUNT,tmp);
	 }
	 else
	 {
	 	ipset.push(IP);
	 	TABLE.remove(ACCOUNT);
	 	TABLE.put(ACCOUNT,ipset);
	 }
	
	return TABLE;
}

function removeAccountIP(TABLE,ACCOUNT,IP)
{
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};

	var ipset =  TABLE.get(ACCOUNT);

	TABLE.remove(ACCOUNT);
	
	if (typeof ipset == "undefined")
	{
		console.log("Input Account Error or Empty Account!");
	};

	if (ipset.length == 1) 
	{
		return TABLE;
	};

	var orilength = ipset.length;
	for (var i = 0; i < ipset.length; i++)
	{
		if(ipset[i] == IP)
		{
			ipset.splice(i,1);
			break;
		}		
	};

	if (ipset.length == orilength)
	{
		console.log("No IP" + IP + "in Account "+ Account);
	};

	TABLE.put(ACCOUNT,ipset);

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
exports.removeAccountIP=removeAccountIP;
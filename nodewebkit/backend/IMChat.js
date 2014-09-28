var net = require('net');
var hashtable = require('hashtable');
var crypto = require('crypto');
var dboper = require('./DAO/IMChatDao.js');
var fs = require('fs');
var ursa = require('./newUrsa');
var ursaED = require('./ursaED');
var keySizeBits = 1024;


/*
* @method MD5
*  计算某个字符串的MD5值
* @param str
*  待计算的字符串
* @param encoding
*  编码方式，默认为hex，该参数可省略
* @return md5
*  返回md5校验值
*/
function MD5(str, encoding)
{
	return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}

/*
* @method initIMServer
*  初始化本地消息接收Server，该Server负责所有的通信接收，存储，回复ACK等操作
* @return null
*  没有返回值
*/
function initIMServer(){
	/*
	we should load the keyPair first, in order to encrypt messages with RSA
	*/
	var keyPair = ursaED.loadPriKeySync('./key/priKey.pem');
	var pubKey = ursaED.loadPubKeySync('./key/priKey.pem');
	var keySizeBits = 1024;

	var server =  net.createServer(function(c) {
	console.log('Remote ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
	var remoteAD = c.remoteAddress;
	var remotePT = c.remotePort;

	c.on('data', function(msgStr) {
		console.log('data from :' + remoteAD+ ': ' + remotePT+ ' ' + msgStr);
		/*
		keyPair to be intergrated by Account Server
		keyPair should be loaded by local account
		*/
		try{
			var decrypteds = ursaED.decrypt(keyPair,msgStr.toString('utf-8'), keySizeBits/8);
			console.log('解密：'+decrypteds);
			var msgObj = JSON.parse(decrypteds);
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
				//console.log("pubkey is "+pubKey);
				var tp = encapsuMSG(MD5(msgObj[0].message),"Reply","A","B",pubKey);
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
		}catch(err){
			console.log("sender pubkey error, change pubkey and try again");
		}
		
    		
	});

	c.on('close',function(){
			console.log('Remote ' + remoteAD +  ' : ' + remotePT + ' disconnected!');
		});


	c.on('error',function(){
			console.log('Unexpected Error!');
	});

	});

	server.on('error',function(err){
		console.log("Error: "+err.code+" on "+err.syscall);
	});

	server.listen(8892, function(){
		console.log('IMServer Binded! '+ 8892);
	});
}

/*
* @method sendMSG
*  根据IP和端口号来发送封装好的数据，若发送成功，则把成功发送的消息存至本地数据库中。若发送失败，则重新发送（循环5次）
* @param IP
*  目的方的IP地址
* @param PORT
*  接收方帐号
* @param MSG
*  用encapsuMSG包装过的待发送消息
* @param PORT
*  消息接收方的通信端口
*@param KEYPAIR
*接收方的pubkey生成的keypair
* @return null
*  没有返回值
*/
function sendIMMsg(IP,PORT,MSG,KEYPAIR){
	var count = 0;
	var id =0;

	var dec = ursaED.decrypt(KEYPAIR,MSG, keySizeBits/8);

	var  pat = JSON.parse(dec);

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
		console.log("remote data arrived! "+client.remoteAddress+" : "+ client.remotePort+RPLY);
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		///////////////this part should be replaced by local prikey//////////////////////////////
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		var keyPair = ursaED.loadPriKeySync('./key/priKey.pem');
		var decrply = ursaED.decrypt(keyPair,RPLY.toString('utf-8'), keySizeBits/8);
		console.log("decry message:"+decrply);
		/////////////////////////////////////////////////////////////////////////////////////////////////////////////
		var  msg = JSON.parse(decrply);
		switch(msg[0].type)
		{
			case 'Reply': 
			{
				if (msg[0].message == MD5(pat[0].message))
				{
					var msgtp = pat;
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

/*
* @method sendMSGbyAccount
*  根据账户来发送消息，该函数从对应表中获取某一帐号所对应的所有IP地址集合，然后遍历该集合，把消息推送到该帐号的所有IP地址
* @param TABLE
*  用来存储ACCOUNT和IP对应关系的对应表，若对应表为空，说明该机器不在局域网内，将该消息推送到服务器端
* @param ACCOUNT
*  接收方帐号
* @param MSG
*  用encapsuMSG包装过的待发送消息
* @param PORT
*  消息接收方的通信端口
* @return null
*  没有返回值
*/
function sendMSGbyAccount(TABLE,ACCOUNT,MSG,PORT)
{
	var ipset =  TABLE.get(ACCOUNT);
	
	if (typeof ipset == "undefined")
	{
		console.log("destination account not in local lan!");
		/*
		here are some server msg send functions!
		*/
	};

	/*
	MSG already be capsuled by encapsuMSG function
	*/
	for (var i = 0; i < ipset.length; i++) 
	{
		sendIMMSG(ipset[i],IP,PORT,keyPair);
	};

	console.log("send " + ipset.length + "IPs in "+ ACCOUNT + "Success!");
}

/*
* @method encapsuMSG
*  将待发送的消息封装成JSON格式，并将JSON数据序列化
* @param MSG
*  消息内容，如可以是聊天内容，上下线通知等
* @param TYPE
*  消息类型，可以是Chat，Reply等
* @param FROM
*  消息的发送方标识，可以是Account帐号
* @param TO
*  消息的接收方标识，可以是Account帐号
* @return rply
*  封装好，并且已经序列化的消息字符串
*/
function encapsuMSG(MSG,TYPE,FROM,TO,PUBKEY)
{
	var MESSAGE = [];
	var tmp = {};
	var now = new Date();
	var pubkeyPair = ursa.createKey(PUBKEY);

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
			var encryptedmsg = ursaED.encrypt(pubkeyPair ,send, keySizeBits/8);
			return encryptedmsg;
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
			var encryptedmsg = ursaED.encrypt(pubkeyPair ,rply, keySizeBits/8);
			return encryptedmsg;
		}
		default:{

		}
	}
}

/*
* @method createAccountTable
*  创建用户账户->IP的映射表
* @param null 
*   
* @return accounttable
*  返回新创建的映射表
*/
function createAccountTable()
{
	var accounttable = new hashtable();
	return accounttable;
}

/*
* @method insertAccount
*  在当前账户中插入新的IP地址（包括同一账户多个用户在线情况），若帐号不存在，则创建新的帐号
* @param TABLE
*  用createAccountTable函数创建的映射表 
* @param ACCOUNT
*  待插入IP的帐号
* @param IP
*  新增的IP地址
* @param UID
*  新增的IP的对应机器UID
* @return TABLE
*  返回新插入IP的映射表
*/
function insertAccount(TABLE,ACCOUNT,IP,UID)
{
	
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};

	var ipset = TABLE.get(ACCOUNT);
	var IPtmp = {};
	IPtmp["IP"] = IP;
	IPtmp["UID"] = UID;
	
	if (typeof ipset == "undefined")
	 {
	 	var tmp = [];
	 	tmp.push(IPtmp);
	 	TABLE.put(ACCOUNT,tmp);
	 }
	 else
	 {
	 	ipset.push(IPtmp);
	 	TABLE.remove(ACCOUNT);
	 	TABLE.put(ACCOUNT,ipset);
	 }
	
	return TABLE;
}

/*
* @method removeAccountIP
*  在当前账户中删除某一下线的IP，若当前IP为帐号对应的唯一IP，则删除该帐号
* @param TABLE
*  用createAccountTable函数创建的映射表 
* @param ACCOUNT
*  待删除IP的帐号
* @param IP
*  要删除的IP地址
* @return TABLE
*  返回删除IP的映射表
*/
function removeAccountIP(TABLE,ACCOUNT,IP)
{
	if ( !net.isIP(IP)) {
		console.log('Input IP Format Error!');
		return;
	};

	var ipset =  TABLE.get(ACCOUNT);
	
	if (typeof ipset == "undefined")
	{
		console.log("Input Account Error or Empty Account!");
		return;
	};

	TABLE.remove(ACCOUNT);

	if (ipset.length == 1) 
	{
		return TABLE;
	};

	var orilength = ipset.length;
	for (var i = 0; i < ipset.length; i++)
	{
		if(ipset[i].IP == IP)
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

/*
* @method getIP
*  返回某一账户下对应的所有IP，该返回值是一个包含一个或多个IP的字符串数组
* @param TABLE
*  用createAccountTable函数创建的映射表 ，该映射表包含N个账户
* @param ACCOUNT
*  想获得IP组的指定帐号
* @return ip
*  返回ACCOUNT账户下所对应的全部IP地址
*/
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

/*
* @method clearTable
*  清空某一个映射表下的全部映射关系
* @param TABLE
*  用createAccountTable函数创建的映射表 ，待清空的表名
* @return null
*  返回清空了的映射表（为空）
*/
function clearTable(TABLE)
{
	return TABLE.clear();
}

/*
* @method removeAccount
*  清空某一个映射表下的某个账户映射关系
* @param TABLE
*  用createAccountTable函数创建的映射表 ，待删除ACCOUNT的表名
* @param ACCOUNT
*  待删除的ACCOUNT名称
* @return TABLE
*  返回删除了ACCOUNT对应关系的映射表
*/
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
exports.sendMSGbyAccount=sendMSGbyAccount;
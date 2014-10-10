var net = require('net');
var ursa = require('./newUrsa');
var ursaED = require('./ursaED');
var clientPackHandler = require('./clientPackHandler');

//account server information loaded from config file
var PORT=8894;
var IP='192.168.160.66';
var keySizeBits = 1024;
var TIMEOUT=2000;

/*
* @method register
*  用户注册新账户
* @param userName
*  待注册的用户名
* @param password
*  待注册的用户密码，用MD5加密
* @param UUID
*  客户端操作系统的唯一标识符
* @param pubKey
*  待提交的本机用户公钥
* @param serverKeyPair
*  帐号公钥服务器的KeyPair，由操作系统预置
* @param rigisterResultCb
*  注册回调函数，用来检测该注册是否成功
*/
function register(userName,password,UUID,pubKey,keyPair,serverKeyPair,rigisterResultCb){
  var client = connectClient();
  clientPackHandler.register(userName,password,UUID,pubKey,function(msg){
    sendMsg(client,msg,serverKeyPair);
  });
  clientOnData(client,keyPair,rigisterResultCb);
  clientOnEndOrError(client);
}
exports.register = register;

/*
* @method login
*  用户登录函数
* @param userName
*  待登录的用户名
* @param password
*  待登录的用户密码，用MD5加密
* @param UUID
*  客户端操作系统的唯一标识符
* @param pubKey
*  本机用户公钥
* @param keyPair
*  本机密钥keyPair
* @param serverKeyPair
*  帐号公钥服务器的KeyPair，由操作系统预置
* @param loginResultCb
*  登录回调函数，用来检测该登录是否成功
*/
function login(userName,password,UUID,pubKey,keyPair,serverKeyPair,loginResultCb){
  var client = connectClient();
  clientPackHandler.login(userName,password,UUID,pubKey,function(msg){
    sendMsg(client,msg,serverKeyPair);
  });
  clientOnData(client,keyPair,loginResultCb);
  clientOnEndOrError(client);
}
exports.login = login;

/*
* @method getPubKeysByName
*  根据用户名请求某一帐号下的所有pubkey
* @param userName
*  待请求pubkey的用户名
* @param UUID
*  请求方机器的UUID
* @param targetName
*  待请求账户的用户名
* @param keyPair
*  本机密钥keyPair
* @param serverKeyPair
*  帐号公钥服务器的KeyPair，由操作系统预置
* @param getPubKeysByNameResultCb
*  请求某账户下公钥集合的回调函数，在该函数中处理请求的公钥集合结果，或者请求状态
*/
function getPubKeysByName(userName,UUID,targetName,keyPair,serverKeyPair,getPubKeysByNameResultCb){
  var client = connectClient();
  clientPackHandler.getPubKeysByUserName(userName,UUID,targetName,function(msg){
    sendMsg(client,msg,serverKeyPair);
  });
  clientOnData(client,keyPair,getPubKeysByNameResultCb);
  clientOnEndOrError(client);
}
exports.getPubKeysByName = getPubKeysByName;

function connectClient(){
  var client = new net.Socket();
  client.connect(PORT,IP,function(){
    console.log('client is connected on server-addr :'+IP+":"+PORT);
  });
  client.setTimeout(TIMEOUT,function(){
    console.log('setTimeout');
    client.end();
  });
  return client;
}
function clientOnData(client,keyPair,callback){
  client.on('data',function(data){    
    //console.log('client  result:'+data);    
    var decrypteds='';
    var rstObj={};  
    console.log(data.toString('utf-8'));
    try{     
      decrypteds = ursaED.decrypt(keyPair,data.toString('utf-8'), keySizeBits/8);
    }catch(err){     
      console.log('getPubKeysByName error!!' + err);
      console.log('server, you don\'t known my pubKey, you know?!');
      client.end();
      return;
    }
    console.log('decrypteds-----'+decrypteds);		
    var msgObj = JSON.parse(decrypteds);		
    if(isInvalid(msgObj)){
	console.log('LEAVE exit');
	client.end();
	return;
      }else{
	callback(msgObj);
	client.end();
      }
  });
}
function timeOut(callback){
 callback(null); 
}
function clientOnEndOrError(client){
  client.on('end',function(){
    console.log('client disconnected');
  });
  client.on('error',function(err){
    console.log('something goes wrong! '+err.message);
    client.end();
  });
}

function isInvalid(msgObj){
  if(msgObj.type==null||msgObj.option==null){
    console.log('invalid true');
    return true;
  }else{
    switch(msgObj.type){
      case 'set':{
	if(msgObj.from==null||msgObj.UUID==null){
	  console.log('invalid true');
	  return true;
	}else{
	  console.log('invalid false');
	  return false;
	}
      }
      break;
      default:{
	console.log('invalid false');
	return false;
      }
    }
  }
}

function sendMsg(client,msg,serverKeyPair){
  msg = JSON.stringify(msg);
  var encrypteds = ursaED.encrypt(serverKeyPair,msg, keySizeBits/8);
  console.log('sending in sendMSG in account');
  client.write(encrypteds);
} 
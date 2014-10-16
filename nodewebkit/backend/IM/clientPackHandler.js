var net = require('net');
var fs = require('fs');
var ursa = require('./newUrsa');
var ursaED = require('./ursaED');
var crypto = require('crypto');

var keySizeBits = 1024;

function MD5(str, encoding){
  return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}
function initPackage(userName,UUID){
  var msg={};
  msg['from']=userName;
  msg['UUID']=UUID;
  msg['date']= (new Date()).getTime();
  return msg;
}
function register(userName,password,UUID,pubKey,rigisterCallback){
  var msg = initPackage(userName,UUID);
  var data = {};
  msg['type']='set';//获取服务器公钥
  msg['option']=0x0000;
  data['userName']=userName;
  data['password']=MD5(password);
  data['UUID']='Linux CDOS';
  data['pubKey']=pubKey.toString('utf-8');
  data['desc']='';
  msg['data']=data;
  msg['msg']='register';
  console.log('register:::::'+msg);
  rigisterCallback(msg);
}
exports.register=register;

function login(userName,password,UUID,pubKey,loginCallback){
  var msg = initPackage(userName,UUID);
  var data = {}; 
  msg['type']='set';//获取服务器公钥
  msg['option']=0x0001;
  data['userName']=userName;
  data['password']=MD5(password);
  data['pubKey']=pubKey.toString('utf-8');
  data['desc']='';
  msg['data']=data;
  msg['msg']='login'; 
  console.log('login in client handler');
  loginCallback(msg);
}
exports.login=login;

function getPubKeysByUserName(userName,UUID,targetName,getPubKeysByUserNameCallback){
  var msg = initPackage(userName,UUID);
  var data = {};
  msg['type']='get';//获取服务器公钥
  msg['option']=0x0100;
  data['userName']=targetName;
  msg['data']=data;
  msg['msg']='getPubKeyByUserName '+targetName; 
  console.log(msg['msg']);
  getPubKeysByUserNameCallback(msg);
}
exports.getPubKeysByUserName=getPubKeysByUserName;
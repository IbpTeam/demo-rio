/**
 * @Copyright:
 * 
 * @Description: Generate unique id.
 *
 * @author: WangFeng Yuanzhe
 *
 * @Data:2014.9.16
 *
 * @version:0.2.1
 **/

var os = require('os');
var npm = require('getmac');
var crypto = require('crypto');
var config = require('./config');
var fs = require('fs');
var path = require('path');

// @const
var UNIQUEID_JS = "uniqueID.js";

function SetSysUid(callback){
  var tmpmac=0;
  npm.getMac(function(err,macAddress){
  	if (err)  throw err;
  	tmpmac = macAddress;
  	console.log(tmpmac);
  	var uptime = getUptime();
  	var cpuidle = getCPUidle();
  	var uid = MD5(tmpmac+uptime+cpuidle);
  	writeUnID(uid,callback);
  });
}

function writeUnID(id,callback){
  if(typeof config.uniqueID == "undefined")	{
  	console.log('uniqueID not defined!');
  	fs.writeFile(path.join(config.USERCONFIGPATH,UNIQUEID_JS),'var uniqueID='+'\''+id+'\''+';'+'\n'+'exports.uniqueID=uniqueID;',function(err){
  		if (err)  throw err;
  		console.log('uniqueID was appended to config.js');
  		callback();
  	});
  }
}

function MD5(str, encoding){
  return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}

function getUptime(){
  console.log('os.uptime: '+os.uptime());
  return os.uptime();
}

function getHostname(){
  console.log('os.hostname: '+os.hostname());
  return os.hostname();
}

function getCPUidle(){
  var osCPUinfo = os.cpus();
  console.log('CPU idle:'+osCPUinfo[0].times.idle);
  return  osCPUinfo[0].times.idle;
}

function getCPUmodel(){
  var osCPUinfo = os.cpus();
  console.log('CPU model:'+osCPUinfo[0].model);
  return  osCPUinfo[0].model
}


function getFileUid(callback){
  getRandomBytes(10,function(token){
	if(token != null){
	  sid = config.uniqueID;
	  sytoken = sid+'#'+token;
	  callback(sytoken);
	}
  });
}

//Get random bytes
function getRandomBytes(length, callback){
  crypto.randomBytes(length,function(ex,buf){
	if(ex){
	  console.log("Crypto Exception: get random exception.");
	  callback(null);
	  return;
	}
	callback(buf.toString('hex'));
  });
}


exports.SetSysUid = SetSysUid;
exports.getFileUid = getFileUid;
exports.getRandomBytes = getRandomBytes;
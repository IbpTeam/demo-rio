var os = require('os');
var npm = require('getmac');
var crypto = require('crypto');
var config = require('./config');
var fs = require('fs');


function SetSysUid(callback)
{
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

function writeUnID(id,callback)
{
	if(typeof config.uniqueID == "undefined")
	{
		console.log('uniqueID not defined!');
		fs.writeFile(config.USERCONFIGPATH+"uniqueID.js",'var uniqueID='+'\''+id+'\''+';'+'\n'+'exports.uniqueID=uniqueID;',function(err){
		  if (err)  throw err;
		    console.log('uniqueID was appended to config.js');
          callback();
	    });
	}
}

function MD5(str, encoding)
{
	return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}

function getUptime()
{
	console.log('os.uptime: '+os.uptime());
	return os.uptime();
}

function getHostname()
{
	console.log('os.hostname: '+os.hostname());
	return os.hostname();
}

/*
console.log(
	'os.hostname(): '+ os.hostname()
	+'\nos.type(): '+os.type()
	+'\nos.release(): '+os.release()
	+'\nos.uptime(): '+os.uptime()
	+'\nos.totalmem() '+os.totalmem()
	);
*/

function getCPUidle()
{
	var osCPUinfo = os.cpus();
	console.log('CPU idle:'+osCPUinfo[0].times.idle);
	return  osCPUinfo[0].times.idle;
}

function getCPUmodel()
{
	var osCPUinfo = os.cpus();
	console.log('CPU model:'+osCPUinfo[0].model);
	return  osCPUinfo[0].model
}

//getmac();

//console.log(osCPUinfo);

var netInfo = os.networkInterfaces();

//console.log(netInfo);
function getFileUid(FUNC)
{
	getRandomBytes(10,function(token){
		if (token != null) {
			var sysid = require('./config');
			sid = sysid.uniqueID;
			sytoken = sid+'#'+token;
			console.log(sytoken);
			FUNC(sytoken);
		}
	});
}

//Get random bytes
function getRandomBytes(length, callback){
	crypto.randomBytes(length,function(ex,buf){
		if (ex) {
			console.log("Crypto Exception: get random exception.");
			callback(null);
		}else{
			callback(buf.toString('hex'));
		}
	});
}


exports.SetSysUid = SetSysUid;
exports.getFileUid = getFileUid;
exports.getRandomBytes = getRandomBytes;
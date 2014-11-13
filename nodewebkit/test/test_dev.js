var device = require('../lib/api/device_service');

device.startMdnsService();

setTimeout(function(){device.getDeviceByAccount('USER1',function(ddd){
	console.log(ddd);
})} ,2000);

setTimeout(function(){device.deviceDown();} ,4000);
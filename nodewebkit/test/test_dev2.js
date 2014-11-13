var device = require('../lib/api/device_service');

device.addListenerByAccount("USER1",function(obj){
	console.log("account up",obj);
},function(obj){
	console.log("account down");
});

device.startMdnsListener();
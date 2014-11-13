var device = require('../lib/api/device_service');

device.addListener(function(obj){
	console.log("normal up",obj);
},function(obj){
	console.log("normal down")
});

device.startMdnsListener();
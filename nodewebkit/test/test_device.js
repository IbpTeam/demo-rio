var mdns = require('../lib/api/device.js');
function deviceStateCb(signal, args){
  var interface = args[0];
  var protocol = args[1];
  var name = args[2];
  var type = args[3];
  var domain = args[4];
  var flags = args[5];
  switch(signal){
	  	case 'ItemNew':
	  		console.log('A new device is add, name: "'+  name + '"');
	  	break;
	  	case 'ItemRemove':
	  		console.log('A device is removed, name: "'+  name + '"');
	  	break;
  }
}

function devicePublishCb(){
  var name = 'demo-rio';
  var port = '80';
  var txtarray = ['demo-rio', 'hello'];
  mdns.entryGroupCommit(name,  port, txtarray)
}

function showDeviceListCb(args){
  deviceList = args;
  console.log("\n=====device list as below=====");
  var cnt = 1;
  var obj;
  for(address in deviceList){
    obj = deviceList[address]
    var txtarray = obj.txt
    var txt = ''
    for(var i=0; i<txtarray.length; i++){
      txt += (txtarray[i] + '; ');
     }    
    console.log(obj.address + ':' + obj.port + ' - ' + '"' + obj.name + '" (' + txt + ')');
  }  
}
mdns.addDeviceListener(deviceStateCb);
//mdns.setShowDeviceListCb(showDeviceListCb);
mdns.createServer(devicePublishCb);
setTimeout(function(){mdns.showDeviceList(showDeviceListCb)}, 2000);

setTimeout(function(){
  mdns.entryGroupReset()
}, 4000);


setTimeout(function(){mdns.showDeviceList(showDeviceListCb)}, 6000);

var mdns = require('../../nodewebkit/lib/api/device.js');
function deviceStateCb(signal, obj){
  interface = obj.interface;
  protocol = obj.protocol;
  name = obj.name;
  stype = obj.stype;
  domain = obj.domain;
  host = obj.host;
  aprotocol = obj.aprotocol;
  address = obj.address;
  port = obj.port;
  txt = obj.txt;
  flags  = obj.flags;
  //console.log(obj);
  switch(signal){
    case 'ItemNew':
      console.log('In function deviceStateCb. A new device is add, obj: ', obj.name);
      break;
    case 'ItemRemove':
      console.log('In function deviceStateCb. A device is removed, obj: ', obj.name);
      break;
  }
}

function deviceStateCb2(signal, obj){
  interface = obj.interface;
  protocol = obj.protocol;
  name = obj.name;
  stype = obj.stype;
  domain = obj.domain;
  host = obj.host;
  aprotocol = obj.aprotocol;
  address = obj.address;
  port = obj.port;
  txt = obj.txt;
  flags  = obj.flags;
  //console.log(obj);
  switch(signal){
    case 'ItemNew':
      console.log('In function deviceStateCb2. A new device is add, obj: ', obj.name);
      break;
    case 'ItemRemove':
      console.log('In function deviceStateCb2. A device is removed, obj: ', obj.name);
      break;
  }
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

id1 = mdns.addDeviceListenerToObj(deviceStateCb);
id2 = mdns.addDeviceListenerToObj(deviceStateCb2);
console.log("id1: ", id1, "id2: ", id2);
mdns.createServer(function(){});
setTimeout(function(){
 mdns.removeDeviceListenerFromObj(id2);
}, 4000);


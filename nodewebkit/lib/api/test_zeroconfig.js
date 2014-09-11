var mdns = require('./zeroconf');
function deviceStateCb(signal, arg){
    var interface = arg[0];
    var protocol = arg[1];
    var name = arg[2];
    var type = arg[3];
    var domain = arg[4];
    var flags = arg[5];
    // console.log('deviceStateCb:', signal, arg);
    switch(signal){
	    	case 'ItemNew':
	    		console.log('A new device is add, name: "'+  name + '"');
	    	break;
	    	case 'ItemRemove':
	    		console.log('A device is removed, name: "'+  name + '"');
	    	break;
    }
}
mdns.addDeviceListener(deviceStateCb);
mdns.createServer();

setTimeout(function(){
    var name = 'demo-rio';
    var address = '192.168.160.176';
    var port = '80';
    var txtarray = ['demo-rio', 'hello'];
    mdns.entryGroupCommit(name, address, port, txtarray)
}, 2000);


setTimeout(function(){mdns.showDeviceList()}, 4000);

setTimeout(function(){
    mdns.entryGroupReset()
}, 6000);


setTimeout(function(){mdns.showDeviceList()}, 8000);

// setTimeout(function(){mdns.createServiceBrowser()}, 200);
// setTimeout(function(){mdns.createEntryGroup}, 200);
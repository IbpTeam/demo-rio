var device = require('../../nodewebkit/lib/api/device_service');
/*
function Listenercb(para) {
  if (para.flag === "up") {
    console.log("device up", para.info.host, para.info.address);
  };
  if (para.flag === "down") {
    console.log("device down", para.info.host, para.info.address);
  };
}

device.addListener(Listenercb);

device.removeListener(Listenercb);
*/


device.addListenerByAccount(function(para) {
  if (para.flag === "up") {
    console.log("device up", para.info.host, para.info.address);
  };
  if (para.flag === "down") {
    console.log("device down", para.info.host, para.info.address);
  };
}, "USER1");


device.startMdnsService(function(state) {
  if (state === true) {
    console.log('start MDNS service successful!');
  };
});


setTimeout(function() {
  device.getDeviceByAccount(function(ddd) {
    console.log("=============This is in getDeviceByAccount function=============");
    for (var dev = 0; dev < ddd.length; dev++) {
      console.log(ddd[dev].host);
      console.log(ddd[dev].address)
    }
  }, 'USER1')
}, 2000);

setTimeout(function() {
  device.showDeviceList(function(ddd) {
    console.log("=============This is in showDeviceList function   =============");
    for (dev in ddd) {
      console.log(ddd[dev].host);
      console.log(ddd[dev].address);
    }
  }, 'USER1')
}, 3000);


setTimeout(function() {
  device.deviceDown(
    function(state) {
      if (state === true) {
        console.log('Device offline successful!');
      };
    });
}, 4000);
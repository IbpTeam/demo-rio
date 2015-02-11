// generate Proxy and Stub automatically base on user defined interface
//
if(process.argv.length != 3)
  return console.log('Usage: node generator.js ${Your_Interface_File}');

var utils = require('../backend/utils'),
    IPC = require('./ipc'),
    fs = require('fs');

utils.readJSONFile(process.argv[2], function(err, interfaces) {
  if(err) return console.log(err);
  builder(interfaces);
});

function builder(ifaces) {
  if(typeof ifaces.service === 'undefined')
    return console.log('Service\'s name not found');
  var pkgName = ifaces.package || 'nodejs.webde',
      addr = ifaces.address || 'nodejs.webde.service',
      initObj = {
        address: addr,
        path: addr.replace(/\./g, '/'),
        name: pkgName + '.' + ifaces.service,
        interface: ifaces.interfaces
      };
  buildProxy(ifaces.service + 'Proxy.js', initObj, ifaces.interfaces);
  buildStub(ifaces.service + 'Stub.js', initObj, ifaces.interfaces);
}

function buildStub(filename, initObj, ifaces) {
  var outputFile = [],
      serviceObj = {},
      TODO = '\/\/TODO: your service';
  initObj.service = true;
  initObj.serviceObj = {};
  // construct service object
  for(var i = 0; i < ifaces.length; ++i) {
    serviceObj[ifaces[i].name] = 'function(' + ifaces[i].in.join(', ') + ') {' + TODO + '}';
  }
  serviceObj['notify'] = 'function(msg) {ipc.notify(msg)}';

  try {
    var svrObjStr = JSON.stringify(serviceObj, null, 2).replace(/\"/g, ''),
        initObjStr = JSON.stringify(initObj, null, 2).replace(/\{\}}/, svrObjStr);
    // TODO: the string to get ipc object
  } catch(e) {
    return console.log(e);
  }
}

function buildProxy(filename, initObj, ifaces) {
  var outputFile = [];
  initObj.service = true;
}


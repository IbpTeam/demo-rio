// generate Proxy and Stub automatically base on user defined interface
//
if(process.argv.length < 3)
  return console.log('Usage: node generator.js ${Your_Interface_File} [ipc type]');

var fs = require('fs'),
    util = require('util'),
    events = require('events'),
    json4line = require('../../sdk/utils/json4line');

json4line.readJSONFile(process.argv[2], function(err, interfaces) {
  if(err) return console.log('Interface File error:', err);
  builder(interfaces);
});

function builder(ifaces) {
  if(typeof ifaces.service === 'undefined')
    return console.log('Service\'s name not found');
  // add 'type' and 'remote' field to interface file to determine features of proxy and stub
  //  will be generated.
  var remote = ifaces.remote || 'false',
      pkgName = ifaces.package || 'nodejs.webde',
      addr = ifaces.address || pkgName + '.' + ifaces.service,
      path = ifaces.path || '/' + addr.replace(/\./g, '/'),
      initObj = {
        address: addr,
        path: path,
        name: addr/*  + '.' + ifaces.service */,
        type: '$ipcType'
      };
  if(process.argv[3] == 'dbus') {
    initObj.type = 'dbus';
  } else if(process.argv[3] == 'binder') {}

  buildProxy(ifaces.service + 'Proxy.js', initObj, ifaces.interfaces, false);
  buildStub(ifaces.service + 'Stub.js', initObj, ifaces.interfaces,
      (remote == 'true' ? true : false));
  if(remote == 'true') {
    // initObj.name = 'nodejs.webde.service.commdeamon';
    delete initObj.interface;
    delete initObj.serviceObj;
    buildProxy(ifaces.service + 'ProxyRemote.js', initObj, ifaces.interfaces, true)
  }
}

var NOTICE = "// This file is auto generated based on user-defined interface.\n"
            + "// Please make sure that you have checked all TODOs in this file.\n"
            + "// TODO: please replace types with peramters' name you wanted of any functions\n"
            + "// TODO: please replace $ipcType with one of dbus, binder, websocket and socket\n";
var GETIPC = "  // TODO: please replace $IPC with the real path of webde-rpc module in your project\n"
            + "  this._ipc = require('$IPC').getIPC(initObj);\n";

function buildStub(filename, initObj, ifaces, remote) {
  var outputFile = [],
      serviceObj = {},
      TODO = '/* TODO: Implement your service. Make sure that call the callback at the end of this function whose parameter is the return of this service.*/';
  initObj.interface = ifaces;
  initObj.service = true;
  initObj.serviceObj = {};
  // construct service object
  for(var i = 0; i < ifaces.length; ++i) {
    serviceObj[ifaces[i].name] = 'function(' + ifaces[i].in.join(', ')
        + (ifaces[i].in.length == 0 ? '' : ', ') + 'callback) {' + TODO + '}';
  }

  try {
    outputFile.push(NOTICE);
    var svrObjStr = JSON.stringify(serviceObj, null, 2).replace(/\"/g, ''),
        lines = svrObjStr.split('\n');
    for(var i = 1; i < lines.length; ++i) {
      lines[i] = '  ' + lines[i];
    }
    var initObjStr = JSON.stringify(initObj, null, 2).replace(/\{\}/, lines.join('\n'));
    outputFile.push("var initObj = " + initObjStr + "\n");
    // the string to get ipc object
    outputFile.push('function Stub() {\n'
      // the string to get ipc object
      + GETIPC
      // TODO: register proxy to server-deamon, if this service will serve for other devices
      + '}\n');
    outputFile.push("Stub.prototype.notify = function(event) {\n"
        + "  this._ipc.notify.apply(this._ipc, arguments);\n"
        + "};\n");
    // interface to get proxy object
    var arg = (remote ? 'proxyAddr' : '');
    outputFile.push("var stub = null"
        + (remote ? ",\n    cd = null;\n" : ";")
        + "exports.getStub = function(" + arg + ") {\n"
        + "  if(stub == null) {\n"
        + (remote ? "    if(typeof proxyAddr === 'undefined')\n"
        + "      throw 'The path of proxy\\'s module file we need!';\n"
        + "    // TODO: replace $cdProxy to the path of commdaemonProxy\n"
        + "    cd = require('$cdProxy').getProxy();\n"
        + "    cd.register(initObj.name, proxyAddr, function(ret) {\n"
        + "      if(ret.err) {\n"
        + "        return console.log(ret.err\n"
        + "          , 'This service cannot be accessed from other devices since failed to register on CD');\n"
        + "      }\n"
        + "    });\n" : "")
        + "    stub = new Stub();\n"
        + "  }\n"
        + "  return stub;\n"
        + "}\n")

    fs.writeFile(filename, outputFile.join('\n'), function(err) {
      if(err) return err;
    });
  } catch(e) {
    return console.log(e);
  }
}

var EVENTHANDLER = "  // TODO: choose to implement interfaces of ipc\n"
        + "  /* handle message send from service\n"
        + "  this._ipc.onMsg = function(msg) {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n\n"
        + "  /* handle the event emitted when connected succeffuly\n"
        + "  this._ipc.onConnect = function() {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n\n"
        + "  /* handle the event emitted when connection has been closed\n"
        + "  this._ipc.onClose = function() {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n\n"
        + "  /* handle the event emitted when error occured\n"
        + "  this._ipc.onError = function(err) {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n";

function buildProxy(filename, initObj, ifaces, remote) {
  var outputFile = [];
  initObj.service = false;
  try {
    outputFile.push(NOTICE);
    if(!remote) {
      var initObjStr = JSON.stringify(initObj, null, 2);
      outputFile.push("var initObj = " + initObjStr + "\n");
    }
    var argus = (remote ? 'ip' : ''), 
        initS = (remote ? '  if(typeof ip !== \'undefined\') {\n'
                  + '    this.ip = ip;\n'
                  + '  } else {\n'
                  + '    return console.log(\'The remote IP is required\');\n'
                  + '  }\n\n' : ''); 
    outputFile.push('function Proxy(' + argus +  ') {\n'
      + initS
      // the string to get ipc or cdProxy object
      + (remote ? "  // TODO: replace $cdProxy to the real path\n"
      + "  this._cd = require('$cdProxy').getProxy();" : GETIPC)
      + "  this._token = 0;\n\n"
      // the string to implement event handler user-own
      + (remote ? "" : EVENTHANDLER)
      + '}\n');
    for(var i = 0; i < ifaces.length; ++i) {
      // console.log(ifaces[i].show);
      if((ifaces[i].show == 'l' && remote) || (ifaces[i].show == 'r' && !remote))
        continue;
      outputFile.push("Proxy.prototype." + ifaces[i].name + " = function(" 
          + ifaces[i].in.join(', ')
          + (ifaces[i].in.length == 0 ? "" : ", ") + "callback) {\n"
          + "  var l = arguments.length,\n"
          + "      args = Array.prototype.slice.call(arguments, 0"
          + ", (typeof callback === 'undefined' ? l : l - 1));\n"
          + (remote ? ("  var argv = {\n"
          + "      action: 0,\n"
          + "      svr: '" + initObj.name + "',\n"
          + "      func: '" + ifaces[i].name + "',\n"
          + "      args: args\n"
          + "    };\n"
          + "  this._cd.send(this.ip, argv, callback);\n") : ("  this._ipc.invoke({\n"
          + "    token: this._token++,\n"
          + "    name: '" + ifaces[i].name + "',\n"
          + "    in: args,\n"
          + "    callback: callback\n"
          + "  });\n"))
          + "};\n");
    }
    // add on/off interface
    outputFile.push("Proxy.prototype.on = function(event, handler) {\n"
        // send on request to remote peer
        + (remote ? ("  this._cd.on(event, handler);\n"
        + "  var argvs = {\n"
        + "    'action': 0,\n"
        + "    'svr': '" + initObj.name + "',\n"
        + "    'func': 'on',\n"
        + "    'args': [event]\n"
        + "  };\n"
        + "  this._cd.send(this.ip, argvs);\n")
        : "  this._ipc.on(event, handler);\n")
        + "};\n\n"
        + "Proxy.prototype.off = function(event, handler) {\n"
        // send off request to remote peer
        + (remote ? ("  this._cd.off(event, handler);\n"
        + "  var argvs = {\n"
        + "    'action': 0,\n"
        + "    'svr': '" + initObj.name + "',\n"
        + "    'func': 'off',\n"
        + "    'args': [event]\n"
        + "  };\n"
        + "  this._cd.send(this.ip, argvs);\n")
        : "  this._ipc.removeListener(event, handler);\n")
        + "};\n");
    // interface to get proxy object
    outputFile.push("var proxy = null;\n"
        + "exports.getProxy = function(" + argus + ") {\n"
        + "  if(proxy == null) {\n"
        + "    proxy = new Proxy(" + argus +  ");\n"
        + "  }\n"
        + "  return proxy;\n"
        + "};\n");

    fs.writeFile(filename, outputFile.join('\n'), function(err) {
      if(err) return err;
    });
  } catch(e) {
    return console.log(e);
  }
}

// TODO: build a HTML document to describ interfaces
//

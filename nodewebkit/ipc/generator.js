// generate Proxy and Stub automatically base on user defined interface
//
if(process.argv.length != 3)
  return console.log('Usage: node generator.js ${Your_Interface_File}');

var /* utils = require('../backend/utils'), TODO: for node to run */
    IPC = require('./ipc'),
    fs = require('fs'),
    util = require('util'),
    events = require('events');

function LineReader(file_, separator_) {
  this._separator = separator_ || /\r?\n|\r/;
  this._rStream = fs.createReadStream(file_, {encoding: 'utf8'});
  this._remain = '';
  events.EventEmitter.call(this);

  var _this = this;
  this._rStream.on('open', function() {
  }).on('data', function(data_) {
    _this.parseData(data_);
  }).on('error', function(err_) {
    _this.emit('error', err_);
  }).on('end', function() {
    if(_this._remain != '')
      _this.emit('lines', [_this._remain]);
    _this.emit('end');
  });
}
util.inherits(LineReader, events.EventEmitter);

LineReader.prototype.parseData = function(data_) {
  var lines = data_.split(this._separator);
  lines[0] = this._remain + lines[0];
  this._remain = lines.pop();
  this.emit('lines', lines);
}
  
function readJSONFile(path_, callback_) {
  var cb_ = callback_ || function() {},
      lr = new LineReader(path_),
      content = [];
  lr.on('lines', function(lines_) {
    for(var i in lines_) {
      if(lines_[i].match(/^\s*#/) == null) content.push(lines_[i]);
    }
  }).on('end', function(){
    try {
      json = JSON.parse(content.join(''));
      return cb_(null, json);
    } catch(e) {
      return cb_(e);
    }
  }).on('error', function(err_) {
    cb_('Fail to load file: ' + err_);
  });
}

readJSONFile(process.argv[2], function(err, interfaces) {
  if(err) return console.log(err);
  builder(interfaces);
});

function builder(ifaces) {
  if(typeof ifaces.service === 'undefined')
    return console.log('Service\'s name not found');
  // TODO: add 'type' and 'remote' field to interface file to determine features of proxy and stub
  //  will be generated.
  var remote = ifaces.remote || 'false',
      pkgName = ifaces.package || 'nodejs.webde',
      addr = ifaces.address || 'nodejs.webde.service',
      path = ifaces.path || '/' + addr.replace(/\./g, '/'),
      initObj = {
        address: addr,
        path: path,
        name: addr + '.' + ifaces.service,
        type: ifaces.type || '$ipcType'
      };
  buildProxy(ifaces.service + 'Proxy.js', initObj, ifaces.interfaces, false);
  buildStub(ifaces.service + 'Stub.js', initObj, ifaces.interfaces);
  if(remote == 'true') {
    initObj.type = 'socket';
    delete initObj.interface;
    delete initObj.serviceObj;
    buildProxy(ifaces.service + 'ProxyRemote.js', initObj, ifaces.interfaces, true)
  }
}

var NOTICE = "// This file is auto generated based on user-defined interface.\n"
            + "// Please make sure that you have checked all TODOs in this file.\n"
            + "// TODO: please replace types with peramters' name you wanted of any functions\n"
            + "// TODO: please replace $ipcType with one of dbus, binder, websocket and socket\n";
var GETIPC = "  // TODO: please replace $IPC with the real path of ipc module in your project\n"
            + "  this.ipc = require('$IPC').getIPC(initObj);\n";

function buildStub(filename, initObj, ifaces) {
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
      + '}\n');
    outputFile.push("Stub.prototype.notify = function(event) {\n"
        + "  this.ipc.notify.apply(this.ipc, arguments);\n"
        + "};\n");
    // interface to get proxy object
    outputFile.push("var stub = null;\n"
        + "exports.getStub = function() {\n"
        + "  if(stub == null) stub = new Stub();\n"
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
        + "  this.ipc.onMsg = function(msg) {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n\n"
        + "  /* handle the event emitted when connected succeffuly\n"
        + "  this.ipc.onConnect = function() {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n\n"
        + "  /* handle the event emitted when connection has been closed\n"
        + "  this.ipc.onClose = function() {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n\n"
        + "  /* handle the event emitted when error occured\n"
        + "  this.ipc.onError = function(err) {\n"
        + "    // TODO: your handler\n"
        + "  }*/\n";

function buildProxy(filename, initObj, ifaces, remote) {
  var outputFile = [];
  initObj.service = false;
  try {
    outputFile.push(NOTICE);
    var initObjStr = JSON.stringify(initObj, null, 2);
    outputFile.push("var initObj = " + initObjStr + "\n");
    var argus = (remote ? 'ip, port' : ''),
        initS = (remote ? '  if(arguments.length == 2) {\n'
                  + '    initObj.ip = ip;\n'
                  + '    initObj.port = port;\n'
                  + '  } else {\n'
                  + '    return console.log(\'IP and Port are required\');\n'
                  + '  }\n\n' : '');
    outputFile.push('function Proxy(' + argus + ') {\n'
      + initS
      // the string to get ipc object
      + GETIPC + '\n'
      // the string to implement event handler user-own
      + EVENTHANDLER
      + '}\n');
    // construct proxy interface
    for(var i = 0; i < ifaces.length; ++i) {
      outputFile.push("Proxy.prototype." + ifaces[i].name + " = function(" 
          + ifaces[i].in.join(', ')
          + (ifaces[i].in.length == 0 ? "" : ", ") + "callback) {\n"
          + "  var l = arguments.length,\n"
          + "      args = Array.prototype.slice.call(arguments, 0, l - 1);\n"
          + "  this.ipc.invoke({\n"
          + "    name: '" + ifaces[i].name + "',\n"
          + "    in: args,\n"
          + "    callback: callback\n"
          + "  });\n"
          + "};\n");
    }
    // add on/off interface
    outputFile.push("Proxy.prototype.on = function(event, handler) {\n"
        + "  this.ipc.on(event, handler);\n"
        + "}\n\n"
        + "Proxy.prototype.off = function(event, handler) {\n"
        + "  this.ipc.off(event, handler);\n"
        + "}\n");
    // interface to get proxy object
    outputFile.push("var proxy = null;\n"
        + "exports.getProxy = function(" + argus + ") {\n"
        + "  if(proxy == null) proxy = new Proxy(" + argus + ");\n"
        + "  return proxy;\n"
        + "}\n")

    fs.writeFile(filename, outputFile.join('\n'), function(err) {
      if(err) return err;
    });
  } catch(e) {
    return console.log(e);
  }
}


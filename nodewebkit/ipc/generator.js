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
  var pkgName = ifaces.package || 'nodejs.webde',
      addr = ifaces.address || 'nodejs.webde.service',
      path = ifaces.path || '/' + addr.replace(/\./g, '/'),
      initObj = {
        address: addr,
        path: path,
        name: addr + '.' + ifaces.service,
      };
  buildProxy(ifaces.service + 'Proxy.js', initObj, ifaces.interfaces);
  buildStub(ifaces.service + 'Stub.js', initObj, ifaces.interfaces);
}

var NOTICE = "// This file is auto generated based on user-defined interface.\n"
            + "// Please make sure that you have checked all TODOs in this file.\n"
            + "// TODO: please replace types with peramters' name you wanted of any functions\n";
var GETIPC = "// TODO: please replace $ipcType with one of dbus, binder and websocket\n"
            + "// TODO: please replace $IPC with the real path of ipc module in your project\n"
            + "var ipc = require('$IPC').getIPC($ipcType, initObj)\n";

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
    outputFile.push(GETIPC);
    outputFile.push("exports.notify = function(msg) {\n"
        + "  ipc.notify(msg);\n"
        + "};\n");

    fs.writeFile(filename, outputFile.join('\n'), function(err) {
      if(err) return err;
    });
  } catch(e) {
    return console.log(e);
  }
}

function buildProxy(filename, initObj, ifaces) {
  var outputFile = [];
  initObj.service = false;
  try {
    // the string to get ipc object
    outputFile.push(NOTICE);
    var initObjStr = JSON.stringify(initObj, null, 2);
    outputFile.push("var initObj = " + initObjStr + "\n");
    outputFile.push(GETIPC);
    // construct proxy interface
    for(var i = 0; i < ifaces.length; ++i) {
      outputFile.push("exports." + ifaces[i].name + " = function(" 
          + ifaces[i].in.join(', ')
          + (ifaces[i].in.length == 0 ? "" : ", ") + "callback) {\n"
          + "  var l = arguments.length,\n"
          + "      args = Array.prototype.slice.call(arguments, 0, l - 1);\n"
          + "  ipc.invoke({\n"
          + "    name: '" + ifaces[i].name + "',\n"
          + "    in: args,\n"
          + "    callback: callback\n"
          + "  });\n"
          + "};\n");
    }
    outputFile.push("// TODO: choose to implement interfaces of ipc\n"
        + "/* handle message send from service\n"
        + "ipc.onMsg = function(msg) {\n"
        + "  // TODO: your handler\n"
        + "}*/\n\n"
        + "/* handle the event emitted when connected succeffuly\n"
        + "ipc.onConnect = function() {\n"
        + "  // TODO: your handler\n"
        + "}*/\n\n"
        + "/* handle the event emitted when connection has been closed\n"
        + "ipc.onClose = function() {\n"
        + "  // TODO: your handler\n"
        + "}*/\n\n"
        + "/* handle the event emitted when error occured\n"
        + "ipc.onError = function(err) {\n"
        + "  // TODO: your handler\n"
        + "}*/\n");

    fs.writeFile(filename, outputFile.join('\n'), function(err) {
      if(err) return err;
    });
  } catch(e) {
    return console.log(e);
  }
}


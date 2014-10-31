var net = require('net');
var fs = require('fs');
var os = require('os');

var PORT = 8891;
var FILE_PORT = 8080;
//var localIP='192.168.160.18'; 
var TIMEOUT = 10000;

function getLocalIP() {
  var IPv4;
  for (var i = 0; i < os.networkInterfaces().eth0.length; i++) {
    if (os.networkInterfaces().eth0[i].family == 'IPv4') {
      IPv4 = os.networkInterfaces().eth0[i].address;
      console.log('IPv4:' + IPv4);
      return IPv4;
    }
  }
  return;
}

function fileTransferStart(err, ip, filePort, fileLtnPort, path, name, length, fileTransferStartCb) {
  var client = connectClient(ip, PORT);
  var msg = {};
  msg['type'] = 'file'; //获取服务器公钥
  msg['option'] = 0x0001;
  var IPv4 = getLocalIP();
  if (err || IPv4 === undefined) {
    msg['state'] = '0';
    msg['msg'] = 'file-transfer you can\'t file ' + name;
    console.log('fileTransferStart' + JSON.stringify(msg));
    client.write(JSON.stringify(msg));
    client.end();
    fileTransferStartCb(true);
    return;
  } else {
    msg['state'] = '1';
    msg['ip'] = IPv4; //+':'+filePort+'/'+path;    
    msg['filePort'] = filePort;
    msg['ltnPort'] = fileLtnPort;
    msg['path'] = path;
    msg['file'] = name;
    msg['length'] = length;
    msg['msg'] = 'file-transfer you can get ' + name;
    console.log('fileTransferStart' + JSON.stringify(msg));
    client.write(JSON.stringify(msg));
  }
  clientOnData(client, fileTransferStartCb);
  clientOnEndOrError(client);
}
exports.fileTransferStart = fileTransferStart;

function fileTransferInit(ip, path, name, fileTransferInitCb) {
  if (!fs.existsSync(path)) {
    fileTransferInitCb(true, 'no such a file');
    return false;
  } else {
    var file = fs.statSync(path);
    if (!file || !file.isFile()) {
      fileTransferInitCb(true, 'file stat error');
      return false;
    } else {
      size = file.size;
      console.log('file.size' + size + ' ' + name);
      fileTransferRequest(ip, name, size, fileTransferInitCb);
    }
  }
}
exports.fileTransferInit = fileTransferInit;

function transferFileRatio(flag, ip, port, path, ratio, callback) {
  var client = connectClient(ip, port);
  var msg = {};
  msg['type'] = 'file';
  msg['option'] = 0x0002;
  msg['path'] = path;
  msg['ratio'] = ratio;
  msg['state'] = flag; //err===true?'0':'1';
  msg['msg'] = 'file-transfer transferRatio of file ' + path + '---' + ratio;
  client.write(JSON.stringify(msg));
  console.log('  transferFileRatio---' + JSON.stringify(msg));
  // clientOnData(client,callback);
  clientOnEndOrError(client);
  client.end();
  callback();
}
exports.transferFileRatio = transferFileRatio;

function fileTransferRequest(ip, name, length, callback) {
  var client = connectClient(ip, PORT);
  var msg = {};
  msg['type'] = 'file'; //获取服务器公钥
  msg['option'] = 0x0000;
  msg['file'] = name;
  msg['length'] = length;
  msg['msg'] = 'file-transfer do you want to accept ' + name;
  client.write(JSON.stringify(msg));
  console.log('fileTransferRequest---' + JSON.stringify(msg));
  clientOnData(client, callback);
  clientOnEndOrError(client);
}

function transferFileCancel(ip, path, callback) {
  var client = connectClient(ip, PORT);
  var msg = {};
  msg['type'] = 'file';
  msg['option'] = 0x0003;
  msg['path'] = path;
  msg['msg'] = 'file-transfer cancel of file ' + path;
  client.write(JSON.stringify(msg));
  console.log(' send  transferFileCancel---' + JSON.stringify(msg));
  // clientOnData(client,callback);
  clientOnEndOrError(client);
  client.end();
  callback();
}
exports.transferFileCancel = transferFileCancel;

function connectClient(ip, port) {
  var client = new net.Socket();
  client.connect(port, ip, function() {
    console.log('client is connected on server-addr :' + ip + ":" + port);
  });
  client.setTimeout(TIMEOUT, function() {
    console.log('setTimeout');
    client.end();
  });
  return client;
}

function clientOnData(client, callback) {
  client.on('data', function(data) {
    var msgObj = JSON.parse(data);
    client.end();
    callback(false, msgObj);
  });
}

function timeOut(callback) {
  callback(null);
}

function clientOnEndOrError(client) {
  client.on('end', function() {
    console.log('client disconnected');
    client.end();
  });
  client.on('error', function(err) {
    console.log('something goes wrong! ' + err.message);
    client.end();
  });
}
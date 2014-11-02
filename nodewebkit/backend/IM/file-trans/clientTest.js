var transferFile = require('./transferFile');
var fileTransferServer = require('./fileTransferServer');
var crypto = require('crypto');
var input = __dirname + '/geju.mkv';
var input0 = __dirname + '/JsFormat.tar.gz'
var fileServer;
var IP = '192.168.160.66';
var buf = input.split('/');
var name = buf[buf.length - 1];
var buf0 = input0.split('/');
var name0 = buf0[buf0.length - 1];

transferFile.transferFile(IP, input, name, function() {
    console.log('transferFiletransferFiletransferFiletransferFiletransferFile');
});
/*
transferFile.transferFile(IP, input0, name0, function() {
    console.log('transferFiletransferFiletransferFiletransferFiletransferFile');
});
*/
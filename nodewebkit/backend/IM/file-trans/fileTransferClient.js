var tape = require('tape');
var fs = require('fs');
var fileTransfer = require('./fileTransfer');
var request = require('request');
var util = require('util');
var HashTable = require('hashtable');
var RATIO_SIZE = 0.1;

var transferHashTable = new HashTable();

function cancelTransfer(path, callback) {
  var fileTransferStream = transferHashTable.get(path);
  if (fileTransferStream !== undefined) {
    fileTransferStream.abort();
    transferHashTable.remove(path);
  }
  callback();
}
exports.cancelTransfer = cancelTransfer;

function transferFile(msgObj, output, callback) {
  try {
    var run = new tape();
    run.test('can stream into a file', function(test) {
      var url = 'http://' + msgObj.ip + ':' + msgObj.filePort + '/' + msgObj.key;

      var read = request(url); 
      transferHashTable.put(msgObj.key, read);
      var write = fs.createWriteStream(output);
      read.pipe(write);

      var currentRatio = 0;
      var currentLength = 0;
      var lastSendRatio = 0;
      read.on('data', function(data) {
        currentLength += data.length;
        currentRatio = currentLength / msgObj.fileSize;
        if ((currentRatio - lastSendRatio) > RATIO_SIZE && currentRatio !== 1) {
          //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示    
          lastSendRatio = currentRatio;
          fileTransfer.transferFileRatio(1, msgObj, currentRatio, function(rstObj) {
            setTimeout(callback(false, rstObj), 0);
          });
        }
      });
      read.on('end', function(data) {
        test.end();
        transferHashTable.remove(msgObj.key);
        //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示
        fileTransfer.transferFileRatio(2, msgObj, currentRatio, function(rstObj) {
          setTimeout(callback(false, rstObj), 0);
        });
      });

      read.on('error', function(err) {
        test.end();
        transferHashTable.remove(msgObj.key);
        if ((err === 404 || err === 500) && fs.existsSync(output)) {
          fs.unlinkSync(output);
        }
        //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示
        fileTransfer.transferFileRatio(0, msgObj, currentRatio, function(rstObj) {
          setTimeout(callback(false, rstObj), 0);
        });
      });
      setTimeout(callback(false, 'on fileTransfering.....'), 0);
    });
  } catch (e) {
    setTimeout(callback(true, 'on fileTransfering failed.....'), 0);
  }
}
exports.transferFile = transferFile;
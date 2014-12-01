var tape = require('tape');
var fs = require('fs');
var fileTransfer = require('./fileTransfer');
var request = require('request');
var util = require('util');
var HashTable = require('hashtable');
//var TAPE_SIZE=10;
//var BLOK_SIZE=65536;
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
    console.log('fileTransfer=====-----' + output + ' ' + msgObj.fileSize);
    var run = new tape();
    run.test('can stream into a file', function(test) {
      var url = 'http://' + msgObj.ip + ':' + msgObj.filePort + '/' + msgObj.key;

      console.log('url====================' + url);
      var read = request(url); //('http://192.168.160.66:8083')
      //console.log('=================\n'+util.inspect(read.getStatusCode())+'\n======================');
      console.log('--------------hooooooooooooooooooooooooo---------------------');
      transferHashTable.put(msgObj.key, read);
      console.log('------------------------------size-----------------------' + transferHashTable.size());
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
            console.log('   transferFileRatio----ondata---');
            //  callback(false,rstObj);
            setTimeout(callback(false, rstObj), 0);
          });
        }
      });
      read.on('end', function(data) {
        test.end();
        console.log('------------------------------size-----agin------------------' + transferHashTable.size());
        transferHashTable.remove(msgObj.key);
        console.log('------------------------------size-----agin------------------' + transferHashTable.size() + '===' + currentRatio);
        //callback(true,1);
        //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示
        fileTransfer.transferFileRatio(2, msgObj, currentRatio, function(rstObj) {
          console.log('   transferFileRatio----onend---');
          // callback(false,rstObj);
          setTimeout(callback(false, rstObj), 0);
        });
      });

      read.on('error', function(err) {
        test.end();
        console.log('------------------------------size-----agin------------------' + transferHashTable.size() + 'v    ' + err);
        transferHashTable.remove(msgObj.key);
        console.log('------------------------------size-----agin------------------' + transferHashTable.size());
        console.log('==========on  error==================');
        if ((err === 404 || err === 500) && fs.existsSync(output)) {
          console.log('11111111111111111   ' + err);
          fs.unlinkSync(output);
        }
        //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示
        fileTransfer.transferFileRatio(0, msgObj, currentRatio, function(rstObj) {
          console.log('   transferFileRatio----onerror---');
          //     callback(false,rstObj);
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
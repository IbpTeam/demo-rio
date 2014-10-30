var tape = require('tape');
var fs = require('fs');
var client = require('./client');
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
    //     client.transferFileCancel(ip,ltnPort,path,function(){      
    //  console.log('   transferFileRatio----transferFileCancel---');
    //       });
  }
  callback();
}
exports.cancelTransfer = cancelTransfer;

function fileTransfer(ip, filePort, ltnPort, path, output, length, callback) {
  console.log('fileTransfer=====-----' + output + ' ' + length);
  var run = new tape();
  run.test('can stream into a file', function(test) {

    var url = 'http://' + ip + ':' + filePort + '/' + path;

    var read = request(url); //('http://192.168.160.66:8083')
    //console.log('=================\n'+util.inspect(read.getStatusCode())+'\n======================');
    transferHashTable.put(path, read);

    var write = fs.createWriteStream(output);
    read.pipe(write);

    var currentRatio = 0;
    var currentLength = 0;
    var lastSendRatio = 0;
    read.on('data', function(data) {
      currentLength += data.length;
      currentRatio = currentLength / length;

      if ((currentRatio - lastSendRatio) > RATIO_SIZE && currentRatio !== 1) {
        //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示    
        lastSendRatio = currentRatio;
        client.transferFileRatio(1, ip, ltnPort, path, currentRatio, function() {
          console.log('   transferFileRatio----ondata---');
        });
      }
      //         if(currentRatio>0.5)
      //     cancelTransfer(path,function(){
      //     console.log('client cancel accept file');
      //    });
    });
    read.on('end', function(data) {
      test.end();
      transferHashTable.remove(path);
      //callback(true,1);
      //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示
      client.transferFileRatio(2, ip, ltnPort, path, currentRatio, function() {
        console.log('   transferFileRatio----onend---');
      });
    });

    read.on('error', function() {
      test.end();
      transferHashTable.remove(path);
      console.log('==========on  error==================');
      //调用显示传输进度的函数  之后再调用client.transferFileRatio------------界面显示
      client.transferFileRatio(0, ip, ltnPort, path, currentRatio, function() {
        console.log('   transferFileRatio----onerror---');
      });
    });
    callback(0, 'on fileTransfering.....');
  });
}
exports.fileTransfer = fileTransfer;
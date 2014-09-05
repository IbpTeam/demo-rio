var net = require('net');
var fs = require('fs');
var ursa = require('./newUrsa');
var ursaED = require('./ursaED');

var count=0;//标识第一次通话传输的是公钥
var pubkey='';//存储收到的公钥
var keySizeBits = 1024;
var keyPair ;//密钥信息
var clearText='我不告诉你';
var client = net.createConnection({port:8214},function(){
  console.log('cliet connected');
  //client.write(sig);
});

client.on('data',function(data){
  console.log('->'+data.toString()); 

  if(count===0){
    pubkey=data;
    keyPair = ursa.createKey(pubkey);
    
  }
  var encrypteds = ursaED.encrypt(keyPair,clearText, keySizeBits/8);
  console.log(clearText+' 加密后的数据：'+encrypteds);
  client.write(encrypteds);
  count++;
});

client.on('end',function(){
  console.log('client disconnected');
});
function sleep(milliSeconds) {
      var startTime = new Date().getTime();
      while (new Date().getTime() < startTime + milliSeconds);
}

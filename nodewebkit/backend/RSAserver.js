var net = require('net');
var fs = require('fs');
var ursa = require('./newUrsa');
var ursaED = require('./ursaED');

var keySizeBits = 1024;
var size=65537;
var keyPair ;//密钥信息
var pubKey='';// 公钥信息
var server = net.createServer(function(c){
  console.log('server connnected');
  c.on('end',function(){
    console.log('server disconntected');
  });
  var clearText='使用RSA加密解密字符串';


  if(keyPair==null){
      
    console.log('no keyPair now!!!');
    fs.exists('priKey.pem', function(exists) {
      if(exists){
        console.log('yes');
        var prikey=fs.readFileSync('priKey.pem').toString('utf-8');
        console.log(prikey);
        keyPair= ursa.createKey(prikey);
      }else{
        console.log('no');
        keyPair= ursa.generatePrivateKey(keySizeBits, size);
        keyPair.saveKeys('');
      }
      keyPair= ursa.generatePrivateKey(keySizeBits, size);
      pubKey=keyPair.getPublicKeyPem();
      c.write(pubKey);
    });  
  }else{
    c.write(pubKey);
  }
  //sleep(5000);
  
  
  c.on('data',function(data){
    //var decrypteds = decrypt(data.toString('utf-8'), keySizeBits/8);
    var decrypteds = ursaED.decrypt(keyPair,data.toString('utf-8'), keySizeBits/8);
    console.log('解密：'+decrypteds);
    sleep(5000);
//    c.write(count+'--hello--\r\n');
  });
  c.pipe(c);
});
server.listen(8214,function(){
  var address = server.address();
  console.log('server bound on %j ',address);
});

function sleep(milliSeconds) {
      var startTime = new Date().getTime();
      while (new Date().getTime() < startTime + milliSeconds);
}

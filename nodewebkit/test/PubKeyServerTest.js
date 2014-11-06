var account = require('../backend/IM/pubkeyServer');
var userAccount = require('../backend/IM/userAccount.js');
var rsaKey = require('../backend/IM/rsaKey');

var keyPair = rsaKey.initSelfRSAKeys('/home/rtty/.demo-rio/key/priKey.pem','/home/rtty/.demo-rio/key/pubKey.pem');
var pubKey= keyPair.getPublicPEM();
var serverKeyPair= rsaKey.loadServerKey('/home/rtty/.demo-rio/key/serverKey.pem');

account.register('rtty123','rtty123','34234324r34rerfe45r4a',pubKey,keyPair,serverKeyPair,function(msg){
  console.log(JSON.stringify(msg));
});



/*

account.getPubKeysByName('rtty1234','serfes4rtfe5tg455656565666','rtty1234',keyPair,serverKeyPair,function(msg){
    console.log(JSON.stringify(msg.data.detail));
    msg.data.detail.forEach(function (row) {    
        console.log(row.UUID);
        console.log(row.pubKey);            
      });       
});

account.register('yuanzhe','yuanzhe','testtest',pubKey,keyPair,serverKeyPair,function(msg){
  console.log(JSON.stringify(msg));
});

var table = userAccount.createAccountTable();

table = userAccount.insertAccount(table,"rtty123","192.168.0.1","1234324242w4r");
table = userAccount.insertAccount(table,"rtty123","192.168.0.2","231sdfdsrgfd");

var ipset = userAccount.getIP(table,"rtty123");
console.log(ipset);

account.register('rtty123','rtty123','Linux Mint17',pubKey,keyPair,serverKeyPair,function(msg){
  console.log(JSON.stringify(msg));
});
34234324r34rerfe45r4


account.login('fyf','fyf','Linux Mint',pubKey,keyPair,serverKeyPair,function(msg){
  console.log(JSON.stringify(msg));
});


account.getPubKeysByName('yuanzhe','testtest','yuanzhe',keyPair,serverKeyPair,function(msg){
    console.log(JSON.stringify(msg.data.detail));
    msg.data.detail.forEach(function (row) {    
        console.log(row.UUID);
        console.log(row.pubKey);            
      });       
});

*/
/*
account.login('yuanzhe','yuanzhe','testtest',pubKey,keyPair,serverKeyPair,function(msg){
  console.log(JSON.stringify(msg));
});

account.login('yuanzhe1','yuanzhe1','testtest',pubKey,keyPair,serverKeyPair,function(msg){
  console.log(JSON.stringify(msg));
});

fs.appendFile("./key/users/34234324r34rerfe45r4a.pem","dddddddddd  ",function(err){
	if(err) throw err;
});

var ursa = require('./newUrsa');
var ursaED = require('./ursaED');
var imchat = require('./IMChat.js');
var fs = require('fs');

var keySizeBits = 1024;
var size = 65537;

 var keyPair = ursaED.loadPriKeySync('./key/priKey.pem');

 var pubKey=ursaED.loadPubKeySync('./key/users/34234324r34rerfe45r4a.pem');
 
var msg = imchat.encapsuMSG("Hello!","SentEnFirst","A","uuiddddd","B",pubKey);

console.log(msg);
 
var tt = imchat.encryptSentMSG(msg,pubKey);
console.log(tt);
var m =JSON.parse(tt);

console.log(m);

/*

imchat.sendIMMsg("127.0.0.1",8892,msg,keyPair);

var keyPair= ursa.generatePrivateKey(keySizeBits, size);
var pubkey= ursaED.getPubKeyPem(keyPair);
var prikey = keyPair.toPrivatePem();

keyPair.saveKeys("3333.pem","4444.pem");

*/
/*
var keySizeBits = 1024;
var size = 65537;
 var keyPair = ursaED.loadPriKeySync('./key/priKey.pem');
 var  pubKey = ursaED.loadPubKeySync('./key/users/34234324erererw3r3w4.pem');
 //var pubKey=keyPair.getPublicKeyPem();
 console.log(pubKey);
var msg = imchat.encapsuMSG("Hello!","Chat","A","B",pubKey);
console.log(msg);
imchat.sendIMMsg("127.0.0.1",8892,msg,keyPair);
*/
//var table = imchat.createAccountTable();
//table = imchat.insertAccount(table,"rtty123","192.168.1.123","34234324r34rerfe45r4");
//table = imchat.insertAccount(table,"rtty123","127.0.0.1","34234324r34rerfe45r4a");
//var IP = imchat.getIP(table,"rtty123");
//IP.forEach(function (row) {
 //console.log(row.IP);
 // console.log(row.UID);
//});
//imchat.sendMSGbyAccount(table,"rtty123","Hello this is sending message",8892);
//table = imchat.removeAccountIP(table,"rtty123","192.168.1.122");

 //IP = imchat.getIP(table,"rtty123");

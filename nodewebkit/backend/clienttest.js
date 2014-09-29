var ursa = require('./newUrsa');
var ursaED = require('./ursaED');
var imchat = require('./IMChat.js');
var fs = require('fs');

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

var table = imchat.createAccountTable();

table = imchat.insertAccount(table,"rtty123","192.168.1.123","34234324r34rerfe45r4");
table = imchat.insertAccount(table,"rtty123","127.0.0.1","34234324erererw3r3w4");

var IP = imchat.getIP(table,"rtty123");

IP.forEach(function (row) {
  console.log(row.IP);
  console.log(row.UID);
});


imchat.sendMSGbyAccount(table,"rtty123","Hello this is sending message",8892);
//table = imchat.removeAccountIP(table,"rtty123","192.168.1.122");

 //IP = imchat.getIP(table,"rtty123");

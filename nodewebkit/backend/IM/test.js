var fs =require('fs');
 var serverPubkey = fs.readFileSync('./serverKey.pem').toString('utf-8');
console.log(serverPubkey);
var r=__dirname;
console.log(r)

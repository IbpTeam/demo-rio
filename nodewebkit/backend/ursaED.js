var ursa = require('./newUrsa');
var fs = require('fs');
var keySizeBits = 1024;
var size=65537;

function encrypt(keyPair,clearText, keySizeBytes){
  var buffer = new Buffer(clearText);
  var maxBufferSize = keySizeBytes - 42; //according to ursa documentation
  var bytesDecrypted = 0;
  var encryptedBuffersList = [];

  //loops through all data buffer encrypting piece by piece
  while(bytesDecrypted < buffer.length){
    //calculates next maximun length for temporary buffer and creates it
    var amountToCopy = Math.min(maxBufferSize, buffer.length - bytesDecrypted);
    var tempBuffer = new Buffer(amountToCopy);

    //copies next chunk of data to the temporary buffer
    buffer.copy(tempBuffer, 0, bytesDecrypted, bytesDecrypted + amountToCopy);

    //encrypts and stores current chunk
    var encryptedBuffer = keyPair.encrypt(tempBuffer);
    encryptedBuffersList.push(encryptedBuffer);

    bytesDecrypted += amountToCopy;
  }

  //concatenates all encrypted buffers and returns the corresponding String
  return Buffer.concat(encryptedBuffersList).toString('base64');
}

function decrypt(keyPair,encryptedString, keySizeBytes){

  var encryptedBuffer = new Buffer(encryptedString, 'base64');
  var decryptedBuffers = [];

  //if the clear text was encrypted with a key of size N, the encrypted 
  //result is a string formed by the concatenation of strings of N bytes long, 
  //so we can find out how many substrings there are by diving the final result
  //size per N
  var totalBuffers = encryptedBuffer.length / keySizeBytes;

  //decrypts each buffer and stores result buffer in an array
  for(var i = 0 ; i < totalBuffers; i++){
    //copies next buffer chunk to be decrypted in a temp buffer
    var tempBuffer = new Buffer(keySizeBytes);
    encryptedBuffer.copy(tempBuffer, 0, i*keySizeBytes, (i+1)*keySizeBytes);
    //decrypts and stores current chunk
    var decryptedBuffer = keyPair.decrypt(tempBuffer);
    decryptedBuffers.push(decryptedBuffer);
  }

  //concatenates all decrypted buffers and returns the corresponding String
  return Buffer.concat(decryptedBuffers).toString();
}

function loadPriKeySync(keypath)
{
  var exist = fs.existsSync(keypath);
  if (exist) {
    console.log('local private key exists');
            var prikey=fs.readFileSync(keypath).toString('utf-8');
            console.log("private key load successful!");
            keyPair= ursa.createKey(prikey);
         //   pubKey=keyPair.getPublicKeyPem();
            return keyPair;
  }else{
    console.log('local private key do not exist');
    return;
  }
}

function loadPubKeySync(keypath)
{
  var exist = fs.existsSync(keypath);
  if (exist) {
    console.log('local public key exists');
            var prikey=fs.readFileSync(keypath).toString('utf-8');
            console.log("public key load successful!");
            keyPair= ursa.createKey(prikey);
           pubKey=keyPair.getPublicKeyPem();
            return pubKey;
  }else{
    console.log('local public key do not exist');
    return;
  }
}

function loadRSAKey(keyPair)
{
  fs.exists('./key/priKey.pem', function(exists) {
      if(exists){
        console.log('local private key exists');
        var prikey=fs.readFileSync('./key/priKey.pem').toString('utf-8');
        console.log("private key load successful!");
        keyPair= ursa.createKey(prikey);
        pubKey=keyPair.getPublicKeyPem();
      }else{
        console.log('local private key not exists');
        keyPair= ursa.generatePrivateKey(keySizeBits, size);
        keyPair.saveKeys('');
        pubKey=keyPair.getPublicKeyPem();
      }
   //   keyPair= ursa.generatePrivateKey(keySizeBits, size);
    });  
}

function getPubKeyPem(keyPair){
  console.log('getPubkeyPem');
  var pubKey=keyPair.getPublicKeyPem();
  return pubKey;
}
function initSelfRSAKeys(priKeyPath,pubKeyPath){
  console.log('no selfPubKey now!!!'); 
  var keyPair;
  var exists = fs.existsSync(priKeyPath);
  if (exists) {
    console.log('local private key exists');
    var prikey=fs.readFileSync(priKeyPath).toString('utf-8');	
    keyPair= ursa.createKey(prikey);
    console.log("private key load successful!");
  }else{
    console.log('local private key do not exist');
    keyPair= ursa.generatePrivateKey(keySizeBits, size);	
    keyPair.saveKeys(priKeyPath,pubKeyPath);   
  }
  return keyPair;
}
function loadServerKey(serverKeyPath){
  console.log('loading server pubkey'); 
  var serverKeyPair;
  var exists = fs.existsSync(serverKeyPath);
  if (exists) {
    console.log('local private key exists');
    var serverkey=fs.readFileSync(serverKeyPath).toString('utf-8');	
    serverKeyPair= ursa.createKey(serverkey);
    console.log("private key load successful!");
    return serverKeyPair;
  }else{
    console.log('local server public key do not exist');
    return;
  }
}
exports.encrypt = encrypt;
exports.decrypt = decrypt;
exports.loadPriKeySync = loadPriKeySync;
exports.loadRSAKey = loadRSAKey;
exports.loadPubKeySync = loadPubKeySync;
exports.getPubKeyPem = getPubKeyPem;
exports.initSelfRSAKeys=initSelfRSAKeys;
exports.loadServerKey=loadServerKey;
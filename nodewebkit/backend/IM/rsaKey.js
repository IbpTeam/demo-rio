var NodeRsa = require('node-rsa');
var fs = require('fs');
var cp = require("child_process");

function initSelfRSAKeys(priKeyPath) {
  var keyPair;
  var exists = fs.existsSync(priKeyPath);
  if (exists) {
    console.log('local private key exists');
    var prikey = fs.readFileSync(priKeyPath).toString('utf-8');
    keyPair = new NodeRsa(prikey);
    console.log("private key load successful!");
  } else {
    console.log('error!!!  local private key do not exist');
  }
  return keyPair;
}
exports.initSelfRSAKeys = initSelfRSAKeys;

function loadServerKey(serverKeyPath) {
  var serverKeyPair;
  var exists = fs.existsSync(serverKeyPath);
  if (exists) {
    console.log('local private key exists');
    var serverkey = fs.readFileSync(serverKeyPath).toString('utf-8');
    serverKeyPair = new NodeRsa(serverkey);
    console.log("private key load successful!");
    return serverKeyPair;
  } else {
    console.log('local server public key do not exist');
    return;
  }
}
exports.loadServerKey = loadServerKey;

function generateKeypair(priKeyPath, pubKeyPath, pemKeyPath, generateKeypairCb) {
  var exists = fs.existsSync(priKeyPath);
  if (exists) {
    fs.unlinkSync(priKeyPath);
  }
  exists = fs.existsSync(pubKeyPath);
  if (exists) {
    fs.unlinkSync(pubKeyPath);
  }
  exists = fs.existsSync(pemKeyPath);
  if (exists) {
    fs.unlinkSync(pemKeyPath);
  }
  var sCommandStr = "ssh-keygen -t rsa -b 1024 -P '' -f '" + priKeyPath + "'";
  cp.exec(sCommandStr, function(err, stdout, stderr) {
    if (err) {
      console.log(err);
      generateKeypairCb(false);
    } else {
      sCommandStr = "ssh-keygen -e -m 'PKCS8' -f '" + pubKeyPath + "'" + " > '" + pemKeyPath + "'";
      cp.exec(sCommandStr, function(err, stdout, stderr) {
        if (err) {
          console.log(err);
          generateKeypairCb(false);
        } else {
          generateKeypairCb(true);
        }
      });
    }
  });
}
exports.generateKeypair = generateKeypair;
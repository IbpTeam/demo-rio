var NodeRsa = require('node-rsa');
var fs = require('fs');
var cp = require("child_process");

function initSelfRSAKeys(priKeyPath) {
  console.log('no selfPubKey now!!!');
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
  console.log('no serverPubKey now!!!');
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
  var existsPri = fs.existsSync(priKeyPath);
  var existsPub = fs.existsSync(pubKeyPath);
  var existsPubPem = fs.existsSync(pemKeyPath);
  if (existsPri && existsPub && existsPubPem)
    generateKeypairCb(true);
  else {
    if (existsPri) {
      fs.unlinkSync(priKeyPath);
    }
    exists = fs.existsSync(pubKeyPath);
    if (existsPub) {
      fs.unlinkSync(pubKeyPath);
    }
    exists = fs.existsSync(pemKeyPath);
    if (existsPubPem) {
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
}
exports.generateKeypair = generateKeypair;
function initServerPubKey(serverPubKeyPath, initServerPubKeyCb) {
  var exists = fs.existsSync(serverPubKeyPath);
  if (exists) {
    initServerPubKeyCb(true);
  } else {
    var curDir=__dirname;
    var serverPubKey = fs.readFileSync(curDir+'/serverKey.pem').toString('utf-8');
    fs.writeFile(serverPubKeyPath, serverPubKey, 'utf8', function(err) {
      initServerPubKeyCb(!err);
    });
  }
}
exports.initServerPubKey = initServerPubKey;
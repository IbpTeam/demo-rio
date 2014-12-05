var NodeRsa = require('node-rsa');
var fs = require('fs');
var cp = require("child_process");

function initSelfRSAKeys(priKeyPath) {
  var keyPair;
  var exists = fs.existsSync(priKeyPath);
  if (exists) {
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

function generateKeypair(sParams, generateKeypairCb) {
  var existsPri = fs.existsSync(sParams[0]); //priKeyPath
  var existsPub = fs.existsSync(sParams[1]); //pubKeyPath
  var existsPubPem = fs.existsSync(sParams[2]); //pemKeyPath
  if (existsPri && existsPub && existsPubPem) {
    initSSHKeyPair(true, sParams, generateKeypairCb);
  } else {
    if (existsPri) {
      fs.unlinkSync(sParams[0]);
    }
    if (existsPub) {
      fs.unlinkSync(sParams[1]);
    }
    if (existsPubPem) {
      fs.unlinkSync(sParams[2]);
    }
    var sCommandStr = "ssh-keygen -t rsa -b 1024 -P '' -f '" + sParams[0] + "'";
    cp.exec(sCommandStr, function(err, stdout, stderr) {
      if (err) {
        console.log(err);
        generateKeypairCb(false, true);
      } else {
        sCommandStr = "ssh-keygen -e -m 'PKCS8' -f '" + sParams[1] + "'" + " > '" + sParams[2] + "'";
        cp.exec(sCommandStr, function(err, stdout, stderr) {
          if (err) {
            console.log(err);
            generateKeypairCb(false, true);
          } else {
            initSSHKeyPair(false, sParams, generateKeypairCb);
          }
        });
      }
    });
  }
}
exports.generateKeypair = generateKeypair;

function needOrNotInitSSH(noNeedCp, sParams, needOrNotInitSSHCb) {
  var existsPri_im = fs.existsSync(sParams[3]); //priKeyPath
  var existsPub_im = fs.existsSync(sParams[4]); //pubKeyPath
  if (existsPri_im && existsPub_im && noNeedCp) {
    needOrNotInitSSHCb(false, false);
  } else {
    var existsDir = fs.existsSync(sParams[5]);
    if (existsDir) {
      needOrNotInitSSHCb(false, true);
    } else {
      mkdirsSync(sParams[5], function(done) {
        needOrNotInitSSHCb(!done, true);
      });
    }
  }
}

function initSSHKeyPair(noNeedCp, sParams, cb) {
  needOrNotInitSSH(noNeedCp, sParams, function(err, cpOrNot) {
    if (err) {
      cb(false);
    } else {
      if (cpOrNot) {
        var sCommandStr = "cp '" + sParams[0] + "'  '" + sParams[5] + "'";
        cp.exec(sCommandStr, function(err, stdout, stderr) {
          if (err) {
            console.log(err);
            cb(false);
          } else {
            sCommandStr = "cp '" + sParams[1] + "'  '" + sParams[5] + "'";
            cp.exec(sCommandStr, function(err, stdout, stderr) {
              if (err) {
                console.log(err);
                cb(false);
              } else {
                cb(true);
              }
            });
          }
        });
      } else {
        cb(true);
      }
    }
  });
}
exports.initSSHKeyPair = initSSHKeyPair;

function initServerPubKey(serverPubKeyPath, initServerPubKeyCb) {
  var exists = fs.existsSync(serverPubKeyPath);
  if (exists) {
    initServerPubKeyCb(true);
  } else {
    var curKeyPath = __dirname + '/serverKey.pem';
    var sCommandStr = "cp '" + curKeyPath + "'  '" + serverPubKeyPath + "'";
    cp.exec(sCommandStr, function(err, stdout, stderr) {
      if (err) {
        console.log(err);
        initServerPubKeyCb(false);
      } else {
        initServerPubKeyCb(true);
      }
    });
  }
}
exports.initServerPubKey = initServerPubKey;
/**
 * @method mkdirsSync
 *  生成多层目录
 *
 * @param1 oParamBag string
 *   启动程序参数，待生成的路径，例如：/home/fyf/.demo-rio/key/users
 *
 * @param2 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作成功与否，成功则返回true,失败则返回false
 */
function mkdirsSync(dirpath, mkdirsSyncCb) {
  try {
    if (fs.existsSync(dirpath)) {
      mkdirsSyncCb(true);
    } else {
      var dirs = dirpath.split('/');
      var dir = '';
      for (var i = 0; i < dirs.length; i++) {
        dir += dirs[i] + '/';
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir);
        }
      }
      mkdirsSyncCb(true);
    }
  } catch (e) {
    mkdirsSyncCb(false);
  }
};
exports.mkdirsSync = mkdirsSync;

function loadPubKey(pubKeyPath, loadPubKeyCb) {
  var exists = fs.existsSync(pubKeyPath);
  if (exists) {
    var pubKey = fs.readFileSync(pubKeyPath).toString('utf-8');
    loadPubKeyCb(pubKey);
  } else {
    console.log('local server public key do not exist');
    loadPubKeyCb();
  }
}
exports.loadPubKey = loadPubKey;
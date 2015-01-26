var rsaKey = require('./IM/rsaKey');
var cryptoConf = require('./cryptoConf');
var fs = require('fs');
var path = require('path');

/**
 * @method initServerPubKey
 *  在默认路径下初始化服务器端公钥信息
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作成功与否，成功则返回true,失败则返回false
 */
function initServerPubKey(initServerPubKeyCb) {
  rsaKey.initServerPubKey(cryptoConf.serverkeypath, function(done) {
    initServerPubKeyCb(done);
  });
}
exports.initServerPubKey = initServerPubKey;
/**
 * @method generateRsaKeypair
 *  根据路径生成数据同步以及即时通信公私钥信息
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作成功与否，成功则返回true,失败则返回false
 
 * @param2 oParamBag string
 *   启动程序参数，可以json格式封装，对应 共用私钥/数据同步公钥/即时通信公钥 存储路径
 */
function generateRsaKeypair(generateRsaKeypairCb, sParams) {
  rsaKey.generateKeypair(sParams, function(done) {
    generateRsaKeypairCb(done);
  });
}
exports.generateRsaKeypair = generateRsaKeypair;

/**
 * @method generateKeypairCtn
 *  默认在路径~/.custard/config/key下生成公私钥，
 *  并生成存放其他用户公钥的目录~/.custard/config/key/users
 *  具体路径由cryptoConf.js读入
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作成功与否，成功则返回true,失败则返回false
 */
function generateKeypairCtn(generateKeypairCtnCb) {
  rsaKey.mkdirsSync(cryptoConf.SSHUSERPATH, function(done) {
    if (done) {
      var sParams = [cryptoConf.prikeypath, cryptoConf.pubkeypath_msg, cryptoConf.pubkeypath_im, cryptoConf.sshPriKeyPath, cryptoConf.sshPubKeyPath, cryptoConf.SSHPATH_msg];
      generateRsaKeypair(function(done) {
        generateKeypairCtnCb(done);
      }, sParams);
    } else {
      generateKeypairCtnCb(done);
    }
  });
}
exports.generateKeypairCtn = generateKeypairCtn;
/**
 * @method getPubKeyInfo
 *  默认在路径/home/fyf/.ssh下得到公钥
 *  具体路径由cryptoConf.js读入
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      string, 返回公钥内容
 */
function getPubKeyInfo(generateKeypairCtnCb) {
  rsaKey.loadPubKey(cryptoConf.sshPubKeyPath,function(pubKey){
    generateKeypairCtnCb(pubKey);
  });
}
exports.getPubKeyInfo = getPubKeyInfo;
var rsaKey = require('../../backend/IM/rsaKey');
var cryptoConf = require('./cryptoConf');
var fs = require('fs');
var path = require('path');

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
function generateRsaKeypair(generateRsaKeypairCb,sParams) {
  rsaKey.generateKeypair(sParams[0], sParams[1], sParams[2], function(done) {
    generateRsaKeypairCb(done);
  });
}
exports.generateRsaKeypair = generateRsaKeypair;

/**
 * @method mkdirsSync
 *  生成多层目录
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作成功与否，成功则返回true,失败则返回false

 * @param2 oParamBag string
 *   启动程序参数，待生成的路径，例如：/home/fyf/.demo-rio/key/users
 */
function mkdirsSync(mkdirsSyncCb, dirpath) {
  try {
    if (fs.existsSync(dirpath)) {
      mkdirsSyncCb(true);
    }
    var dirs = dirpath.split('/');
    var dir = '';
    for (var i = 0; i < dirs.length; i++) {
      dir += dirs[i] + '/';
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }
    mkdirsSyncCb(true);
  } catch (e) {
    mkdirsSyncCb(false);
  }
};
exports.mkdirsSync = mkdirsSync;

/**
 * @method generateKeypairCtn
 *  默认在路径/home/fyf/.demo-rio/key下生成公私钥，
 *  并生成存放其他用户公钥的目录/home/fyf/.demo-rio/key/users
 *  具体路径由cryptoConf.js读入
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作成功与否，成功则返回true,失败则返回false
 */
function generateKeypairCtn(generateKeypairCtnCb){
    mkdirsSync(function(done){
        if(done){
            var sParams=[cryptoConf.prikeypath, cryptoConf.pubkeypath_msg, cryptoConf.pubkeypath_im];
            generateRsaKeypair(function(done){
                generateKeypairCtnCb(done);
            },sParams);
        }else{
            generateKeypairCtnCb(done);
        }
    },cryptoConf.SSHUSERPATH);
}
exports.generateKeypairCtn = generateKeypairCtn;



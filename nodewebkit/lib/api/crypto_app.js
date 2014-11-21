var rsaKey = require('../../backend/IM/rsaKey');

/**
 * @method generateRsaKeypair
 *  生成数据同步以及即时通信公私钥信息
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
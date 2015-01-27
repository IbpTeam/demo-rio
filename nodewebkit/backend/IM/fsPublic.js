var fs = require('fs');
var cp = require("child_process");

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
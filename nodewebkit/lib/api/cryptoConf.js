var path = require('path');

/**
 * 产生公私钥的默认路径
 *  数据同步与即时通信共用私钥路径 prikeypath
 *  数据同步公钥路径 pubkeypath_msg
 *  即时通信公钥路径 pubkeypath_im
 *  即时通信用户存储的其他用户公钥目录 SSHUSERPATH
 */
var HOME_DIR = "/home";
var DEMO_RIO = ".demo-rio";
var CURUSER = process.env['USER'];
var USERCONFIGPATH = path.join(HOME_DIR, CURUSER, DEMO_RIO);
var SSHPATH = path.join(USERCONFIGPATH,"key");
var SSHUSERPATH = path.join(SSHPATH,"users");

var prikeypath = path.join(SSHPATH, "rio_rsa");
var pubkeypath_msg = path.join(SSHPATH, "rio_rsa.pub");//use in msgTransfer
var pubkeypath_im = path.join(SSHPATH, "rio_rsa.pem");//use in imchat
var serverkeypath = path.join(SSHPATH, "serverKey.pem");//公钥服务器公钥路径

exports.prikeypath=prikeypath;
exports.pubkeypath_msg=pubkeypath_msg;
exports.pubkeypath_im=pubkeypath_im;
exports.serverkeypath = serverkeypath;
exports.SSHUSERPATH=SSHUSERPATH;
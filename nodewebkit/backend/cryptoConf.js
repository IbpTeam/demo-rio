var path = require('path');
var config = require("config");
/**
 * 产生公私钥的默认路径
 *  数据同步与即时通信共用私钥路径 prikeypath
 *  数据同步公钥路径 pubkeypath_msg
 *  即时通信公钥路径 pubkeypath_im
 *  即时通信用户存储的其他用户公钥目录 SSHUSERPATH
 */
var HOME_DIR = "/home";
//var DEMO_RIO = ".demo-rio";
var SSH_DIR = ".ssh";
var DOWNLOAD_DIR = ".download";
var CURUSER = process.env['USER'];
var USERCONFIGPATH = config.USERCONFIGPATH;//path.join(HOME_DIR, CURUSER, DEMO_RIO);
var SSHPATH = path.join(USERCONFIGPATH, "key");
var SSHUSERPATH = path.join(SSHPATH, "users");
var SSHPATH_msg = path.join(HOME_DIR, CURUSER, SSH_DIR);
var DOWNLOADPATH = path.join(HOME_DIR, CURUSER, DOWNLOAD_DIR);

var prikeypath = path.join(SSHPATH, "rio_rsa");
var pubkeypath_msg = path.join(SSHPATH, "rio_rsa.pub"); //use in msgTransfer
var pubkeypath_im = path.join(SSHPATH, "rio_rsa.pem"); //use in imchat
var serverkeypath = path.join(SSHPATH, "serverKey.pem"); //公钥服务器公钥路径
var sshPriKeyPath = path.join(SSHPATH_msg, "rio_rsa");
var sshPubKeyPath = path.join(SSHPATH_msg, "rio_rsa.pub");

exports.prikeypath = prikeypath;
exports.pubkeypath_msg = pubkeypath_msg;
exports.pubkeypath_im = pubkeypath_im;
exports.serverkeypath = serverkeypath;
exports.SSHUSERPATH = SSHUSERPATH;
exports.sshPriKeyPath = sshPriKeyPath;
exports.sshPubKeyPath = sshPubKeyPath;
exports.SSHPATH_msg = SSHPATH_msg;
exports.DOWNLOADPATH = DOWNLOADPATH;
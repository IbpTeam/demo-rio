var path = require('path');
var userAccount = require("../../backend/IM/pubkeyServer.js");
var rsaKey = require("../../backend/IM/rsaKey.js");

var HOME_DIR = "/home";
var SSH = ".ssh";
var DEMO_RIO = ".demo-rio";
var CURUSER = process.env['USER'];
var SSHPATH = path.join(HOME_DIR, CURUSER, SSH);
var USERCONFIGPATH = path.join(HOME_DIR, CURUSER, DEMO_RIO);
var uniqueID = require(USERCONFIGPATH + '/uniqueID.js')

var prikeypath = path.join(SSHPATH, "priKey.pem");
var pubkeypath = path.join(SSHPATH, "pubKey.pem");
var serverkeypath = path.join(SSHPATH, "serverKey.pem");

var keyPair = rsaKey.initSelfRSAKeys(prikeypath, pubkeypath);
var pubKey = keyPair.getPublicPEM();
var serverKeyPair = rsaKey.loadServerKey(serverkeypath);

/**
 * @method accountRegister
 *  在公钥服务器上注册新用户
 *
 * @param registerCb
 *   回调函数，用来显示注册结果
 *  @param1
 *   JSON, 表示注册的状态，其中
 *   state字段表示注册成功与否，若成功，则为1,若失败，则返回0
 *   msg字段表示注册结果的详细信息，包括register succeed/register failed/account existed/Err
 *   该结构体具体描述如下：
 * {
   'type': result/error',
   'option': 0x0000,
   'state': 0/1,
    'date': '',
    'msg': 'register succeed/register failed/account existed/Err',
  }
 * @param reginfo
 *  JSON，待注册的账户信息，其中
 *  account字段表示待注册的用户名，passwd字段表示注册的用户密码
 *  举例如下：
 * var accinfo = {
    account: "user1",
    passwd: "123456"
};
 *
 */
function accountRegister(registerCb, reginfo) {
  userAccount.register(reginfo.account, reginfo.passwd, uniqueID.uniqueID, pubKey, keyPair, serverKeyPair, registerCb);
}
exports.accountRegister = accountRegister;

/**
 * @method accountLogin
 *  在公钥服务器上登录用户
 *
 * @param loginCb
 *   回调函数，用来显示登录结果
 *  @param1
 *   JSON, 表示登录的状态，其中
 *   state字段表示登录是否成功，若成功，则为1,若失败，则返回0
 *   msg字段表示登录结果的详细信息，包括'auth failed/auth succeed/Err',
 *   该结构体具体描述如下：
 *{
  'type': 'result/error',
  'option': 0x0001,
  'state': 0/1,
  'type': 'result/error',
  'msg': 'auth failed/auth succeed/Err',
}
 * @param loginfo
 *  JSON，待登录的账户信息，其中
 *  account字段表示待注册的用户名，passwd字段表示注册的用户密码
 *  举例如下：
 * var accinfo = {
    account: "user1",
    passwd: "123456"
};
 *
 */
function accountLogin(loginCb, loginfo) {
  userAccount.login(loginfo.account, loginfo.passwd, uniqueID.uniqueID, pubKey, keyPair, serverKeyPair, loginCb);
}
exports.accountLogin = accountLogin;
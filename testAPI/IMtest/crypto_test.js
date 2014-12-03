var cryptoApp= require('../../nodewebkit/lib/api/crypto_app');
var path= require('path');

var HOME_DIR = "/home";
var DEMO_RIO = ".demo-rio";
var SSH_DIR = ".ssh";
var CURUSER = process.env['USER'];
var USERCONFIGPATH = path.join(HOME_DIR, CURUSER, DEMO_RIO);
var SSHPATH = path.join(USERCONFIGPATH, "key");
var SSHUSERPATH = path.join(SSHPATH, "users");
var SSHPATH_msg = path.join(HOME_DIR, CURUSER, SSH_DIR);

var prikeypath = path.join(SSHPATH, "rio_rsa");
var pubkeypath_msg = path.join(SSHPATH, "rio_rsa.pub"); //use in msgTransfer
var pubkeypath_im = path.join(SSHPATH, "rio_rsa.pem"); //use in imchat
var serverkeypath = path.join(SSHPATH, "serverKey.pem"); //公钥服务器公钥路径
var sshPriKeyPath = path.join(SSHPATH_msg, "rio_rsa");//.ssh私钥路径
var sshPubKeyPath = path.join(SSHPATH_msg, "rio_rsa.pub");//.ssh公钥路径

/*  默认在路径/home/fyf/.demo-rio/key下生成公私钥，
*并生成存放其他用户公钥的目录/home/fyf/.demo-rio/key/users
*具体路径由cryptoConf.js读入
*/
cryptoApp.generateKeypairCtn(function(done) {
  if (done)
    console.log('create rsa keypair success!');
  else
    console.log('create rsa keypair failed!!!');
});

//根据路径生成数据同步以及即时通信公私钥信息
var sParams = [prikeypath, pubkeypath_msg, pubkeypath_im, sshPriKeyPath, sshPubKeyPath, SSHPATH_msg];
cryptoApp.generateRsaKeypair(function(done) {
  if (done)
    console.log('create rsa keypair success!');
  else
    console.log('create rsa keypair failed!!!');
}, parse);
//在默认路径下初始化服务器端公钥信息
cryptoApp.initServerPubKey(function(done) {
  if (done)
    console.log('init server pubkey success!');
  else
    console.log('init server pubkey failed!!!');
 });
//获取默认路径.ssh/下的公钥信息
cryptoApp.getPubKeyInfo(function(pubkey) {
  if (pubkey===undefined)
    console.log('can not find youe pubKey!');
  else
    console.log('pubKey:'+pubkey);
 });


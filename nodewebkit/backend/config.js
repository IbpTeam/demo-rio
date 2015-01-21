var util = require('util');
var os = require('os');
var path = require("path");

/*
 * Config Path
 * */
var BASEPATH = path.join(process.env["HOME"],".custard");
exports.BASEPATH = BASEPATH;

var RESOURCEPATH = path.join(BASEPATH, "resources");
exports.RESOURCEPATH = RESOURCEPATH;

var USERCONFIGPATH = path.join(BASEPATH, "config");
exports.USERCONFIGPATH = USERCONFIGPATH;

var DATABASENAME = "rio.sqlite3";
var DATABASEPATH = path.join(USERCONFIGPATH, DATABASENAME);
exports.DATABASEPATH = DATABASEPATH;

var UNIQUEID_JS = "uniqueID.js";
exports.UNIQUEID_JS = UNIQUEID_JS;

var NETLINKSTATUSPATH;
exports.NETLINKSTATUSPATH = NETLINKSTATUSPATH;

/**
 * APP Path
 * Default APP Base path is repo/app dir，we use __dirname to locate it
 */
var APPBASEPATH;
APPBASEPATH = path.join(__dirname, "../../..");
exports.APPBASEPATH = APPBASEPATH;
var APP_DATA_PATH = [
  path.join(process.env["HOME"], '.local/share/webde'),
  __dirname + '/app/default'
];
exports.APP_DATA_PATH = APP_DATA_PATH;
exports.D_APP_ICON = __dirname + '/app/default/favicon.ico';

/**
 * Desktop configure file path before login
 */
exports.BEFORELOGIN = __dirname + '/data/default/Default.conf';

/**
 * path of language file
 */
exports.LANG = [
  path.join(process.env["HOME"], '.local/share/webde/langs'),
  __dirname + '/language/langs'
];

/**
 * Project Path
 * Default Project Base path is /repo dir，we use __dirname to locate it
 */
var PROJECTPATH;
PROJECTPATH = path.join(__dirname,"../../../..");
exports.PROJECTPATH = PROJECTPATH;

/**
 * Database Path
 *
 */
var DATABASEPATH;
exports.DATABASEPATH = DATABASEPATH;

/*
 * Debug Config
 * */
var RIODEBUG=1;
var DBDEBUG=1;

/*
 * Server network config
 * */
var SERVERPORT=8888;
exports.SERVERPORT = SERVERPORT;
var MSGPORT=8892;
exports.MSGPORT = MSGPORT;
var FILEPORT=8080;
exports.FILEPORT=FILEPORT;
var MDNSPORT=8889;
exports.MDNSPORT = MDNSPORT;
//SERVERIP has been decpreted, you should use config.getIPAddress();
var SERVERIP=getIPAddress();
exports.SERVERIP = SERVERIP;
var SERVERNAME;
exports.SERVERNAME = SERVERNAME;
var WEBSOCKETPATH="/ws";
exports.WEBSOCKETPATH = WEBSOCKETPATH;

/*
 * Secure config. The key and cert path should be set later.
 * */
var ISSECURE=false;
exports.ISSECURE = ISSECURE;
var KEYPATH=path.join(USERCONFIGPATH, "httpserver/key.pem");
exports.KEYPATH = KEYPATH;
var CERTPATH=path.join(USERCONFIGPATH, "httpserver/cert.pem");
exports.CERTPATH = CERTPATH;

/*
 * account
 * */
var ACCOUNT;
exports.ACCOUNT = ACCOUNT;
var EMAIL="cos_ibp@iscas.ac.cn";
exports.EMAIL = EMAIL;

/*
 * Network API
 *   获取本地IP地址（仅针对IPv4）
 * */
function getIPAddress(){
  var ifaces = os.networkInterfaces();
  var IPv4=null;
  var IPifname=null;

  Object.keys(ifaces).forEach(function (ifname) {
    ifaces[ifname].forEach(function (iface) {
      if (null!==IPv4){return};
      if ('IPv4' !== iface.family || iface.internal !== false) {
        return;
      }
      IPv4=iface.address;
    });
  });

  return IPv4;
}
exports.getIPAddress = getIPAddress;


/*
 * Log functions
 * */
function riolog(str){
  if(RIODEBUG==1){
    util.log(str);
  } 
}
exports.riolog = riolog;

function dblog(str){
  if(DBDEBUG==1){
    util.log(str);
  } 
}
exports.dblog = dblog;

var uniqueID;
exports.uniqueID = uniqueID;

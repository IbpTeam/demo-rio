var util = require('util');
var os = require('os');
var path = require("path");

/*
 * Config Path
 * */
var RESOURCEPATH;
exports.RESOURCEPATH = path.join(process.env["HOME"],".resources");

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
var SERVERIP;
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
var KEYPATH=path.join(process.env["HOME"], ".demo-rio/httpserver/key.pem");
exports.KEYPATH = KEYPATH;
var CERTPATH=path.join(process.env["HOME"], ".demo-rio/httpserver/cert.pem");
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
 * */
function getAddr(){
  var IPv4;
  //var os = require('os');
  var getip = require('../node_modules/getip/build/Release/hello.node');
  //console.log("getttttttttt"+getip.hello());
  //console.log(os.networkInterfaces());
  IPv4=getip.hello();
  if(IPv4==''){
    for(var i=0;i<os.networkInterfaces().lo.length;i++){
      if(os.networkInterfaces().lo[i].family=='IPv4'){
        IPv4=os.networkInterfaces().lo[i].address;
      }
    }
  }
  console.log("IPv4="+IPv4);
  return IPv4;
}
exports.getAddr = getAddr;


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

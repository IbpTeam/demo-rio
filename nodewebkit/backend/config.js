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
APPBASEPATH = path.join(__dirname,"../../..");
exports.APPBASEPATH = APPBASEPATH;

/**
 * AppList 用于存放所有已安装程序列表，目前暂时支持默认自带的程序，如数据管理器
 * 音乐播放器等
 * 每一个APP对象包括以下属性：
 *   name:程序名称
 *   win:窗口对象，如果为null则处于未打开状态
 *   path:程序的启动路径，应该是html文件，可以是相对repo/app路径
 */
var AppList=[
  {
    id:"app1",
    name:"datamgr",
    win:null,
    win2:null,
    path:"demo-rio/datamgr/file-explorer.html"
  },
  {
    id:"app_example",
    name:"example",
    win:null,
    win2:null,
    path:"demo-rio/appExample/index.html"
  },
  {
    id:"app_viewerPDF",
    name:"viewerPDF",
    win:true,
    win2:null,
    path:"demo-rio/viewerPDF/index.html"
  }
];
exports.AppList = AppList;

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

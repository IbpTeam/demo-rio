var util = require('util');
var os = require('os');

/*
 * Config Path
 * */
var USERCONFIGPATH;
exports.USERCONFIGPATH = USERCONFIGPATH;
var RESOURCEPATH;
exports.RESOURCEPATH = RESOURCEPATH;

/*
 * Debug Config
 * */
var RIODEBUG=1;
var DBDEBUG=1;

/*
 * Server network config
 * */
var SERVERPORT=8888;
var MSGPORT=8889;
exports.MSGPORT = MSGPORT;
exports.SERVERPORT = SERVERPORT;
var FILEPORT=8080;
exports.FILEPORT=FILEPORT;
var MDNSPORT=8889;
exports.MDNSPORT = MDNSPORT;
var SOCKETIOPORT=8891;
exports.SOCKETIOPORT = SOCKETIOPORT;
var SERVERIP;
exports.SERVERIP = SERVERIP;
var SERVERNAME;
exports.SERVERNAME = SERVERNAME;

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

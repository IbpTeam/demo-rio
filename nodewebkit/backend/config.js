var util = require('util');
var PROJECTHOME="/home/h/demo-rio/nodewebkit/backend";
var RESOURCEPATH='/home/v1/demo-rio/nodewebkit/resources';
var USERCONFIGPATH;
exports.USERCONFIGPATH = USERCONFIGPATH;
var os = require('os');
var RIODEBUG=1;
var DBDEBUG=1;
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
var ACCOUNT="xiquan";
exports.ACCOUNT = ACCOUNT;
var EMAIL="xiquan@iscas.ac.cn";
exports.EMAIL = EMAIL;
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

var SERVERIP;
exports.SERVERIP = SERVERIP;


var SERVERNAME;
exports.SERVERNAME = SERVERNAME;

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




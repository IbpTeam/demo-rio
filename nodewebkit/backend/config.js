var util = require('util');
var RIODEBUG=1;
var DBDEBUG=1;
var SERVERPORT=8888;
var MSGPORT=8889
exports.MSGPORT = MSGPORT;
exports.SERVERPORT = SERVERPORT;
var SERVERIP="192.168.162.122";
exports.SERVERIP = SERVERIP;


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

var RIODEBUG=1;
var DBDEBUG=1;
var SERVERPORT=8888;
exports.SERVERPORT = SERVERPORT;
var SERVERIP="192.168.162.122";
exports.SERVERIP = SERVERIP;


function riolog(str){
  if(RIODEBUG==1){
    console.log(str);
  } 
}
exports.riolog = riolog;

function dblog(str){
  if(DBDEBUG==1){
    console.log(str);
  } 
}
exports.dblog = dblog;

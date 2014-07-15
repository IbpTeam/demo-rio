var PROJECTHOME="/home/h/demo-rio/nodewebkit/backend";
var RESOURCEPATH='/home/v1/demo-rio/nodewebkit/resources';
var RIODEBUG=1;
var DBDEBUG=1;
exports.projecthome = PROJECTHOME;
exports.RESOURCEPATH = RESOURCEPATH;
var SERVERPORT=8888;
exports.SERVERPORT = SERVERPORT;
var MDNSPORT=8889;
exports.MDNSPORT = MDNSPORT;
var SOCKETIOPORT=8890;
exports.SOCKETIOPORT = SOCKETIOPORT;

var SERVERIP;
exports.SERVERIP = SERVERIP;


var SERVERNAME;
exports.SERVERNAME = SERVERNAME;

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


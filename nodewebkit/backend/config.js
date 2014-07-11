var PROJECTHOME="/home/h/demo-rio/nodewebkit/backend";
var RESOURCEPATH='/home/v1/demo-rio/nodewebkit/resources';
var RIODEBUG=1;
var DBDEBUG=1;
exports.projecthome = PROJECTHOME;
exports.RESOURCEPATH = RESOURCEPATH;
var SERVERPORT=8888;
exports.SERVERPORT = SERVERPORT;

var SERVERNAME="v1";
exports.SERVERNAME = SERVERNAME;

var SERVERIP;
exports.SERVERIP = SERVERIP;
function getAddr(){
  var os = require('os');
  var IPv4;
  for(var i=0;i<os.networkInterfaces().eth0.length;i++){
    if(os.networkInterfaces().eth0[i].family=='IPv4'){
      IPv4=os.networkInterfaces().eth0[i].address;
    }
  }
  return IPv4;
}
exports.getAddr = getAddr;


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

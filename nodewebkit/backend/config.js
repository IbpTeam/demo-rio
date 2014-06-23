var PROJECTHOME="/home/h/demo-rio/nodewebkit/backend";
var RESOURCEPATH='/home/v1/demo-rio/nodewebkit/resources';
var RIODEBUG=0;
var DBDEBUG=0;
exports.projecthome = PROJECTHOME;
exports.RESOURCEPATH = RESOURCEPATH;


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

//This file is generated manually.
//@remote openDev
function openDev = function(callback){
  console.log("openDev is not supported now.");
  setTimeout(callback(false), 0);
}
exports.openDev=openDev;

//@remote isLocal
function isLocal = function(callback){
  setTimeout(callback(false), 0);
}
exports.isLocal=isLocal;

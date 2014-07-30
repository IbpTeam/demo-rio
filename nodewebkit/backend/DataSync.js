/**
 * @Title: DataSync.js
 * @Description: Function for data sync
 * @author: yuanzhe
 * @version: 0.0.1
 **/

var msgTransfer = require.("./msgtransfer");

//Init method
function init(){
  console.log("==============================================");
}

function start(ip){
  console.log("get ip from internet discovery : " + ip);
  msgTransfer.initServer();
  msgTransfer.sendMsg(ip,"this is a test message!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  init();
}


//Export method
exports.start = start;
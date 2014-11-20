var imChat = require("../../backend/IM/IMChatNoRSA");
var util = require('util');

/*
*getLocalData
*/
function getLocalData(getLocalDataCb){
  var localJson={};
  localJson['account']=imChat.LOCALACCOUNT;
  localJson['UID']=imChat.LOCALUUID;
 
  getLocalDataCb(localJson);
}
exports.getLocalData = getLocalData;
/*
*IMChat start Server
*/
function startIMChatServer(startIMChatServerCb){ 
  imChat.initIMServerNoRSA(6986, function(msgobj){ 
    startIMChatServerCb(msgobj);/*
    try{
      var msgFile=msgobj.MsgObj.message;
      var msg=msgobj;
      msg.MsgObj.message=JSON.parse(msgFile);
      startIMChatServerCb(msg);
    }catch(e){
      startIMChatServerCb(msgobj);
    } */
  });
}
exports.startIMChatServer = startIMChatServer;
/*
*IMChat close Server
*/
function closeIMChatServer(server) {
  imChat.closeIMServerNoRSA(server);
}
exports.closeIMChatServer = closeIMChatServer;
/*
* imChat send message
*/
function sendIMMsg(sendIMMsgCb,ipset, toAccount,msg){
  imChat.sendMSGbyUIDNoRSA(ipset,toAccount, msg, 6986, sendIMMsgCb);
}
exports.sendIMMsg=sendIMMsg;
/*
function sendIMFile(sendIMFileCb,ipset, toAccount,msg){
  transferFile.transferFile(msg,function(){

  });
  imChat.sendMSGbyUIDNoRSA(ipset,toAccount, msg, 6986, sendIMFileCb);
}
exports.sendIMFile=sendIMFile;
*/
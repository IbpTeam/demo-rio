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
    startIMChatServerCb(msgobj);
  }); 
}
exports.startIMChatServer = startIMChatServer;
/*
* imChat send message
*/
function sendIMMsg(sendIMMsgCb,ipset, toAcciount,msg){
  imChat.sendMSGbyUIDNoRSA(ipset,toAcciount, msg, 6986, sendIMMsgCb);
}
exports.sendIMMsg=sendIMMsg;
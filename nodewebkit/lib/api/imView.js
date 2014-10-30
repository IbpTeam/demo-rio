var imChat = require("../../backend/IM/IMChatNoRSA");


function test(){
  console.log('-------------test imView-------------------');
}
exports.test=test;

/*
*getLocalData
*/
function getLocalData(getLocalDataCb){
  var localJson={};
  localJson['account']=imChat.LOCALACCOUNT;
  localJson['UID']=imChat.LOCALUUID;

  console.log('***********'+util.inspect(localJson));
  getLocalDataCb(localJson);
}
exports.getLocalData = getLocalData;


/*
*IMChat start Server
*/
function startIMChatServer(startIMChatServerCb){ 
  imChat.initIMServerNoRSA(6985, function(msgobj){
    console.log('&&&&&&&&&&&&&&&&&&'); 
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
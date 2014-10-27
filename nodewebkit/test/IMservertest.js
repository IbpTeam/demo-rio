var imchat = require('../backend/IM/IMChatNoRSA.js');

function recvcallback(msgobj) {
  var msg = msgobj['MsgObj'];
  var IP = msgobj['IP'];
  console.log("this is in recvcallback " + msg.message);
  var msgtime = new Date();
  msgtime.setTime(msg.time);
  console.log("Sent time: " + msgtime);
  console.log("from account: " + msg.from);
  console.log("from uuid: " + msg.uuid);
  console.log("from IP " + IP);
}
imchat.initIMServerNoRSA(7777,recvcallback);
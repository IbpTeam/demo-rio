var IM = require('../../nodewebkit/lib/api/IM.js');

IM.RegisterApp(function(msgobj) {
  var msg = msgobj['MsgObj'];
  var IP = msgobj['IP'];
  console.log("this is in recvcallback " + msg.message);
  var msgtime = new Date();
  msgtime.setTime(msg.time);
  console.log("Sent time: " + msgtime);
  console.log("from account: " + msg.from);
  console.log("from uuid: " + msg.uuid);
  console.log("from IP " + IP);
}, "app1");

IM.StartIMService(function(state) {
  console.log(state);
},"true");

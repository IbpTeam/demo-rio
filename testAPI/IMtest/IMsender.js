var IM = require('../../nodewebkit/lib/api/IM.js');

var msgobj = {
  IP: "192.168.1.100",
  UID: "2312324323dsfseferfgdghf",
  Account: "USER2",
  Msg: "Hi  this is in IMSender test",
  App: "app1"
};

IM.SendAppMsg(function(msg) {
  console.log("Send Msg Successful in SendAppMsg function, msg :::", msg);
}, msgobj);
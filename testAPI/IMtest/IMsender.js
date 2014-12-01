var IM = require('../../nodewebkit/lib/api/IM.js');

var msgobj = {
  IP: "192.168.1.100",
  UID: "0ace23c24390ca960a7edfe26b7aaa47",
  Account: "rtty123",
  Msg: "Hi  this is in IMSender test",
  App: "app1",
  rsaflag:  "true"
};

IM.SendAppMsg(function(msg) {
  console.log("Send Msg Successful in SendAppMsg function, msg :::", msg);
}, msgobj);
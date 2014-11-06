var imchat = require('../backend/IM/IMChatNoRSA.js');

function callback(msg){
  console.log("CALLLLLback, "+msg);
}

var ipset = {};
ipset["IP"] = "192.168.1.100";
ipset["UID"] = "34234324r34rerfe45r4a";

imchat.sendMSGbyUIDNoRSA(ipset,"rtty123","Hi this is in sendMSGbyUID function",7777,callback);

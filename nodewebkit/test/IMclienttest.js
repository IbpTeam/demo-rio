var imchat = require('../backend/IM/IMChat.js');

function callback(msg){
  console.log("CALLLLLback, "+msg);
}

var ipset = {};
ipset["IP"] = "127.0.0.1";
ipset["UID"] = "34234324r34rerfe45r4a";

imchat.sendMSGbyUID(ipset,"rtty123","Hi this is in sendMSGbyUID function",8892,callback);

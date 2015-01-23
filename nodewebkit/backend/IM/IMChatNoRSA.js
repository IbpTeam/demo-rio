var net = require('net');
var path = require('path');
var fs = require('fs');
var hashtable = require('hashtable');
var crypto = require('crypto');
var config = require('../config.js');
var buffer = require('buffer');
var HOME_DIR = "/home";
var CURUSER = process.env['USER'];
var uniqueID = require(config.USERCONFIGPATH + '/uniqueID.js')

var LOCALACCOUNT = uniqueID.Account;
var LOCALUUID = uniqueID.uniqueID;
exports.LOCALACCOUNT=LOCALACCOUNT;
exports.LOCALUUID=LOCALUUID;

/*
 * @method MD5
 *  计算某个字符串的MD5值
 * @param str
 *  待计算的字符串
 * @param encoding
 *  编码方式，默认为hex，该参数可省略
 * @return md5
 *  返回md5校验值
 */
function MD5(str, encoding) {
  var binaryStr = new buffer.Buffer(str).toString('binary', 0);
  return crypto.createHash('md5').update(binaryStr).digest(encoding || 'hex');
}

/*
* @method initIMServer
* @param port
* 消息服务器指定要绑定的端口
*  初始化本地消息接收Server，该Server负责所有的通信接收，存储，回复ACK等操作
* @param ReceivedMsgCallback
*   当成功接收到客户端发来的消息时，调用该回调函数
*    @msg
*     string 回调函数参数，表示成功接收到的消息
* @return null
*  没有返回值
*/
function initIMServerNoRSA(port,ReceivedMsgCallback) {

  var server = net.createServer(function(c) {
    //console.log('Remote ' + c.remoteAddress + ' : ' + c.remotePort + ' connected!');
    var remoteAD = c.remoteAddress;
    var remotePT = c.remotePort;

    c.on('data', function(msgStri) {
      var msgStr, decrypteds, msgObj;
      try {
        msgStr = JSON.parse(msgStri);
        decrypteds = msgStr.content;
        msgObj = JSON.parse(decrypteds);
      } catch (err) {
        console.log(err);
        return;
      }
      function replyFunc(msg){
        c.write(msg);
      }
      switch (msgStr.type) {
        case 'SentEnFirst':
          {
            var CalBakMsg = {};
            CalBakMsg['MsgObj'] = msgObj;
            CalBakMsg['IP'] = remoteAD; 
            setTimeout(ReceivedMsgCallback(msgObj.type,CalBakMsg), 0);
            var tp = encapsuMSG(MD5(decrypteds), "Reply", LOCALACCOUNT, LOCALUUID, msgObj.from,'');
            setTimeout(replyFunc(tp), 50);
          }
          break;
        case 'Reply':
          {
            //sender received message, sesson end
          }
          break;
        default:
          {
            console.log("this is in default switch on data");
            console.log(data);
          }
      }
    });

    c.on('close', function() {
      //console.log('Remote ' + remoteAD + ' : ' + remotePT + ' disconnected!');
    });

    c.on('error', function() {
      console.log('Unexpected Error!');
    });
  });

  server.on('error', function(err) {
    console.log("Error: " + err.code + " on " + err.syscall);
  });

  server.listen(port, function() {
    console.log('IMServer Binded! ' + port);
  });
}

/*
 * @method sendMSG
 *  根据IP和端口号来发送封装好的数据，若发送成功，则把成功发送的消息存至本地数据库中。若发送失败，则重新发送（循环5次）
 * @param IP
 *  目的方的IP地址
 * @param PORT
 *  接收方帐号
 * @param MSG
 *  用encapsuMSG包装过的待发送消息
 * @param PORT
 *  消息接收方的通信端口
 *@param KEYPAIR
 *发送方的pubkey生成的keypair
 *@param SentCallBack
 *发送方发送数据成功后的callback函数
 *     @msg
 *     string 回调函数参数，表示发送成功的消息
 * @return null
 *  没有返回值
 */
function sendIMMsg(IP, PORT, SENDMSG, SentCallBack) {
  var count = 0;
  var id = 0;
  var tmpenmsg =  SENDMSG;
  try{
    var MSG = JSON.parse(SENDMSG);
    var dec = MSG.content;
    var pat = JSON.parse(dec);
  }catch(e){
    console.log('JSON.parse error:'+e);
  }

  if (!net.isIP(IP)) {
    console.log('Input IP Format Error!',IP);
    return;
  };
  var client = new net.Socket();
  client.setTimeout(6000, function() {
    console.log("connect time out");
    client.end();
  });

  function innerrply() {
    id = setInterval(function(C, tmpenmsg) {
      if (count < 5) {
        //console.log("this is in resending " + tmpenmsg);
        if (typeof tmpenmsg === 'object') {
          tmpenmsg = JSON.stringify(tmpenmsg);
        };
        client.write(tmpenmsg);
        count++;
      } else {
        clearInterval(id);
        console.log("Send message error: no reply ");
      };

    }, 1000, client, MSG);
  }
  switch (MSG.type) {
    case 'SentEnFirst':
      {
        client.connect(PORT, IP, function() {
          client.write(tmpenmsg, function() {});
        });
      }
      break;
    default:
      {
        client.connect(PORT, IP, function() {
          client.write(tmpenmsg, function() {});
        });
      }
  }

  client.on('connect', innerrply);

  client.on('data', function(REPLY) {

    var RPLY = JSON.parse(REPLY);
    switch (RPLY.type) {
      case 'Reply':
        {
          var decrply = RPLY.content;
          var msg = JSON.parse(decrply);
          switch (msg.type) {
            case 'Reply':
              {
                if (msg.message == MD5(dec)) {
                  var msgtp = pat;
                  setTimeout(SentCallBack(msgtp.message), 0);
                  clearInterval(id);
                  client.end();
                };
              }
              break;
          }
        }
        break;
    }


  });
  //client.end();

  client.on('error', function(err) {
    clearInterval(id);
    client.end();
  });
}


function senderFunc(ACCOUNT, IPSET, PORT, MSG, TOAPP,SENTCALLBACK) {
  var tmpmsg = encapsuMSG(MSG, "SentEnFirst", LOCALACCOUNT, LOCALUUID, ACCOUNT,TOAPP);
  sendIMMsg(IPSET.IP, PORT, tmpmsg, SENTCALLBACK);
}

function sendMSGbyUIDNoRSA(IPSET, ACCOUNT, MSG,TOAPP, SENTCALLBACK) {
  if (typeof IPSET.UID == "undefined") {
    //console.log("receiver uuid null");
    /*
    here are some server msg send functions!
    */
  };
  senderFunc(ACCOUNT, IPSET, config.IMPORT, MSG, TOAPP,SENTCALLBACK);
}



/*
 * @method encapsuMSG
 *  将待发送的消息封装成JSON格式，并将JSON数据序列化
 * @param MSG
 *  消息内容，如可以是聊天内容，上下线通知等
 * @param TYPE
 *  消息类型，可以是Chat，Reply等
 * @param FROM
 *  消息的发送方标识，可以是Account帐号
 * @param FROMUUID
 *  消息的发送方的UUID
 * @param TO
 *  消息的接收方标识，可以是Account帐号
 * @return rply
 *  封装好，并且已经序列化的消息字符串
 */
function encapsuMSG(MSG, TYPE, FROM, FROMUUID, TO,TOAPP) {
  var tmp = {};
  var restmp = {};
  var now = new Date();
  restmp['type'] = TYPE;
  restmp['content'] = '';

  switch (TYPE) {
    case 'Chat':
      {
        tmp["from"] = FROM;
        tmp["uuid"] = FROMUUID;
        tmp["to"] = TO;
        tmp["message"] = MSG;
        tmp['type'] = TOAPP;
        tmp['time'] = now.getTime();
        var content = JSON.stringify(tmp);
        restmp['content'] = content;
      }
      break;
    case 'Reply':
      {
        tmp["from"] = FROM;
        tmp["to"] = TO;
        tmp["message"] = MSG;
        tmp["type"] = TYPE;
        tmp['time'] = now.getTime();
        var content = JSON.stringify(tmp);
        restmp['content'] = content;
      }
      break;
    case 'RegetPubkey':
      {
        //sender got wrong pubkey, notify sender to update pubkey.
      }
      break;
    case 'SentEnFirst':
      {
        tmp["from"] = FROM;
        tmp["uuid"] = FROMUUID;
        tmp["to"] = TO;
        tmp["message"] = MSG;
        tmp['type'] = TOAPP;
        tmp['time'] = now.getTime();
        var content = JSON.stringify(tmp);
        restmp['content'] = content;
      }
      break;
    case 'SenderChangePubkey':
      {
        tmp["from"] = FROM;
        tmp["uuid"] = FROMUUID;
        var content = JSON.stringify(tmp);
        restmp['content'] = content;
      }
      break;
    default:
      {
        console.log("encapsuMSG : Please take a proper Type.");
      }
  }

  var send = JSON.stringify(restmp);
  return send;
}

exports.initIMServerNoRSA = initIMServerNoRSA;
exports.sendMSGbyUIDNoRSA = sendMSGbyUIDNoRSA;

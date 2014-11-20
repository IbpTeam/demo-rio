var FuncObj = require("../../backend/IM/FuncObj.js");
var IMNoRsa = require("../../backend/IM/IMChatNoRSA.js");
var net = require('net');

var Port = 7777;


/**
 * @method RegisterApp
 *  在本机消息接收端口上添加新应用监听回调函数，本方法意在将多个
 * 应用的消息收发统一化，避免开多个通信端口。当新消息到达时，根
 * 据AppName来区分消息是分发给哪个应用的
 *
 * @param AppCallBack
 *   回调函数，为新应用添加的接收消息回调函数
 *  @param1
 *   JSON, 表示注册的状态，其中
 *   IP字段表示发送方的IP地址
 *  MsgObj字段表示收到消息的详细信息，其中
 *  MsgObj.message为收到的具体信息
 *  MsgObj.time表示发送时间，具体使用方法见测试
 *  MsgObj.from表示发送方的账户信息
 *  MsgObj.uuid表示发送方的设备UUID
 *  
 * @param AppName
 *  string，新注册的应用名称，该名称用来区分消息的归属应用
 *
 */
function RegisterApp(AppCallBack, AppName) {
  FuncObj.registerFunc(AppCallBack, AppName);
}
exports.RegisterApp = RegisterApp;

/**
 * @method StartIMService
 *  该函数用来启动本机接收消息监听服务，该函数会在本机开启
 * 一个消息接收端口，用于通信，收到的消息交付RegisterApp函数
 * 注册的回调函数处理
 *
 * @param StartCb
 *   回调函数，用来表示开启监听服务的状态
 *  @param1
 *   bool, 表示服务开启是否成功，若成功则为true，否则为false
 * 
 * @param Flag
 *   string 表示是否开启加密状态服务
 *   若加密则为true，否则为false
 *
 */
function StartIMService(StartCb,Flag) {
  try {
    IMNoRsa.initIMServerNoRSA(Port, function(AppType, msgobj) {
      console.log("AppType :", AppType);
      FuncObj.takeMsg(AppType, msgobj);
    });
    StartCb(true);
  } catch (err) {
    console.log(err);
    StartCb(false);
  }
}
exports.StartIMService = StartIMService;

/**
 * @method SendAppMsg
 *  该函数用来给目的机器的指定应用程序发送消息
 *
 * @param SentCallBack
 *   回调函数，当消息发送成功时，调用该函数，并传参发送的消息
 *  @param1
 *   string, 表示发送了的消息，具体为MsgObj.Msg，关于MsgObj下文有介绍
 * @param MsgObj
 *   JSON,待发送的消息结构体，其中：
 *  MsgObj.IP 表示接收方的IP地址
 *  MsgObj.UID 表示接收方的UUID
 *  MsgObj.Account表示接收方的帐号
 *  MsgObj.Msg表示要发送给指定应用的消息
 *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和RegisterApp中的AppName对应
 *  MsgOb举例如下：
 *  var msgobj = {
  IP: "192.168.1.100",
  UID: "2312324323dsfseferfgdghf",
  Account: "USER2",
  Msg: "Hi  this is in IMSender test",
  App: "app1"
};
 *
 */
function SendAppMsg(SentCallBack, MsgObj) {
  var ipset = {};
  if (!net.isIP(MsgObj.IP)) {
    console.log('Input IP Format Error!:::', MsgObj.IP);
    return;
  };
  ipset["IP"] = MsgObj.IP;
  ipset["UID"] = MsgObj.UID;
  IMNoRsa.sendMSGbyUIDNoRSA(ipset, MsgObj.Account, MsgObj.Msg, Port, MsgObj.App, SentCallBack);
}
exports.SendAppMsg = SendAppMsg;
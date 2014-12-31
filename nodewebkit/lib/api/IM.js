var FuncObj = require("../../backend/IM/FuncObj.js");
var IMNoRsa = require("../../backend/IM/IMChatNoRSA.js");
var IMRsa = require("../../backend/IM/IMChat.js");
var config = require("../../backend/config.js");
var router = require('../../backend/router.js');
var net = require('net');
var fileTransfer = require("../../backend/IM/file-trans/fileTransfer");
var fileTransferServer = require("../../backend/IM/file-trans/fileTransferServer");
var fileTransferClient= require("../../backend/IM/file-trans/fileTransferClient");
var crypto = require('crypto');

var Port = 7777;
var fileServer;
var pathMap;

/**
 * @method getLocalData
 *  获得设备信息，包括设备用户名和UID
 *
 * @param getLocalDataCb
 *   回调函数，返回设备信息
 *  @cbparam1
 *   JSON，表示设备信息，其中
 *   account字段表示设备的用户名
 *   UID字段表示设备的UUID
 *
 */
function getLocalData(getLocalDataCb){
  var localJson={};
  localJson['account']=config.ACCOUNT;
  localJson['UID']=config.uniqueID;
  getLocalDataCb(localJson);
}
exports.getLocalData = getLocalData;

/**
 * @method registerApp
 *  在本机消息接收端口上添加新应用监听回调函数，本方法意在将多个
 * 应用的消息收发统一化，避免开多个通信端口。当新消息到达时，根
 * 据AppName来区分消息是分发给哪个应用的
 *
 * @param AppCallBack
 *   回调函数，为新应用添加的接收消息回调函数
 *  @cbparam1
 *   JSON, 表示注册的状态，其中
 *   IP字段表示发送方的IP地址
 *   MsgObj字段表示收到消息的详细信息，其中
 *   MsgObj.message为收到的具体信息
 *   MsgObj.time表示发送时间，具体使用方法见测试
 *   MsgObj.from表示发送方的账户信息
 *   MsgObj.uuid表示发送方的设备UUID
 *  
 * @param AppName
 *  string，新注册的应用名称，该名称用来区分消息的归属应用
 *
 */
function registerApp(AppCallBack, AppName) {
  FuncObj.registerFunc(AppCallBack, AppName);
}
exports.registerApp = registerApp;

/**
 * @method registerIMApp
 *  在本机消息接收端口上添加即时通信监听回调函数
 *
 * @param AppCallBack
 *   回调函数，为即时通信添加的接收消息回调函数
 *  @cbparam1
 *   JSON，表示注册的App收到的消息内容，其中
 *    IP字段表示发送方的IP地址
 *    MsgObj字段表示收到消息的详细信息，其中
 *    MsgObj.message为收到的具体信息
 *    MsgObj.time表示发送时间，具体使用方法见测试
 *    MsgObj.from表示发送方的账户信息
 *    MsgObj.uuid表示发送方的设备UUID
 *  
 * @param ws
 *  Object，设备显示终端的webSocket连接
 *
 */
function registerIMApp(AppCallBack,ws) {
  var msg = {
    'Action': 'on',
    'Event': 'imChat'
  };
  ws.send(JSON.stringify(msg));
  FuncObj.registerFunc(function(recMsg) {
    router.wsNotify({
      'Action': 'notify',
      'Event': 'imChat',
      'Data': recMsg
    });
  }, 'imChat');
}
exports.registerIMApp = registerIMApp;

/**
 * @method startIMService
 *  该函数用来启动本机接收消息监听服务，该函数会在本机开启
 *  一个消息接收端口，用于通信，收到的消息交付registerApp函数
 *  注册的回调函数处理
 *
 * @param StartCb
 *   回调函数，用来表示开启监听服务的状态
 *  @cbparam1
 *   bool, 表示服务开启是否成功，若成功则为true，否则为false
 * 
 * @param Flag
 *   string 表示是否开启加密状态服务
 *   若加密则为true，否则为false
 *
 */
function startIMService(StartCb,Flag) {
  try {
    if (Flag === "true") {
      IMRsa.initIMServer(Port, function(AppType,msgobj){
        FuncObj.takeMsg(AppType,msgobj);
      });
    }else{
      IMNoRsa.initIMServerNoRSA(Port, function(AppType, msgobj) {
      FuncObj.takeMsg(AppType, msgobj);
    });
    } 
    StartCb(true);
  } catch (err) {
    console.log(err);
    StartCb(false);
  }
}
exports.startIMService = startIMService;

/**
 * @method sendAppMsg
 *  该函数用来给目的机器的指定应用程序发送消息
 *
 * @param SentCallBack
 *   回调函数，当消息发送成功时，调用该函数，并传参发送的消息
 *  @cbparam1
 *   string， 表示发送了的消息，具体为MsgObj.Msg，关于MsgObj下文有介绍
 *  
 * @param MsgObj
 *   JSON，待发送的消息结构体，其中：
 *  MsgObj.IP 表示接收方的IP地址
 *  MsgObj.UID 表示接收方的UUID
 *  MsgObj.Account表示接收方的帐号
 *  MsgObj.Msg表示要发送给指定应用的消息,为JSON转化的string类型。其中group表示对应组别，此处为“”，表示无组别;msg为发送消息内容
 *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和registerApp中的AppName对应
 *  MsgObj.rsaflag表示发送方是否启用加密发送，若为“true” 注意，是string类型，不是bool类型。则启用加密发送。
 *  MsgOb举例如下：
 *  var msgobj = {
      IP: "192.168.1.100",
      UID: "fyfrio1997rio",
      Account: "fyf",
      Msg: "{'group':'','msg':'Hi  this is in IMSender test'}",
      App: "app1"
      rsaflag: "true"
    };
 *
 */
function sendAppMsg(SentCallBack, MsgObj) {
  var ipset = {};
  if (!net.isIP(MsgObj.IP)) {
    console.log('Input IP Format Error!:::', MsgObj.IP);
    return;
  };
  ipset["IP"] = MsgObj.IP;
  ipset["UID"] = MsgObj.UID;
  if (MsgObj.rsaflag === "true") {
    IMRsa.sendMSGbyUID(ipset,MsgObj.Account,MsgObj.Msg,Port,MsgObj.App,SentCallBack);
  }else{
    IMNoRsa.sendMSGbyUIDNoRSA(ipset, MsgObj.Account, MsgObj.Msg, Port, MsgObj.App, SentCallBack);
  }
}
exports.sendAppMsg = sendAppMsg;

/**
 * @method sendAppMsgByDevice
 *  该函数用来给目的机器的指定应用程序发送消息
 *
 * @param SentCallBack
 *   回调函数，当消息发送成功时，调用该函数，并传参接收端收到后封装的消息
 *  @cbparam1
 *   JSON， 表示发送的消息经接收端封装后的消息内容，其中
 *    IP字段表示发送方的IP地址
 *    destInfo表示发送方的信息内容，其中
 *    destInfo.Account表示接收端的账户信息
 *    destInfo.UID表示接收端的设备UUID
 *    destInfo.IP表示接收端的IP地址
 *    MsgObj字段表示接收端收到消息的详细信息，其中
 *    MsgObj.message为接收端应该接收的具体信息
 *    MsgObj.time表示发送时间，具体使用方法见测试
 *    MsgObj.from表示发送方的账户信息
 *    MsgObj.uuid表示发送方的设备UUID
 *  
 * @param MsgObj
 *  JSON，待发送的消息结构体，其中：
 *  MsgObj.IP 表示接收方的IP地址
 *  MsgObj.UID 表示接收方的UUID
 *  MsgObj.Account表示接收方的帐号
 *  MsgObj.Msg表示要发送给指定应用的消息,为JSON转化的string类型。其中group表示对应组别，此处为“”，表示无组别;msg为发送消息内容
 *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和registerIMApp中的AppName对应，此处为imChat
 *  MsgObj.rsaflag表示发送方是否启用加密发送，若为“true” 注意，是string类型，不是bool类型。则启用加密发送。
 *  MsgOb举例如下：
 *  var msgobj = {
      IP: "192.168.1.100",
      UID: "fyfrio1997rio",
      Account: "fyf",
      Msg: "{'group':'','msg':'Hi  this is in IMSender test'}",
      App: "app1"
      rsaflag: "true"
    };
 *  
 * @param wsID
 * string，发送端的webSocket连接的sessionID
 *  
 * @param flag
 * boolean，是否需要发送端发送给其显示终端，true表示需要发送，false表示不需要发送
 *
 */
function sendAppMsgByDevice(SentCallBack, MsgObj,wsID,flag) {
  var ipset = {};
  if (!net.isIP(MsgObj.IP)) {
    console.log('Input IP Format Error!:::', MsgObj.IP);
    return;
  };
  ipset["IP"] = MsgObj.IP;
  ipset["UID"] = MsgObj.UID;
  if (MsgObj.rsaflag === "true") {
    IMRsa.sendMSGbyUID(ipset, MsgObj.Account, MsgObj.Msg, Port, MsgObj.App, function(rstMsg){
      SentCallBack(rstMsg);
      if(flag){
        rstMsg['destInfo']={'Account':rstMsg.MsgObj.from,'UID':rstMsg.MsgObj.uuid,'IP':rstMsg.IP};
        router.wsNotify({
          'Action': 'notify',
          'Event': 'imChat',
          'Data': rstMsg,
          'SessionID':wsID
        });
      }
    });
  } else {
    IMNoRsa.sendMSGbyUIDNoRSA(ipset, MsgObj.Account, MsgObj.Msg, Port, MsgObj.App, function(rstMsg){
      SentCallBack(rstMsg);
      if(flag){
        rstMsg['destInfo']={'Account':rstMsg.MsgObj.from,'UID':rstMsg.MsgObj.uuid,'IP':rstMsg.IP};
        router.wsNotify({
          'Action': 'notify',
          'Event': 'imChat',
          'Data': rstMsg,
          'SessionID':wsID
        });
      }
    });
  }
}
exports.sendAppMsgByDevice = sendAppMsgByDevice;

/**
 * @method sendAppMsgByAccount
 *  该函数用来给目的帐号（一个帐号下的设备组）的指定应用程序发送消息
 *
 * @param SentCallBack
 *   回调函数，当消息发送成功时，调用该函数，并传参接收端收到后封装的消息
 *  @cbparam1
 *   JSON， 表示发送的消息经接收端封装后的消息内容，其中
 *    IP字段表示发送方的IP地址
 *    destInfo表示发送方的信息内容，其中
 *    destInfo.Account表示接收端的账户信息
 *    MsgObj字段表示接收端收到消息的详细信息，其中
 *    MsgObj.message为接收端应该接收的具体信息
 *    MsgObj.time表示发送时间，具体使用方法见测试
 *    MsgObj.from表示发送方的账户信息
 *    MsgObj.uuid表示发送方的设备UUID
 *  
 * @param MsgObj
 *   JSON,待发送的消息结构体，其中：
 *  MsgObj.toAccList 表示接收方的IP以及UID集合
 *  MsgObj.Account表示接收方的帐号
 *  MsgObj.localUID表示正在登录帐号的对应设备的UID
 *  MsgObj.Msg表示要发送给指定应用的消息,为JSON转化的string类型。其中group表示对应组别，此处为“fyf”，表示组别为fyf;msg为发送消息内容
 *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和registerIMApp中的AppName对应，此处为imChat
 *  MsgObj.rsaflag表示发送方是否启用加密发送，若为“true” 注意，是string类型，不是bool类型。则启用加密发送。
 *  MsgOb举例如下：
 *  var msgobj = {
      toAccList: {
        "fyfrio1997rio":{
          "toIP":'192.168.121.12',
          "toUID":'fyfrio1997rio',
          "toAccount":"fyf"
        },
        "fyfrio1998rio":{
            "toIP":'192.168.121.13',
            "toUID":'fyfrio1998rio',
            "toAccount":"fyf"
        }
      },
      Account: "fyf",
      localUID: "fyfrio1997rio",
      Msg: "{'group':'fyf','msg':'Hi  this is in IMSender test'}",
      App: "app1"
      rsaflag: "true"
    };
 *  
 * @param wsID
 * string，发送端的webSocket连接的sessionID
 *  
 * @param flag
 * boolean，是否需要发送端发送给其显示终端，true表示需要发送，false表示不需要发送
 *
 */
function sendAppMsgByAccount(SentCallBack, MsgObj,wsID,flag) {
  var accSetItem = {};
  var ipset = {};
  var countFlag = 0;
  var msgRst={};
  var len = Object.keys(MsgObj.toAccList).length;
  for (var accSetItemKey in MsgObj.toAccList) {
    accSetItem = MsgObj.toAccList[accSetItemKey];
    if (MsgObj.localUID === accSetItemKey) {
      len -= 1;
      if (countFlag === len) {
        SentCallBack(msgRst);
        if(flag){
          msgRst['destInfo']={'Account':msgRst.MsgObj.from,'UID':msgRst.MsgObj.uuid,'IP':msgRst.IP};
          router.wsNotify({
            'Action': 'notify',
            'Event': 'imChat',
            'Data': msgRst,
            'SessionID':wsID
          });
        }
      }
      continue;
    } else {
      if (!net.isIP(accSetItem.toIP)) {
        console.log('Input IP Format Error!:::', accSetItem.toIP);
      } else {
        ipset["IP"] = accSetItem.toIP;
        ipset["UID"] = accSetItem.toUID;
        if (MsgObj.rsaflag === "true") {
          IMRsa.sendMSGbyUID(ipset, accSetItem.toAccount, MsgObj.Msg, Port, MsgObj.App, function(msg) {
            if (msgRst === undefined)
              msgRst = msg;
            if ((++countFlag) === len) {
              SentCallBack(msg);
              if(flag){
                msg['destInfo']={'Account':msg.MsgObj.from,'UID':msg.MsgObj.uuid,'IP':msg.IP};
                router.wsNotify({
                  'Action': 'notify',
                  'Event': 'imChat',
                  'Data': msg,
                  'SessionID':wsID
                });
              }    
            }
          });
        } else {
          IMNoRsa.sendMSGbyUIDNoRSA(ipset, accSetItem.toAccount, MsgObj.Msg, Port, MsgObj.App, function(msg) {
            if (msgRst === undefined)
              msgRst = msg;
            if ((++countFlag) === len) {
              SentCallBack(msg);
              if(flag){
                msg['destInfo']={'Account':msg.MsgObj.from,'UID':msg.MsgObj.uuid,'IP':msg.IP};
                router.wsNotify({
                  'Action': 'notify',
                  'Event': 'imChat',
                  'Data': msg,
                  'SessionID':wsID
                });
              }
            }
          });
        }
      }
    }
  }
}
exports.sendAppMsgByAccount = sendAppMsgByAccount;

/**
 * @method sendIMMsg
 *  该函数用来给目的帐号（与一组设备）或者设备的指定应用程序发送消息
 *
 * @param SentCallBack
 *   回调函数，作为调用具体发送函数sendAppMsgByDevice或者sendAppMsgByAccount的参数\
 * 
 * @param MsgObj
 *   JSON,待发送的消息结构体，其中：
 *  MsgObj.IP 表示接收方的IP地址
 *  MsgObj.UID 表示接收方的UUID
 *  MsgObj.toAccList 表示接收方的IP以及UID集合
 *  MsgObj.Account表示接收方的帐号
 *  MsgObj.localUID表示正在登录帐号的对应设备的UID
 *  MsgObj.group表示消息发送以及接收端群组名称
 *  MsgObj.Msg表示要发送给指定应用的消息,为JSON转化的string类型。其中group表示对应组别，此处为“fyf”，表示组别为fyf;msg为发送消息内容
 *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和registerIMApp中的AppName对应，此处为imChat
 *  MsgObj.rsaflag表示发送方是否启用加密发送，若为“true” 注意，是string类型，不是bool类型。则启用加密发送。
 *  MsgOb举例如下：
 *  var msgobj = {
      toAccList: {
        "fyfrio1997rio":{
          "toIP":'192.168.121.12',
          "toUID":'fyfrio1997rio',
          "toAccount":"fyf"
        },
        "fyfrio1998rio":{
            "toIP":'192.168.121.13',
            "toUID":'fyfrio1998rio',
            "toAccount":"fyf"
        }
      },
      Account: "fyf",
      localUID: "fyfrio1997rio",
      group: "fyf",
      Msg: "{'group':'fyf','msg':'Hi  this is in IMSender test'}",
      App: "app1"
      rsaflag: "true"
    };
 * 
 * @param wsID
 * string，发送端的webSocket连接的sessionID
 * 
 * @param flag
 * boolean，是否需要发送端发送给其显示终端，true表示需要发送，false表示不需要发送
 *
 */
function sendIMMsg(SentCallBack, MsgObj,wsID,flag){
  if(MsgObj.group===''){
    sendAppMsgByDevice(SentCallBack, MsgObj,wsID,flag);
  }else{
    sendAppMsgByAccount(SentCallBack, MsgObj,wsID,flag);
  }
}
exports.sendIMMsg = sendIMMsg;

/**
 * @method sendFileTransferRequest
 *  发送端发送传输文件请求
 *
 * @param sendFileTransferRequestCb
 *   回调函数
 *   @cbparam1
 *      boolean，返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *      JSON，返回待传输的文件信息MsgObj或者出错信息
 * 
 * @param MsgObj
 *   启动程序参数，json格式封装，其中：
 *  MsgObj.IP 表示接收方的IP地址
 *  MsgObj.UID 表示接收方的UUID
 *  MsgObj.Account表示接收方的帐号
 *  MsgObj.Msg表示代传输文件的路径
 *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和registerIMApp中的AppName对应，此处为imChat
 *  MsgOb举例如下：
 *  var msgobj = {
      IP: "192.168.1.100",
      UID: "2312324323dsfseferfgdghf",
      Account: "USER2",
      Msg: "/media/fyf/BACKUP/test.txt",
      App: "app1"
    };
 */
function sendFileTransferRequest(sendFileTransferRequestCb, MsgObj) {
  fileTransfer.fileTransferInit(MsgObj.Msg,function(err,msg){
    if(err){
      sendFileTransferRequestCb(err,msg);
    }else{
      var id=MsgObj.group===''?MsgObj.Account+MsgObj.UID:MsgObj.group+MsgObj.localUID;
      msg['key']=MD5(id + new Date().getTime());
      MsgObj.Msg=msg;
      sendFileTransferRequestCb(err,MsgObj);
    }
  });
 }
exports.sendFileTransferRequest = sendFileTransferRequest;

/**
 * @method sendFileTransferStart
 *  收到接收端同意接收请求后，发送端发送传输文件请求
 *
 * @param sendFileTransferStartCb
 *   回调函数
 *   @cbparam1
 *      boolean， 返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *      JSON， 返回待传输的文件信息MsgObj
 * 
 * @param MsgObj 
 *   启动程序参数，json格式封装，待发送的消息结构体，其中：
 *  MsgOb举例如下：
 *  var msgobj = {
       type: "file",
       option: 0x0000,
       state: "1",//"0"表示拒绝接收文件
       fileName: "test.txt",
       key:"57374caa837997035b5fbc1d7732a66b",
       fileSize: "1024",
       msg: "I want to get the file"
     };
 * 
 * @param path  
 *   启动程序参数，待传输文件的路径，例如'/media/fyf/BACKUP/test.txt'
 * 
 */
function sendFileTransferStart(sendFileTransferStartCb, msgObj,path) {
  fileTransferServer.transferFile(fileServer, function(err, msg, server) { //发送端初始化传输信息
    if (err) { //发送端初始化传输信息失败-----有点问题请稍候重发----界面显示  
      fileTransfer.fileTransferStart(true, '', '', msgObj, function(err, rstObj) {
        serverAndMapHandler();
        sendFileTransferStartCb(err,rstObj);
      });
    } else {
      fileServer = server;
      fileTransferServer.addPath(msgObj.key, path, function(pathMapTmp) { //发送端初始化传输信息
        pathMap = pathMapTmp;
        //发送端初始化传输信息成功     并发送 “接收端可以进行接受” 的信息
        fileTransfer.fileTransferStart(false, fileServer.address().port, msgObj, function(err, rstObj) {
          if (err || rstObj.state === '0') { //接收端 初始化接收信息失败 或 接收端回复信息出错 ---------界面显示
            serverAndMapHandler(rstObj.key);
            sendFileTransferStartCb(true,rstObj);
          } else { //显示正在传输文件---------界面显示
            sendFileTransferStartCb(err,rstObj);
          }
        });
      });
    }
  });
}
exports.sendFileTransferStart = sendFileTransferStart;

/**
 * @method transferFileProcess
 *  接收端收到发送端可以进行文件传输消息后，开始文件传输
 *
 * @param transferFileCb
 *   回调函数
 *   @cbparam1
 *      boolean， 返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *      JSON， 返回待传输的文件信息MsgObj
 * 
 * @param MsgObj 
 *   启动程序参数，JSON，待发送的消息结构体，其中：
 *  MsgOb举例如下：
 *  var msgobj = {
       type: "file",
       option: 0x0001,
       fileName: "test.txt",
       key:"57374caa837997035b5fbc1d7732a66b",
       fileSize: "1024",
       msg: "I want to get the file"
     };
 * 
 * @param sendMsg 
 * JSON，接收端的信息结构体，其中：
 *  sendMsg.IP 表示接收方的IP地址
 *  sendMsg.UID 表示接收方的UUID
 *  sendMsg.Account表示接收方的帐号
 *  sendMsg.group表示消息发送以及接收端群组名称
 *  MsgOb举例如下：
 *  var msgobj = {
      IP: "192.168.1.100",
      UID: "fyfrio1997rio",
      Account: "fyf",
      group:'fyf'
    };
 * 
 * @param isLocal 
 * boolean，是否为设备本地操作，true表示为设备本地，false表示为浏览器操作
 * 
 */
function transferFileProcess(transferFileCb, msgObj, sendMsg,isLocal) {
  fileTransferClient.transferFileProcess(msgObj, function(err, rst) { //传输文件    
    if (err) { //传输文件失败------------界面显示      
      msgObj['state'] = 0;
      msgObj['option'] = 0x0002;
      msgObj['ratio'] = 0;
      msgObj['msg'] = 'transfering error:' + rst;
    } else {
      msgObj = rst;
    }
    console.log('transferFileProcess============' + JSON.stringify(sendMsg));
    transferFileCb(err, msgObj);
    if (msgObj.initFile === undefined && !isLocal) {
      console.log('isLocal============' + msgObj.initFile+'   '+isLocal);
      var sendM = {};
      var CalBakMsg = {};
      sendM['from'] = config.ACCOUNT;
      sendM['uuid'] = config.uniqueID;
      sendM['to'] = sendMsg.Account;
      sendM['message'] = JSON.stringify({
        'group': sendMsg.group,
        'msg': msgObj
      });
      CalBakMsg['MsgObj'] = sendM;
      CalBakMsg['IP'] = sendMsg.IP;
      CalBakMsg['destInfo'] = {
        'Account': sendMsg.Account,
        'UID': sendMsg.UID,
        'IP': sendMsg.IP
      };
      console.log(JSON.stringify(CalBakMsg));
      router.wsNotify({
        'Action': 'notify',
        'Event': 'imChat',
        'Data': CalBakMsg
      });
    }
  });
}
exports.transferFileProcess = transferFileProcess;
/**
 * @method transferCancelSender
 *  发送端中止文件传输
 * 
 * @param transferCancelSenderCb
 *   回调函数
 *   @cbparam1
 *      JSON, 返回中止传输的文件信息MsgObj
 * 
 * @param MsgObj 
 *   启动程序参数，JSON，待发送的消息结构体，其中：
 *  MsgOb举例如下：
 *  var msgobj = {
       type: "file",
       option: 0x0000,
       fileName: "test.txt",
       key:"57374caa837997035b5fbc1d7732a66b",
       fileSize: "1024",
       msg: "do you  want to get the file"
     };
 * 
 * @param flag 
 *  boolean，是否中断传输
 * 
 * @param state 
 *  int，帐号（设备组）通信窗口下，0表示发送方取消传输文件;1表示帐号下某个设备接收文件时，发送方取消对其他设备传输文件;2表示帐号下某个设备拒绝接收文件时，发送方取消对其他设备传输文件
 *  
 */
function transferCancelSender(transferCancelSenderCb,msgObj,flag,state){//接收端取消传输文件-----界面显示
  fileTransfer.transferFileCancel(msgObj,state,function (){
    if(flag)
      serverAndMapHandler(msgObj.key);
    transferCancelSenderCb(msgObj);
  });
}
exports.transferCancelSender=transferCancelSender;

/**
 * @method transferCancelReciever
 *  接收端取消文件接收
 * 
 * @param transferCancelRecieverCb
 *   回调函数
 * 
 * @param key
 *   string，启动程序参数，正在接手文件的key值（一串MD5值），例如57374caa837997035b5fbc1d7732a66b
 */
function transferCancelReciever(transferCancelRecieverCb,key){//接收端取消传输文件-----界面显示
  fileTransferClient.cancelTransfer(key,function (){
    transferCancelRecieverCb();
  });
}
exports.transferCancelReciever=transferCancelReciever;

/**
 * @method transferProcessing
 *  发送端收到接收端发送的传输文件进度信息后台处理函数
 * 
 * @param transferProcessingCb
 *   回调函数
 * 
 * @param msgObj 
 *   启动程序参数，json格式封装
 *   JSON,待发送的消息结构体，其中：
 *  MsgOb举例如下：
 *  var msgobj = {
       type: "file",
       option: 0x0002,
       fileName: "test.txt",
       fileSize: "1024",
       key:"57374caa837997035b5fbc1d7732a66b",
       ratio:0.1234,
       msg: "I want to get the file"
     };
 *  
 */
function transferProcessing(transferProcessingCb,msgObj){ 
  //此处调用显示进度等传输问题的信息
  if(pathMap.get(msgObj.key)===undefined){
    return;
  }
  if(msgObj.state!==1){
    serverAndMapHandler(msgObj.key);
  }
  transferProcessingCb();
}
exports.transferProcessing = transferProcessing;

/**
 * @method deleteTmpFile
 *  接收端将接收到并存储于临时目录下的文件删除
 * 
 * @param deleteTmpFileCb
 *   回调函数
 *   @cbparam1
 *       boolean， 返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *       string， 返回操作结果消息提示
 * 
 * @param tmpFilePath 
 *   启动程序参数，string，文件存储的临时路径
 */
function deleteTmpFile(deleteTmpFileCb,tmpFilePath){ 
  fileTransferClient.deleteTmpFile(tmpFilePath,function(err,msg){
    deleteTmpFileCb(err,msg);
  });
}
exports.deleteTmpFile = deleteTmpFile;

function transferFileOutOfDate(transferFileOutOfDateCb,msgObj) {
  var msg = msgObj;
  msg['option'] = 0x0004;
  transferFileOutOfDateCb(msg);
}
exports.transferFileOutOfDate = transferFileOutOfDate;

function serverAndMapHandler(path) {
  if(pathMap===undefined)
    return;
  if (path !== undefined) {
    var file = pathMap.get(path);
    if (file !== undefined) {
      pathMap.remove(path);
    }
  }
  if (pathMap.size() === 0) {
    if (fileServer !== undefined) {
      fileServer.close(function() {
        fileServer = undefined;
      });
    }
  }
}

function MD5(str, encoding) {
  return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}


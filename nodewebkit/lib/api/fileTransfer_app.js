var fileTransfer = require("../../backend/IM/file-trans/fileTransfer");
var fileTransferServer = require("../../backend/IM/file-trans/fileTransferServer");
var fileTransferClient= require("../../backend/IM/file-trans/fileTransferClient");
var crypto = require('crypto');

var fileServer;
var pathMap;
/**
 * @method sendFileTransferRequest
 *  发送端发送传输文件请求
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *      JSON, 返回待传输的文件信息MsgObj或者出错信息

 * @param2 MsgObj
 *   启动程序参数，json格式封装
   *   JSON,待发送的消息结构体，其中：
   *  MsgObj.IP 表示接收方的IP地址
   *  MsgObj.UID 表示接收方的UUID
   *  MsgObj.Account表示接收方的帐号
   *  MsgObj.Msg表示代传输文件的路径
   *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和RegisterApp中的AppName对应
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
      msg['key']=MD5(msg.fileName + MsgObj.toIP + new Date().getTime());
      MsgObj.Msg=msg;
      sendFileTransferRequestCb(err,MsgObj);
    }
  });
 }
exports.sendFileTransferRequest = sendFileTransferRequest;
/*
function sendFileTransferRefuse(sendFileTransferRefuseCb, MsgObj) {
  MsgObj['state']='0';
  sendFileTransferRefuseCb(MsgObj);
 }
exports.sendFileTransferRefuse = sendFileTransferRefuse;
function sendFileTransferAccept(sendFileTransferAcceptCb, MsgObj) {
  MsgObj['state']='1';
  sendFileTransferAcceptCb(MsgObj);
 }
exports.sendFileTransferAccept = sendFileTransferAccept;
*/
/**
 * @method sendFileTransferStart
 *  收到接收端同意接收请求后，发送端发送传输文件请求
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *      JSON, 返回待传输的文件信息MsgObj

 * @param2 MsgObj
 *   启动程序参数，json格式封装
   *   JSON,待发送的消息结构体，其中：
   *  MsgObj.IP 表示接收方的IP地址
   *  MsgObj.UID 表示接收方的UUID
   *  MsgObj.Account表示接收方的帐号
   *  MsgObj.Msg表示代传输文件的路径
   *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和RegisterApp中的AppName对应
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
 * @param3 path
 *   启动程序参数，待传输文件的路径，例如“/media/fyf/BACKUP/test.txt”
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
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      boolean, 返回操作出错与否，出错则返回true,无错则返回false
 *   @cbparam2
 *      JSON, 返回待传输的文件信息MsgObj

 * @param2 MsgObj
 *   启动程序参数，json格式封装
   *   JSON,待发送的消息结构体，其中：
   *  MsgObj.IP 表示接收方的IP地址
   *  MsgObj.UID 表示接收方的UUID
   *  MsgObj.Account表示接收方的帐号
   *  MsgObj.Msg表示代传输文件的路径
   *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和RegisterApp中的AppName对应
   *  MsgOb举例如下：
   *  var msgobj = {
          type: "file",
          option: 0x0001,
          fileName: "test.txt",
	  key:"57374caa837997035b5fbc1d7732a66b",
          fileSize: "1024",
          msg: "I want to get the file"
        };
 * @param3 outputPath
 *   启动程序参数，待接收文件的保存路径，例如“/media/yff/backup/test.txt”
 */
function transferFileProcess(transferFileCb, msgObj, outputPath) {
  fileTransferClient.transferFile(msgObj,outputPath,function(err, rst) { //传输文件    
    if (err) { //传输文件失败------------界面显示      
      msgObj['state'] = '0';
      msgObj['option']=0x0002;
      msgObj['ratio']=0;
      msgObj['msg'] = 'transfering error:' + rst;
    } 
    transferFileCb(err,msgObj);
  });
}
exports.transferFileProcess = transferFileProcess;
/*
function transferCancelSenderBefore(transferCancelSenderCb,msgObj){//接收端取消传输文件-----界面显示
  fileTransfer.transferFileCancel(msgObj,function (){
    serverAndMapHandler(msgObj.key);
    transferCancelSenderCb(msgObj);
  });
}
exports.transferCancelSenderBefore=transferCancelSenderBefore;*/

/**
 * @method transferCancelSender
 *  发送端中止文件传输
 *
 * @param1 callback function
 *   回调函数
 *   @cbparam1
 *      JSON, 返回中止传输的文件信息MsgObj

 * @param2 MsgObj
 *   启动程序参数，json格式封装
   *   JSON,待发送的消息结构体，其中：
   *  MsgObj.IP 表示接收方的IP地址
   *  MsgObj.UID 表示接收方的UUID
   *  MsgObj.Account表示接收方的帐号
   *  MsgObj.Msg表示代传输文件的路径
   *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和RegisterApp中的AppName对应
   *  MsgOb举例如下：
   *  var msgobj = {
          type: "file",
          option: 0x0000,
          fileName: "test.txt",
	  key:"57374caa837997035b5fbc1d7732a66b",
          fileSize: "1024",
          msg: "do you  want to get the file"
        };
 */
function transferCancelSender(transferCancelSenderCb,msgObj){//接收端取消传输文件-----界面显示
  fileTransfer.transferFileCancel(msgObj,function (){
    serverAndMapHandler(msgObj.key);
    transferCancelSenderCb(msgObj);
  });
}
exports.transferCancelSender=transferCancelSender;
/**
 * @method transferCancelReciever
 *  接收端取消文件接收
 *
 * @param1 callback function
 *   回调函数

 * @param2 string
 *   启动程序参数，正在接手文件的key值（一串MD5值），例如57374caa837997035b5fbc1d7732a66b
 */
function transferCancelReciever(transferCancelRecieverCb,key){//接收端取消传输文件-----界面显示
  fileTransferClient.cancelTransfer(key,function (){
    transferCancelRecieverCb();
  });
}
exports.transferCancelReciever=transferCancelReciever;
/**
 * @method transferProcessing
 *  发送端收到接收端发送的传输文件进度信息
 *
 * @param1 callback function
 *   回调函数

 * @param2 msgObj
 *   启动程序参数，json格式封装
   *   JSON,待发送的消息结构体，其中：
   *  MsgObj.IP 表示接收方的IP地址
   *  MsgObj.UID 表示接收方的UUID
   *  MsgObj.Account表示接收方的帐号
   *  MsgObj.Msg表示代传输文件的路径
   *  MsgObj.App表示接收方的预先注册的接收该信息的应用名称，和RegisterApp中的AppName对应
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
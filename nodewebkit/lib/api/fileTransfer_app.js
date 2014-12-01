var fileTransfer = require("../../backend/IM/file-trans/fileTransfer");
var fileTransferServer = require("../../backend/IM/file-trans/fileTransferServer");
var fileTransferClient= require("../../backend/IM/file-trans/fileTransferClient");

var crypto = require('crypto');

var fileServer;
var pathMap;

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

function sendFileTransferStart(sendFileTransferStartCb, msgObj,path) {
  fileTransferServer.transferFile(fileServer, function(err, msg, server) { //发送端初始化传输信息
    if (err) { //发送端初始化传输信息失败-----有点问题请稍候重发----界面显示  
      // client.fileTransferError(rstObj.file,msg,function(){        
      console.log('transfer------error--transferFile------' + msg);
      //   });        
      fileTransfer.fileTransferStart(true, '', '', msgObj, function(err, rstObj) {
        serverAndMapHandler();
        sendFileTransferStartCb(err,rstObj);
        /*if(err||rstObj.state==='1'){//接收端 初始化接收信息失败 或 接收端回复信息出错 ---------界面显示     
      serverAndMapHandler();          
    }else{//显示正在传输文件---------界面显示     
      console.log('transfer------ing--------'+JSON.stringify(rstObj));                    
    } */
      });
    } else {
      fileServer = server;
      fileTransferServer.addPath(msgObj.key, path, function(pathMapTmp) { //发送端初始化传输信息
        pathMap = pathMapTmp;
        //发送端初始化传输信息成功     并发送 “接收端可以进行接受” 的信息
        fileTransfer.fileTransferStart(false, fileServer.address().port, msgObj, function(err, rstObj) {
          if (err || rstObj.state === '0') { //接收端 初始化接收信息失败 或 接收端回复信息出错 ---------界面显示
            console.log('-------fileTransferStart  error ---' + JSON.stringify(rstObj));
            serverAndMapHandler(rstObj.key);
            sendFileTransferStartCb(true,rstObj);
          } else { //显示正在传输文件---------界面显示
            console.log('transfer------ing----fileTransferStart   after----' + JSON.stringify(rstObj));
            sendFileTransferStartCb(err,rstObj);
          }
        });
      });
    }
  });
}
exports.sendFileTransferStart = sendFileTransferStart;

function transferFileProcess(transferFileCb, msgObj, outputPath) {
  console.log(JSON.stringify(msgObj));
  fileTransferClient.transferFile(msgObj,outputPath,function(err, rst) { //传输文件        
    console.log('----ooooo-----------oooooooooo--------');
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
function transferCancelSenderBefore(transferCancelSenderCb,msgObj){//接收端取消传输文件-----界面显示
  fileTransfer.transferFileCancel(msgObj,function (){
    serverAndMapHandler(msgObj.key);
    transferCancelSenderCb(msgObj);
  });
}
exports.transferCancelSenderBefore=transferCancelSenderBefore;
function transferCancelSender(transferCancelSenderCb,msgObj){//接收端取消传输文件-----界面显示
  fileTransfer.transferFileCancel(msgObj,function (){
    serverAndMapHandler(msgObj.key);
    transferCancelSenderCb(msgObj);
  });
}
exports.transferCancelSender=transferCancelSender;
function transferCancelReciever(transferCancelRecieverCb,key){//接收端取消传输文件-----界面显示
  fileTransferClient.cancelTransfer(key,function (){
    transferCancelRecieverCb();
  });
}
exports.transferCancelReciever=transferCancelReciever;
function transferProcessing(transferProcessingCb,msgObj){ 
  //此处调用显示进度等传输问题的信息
  if(pathMap.get(msgObj.key)===undefined){
    console.log('-------------I  do not know the file  why tell me???');
    return;
  }
  if(msgObj.state!==1){
    serverAndMapHandler(msgObj.key);
  }
  transferProcessingCb();
}
exports.transferProcessing = transferProcessing;
function serverAndMapHandler(path) {
  console.log('=========serverAndMapHandler===========' + path);
  if(pathMap===undefined)
    return;
  if (path !== undefined) {
    var file = pathMap.get(path);
    if (file !== undefined) {
      pathMap.remove(path);
      console.log('=========serverAndMapHandler===iiiiiiiiiiiiiiiiiiiiiiiiii========' + pathMap.size());
    }
  }
  if (pathMap.size() === 0) {
    if (fileServer !== undefined) {
      fileServer.close(function() {
        console.log('`````````````````fileServer======close====');
        fileServer = undefined;
      });
    }
  }
}
function MD5(str, encoding) {
  return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}
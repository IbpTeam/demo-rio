/**
 * @Copyright:
 * 
 * @Description: Message transfer.
 *
 * @author: Yuanzhe
 *
 * @Data:2014.9.22
 *
 * @version:0.2.1
 **/

var imchat = require("../IM/IMChatNoRSA.js");
var config = require("../config");
var repo = require("../FilesHandle/repo");
var fs = require("fs");
var cp = require("child_process");
var path = require("path");

// @Enum sync state
var syncState = {
  SYNC_IDLE:0,
  SYNC_REQUEST:1,
  SYNC_START:2,
  SYNC_COMPLETE:3
};
// @Enum message type
var msgType = {
  TYPE_REQUEST:"syncRequest",
  TYPE_RESPONSE:"syncResponse",
  TYPE_COMPLETE:"syncComplete"
};

// @const
var SSH_DIR = ".ssh";
var PRI_KEY = "rio_rsa";
var PUB_KEY = "rio_rsa.pub";

var iCurrentState = syncState.SYNC_IDLE;
var syncList = new Array();

/**
 * @method initServer
 *    Message transfer server initialize.
 */
exports.initServer = function(){
  imchat.initIMServerNoRSA(recieveMsgCb);
}

function recieveMsgCb(msg){
  console.log("Receive message : " + msg);
  var oMessage = JSON.parse(msg);
  switch(oMessage.type){
    case msgType.TYPE_REQUEST: {
      //syncRequestCb(oMessage);
    }
    break;
    case msgType.TYPE_RESPONSE: {
      console.log("=========================================syncStart");
      //syncResponseCb(oMessage);
    }
    break;
    case msgType.TYPE_COMPLETE: {
      //syncCompleteCb(false, oMessage.isComplete,oMessage.deviceId,sRemoteAddress);
    }
    break;
    default: {
      console.log("this is in default switch on data");
    }
  }
}

/**
 * @method sendMsg
 *    Send msg to specific address.
 * @param device
 *    Remote device info.
 * @param msgObj
 *    Message object.
 */
function sendMsg(device,msgObj){
  var account = device.account;
  var ipset = {
    IP:device.ip,
    UID:device.device_id
  };
  var sMsgStr = JSON.stringify(msgObj);
  console.log("sendMsg-------------------------"+sMsgStr);
  imchat.sendMSGbyUIDNoRSA(ipset,account,sMsgStr,config.MSGPORT,sendMsgCb);
}

/**
 * @method sendMsgCb
 *    Received from remote when message arrived.
 * @param msg
 *    Message string.
 */
function sendMsgCb(msg){
  // TO-DO
  // Right now, this callback do nothing, may be set it null.
  console.log("[Send message successfull] + Msg : " + msg);
}

/**
 * @method checkPubKey
 *    Check if the specific key file exists.
 * @param callback
 *    The callback is passed one argument true/false, where pub key is/isn't exists.
 */
function checkPubKey(callback){
  //Get env HOME path
  var sHomePath = process.env['HOME'];
  var sSshDir = path.join(sHomePath,SSH_DIR);
  var sPriKeyPath = path.join(sSshDir,PRI_KEY);
  var sPubKeyPath = path.join(sSshDir,PUB_KEY);

  fs.exists(sSshDir,function(isDirExists){
    if(!isDirExists){
      callback(false);
      return;
    }
    //ssh以私钥为准，当私钥存在公钥不存在时，再次创建会提示重写信息；当私钥不存在时，不提示重写信息。
    fs.exists(sPriKeyPath,function(isPriExists){
      if(!isPriExists){
        callback(false);
        return;
      }
      fs.exists(sPubKeyPath,function(isPubExists){
        if(!isPubExists){
          //remove private key file
          fs.unlink(sPriKeyPath,function(err){
            if(err)
              console.log(err);
            callback(false);
          });
          return;
        }
        callback(true);
      });
    });
  });
}

/**
 * @method readPubKeyFile
 *    Read pub key file, get pub key string.
 * @param callback
 *    This callback is passed one argument: ssh pubkey string.
 */
function readPubKeyFile(callback){
  var sPubKeyPath = path.join(process.env['HOME'],SSH_DIR,PUB_KEY);
  fs.readFile(sPubKeyPath,function(err,data){
    if(err)
      console.log(err);
    callback(data.toString());
  });
}

/**
 * @method getPubKey
 *    Check pub key and get pub key string.
 *    If the ssh key is not exists, generate it.
 * @param callback
 *    This callback is passed one argument: ssh pubkey string.
 */
function getPubKey(callback){
  //If ssh pub key is not exist, run ssh-keygen to generate first.
  checkPubKey(function(isPubKeyExist){
    if(!isPubKeyExist){
      var sPriKeyPath = path.join(process.env['HOME'],SSH_DIR,PRI_KEY);
      var sCommandStr = "ssh-keygen -t rsa -P '' -f '" + sPriKeyPath + "'";
      cp.exec(sCommandStr,function(err,stdout,stderr){
        if(err)
          console.log(err);
        readPubKeyFile(callback);
      });
      return;
    }
    readPubKeyFile(callback);
  });
}

/**
 * @method serviceUpCb
 *    Service up callback.
 * @param device
 *    Device object,include device id,name,ip and so on.
 */
exports.serviceUpCb = function(device){
  var sDeviceId = device.device_id;
  var sDeviceIp = device.ip;
  //if(sDeviceId.localeCompare(config.uniqueID) <= 0)
  //  return;
  if(sDeviceId != "Linux Mint"){
    console.log("device id :=================== " + sDeviceId);
    return;
  }
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      getPubKey(function(pubKeyStr){
        syncList.unshift(device);
        requestMsg = {
          type:msgType.TYPE_REQUEST,
          ip:config.SERVERIP,
          path:config.RESOURCEPATH,
          account:config.ACCOUNT,
          deviceId:config.uniqueID
        };
        //sendMsg(device,requestMsg);
        iCurrentState = syncState.SYNC_REQUEST;
      });
      break;
    }
    case syncState.SYNC_REQUEST:{
      syncList.push(device);
      break;
    }
    case syncState.SYNC_START:{
      syncList.push(device);
      break;
    }
    case syncState.SYNC_COMPLETE:{
      syncList.push(device);
      break;
    }
  }
}

/**
 * @method syncRequestCb
 *    Sync request callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncRequestCb(msgObj){
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      var responseMsg = {
        type:msgtype.TYPE_RESPONSE,
        deviceId:config.uniqueID,
        path:config.RESOURCEPATH,
        account:config.ACCOUNT,
        ip:config.SERVERIP
      };
      sendMsg(remoteAddress,responseMsg);
      syncList.unshift(msgObj.deviceId);
      iCurrentState = syncState.SYNC_START;

      //Start to sync
      repo.pullFromOtherRepo(remoteAddress,msgObj.path,function(){
        iCurrentState = syncState.SYNC_COMPLETE;
        var completeMsg = {
          type:msgType.TYPE_COMPLETE,
          ip:config.SERVERIP
        };
      console.log("syncRequestCb-------------------------"+device.ip);
        sendMsg(remoteAddress,completeMsg);
      });
      break;
    }
    case syncState.SYNC_REQUEST:{
      syncList.push(msgObj.deviceId);
      break;
    }
    case syncState.SYNC_START:{
      syncList.push(msgObj.deviceId);
      break;
    }
    case syncState.SYNC_COMPLETE:{
      syncList.push(msgObj.deviceId);
      break;
    }
  }
}

/**
 * @method syncResponseCb
 *    Sync response callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncResponseCb(msgObj){
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      console.log("SYNC ERROR: current state is not request!");
      break;
    }
    case syncState.SYNC_REQUEST:{
      if(syncList[0] != msgObj.deviceId){
      console.log("SYNC ERROR: current sync device is wrong!")
      }
      else{
        iCurrentState = syncState.SYNC_START;
        //Start to sync
        repo.pullFromOtherRepo(remoteAddress,msgObj.path,function(){
          iCurrentState = syncState.SYNC_COMPLETE;
            var completeMsg = {
            type:msgType.TYPE_COMPLETE,
            ip:config.SERVERIP
          };
          console.log("syncResponseCb-------------------------"+device.ip);
          sendMsg(remoteAddress,completeMsg);
        });
      }
      break;
    }
    case syncState.SYNC_START:{
      console.log("SYNC ERROR: current state is not request!");
      break;
    }
    case syncState.SYNC_COMPLETE:{
      console.log("SYNC ERROR: current state is not request!");
      break;
    }
  }
}

/**
 * @method syncCompleteCb
 *    Sync complete callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncCompleteCb(msgObj,remoteAddress){
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      console.log("SYNC completed!");
      break;
    }
    case syncState.SYNC_REQUEST:{
      console.log("SYNC ERROR: current sync device is start/complete!")
      break;
    }
    case syncState.SYNC_START:{
      console.log("Remote device sync completed...wait for us");
      break;
    }
    case syncState.SYNC_COMPLETE:{
      var completeMsg = {
        type:msgType.TYPE_COMPLETE,
        ip:config.SERVERIP
      };
      console.log("syncResponseCb-------------------------"+device.ip);
      sendMsg(remoteAddress,completeMsg);
      iCurrentState = syncState.SYNC_IDLE;
      break;
    }
  }
}
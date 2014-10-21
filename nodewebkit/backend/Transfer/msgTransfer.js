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

//var imchat = require("../IM/IMChat.js");
var config = require("../config");
var repo = require("../FilesHandle/repo");
//var fs = require("fs");
//var cp = require('child_process');

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

var iCurrentState = syncState.SYNC_IDLE;
var syncList = new Array();

/**
 * @method initServer
 *    Message transfer server initialize.
 */
exports.initServer = function(){
  //imchat.initIMServer(recieveMsgCb);
}

function recieveMsgCb(msg){
  console.log("Receive message : " + msg);
  var oMessage = JSON.parse(msg);
  switch(oMessage.type){
    case msgType.TYPE_REQUEST: {
      syncRequestCb(oMessage);
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
  //imchat.sendMSGbyUID(ipset,account,sMsgStr,config.MSGPORT,sendMsgCb);
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
      syncList.unshift(device);
      requestMsg = {
        type:msgType.TYPE_REQUEST,
        ip:config.SERVERIP,
        path:config.RESOURCEPATH,
        account:config.ACCOUNT,
        deviceId:config.uniqueID
      };
      sendMsg(device,requestMsg);
      iCurrentState = syncState.SYNC_REQUEST;
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
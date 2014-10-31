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
var repo = require("../commonHandle/repo");
var fs = require("fs");
var cp = require("child_process");
var path = require("path");
var documents = require("../data/document");

// @Enum sync state
var syncState = {
  SYNC_IDLE:0,
  SYNC_REQUEST:1,
  SYNC_RESPONSE:2,
  SYNC_START:3,
  SYNC_COMPLETE:4
};
// @Enum message type
var msgType = {
  TYPE_REQUEST:"syncRequest",
  TYPE_RESPONSE:"syncResponse",
  TYPE_START:"syncStart",
  TYPE_COMPLETE:"syncComplete",
  TYPE_ONLINE:"syncOnline"
};

// @const
var SSH_DIR = ".ssh";
var PRI_KEY = "rio_rsa";
var PUB_KEY = "rio_rsa.pub";
var AUTHORIZED_KEYS = "authorized_keys";
var CONFIG_FILE = "config";
var RESOURCES_PATH = path.join(process.env["HOME"],".resources");

var iCurrentState = syncState.SYNC_IDLE;
var syncList = new Array();

/**
 * @method initServer
 *    Message transfer server initialize.
 */
exports.initServer = function(){
  imchat.initIMServerNoRSA(config.MSGPORT,recieveMsgCb);
}

function recieveMsgCb(msgobj){
  var msg = msgobj['MsgObj'];
  console.log("Receive message : " + msg);
  var oMessage = JSON.parse(msg.message);
  switch(oMessage.type){
    case msgType.TYPE_REQUEST: {
      syncRequest(oMessage);
    }
    break;
    case msgType.TYPE_RESPONSE: {
      syncResponse(oMessage);
    }
    break;
    case msgType.TYPE_START: {
      syncStart(oMessage);
    }
    case msgType.TYPE_COMPLETE: {
      syncComplete(oMessage);
    }
    break;
    case msgType.TYPE_ONLINE: {
      syncOnline(oMessage);
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
exports.sendMsg=sendMsg;
/**
 * @method sendMsgCb
 *    Received from remote when message arrived.
 * @param msg
 *    Message string.
 */
function sendMsgCb(msgObj){
  // TO-DO
  // Right now, this callback do nothing, may be set it null.
  //var msg = msgObj['MsgObj'];
  //console.log("[Send message successfull] + Msg : " + msg.message);
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
    fs.exists(sPriKeyPath,function(isPriFileExists){
      if(!isPriFileExists){
        callback(false);
        return;
      }
      fs.exists(sPubKeyPath,function(isPubFileExists){
        if(!isPubFileExists){
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
 * @method setConfig
 *    Config SSH to ignore known_hosts checking.
 * @param callback
 *    Callback will be called when add set configuration successed.
 */
function setConfig(callback){
  var sSSHConifgPath = path.join(process.env['HOME'],SSH_DIR,CONFIG_FILE);
  //解决known_hosts列表问题，添加用户SSH个人config，忽略此检查
  //配置文件不存在则直接添加，存在则需进行充分判断
  fs.exists(sSSHConifgPath,function(isConfigExists){
    if(!isConfigExists){
      var sConfigStr = "StrictHostKeyChecking no\n \
      UserKnownHostsFile /dev/null\n";
      fs.appendFile(sSSHConifgPath,sConfigStr,function(err){
        if(err){
          console.log(err);
        }
        readPubKeyFile(callback);
        return;        
      });
    }
    //Todo 配置文件存在，需检查是否按要求进行了配置
    readPubKeyFile(callback);
  });
}

/**
 * @method setPubKey
 *    Add pub key into authorized_keys file.
 *    If the file is not exists, generate it.
 * @param pubKey
 *    SSH pub key from other side.
 * @param callback
 *    Callback will be called when add pub key successed.
 */
function setPubKey(pubKey,callback){
  var sAuthorizedKeysPath = path.join(process.env['HOME'],SSH_DIR,AUTHORIZED_KEYS);
  fs.exists(sAuthorizedKeysPath,function(isAkFileExists){
    if(!isAkFileExists){
      // Create authorized_keys file first
      fs.appendFile(sAuthorizedKeysPath,pubKey,function(err){
        if(err)
          console.log(err);
        //Todo if save in db,update pubkey in db
        callback();
      });
      return;   
    }
    //Todo-如果需要替换文件中pubkey，则需将pubkey写入数据库
    //     先比较数据库中pubkey，再查找文件中Pubkey
    fs.appendFile(sAuthorizedKeysPath,pubKey,function(err){
      if(err)
        console.log(err);
      //Todo if save in db,update pubkey in db
      callback();
    });
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
        setConfig(callback);
      });
      return;
    }
    setConfig(callback);
  });
}

/**
 * @method serviceUp
 *    Service up callback.
 * @param device
 *    Device object,include device id,name,ip and so on.
 */
exports.serviceUp = function(device){
    console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$"+device.ip);
  if(device.ip != "192.168.162.122"){
    return;
  }
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      iCurrentState = syncState.SYNC_REQUEST;
      getPubKey(function(pubKeyStr){
        syncList.unshift(device);
        requestMsg = {
          type:msgType.TYPE_REQUEST,
          ip:config.SERVERIP,
          path:RESOURCES_PATH,
          account:config.ACCOUNT,
          deviceId:config.uniqueID,
          pubKey:pubKeyStr
        };
        sendMsg(device,requestMsg);
      });
      break;
    }
    case syncState.SYNC_REQUEST:{
      syncList.push(device);
      break;
    }
    case syncState.SYNC_RESPONSE:{
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
 * @method syncRequest
 *    Sync request callback.
 * @param msgObj
 *    Message object.
 */
function syncRequest(msgObj){
  var device = {
    device_id:msgObj.deviceId,
    ip:msgObj.ip,
    account:msgObj.account
  };
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      //First is to get pub key, because of this step will create ssh directory.
      iCurrentState = syncState.SYNC_RESPONSE;
      getPubKey(function(pubKeyStr){
        setPubKey(msgObj.pubKey,function(){
          syncList.unshift(device);
          responseMsg = {
            type:msgType.TYPE_RESPONSE,
            ip:config.SERVERIP,
            resourcePath:RESOURCES_PATH,
            account:config.ACCOUNT,
            deviceId:config.uniqueID,
            pubKey:pubKeyStr
          };
          sendMsg(device,responseMsg);
        });
      });
      break;
    }
    case syncState.SYNC_REQUEST:{
      //ToDo-判断等待的是否为同一台设备
      syncList.push(device);
      break;
    }
    case syncState.SYNC_RESPONSE:{
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
 * @method syncResponse
 *    Sync response callback.
 * @param msgObj
 *    Message object.
 */
function syncResponse(msgObj){
  var device = {
    device_id:msgObj.deviceId,
    ip:msgObj.ip,
    account:msgObj.account
  };
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      //Todo send error msg to reset remote state
      console.log("SYNC ERROR: current state is not request!");
      break;
    }
    case syncState.SYNC_REQUEST:{
      if(syncList[0].device_id != msgObj.deviceId){
      console.log("SYNC ERROR: current sync device is wrong!")
      }
      else{
        iCurrentState = syncState.SYNC_RESPONSE;
        setPubKey(msgObj.pubKey,function(){
          responseMsg = {
            type:msgType.TYPE_START,
            ip:config.SERVERIP,
            resourcePath:RESOURCES_PATH,
            account:config.ACCOUNT,
            deviceId:config.uniqueID
          };
          sendMsg(device,responseMsg);
          syncStart(msgObj);
        });
      }
      break;
    }
    case syncState.SYNC_RESPONSE:{
      console.log("SYNC ERROR: current state is not request!");
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

function syncStart(msgObj){
  var device = {
    device_id:msgObj.deviceId,
    ip:msgObj.ip,
    account:msgObj.account
  };
  switch(iCurrentState){
    case syncState.SYNC_IDLE:{
      //Todo send error msg to reset remote state
      console.log("SYNC ERROR: current state is not response!");
      break;
    }
    case syncState.SYNC_REQUEST:{
      console.log("SYNC ERROR: current state is not response!");
      break;
    }
    case syncState.SYNC_RESPONSE:{
      //Start to sync
      iCurrentState = syncState.SYNC_START;
      documents.pullRequest(msgObj.deviceId,msgObj.ip,msgObj.account,msgObj.resourcePath,mergeCompleteCallback);
      //repo.pullFromOtherRepo(msgObj.deviceId,msgObj.ip,msgObj.account,msgObj.resourcePath,mergeCompleteCallback);
      break;
    }
    case syncState.SYNC_START:{
      console.log("SYNC ERROR: current state is not response!");
      break;
    }
    case syncState.SYNC_COMPLETE:{
      console.log("SYNC ERROR: current state is not response!");
      break;
    }
  }
}

/**
 * @method mergeCompleteCallback
 *    Called when git merge completed.
 * @param deviceId
 *    Remote device id.
 * @param deviceAccount
 *    Remote device account.
 * @param deviceIp
 *    Remote device ip.
 */
function mergeCompleteCallback(deviceId,deviceIp,deviceAccount){
  var device = {
    device_id:deviceId,
    ip:deviceIp,
    account:deviceAccount
  };
  var completeMsg = {
    type:msgType.TYPE_COMPLETE,
    ip:config.SERVERIP,
    account:config.ACCOUNT,
    deviceId:config.uniqueID
  };
  iCurrentState = syncState.SYNC_COMPLETE;
  sendMsg(device,completeMsg);
}

/**
 * @method syncComplete
 *    Sync complete callback.
 * @param msgObj
 *    Message object.
 * @param remoteAddress
 *    Remote device ip.
 */
function syncComplete(msgObj){
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
      var device = {
        device_id:msgObj.deviceId,
        ip:msgObj.deviceIp,
        account:msgObj.deviceAccount
      };
      var completeMsg = {
        type:msgType.TYPE_COMPLETE,
        ip:config.SERVERIP,
        account:config.ACCOUNT,
        deviceId:config.uniqueID
      };
      sendMsg(device,completeMsg);
      //Todo check the first element in array.
      syncList.shift();
      //Todo check sync list, if length>0, do sync.
      //if syncList.length>0, get device info ,and call serviceup
      iCurrentState = syncState.SYNC_IDLE;
      break;
    }
  }
}

function syncOnline(msgObj) {
  console.log("receive message:::::::::::::::::::::::::::::::::::::::::::::::::::::::");
  console.log(msgObj);
  console.log("::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::");
  if(iCurrentState == syncState.SYNC_IDLE){
    repo.pullFromOtherRepo(msgObj.deviceId,msgObj.ip,msgObj.account,msgObj.path,function(result){
      console.log(result);
    });
  }
}

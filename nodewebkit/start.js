/**
 * @Copyright:
 * 
 * @Description: Data access object api, used in file handle to connect database.
 *
 * @author: WangFeng Yuanzhe
 *
 * @Data:2014.9.15
 *
 * @version:0.2.1
 **/

var config = require("./backend/config");
var server = require("./backend/server");
var router = require("./backend/router");
var filesHandle = require("./backend/filesHandle");
var uniqueID=require('./backend/uniqueID');
var device = require("./backend/data/device");
var msgTransfer = require("./backend/Transfer/msgTransfer");
var util = require('util');
var os = require('os');
var fs = require('fs');
var cp = require('child_process');
var path = require('path');
//var process = require('process');

var handle = {}

// @const
var HOME_DIR = "/home";
var DEMO_RIO = ".demo-rio";
var CONFIG_JS = "config.js";
var UNIQUEID_JS = "uniqueID.js";
var DATABASENAME = "rio.sqlite3";
var NETLINKSTATUS = ".netlinkstatus"

var startonce = false;

/** 
 * @Method: startApp
 *    Start this application and initialization.
 **/
function startApp(){
  if (startonce === true){
    return;
  }
  startonce = true;
  config.SERVERIP = config.getAddr();
  config.SERVERNAME = os.hostname();
  config.ACCOUNT = process.env['USER'];
  var sFullPath = path.join(HOME_DIR, config.ACCOUNT, DEMO_RIO);
  config.USERCONFIGPATH = sFullPath;
  config.DATABASEPATH = path.join(config.USERCONFIGPATH,DATABASENAME);
  util.log('mkdir ' + sFullPath);
  fs.exists(sFullPath,function(rioExists){
    if(!rioExists){
      fs.mkdir(sFullPath, 0755, function(err){
        if(err) throw err;
        initializeApp(sFullPath);
      });
      return;
    }
    initializeApp(sFullPath);
  });
  // MSG transfer server initialize
  msgTransfer.initServer();
  server.start(router.route, handle);

  cp.exec('./node_modules/netlink/netlink ./var/.netlinkStatus');
}

/** 
 * @Method: initializeApp
 *    initialize config/uniqueid.js.
 **/
function initializeApp(sFullPath){
  config.USERCONFIGPATH = sFullPath;
  var sConfigPath = path.join(config.USERCONFIGPATH,CONFIG_JS);
  var sUniqueIDPath = path.join(config.USERCONFIGPATH,UNIQUEID_JS);
  var sDatabasePath = path.join(config.USERCONFIGPATH,DATABASENAME);
  var sNetLinkStatusPath = path.join(config.USERCONFIGPATH,NETLINKSTATUS);
  var bIsConfExist = false;
  filesHandle.isPulledFile=false;
  console.log("Config Path is : " + sConfigPath);
  console.log("UniqueID Path is : " + sUniqueIDPath);
  fs.exists(sConfigPath, function (configExists) {
    if(!configExists){
      console.log("No data777777777777777777777777777");
    }else{
      bIsConfExist = true;
      var dataDir=require(sConfigPath).dataDir;
      config.RESOURCEPATH=dataDir;
      util.log("monitor : "+dataDir);
      filesHandle.monitorFiles(dataDir,filesHandle.monitorFilesCb);
      filesHandle.monitorDesFiles(dataDir+"/.des",filesHandle.monitorDesFilesCb);
    }
    fs.exists(sUniqueIDPath, function (uniqueExists) {
      if(!uniqueExists){
        console.log("UniqueID.js is not exists, start to set sys uid.");
        setSysUid(null,sUniqueIDPath,function(){
          if(bIsConfExist)
            device.startDeviceDiscoveryService();
        });
        return;
      }
      console.log("UniqueID.js is exist.");
      var deviceID=require(sUniqueIDPath).uniqueID;
      setSysUid(deviceID,sUniqueIDPath,function(){
        if(bIsConfExist){
          device.startDeviceDiscoveryService();
        }
        fs.exists(sNetLinkStatusPath, function (netlinkExists) {
          if(!netlinkExists){
            cp.exec('touch '+sNetLinkStatusPath,function(error,stdout,stderr){
              util.log("touch .netlinkstatus");
              config.NETLINKSTATUSPATH=sNetLinkStatusPath;
              cp.exec('./node_modules/netlink/netlink '+sNetLinkStatusPath,function(error,stdout,stderr){
                util.log(sNetLinkStatusPath);
                filesHandle.monitorNetlink(sNetLinkStatusPath);
              });
            });
          }
          else{
            config.NETLINKSTATUSPATH=sNetLinkStatusPath;
            cp.exec('./node_modules/netlink/netlink '+sNetLinkStatusPath,function(error,stdout,stderr){
              util.log(sNetLinkStatusPath);
              filesHandle.monitorNetlink(sNetLinkStatusPath);
            });
          }
        });
      });
    });
  });
 }

/** 
 * @Method: setSysUid
 *    set system unique id.
 * @param deviceID
 *    Device id.
 * @param uniqueIDPath
 *    Path of uniqueId.js.
 * @param callback
 *    Callback
 **/
function setSysUid(deviceID,uniqueIDPath,callback){
  if(deviceID == undefined || deviceID == null){
    uniqueID.SetSysUid(function(){
      deviceID=require(uniqueIDPath).uniqueID;
      console.log("deviceID = "+deviceID);
      config.uniqueID=deviceID;
      callback();
    });
  }else{
    console.log("deviceID = "+deviceID);
    config.uniqueID=deviceID;
    callback();
  }
}

// Start
exports.startServer=function(){
  startApp();
}

exports.requireAPI=function(apilist, callback){
  util.log("requireAPI:" + apilist);
  if(startonce === false){
     startApp();
  }
  var i;
  var apiArr = new Array(apilist.length);
  for(i = 0; i < apilist.length; i += 1){
    apiArr[i] = require('./lib/api/' + apilist[i]);
  }
  setTimeout(function(){callback.apply(null, apiArr)}, 0);
}

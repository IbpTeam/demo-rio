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
var device = require("./backend/devices");
var util = require('util');
var os = require('os');
var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var handle = {}

// @const
var HOME_DIR = "/home";
var DEMO_RIO = ".demo-rio";
var CONFIG_JS = "config.js";
var UNIQUEID_JS = "uniqueID.js";
var DATABASENAME = "rio.sqlite3";

//
var sFullPath;

/** 
 * @Method: startApp
 *    Start this application and initialization.
 **/
function startApp(){
  config.SERVERIP=config.getAddr();
  config.SERVERNAME = os.hostname()+'('+config.SERVERIP+')';
  config.ACCOUNT = os.hostname()+'('+config.SERVERIP+')';
  server.start(router.route, handle);

  cp.exec('./node_modules/netlink/netlink ./var/.netlinkStatus');
  cp.exec('echo $USER',function(error,stdout,stderr){
    var sUserName=stdout.replace("\n","");
    sFullPath = path.join(HOME_DIR,sUserName,DEMO_RIO);
    util.log('mkdir ' + sFullPath);
    fs.exists(sFullPath,function(rioExists){
      if(!rioExists){
        fs.mkdir(sFullPath, 0755, function(err){
          if(err) throw err;
          initializeApp();
        });
        return;
      }
      initializeApp();
    });
  });
}

/** 
 * @Method: initializeApp
 *    initialize config/uniqueid.js.
 **/
function initializeApp(){
  config.USERCONFIGPATH = sFullPath;
  var sConfigPath = path.join(config.USERCONFIGPATH,CONFIG_JS);
  var sUniqueIDPath = path.join(config.USERCONFIGPATH,UNIQUEID_JS);
  var sDatabasePath = path.join(config.USERCONFIGPATH,DATABASENAME);
  console.log("Config Path is : " + sConfigPath);
  console.log("UniqueID Path is : " + sUniqueIDPath);

  fs.exists(sConfigPath, function (configExists) {
    if(!configExists){
      console.log("No data");
    }else{
      var dataDir=require(sConfigPath).dataDir;
      config.RESOURCEPATH=dataDir;
      util.log("monitor : "+dataDir);
      filesHandle.monitorFiles(dataDir,filesHandle.monitorFilesCb);
    }
    fs.exists(sUniqueIDPath, function (uniqueExists) {
      if(!uniqueExists){
        console.log("UniqueID.js is not exists, start to set sys uid.");
        setSysUid(null,sUniqueIDPath);
        return;
      }
      console.log("UniqueID.js is exist.");
      var deviceID=require(sUniqueIDPath).uniqueID;
      setSysUid(deviceID,sUniqueIDPath);
      device.getDeviceList();
    });
  });

  //start to init database
  fs.exists(sDatabasePath,function(dbExists){
    if(!dbExists){
      config.DATABASEPATH = sDatabasePath;
      filesHandle.initDatabase();
      return;
    }
    config.DATABASEPATH = sDatabasePath;
  });
 }

/** 
 * @Method: setSysUid
 *    set system unique id.
 **/
function setSysUid(deviceID,uniqueIDPath){
  if(deviceID == undefined || deviceID == null){
    uniqueID.SetSysUid(function(){
      deviceID=require(uniqueIDPath).uniqueID;
      console.log("deviceID = "+deviceID);
      config.uniqueID=deviceID;
    });
  }else{
    console.log("deviceID = "+deviceID);
    config.uniqueID=deviceID;
  }
}

// Start
startApp();
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

var initRio = require("./backend/initRio");
var config = require("./backend/config");
var server = require("./backend/server");
var router = require("./backend/router");
var desktopConf = require("./backend/data/desktop");
var uniqueID=require('./backend/uniqueID');
var device = require("./backend/data/device");
var util = require('util');
var os = require('os');
var fs = require('fs');
var cp = require('child_process');
var path = require('path');
var cryptoApp= require('./backend/crypto_app');
var appManager = require('./backend/app/appManager');
var IM = require("./backend/IM/IM");
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
  cryptoApp.generateKeypairCtn(function(done) {
    if (done)
      console.log('create rsa keypair success!');
    else
      console.log('create rsa keypair failed!!!');
  });
  cryptoApp.initServerPubKey(function(done) {
  if (done)
    console.log('init server pubkey success!');
  else
    console.log('init server pubkey failed!!!');
 });
  startonce = true;
  config.SERVERNAME = os.hostname();
  var sFullPath = path.join(HOME_DIR, process.env['USER'], DEMO_RIO);
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
  server.start(router.route, handle);
  IM.startIMService(function(){},false);

  cp.exec('./node_modules/netlink/netlink ./var/.netlinkStatus');
}

/** 
 * @Method: initializeApp
 *    initialize config/uniqueid.js.
 **/
function initializeApp(sFullPath) {
  config.USERCONFIGPATH = sFullPath;
  var sUniqueIDPath = path.join(config.USERCONFIGPATH, UNIQUEID_JS);
  var sDatabasePath = path.join(config.USERCONFIGPATH, DATABASENAME);
  var sNetLinkStatusPath = path.join(config.USERCONFIGPATH, NETLINKSTATUS);
  console.log("UniqueID Path is : " + sUniqueIDPath);
    /*
     * TODO: desktop config part is not working now, will fix it later
     */
    // desktopConf.initConf(function(result) {
    //   if (result !== "success") {
    //     console.log("init config error");
    //     return;
    //   }
  fs.exists(sUniqueIDPath, function(uniqueExists) {
    if (!uniqueExists) {
      console.log("UniqueID.js is not exists, start to set sys uid.");
      setSysUid(null, sUniqueIDPath, function() {
        device.startDeviceDiscoveryService();
      });
      return;
    }
    console.log("UniqueID.js is exist.");
    var deviceID = require(sUniqueIDPath).uniqueID;
    config.ACCOUNT  = require(sUniqueIDPath).Account;
    setSysUid(deviceID, sUniqueIDPath, function() {
      device.startDeviceDiscoveryService();
      /***************
      /*Temporary delete 
      ****************/
      /*fs.exists(sNetLinkStatusPath, function(netlinkExists) {
        if (!netlinkExists) {
          cp.exec('touch ' + sNetLinkStatusPath, function(error, stdout, stderr) {
            util.log("touch .netlinkstatus");
            config.NETLINKSTATUSPATH = sNetLinkStatusPath;
            cp.exec('./node_modules/netlink/netlink ' + sNetLinkStatusPath, function(error, stdout, stderr) {
              util.log(sNetLinkStatusPath);
              filesHandle.monitorNetlink(sNetLinkStatusPath);
              });
          });
        } else {
          config.NETLINKSTATUSPATH = sNetLinkStatusPath;
          cp.exec('./node_modules/netlink/netlink ' + sNetLinkStatusPath, function(error, stdout, stderr) {
            util.log(sNetLinkStatusPath);
            filesHandle.monitorNetlink(sNetLinkStatusPath);
          });
        }
      });*/
    });
  });
  // init HTML5 app manager
  appManager.loadAppList();
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
      deviceID = require(uniqueIDPath).uniqueID;
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

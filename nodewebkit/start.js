var config = require("./backend/config");
var server = require("./backend/server");
var router = require("./backend/router");
var msgTransfer = require("./backend/Transfer/msgtransfer");
var fileHandle = require("./backend/filesHandle");
var util = require('util');
var os = require('os');
var fs = require('fs');
var uniqueID=require('./backend/uniqueID');

var handle = {}

config.SERVERIP=config.getAddr();
config.SERVERNAME = os.hostname()+'('+config.SERVERIP+')';
//msgTransfer.initServer();
server.start(router.route, handle);

var cp = require('child_process');
cp.exec('./node_modules/netlink/netlink ./var/.netlinkStatus');
cp.exec('echo $USER',function(error,stdout,stderr){
  var usrname=stdout.replace("\n","");
  util.log('mkdir /home/'+usrname+'/.demo-rio');
  fileHandle.mkdirSync('/home/'+usrname+'/.demo-rio', 0755,function(e){
  	config.USERCONFIGPATH='/home/'+usrname+'/.demo-rio/';
  	fs.exists(config.USERCONFIGPATH+"config.js", function (exists) {
      util.log(config.USERCONFIGPATH+"config.js "+ exists);
      if(exists==false){
        util.log("No data");
      }
      else{
        var dataDir=require(config.USERCONFIGPATH+"config.js").dataDir;
        util.log("monitor : "+dataDir);
        fileHandle.monitorFiles(dataDir,fileHandle.monitorFilesCb);
      }
      fs.exists(config.USERCONFIGPATH+"uniqueID.js", function (exists) {
        if(exists==false){
          console.log("$$$$$$$$$$$$"+config.USERCONFIGPATH+"uniqueID.js$$$$$$$$$$$$$$$$$$$$$$no");
          uniqueID.SetSysUid(function(){
            deviceID=require(config.USERCONFIGPATH+"uniqueID.js").uniqueID;
            console.log("deviceID = "+deviceID);
            config.uniqueID=deviceID;
          });
        }
        else{
          console.log("$$$$$$$$$$$$"+config.USERCONFIGPATH+"uniqueID.js$$$$$$$$$$$$$$$$$$$$$$yes");
          var deviceID=require(config.USERCONFIGPATH+"uniqueID.js").uniqueID;
          console.log("exist deviceID = "+deviceID);
          config.uniqueID=deviceID;
          if(deviceID==undefined){
            uniqueID.SetSysUid(function(){
              deviceID=require(config.USERCONFIGPATH+"uniqueID.js").uniqueID;
              console.log("deviceID = "+deviceID);
              config.uniqueID=deviceID;
            });
          }
        }
      });
    });
    if(e){
        util.log('mkdir /home/'+usrname+'/.demo-rio fail');
    }else{
        util.log('mkdir /home/'+usrname+'/.demo-rio sucess');
    }
  });
 });

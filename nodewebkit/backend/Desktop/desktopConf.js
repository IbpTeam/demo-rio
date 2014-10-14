/**
 * @Copyright:
 * 
 * @Description: API for desktop configuration.
 *
 * @author: Xiquan
 *
 * @Data:2014.10.13
 *
 * @version:0.1.1
 **/
var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var os = require('os');
var config = require("../config");
var dataDes = require("../FilesHandle/desFilesHandle");
var commonDAO = require("../DAO/CommonDAO");
var resourceRepo = require("../FilesHandle/repo");
var util = require('util');
var events = require('events'); 
var uniqueID = require("../uniqueID");
var ThemeConfPath = config.RESOURCEPATH + ".desktop/Theme.conf";
var WidgetConfPath = config.RESOURCEPATH + ".desktop/Widget.conf";



function readThemeConf (callback) {
  fs.readFile(ThemeConfPath,'utf8',function(err,data){
    if (err) {
      console.log("read Theme config file error!");
      console.log(err);
    }
    else{
      var json=JSON.parse(data);
      console.log(json);
      callback(json);
    } 
  });
}
exports.readThemeConf = readThemeConf;

function writeThemeConf (callback,oTheme) {
  var oTheme = JSON.stringify(oTheme,null,4);
  fs.open(ThemeConfPath,"w",0644,function(err,fd){
    if(err){
      console.log("open Theme config file error!");         
    }
    else{
      fs.write(fd,sItem,0,'utf8',function(err){  
        if (err) {
          console.log("write Theme config file error!");
          console.log(err);
        }
        else{
          var currentTime = (new Date());
          config.riolog("time: "+ currentTime);
          var oChanges = {
            lastAccessTime: currentTime,
            lastAccessDev: config.uniqueID;
          }       
          var chItem = ThemeConfPath;
          var attrs = 
          var itemDesPath = ThemeConfPath.replace(/\/resources\//,'/resources/.des/')+".md";
          dataDes.updateItem(chItem,attrs,itemDesPath,function(){
            callback("success");
          });
        }
      });
    }
  });
}
exports.writeThemeConf = writeThemeConf;

function readWidgetConf (callback) {
  fs.readFile(WidgetConfPath,'utf8',function(err,data){
    if (err) {
      console.log("read Theme config file error!");
      console.log(err);
    }
    else{
      var json=JSON.parse(data);
      console.log(json);
      callback(json);
    } 
  });
}
exports.readWidgetConf = readWidgetConf;

function writeThemeConf (callback,oTheme) {
  var oTheme = JSON.stringify(oTheme,null,4);
  fs.open(WidgetConfPath,"w",0644,function(err,fd){
    if(err){
      console.log("open Theme config file error!");         
    }
    else{
      fs.write(fd,sItem,0,'utf8',function(err){  
        if (err) {
          console.log("write Theme config file error!");
          console.log(err);
        }
        else{
          var chItem = WidgetConfPath;
          var attrs = 
          var itemDesPath = WidgetConfPath.replace(/\/resources\//,'/resources/.des/')+".md";
          dataDes.updateItem(chItem,attrs,itemDesPath,function(){
            callback("success");
          });
        }
      });
    }
  });
}
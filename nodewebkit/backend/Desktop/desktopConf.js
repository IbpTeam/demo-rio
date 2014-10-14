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
var uniqueID = require("./uniqueID");


function readThemeConf () {
  var confPath = pathModule.join(config.RESOURCEPATH + "Theme.conf");
  console.log("paaaaaaaaaaaaaaaaaaaath: "+confPath);
}
exports.readThemeConf = readThemeConf;
//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var fileTranfer = require("./fileTransfer");//2014.7.18 by shuanzi
var fs = require('fs');
var config = require('./config');




//add function for file transfer 
//2014.7.18 by xiquan
function sendFileFromLocal(host){
  fileTranfer.startSending(host);
}
exports.sendFileFromLocal = sendFileFromLocal;

//add function for file transfer 
//2014.7.21 by xiquan
function receiveFileFromLocal(path){
  fileTranfer.startReceiving(path);
}
exports.receiveFileFromLocal = receiveFileFromLocal;


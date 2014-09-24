var commonDAO = require("./DAO/CommonDAO");
var fs = require('fs');
var config = require('./config');



//API openDataSourceById: 打开数据
//返回类型：
//回调函数带一个参数，内容是一个div，用于显示应用数据，如果是本地打开文件，则显示成功打开信息
function openLocalDataSourceByPath(openDataSourceCb, content){
  var sys = require('sys');
  var exec = require('child_process').exec;
  var commend = "xdg-open \"" + content + "\"";
  exec(commend, function(error,stdout,stderr){
    sys.print('stdout: ' + stdout);
    sys.print('stderr: ' + error);
  });
  file_content = "成功打开文件" + content;
  openDataSourceCb(file_content);
}
exports.openLocalDataSourceByPath = openLocalDataSourceByPath;

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
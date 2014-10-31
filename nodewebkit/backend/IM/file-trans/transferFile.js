var client = require('./client');
var fileTransferServer = require('./fileTransferServer');
var crypto = require('crypto');

var fileServer;
var fileServerLst;
var pathMap;

function transferCancel(ip, path, callback) { //接收端取消传输文件-----界面显示
  client.transferFileCancel(ip, path, function() {
    serverAndMapHandler(path);
    callback();
  });
}
exports.transferCancel = transferCancel;

function transferProcessing(rstObj) {
  console.log('transferProcessing--------' + rstObj.path + ' ' + ' ' + rstObj.ratio + '   state:' + rstObj.state);
  //此处调用显示进度等传输问题的信息
  if (pathMap.get(rstObj.path) === undefined)
    return;
  switch (rstObj.state) {
    case 0:
      { // 传输过程出错---------界面显示
        console.log('transferProcessing----error  ----' + rstObj.path + ' ' + ' ' + rstObj.ratio);
        serverAndMapHandler(rstObj.path);
        if (rstObj.ratio === 1) { // 传输结束---------界面显示
        } else { // 传输过程出错---------界面显示
          console.log('transferProcessing----error  ----' + rstObj.path + ' ' + ' ' + rstObj.ratio);
        }
      }
      break;
    case 1:
      { //显示进度信息---------正在传输百分之。。。---界面显示  
        console.log('transferProcessing--okkkkkkkkk------' + rstObj.path + ' ' + ' ' + rstObj.ratio);
      }
      break;
    default:
      { //传输结束---------界面显示      
        console.log('transferProcessing----end  ----' + rstObj.path + ' ' + ' ' + rstObj.ratio);
        serverAndMapHandler(rstObj.path);
        if (rstObj.ratio === 1) { // 传输结束---------界面显示
        } else { // 接收端取消传输---------界面显示
        }
      }
  }
}
exports.transferProcessing = transferProcessing;

function transferFile(ip, input, name, callback) {
  //此处调用显示文件传输 接受/拒绝、发送端初始化传输失败 的信息
  client.fileTransferInit(ip, input, name, function(err, rstObj) {
    if (err) { //文件找不到--------界面显示
      console.log('fileTransferInit error:' + rstObj);
    } else { //文件传输 接受/拒绝---------界面显示
      if (rstObj.state === '1') { //接收端选择 接受文件---------界面显示
        console.log('state====接受文件====1');
        fileTransferServer.transferFile(fileServer, fileServerLst, function(err, msg, server, fileServerListening) { //发送端初始化传输信息
          if (err) { //发送端初始化传输信息失败-----有点问题请稍候重发----界面显示  
            // client.fileTransferError(rstObj.file,msg,function(){       
            console.log('transfer------error--------' + msg);
            //   });         
            client.fileTransferStart(true, '', '', '', '', name, 0, function(err, rstObj) {
              serverAndMapHandler();
            });
          } else {
            fileServer = server;
            fileServerLst = fileServerListening;
            var key = MD5(name);
            fileTransferServer.addPath(key, input, function(pathMapTmp) { //发送端初始化传输信息
              pathMap = pathMapTmp;
              //发送端初始化传输信息成功     并发送 “接收端可以进行接受” 的信息
              client.fileTransferStart(false, ip, fileServer.address().port, fileServerLst.address().port, key, name, rstObj.length, function(err, rstObj) {
                if (err || rstObj.state === '0') { //接收端 初始化接收信息失败 或 接收端回复信息出错 ---------界面显示
                  serverAndMapHandler(rstObj.path);
                } else { //显示正在传输文件---------界面显示
                  console.log('transfer------ing--------' + JSON.stringify(rstObj));
                }
              });
            });
          }
        });
      } else { //拒绝---------界面显示
        console.log('how could you refuse me?!');
      }
    }
    callback();
  });
}
exports.transferFile = transferFile;

function serverAndMapHandler(path) {
  console.log('=========serverAndMapHandler===========' + path);
  if (path !== undefined) {
    var file = pathMap.get(path);
    if (file !== undefined) {
      pathMap.remove(path);
      console.log('=========serverAndMapHandler===iiiiiiiiiiiiiiiiiiiiiiiiii========' + pathMap.size());
    }
  }
  if (pathMap.size() === 0) {
    if (fileServer !== undefined) {
      fileServer.close(function() {
        console.log('`````````````````fileServer======close====');
        fileServer = undefined;
      });
    }
    if (fileServerLst !== undefined) {
      fileServerLst.close(function() {
        console.log('`````````````````fileServerLst======close====');
        fileServerLst = undefined;
      });
    }
  }
  
function MD5(str, encoding) {
  return crypto.createHash('md5').update(str).digest(encoding || 'hex');
}
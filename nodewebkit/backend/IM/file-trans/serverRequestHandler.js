var fileTransferClient = require('./fileTransferClient');
var transferFile = require('./transferFile');
var state = '1';

function processFileRequest(msgObj, callback) {
  var msg = msgObj;
  switch (msgObj.option) {
    case 0x0000:
      { //收到发送端传输文件的请求------------界面显示
        msg['state'] = state; //state=1：同意接受;state=0 ：不同意接受------------界面显示
        var ok = state === '1' ? 'yes' : 'no';
        msg['msg'] = 'file-transfer I say  ' + ok;
        callback(msg);
      }
      break;
    case 0x0001:
      { //收到发送端可以进行传输文件的响应      
        if (msgObj.state === '0') { //不可以传输了------------界面显示    
          console.log('sender transfer file cancelled');
        } else {
          var output = __dirname + '/' + msgObj.file + '0';
          fileTransferClient.fileTransfer(msgObj.ip, msgObj.filePort, msgObj.ltnPort, msgObj.path, output, msgObj.length, function(err, rst) { //传输文件       
            console.log('----ooooo-----------oooooooooo--------');
            if (err) { //传输文件失败------------界面显示     
              msg['state'] = '0';
              msg['msg'] = 'transfering error';
            } else { //正在传输文件------------界面显示     
              msg['state'] = '1';
              msg['msg'] == rst;
            }
            callback(msg);
          });
        }
      }
      break;
    case 0x0002:
      { //收到接收文件端的传输文件进度      
        console.log('ininitransferFileProcessing ' + JSON.stringify(msgObj));
        transferFile.transferProcessing(msgObj);
      }
      break;
    case 0x0003:
      { //收到发送端取消传输文件的请求   
        console.log('transferCancel ' + JSON.stringify(msgObj));
        fileTransferClient.cancelTransfer(msgObj.path, function() {
          console.log('server send cancel file transfer');
        });
      }
      break;
    default:
      {
        console.log('processFileRequest default');
      }
  }
}
exports.processFileRequest = processFileRequest
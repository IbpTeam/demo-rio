var net = require('net');
var fs = require('fs');
var os = require('os');

var TIMEOUT = 10000;

function getLocalIP(){
  var IPv4;   
  for(var i=0;i<os.networkInterfaces().eth0.length;i++){      
    if(os.networkInterfaces().eth0[i].family=='IPv4'){        
      IPv4=os.networkInterfaces().eth0[i].address; 
      return IPv4;     
    }  
  } 
  return;
}
function getFileSize(num) {
  var type = 'byte';
  var i = 0;
  while (num > 1000) {
    num /= 1000;
    i++;
  }
  switch (i) {
    case 0:
      type = 'B';
      break;
    case 1:
      type = 'KB';
      break;
    case 2:
      type = 'MB';
      break;
    case 3:
      type = 'GB';
      break;
    case 4:
      type = 'TB';
      break;
    case 5:
      type = 'PB';
      break;
    case 6:
      type = 'EB';
      break;
    case 7:
      type = 'ZB';
      break;
    case 8:
      type = 'YB';
      break;
    default:
      type = 'byte';
  }
  if (num - num.toFixed(2) === 0)
    return num + ' ' + type;
  else return num.toFixed(1) + ' ' + type;
}

function fileTransferInit(path, fileTransferInitCb) {
  if (!fs.existsSync(path)) {
    fileTransferInitCb(true, 'no such a file');
    return false;
  } else {
    var file = fs.statSync(path);
    if (!file || !file.isFile()) {
      fileTransferInitCb(true, 'file stat error');
      return false;
    } else {
      size = file.size;
      if (size === 0) {
        fileTransferInitCb(true, 0);
      } else {
        var buf = path.split('/');
        var name = buf[buf.length - 1];
        fileTransferRequest(name, size, fileTransferInitCb);
      }
    }
  }
}
exports.fileTransferInit=fileTransferInit;

function fileTransferRequest( name, length, callback) {
  var msg = {};
  msg['type'] = 'file'; //获取服务器公钥
  msg['option'] = 0x0000;
  msg['fileName'] = name;
  msg['fileSize'] = getFileSize(length);
  msg['fileLength'] = length;
  msg['msg'] = 'file-transfer do you want to accept ' + name;
  callback(false,msg);
}
function fileTransferStart(err,filePort,msgObj,fileTransferStartCb){
  var msg=msgObj;
  msg['option']=0x0001;
  var IPv4=getLocalIP();
  if(err||IPv4===undefined){
    msg['state']='0';
    msg['msg']='file-transfer you can\'t file '+msg.fileName; 
    fileTransferStartCb(true,msg);
    return;
  }else{      
    msg['state'] = '1';
    msg['ip'] = IPv4;   
    msg['filePort'] = filePort;
    msg['msg'] = 'file-transfer you can get ' + msg.fileName;
    fileTransferStartCb(false,msg);
    return;
  }
}
exports.fileTransferStart=fileTransferStart;

function transferFileRatio(flag, msgObj, ratio, callback) {
  var msg = msgObj;
  msg['type'] = 'file';
  msg['option'] = 0x0002;
  msg['ratio'] = ratio;
  msg['state'] = flag; 
  msg['msg'] = 'file-transfer transferRatio of file ' + msgObj.key + '---' + ratio;
  callback(msg);
}
exports.transferFileRatio = transferFileRatio;

function transferFileCancel(msgObj, state,callback) {
  var msg = msgObj;
  msg['option'] = 0x0003;
  msg['state']=state;
  callback(msg);
}
exports.transferFileCancel = transferFileCancel;

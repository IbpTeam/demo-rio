/**
 * @Copyright:
 * 
 * @Description: API for file handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.9.11
 *
 * @version:0.2.1
 **/

var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var os = require('os');
var config = require("./config");
var dataDes = require("./FilesHandle/desFilesHandle");
var commonDAO = require("./DAO/CommonDAO")
var resourceRepo = require("./FilesHandle/repo");
var device = require("./devices");
var util = require('util');
var events = require('events'); 
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");

var writeDbNum=0;
var dataPath;

function sleep(milliSeconds) { 
  var startTime = new Date().getTime(); 
  while (new Date().getTime() < startTime + milliSeconds);
};
exports.sleep = sleep;

var repoCommitStatus =  'idle';
exports.repoCommitStatus = repoCommitStatus;
var addCommitList = new Array();
var rmCommitList = new Array();
var chCommitList = new Array();
var monitorFilesStatus =  false;
exports.monitorFilesStatus = monitorFilesStatus;
var chokidar = require('chokidar'); 
var watcher;

function uniqueIDHelper(category,oNewItem,itemDesPath,callback){
  uniqueID.getFileUid(function(uri){
    callback(uri,category,oNewItem,itemDesPath);
  })
}

function addData(itemPath,itemDesPath,isLoadEnd,callback){
  var pointIndex=itemPath.lastIndexOf('.');
  if(pointIndex == -1){
    var itemPostfix= "none";
    var nameindex=itemPath.lastIndexOf('/');
    var itemFilename=itemPath.substring(nameindex+1,itemPath.length);
  }else{
    var itemPostfix=itemPath.substr(pointIndex+1);
    var nameindex=itemPath.lastIndexOf('/');
    var itemFilename=itemPath.substring(nameindex+1,pointIndex);
  }
  if(itemPostfix == 'csv' || itemPostfix == 'CSV'){
  }
  else{
  function getFileStatCb(error,stat)
  {
    var mtime=stat.mtime;
    var ctime=stat.ctime;
    var size=stat.size;
    if(itemPostfix == 'none' || 
     itemPostfix == 'ppt' || 
     itemPostfix == 'pptx'|| 
     itemPostfix == 'doc'|| 
     itemPostfix == 'docx'|| 
     itemPostfix == 'wps'|| 
     itemPostfix == 'odt'|| 
     itemPostfix == 'et'|| 
     itemPostfix == 'txt'|| 
     itemPostfix == 'xls'|| 
     itemPostfix == 'xlsx' || 
     itemPostfix == 'ods' || 
     itemPostfix == 'zip' || 
     itemPostfix == 'sh' || 
     itemPostfix == 'gz' || 
     itemPostfix == 'html' || 
     itemPostfix == 'et' || 
     itemPostfix == 'odt' || 
     itemPostfix == 'pdf'){
      var category='Documents';
    uniqueID.getFileUid(function(uri){
      var oNewItem={
        id:"",
        URI:uri + "#" + category,
        category:category,
        commit_id: null,
        version:null,
        is_delete:0,
        others:null,
        filename:itemFilename,
        postfix:itemPostfix,
        size:size,
        path:itemPath,
        project:'上海专项',
        createTime:ctime,
        lastModifyTime:mtime,
        lastAccessTime:ctime,
      };
      function createItemCb(){
        callback(isLoadEnd,oNewItem);
      }
      dataDes.createItem(oNewItem,itemDesPath,createItemCb);
    });
  }
  else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
    var category='Pictures';
    uniqueID.getFileUid(function(uri){
      var oNewItem={
        URI:uri + "#" + category,
        category:category,
        commit_id: null,
        version:null,
        is_delete:0,
        filename:itemFilename,
        postfix:itemPostfix,
        id:null,
        size:size,
        path:itemPath,
        location:"Mars",
        createTime:ctime,
        lastModifyTime:mtime,
        lastAccessTime:ctime,
        others:null,
      };
      function createItemCb(){
        callback(isLoadEnd,oNewItem);
      }
      dataDes.createItem(oNewItem,itemDesPath,createItemCb);
    })
  }
  else if(itemPostfix == 'mp3' || itemPostfix == 'ogg' ){
    var category='Music'; 
    uniqueID.getFileUid(function(uri){
        var oNewItem = {
        id:null,
        URI:uri + "#" + category,
        category:category,
        commit_id: null,
        version:null,
        is_delete:0,
        others:null,
        filename:itemFilename,
        postfix:itemPostfix,
        size:size,
        path:itemPath,
        album:'流行',
        composerName:"Xiquan",
        actorName:"Xiquan",
        createTime:ctime,
        lastModifyTime:mtime,
        lastAccessTime:ctime,
      };
      function createItemCb(){
        callback(isLoadEnd,oNewItem);
      }
      dataDes.createItem(oNewItem,itemDesPath,createItemCb);
    })
  } 
  else{
    writeDbNum --;
  }     
}
fs.stat(itemPath,getFileStatCb);
}
}

function rmData(itemPath,itemDesPath,rmDataCb){
  console.log("rm itemDesPath = "+itemDesPath);
  dataDes.deleteItem(itemPath,itemDesPath,rmDataCb);
}

function chData(itemPath,attrs,itemDesPath,chDataCb){
  console.log("ch itemDesPath = "+itemDesPath);
  dataDes.updateItem(itemPath,attrs,itemDesPath,chDataCb);
}

function watcherStart(monitorPath,callback){
  watcher = chokidar.watch(monitorPath, {ignored: /[\/\\]\./,ignoreInitial: true});
  watcher.on('all', function(event, path) {
    callback(path,event);
  });
}
exports.watcherStart = watcherStart;

function watcherStop(monitorPath,callback){
  watcher.close();
}
exports.watcherStop = watcherStop;

function addFileCb(){
  /******************
  *write DB
  ******************/
  addCommitList.shift();
  if(addCommitList[0]!=null){
    var path=addCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    var isLoadEnd=1;
    addData(path,itemDesPath,isLoadEnd,function(){
      resourceRepo.repoAddCommit(config.RESOURCEPATH,path,desFilePath,addFileCb);
    });
  }
  else if(chCommitList[0]!=null){
    var path=chCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    fs.stat(path,function(error,stat){
      var attrs={
        size:stat.size,
        lastModifyTime:(new Date()).getTime()
      };
      chData(path,attrs,itemDesPath,function(){
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb,attrs);
      });
    });
  }
  else if(rmCommitList[0]!=null){
    var path=rmCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    rmData(path,itemDesPath,function(){
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb);
    });
  }
  else{
    repoCommitStatus = 'idle';  
    util.log("commit complete");
  }
}

function rmFileCb(){
  /******************
  *write DB
  ******************/
  rmCommitList.shift();
  if(rmCommitList[0]!=null){
    var path=rmCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    rmData(path,itemDesPath,function(){
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb);
    });
  }
  else if(addCommitList[0]!=null){
    var path=addCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    var isLoadEnd=1;
    addData(path,itemDesPath,isLoadEnd,function(){
      resourceRepo.repoAddCommit(config.RESOURCEPATH,path,desFilePath,addFileCb);
    });
  }
  else if(chCommitList[0]!=null){
    var path=chCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    fs.stat(path,function(error,stat){
      var attrs={
        size:stat.size,
        lastModifyTime:(new Date()).getTime()
      };
      chData(path,attrs,itemDesPath,function(){
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb,attrs);
      });
    });
  }
  else{
    repoCommitStatus = 'idle';  
    util.log("commit complete");
  }
}

function chFileCb(){
  /******************
  *write DB
  ******************/
  chCommitList.shift();
  if(chCommitList[0]!=null){
    var path=chCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    fs.stat(path,function(error,stat){
      var attrs={
        size:stat.size,
        lastModifyTime:(new Date()).getTime()
      };
      chData(path,attrs,itemDesPath,function(){
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb,attrs);
      });
    });
  }
  else if(addCommitList[0]!=null){
    var path=addCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    var isLoadEnd=1;
    addData(path,itemDesPath,isLoadEnd,function(){
      resourceRepo.repoAddCommit(config.RESOURCEPATH,path,desFilePath,addFileCb);
    });
  }
  else if(rmCommitList[0]!=null){
    var path=rmCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    rmData(path,itemDesPath,function(){
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb);
    });
  }
  else{
    repoCommitStatus = 'idle';  
    util.log("commit complete");
  }
}

function addFile(path){
  util.log("new file "+path);
  addCommitList.push(path);
  if(repoCommitStatus == 'idle'){
    util.log("emit commit "+addCommitList[0]);
    repoCommitStatus = 'busy';  
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    var isLoadEnd=1;
    console.log("itemDesPath="+itemDesPath);
    addData(path,itemDesPath,isLoadEnd,function(){
      resourceRepo.repoAddCommit(config.RESOURCEPATH,path,desFilePath,addFileCb);
    });
  }
}

function rmFile(path){
  util.log("remove file "+path);
  rmCommitList.push(path);
  console.log("repoCommitStatus="+repoCommitStatus);
  if(repoCommitStatus == 'idle'){
    util.log("emit commit "+rmCommitList[0]);
    repoCommitStatus = 'busy';  
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    rmData(path,itemDesPath,function(){
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb);
    });
  }
}

function chFile(path){
  util.log("change file "+path);
  chCommitList.push(path);
  if(repoCommitStatus == 'idle'){
    util.log("emit commit "+chCommitList[0]);
    repoCommitStatus = 'busy';  
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=pathModule.join(config.RESOURCEPATH,".des",addPath);
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    fs.stat(path,function(error,stat){
      var attrs={
        size:stat.size,
        lastModifyTime:stat.mtime
      };
      chData(path,attrs,itemDesPath,function(){
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb,attrs);
      });
    });
  }
}

function monitorFilesCb(path,event){
  util.log(event+'  :  '+path);
  var sConfigPath = pathModule.join(config.USERCONFIGPATH,"config.js");
  var res = path.match(/.git/);
  if(res!=null){
    //util.log(res);
  }
  else{
    switch(event){
      case 'add' : {
        addFile(path);
      }
      break;
      case 'unlink' : {
        rmFile(path);
      }
      break;
      case 'change' : {
        chFile(path);
      }
      break;
    }
  }
}
exports.monitorFilesCb = monitorFilesCb;

function monitorFiles(monitorPath,callback){
  if(monitorFilesStatus==true){
    return;
  }
  monitorFilesStatus=true;
  watcherStart(monitorPath,callback);
}
exports.monitorFiles = monitorFiles;

function initData(loadResourcesCb,resourcePath)
{
  config.riolog("initData ..............");
  dataPath=resourcePath;
  fs.mkdir(dataPath+'/.des',function (err){
    if(err) {
      console.log("mk resourcePath error!");
      console.log(err);
      return;
    }else{
      var fileList = new Array();
      var fileDesDir = new Array();
      var sConfigPath = pathModule.join(config.USERCONFIGPATH,"config.js");
      fs.exists(sConfigPath, function (exists) {
        util.log(sConfigPath+ exists);
        if(exists==false){
          var oldDataDir=null;
        }
        else{
          var oldDataDir=require(sConfigPath).dataDir;
        }
        util.log("oldDataDir = "+oldDataDir);
        if(oldDataDir==null || oldDataDir!=resourcePath){
          var context="var dataDir = '"+resourcePath+"';\nexports.dataDir = dataDir;";
          util.log("write "+config.USERCONFIGPATH+"config.js : " +context);
          fs.writeFile(sConfigPath,context,function(e){
            if(e) throw e;
          });
        }
      });
      function walk(path,pathDes){  
        var dirList = fs.readdirSync(path);
        dirList.forEach(function(item){
          if(fs.statSync(path + '/' + item).isDirectory()){
            if(item != '.git' && item != '.des' && item != 'contacts'){
              fs.mkdir(pathDes + '/' + item, function(err){
                if(err){ 
                  console.log("mkdir error!");
                  console.log(err);
                  //return;
                }
              });              
              walk(path + '/' + item,pathDes + '/' + item);
            }
          }
          else{
            var sPosIndex = (item).lastIndexOf(".");
            var sPos = (sPosIndex == -1) ? "" : (item).substring(sPosIndex,(item).length);
            if(sPos != '.csv' && sPos != '.CSV'){
            fileDesDir.push(pathDes);
            fileList.push(path + '/' + item);
          }
          }
        });
      }
      walk(resourcePath,resourcePath+'/.des');
      config.riolog(fileList); 
      writeDbNum=fileList.length;
      config.riolog('writeDbNum= '+writeDbNum);
      function isEndCallback(){
        resourceRepo.repoInit(resourcePath,loadResourcesCb);
      }
      var oNewItems = new Array();
      for(var k=0;k<fileList.length;k++){
        var isLoadEnd = (k == (fileList.length-1));
        addData(fileList[k],fileDesDir[k],isLoadEnd,function(isLoadEnd,oNewItem){
          oNewItems.push(oNewItem);
          if(isLoadEnd){
            isEndCallback();
            commonDAO.createItems(oNewItems,function(result){
              console.log("initData is end!!!");
              console.log(result);
           });
          }
        });
      }
    }
  });
}
exports.initData = initData;

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb,uri,version,item){
  console.log("Request handler 'updateDataValue' was called.");
  function updateItemValueCb(uri,version,item,result){
    config.riolog("update DB: "+ result);
    if(result!='successfull'){
      filesHandle.sleep(1000);
      commonDAO.updateItemValue(uri,version,item,updateItemValueCb);
    }
    else{
      updateDataValueCb('success');
    }
  }
  commonDAO.updateItemValue(uri,version,item,updateItemValueCb);
}
exports.updateDataValue = updateDataValue;


function monitorNetlink(path){
  /*
  fs.watch(path, function (event, filename) {
    config.riolog('event is: ' + event);
    if(filename){
      config.riolog('filename provided: ' + filename);
      sleep(5000);
      config.SERVERIP=config.getAddr();
      config.SERVERNAME=os.hostname()+'('+config.SERVERIP+')';
    } 
    else{
      config.riolog('filename not provided');
    }
  });
*/
}
exports.monitorNetlink = monitorNetlink;

function openFileByPath(path,callback){
  var  exec = require('child_process').exec;
  var comstr = "bash ./backend/vnc/open.sh -doc \"" + path + "\"";
    //var comstr = "xdg-open " + path;
    console.log("run vncserver and websockify server ......");
    console.log("path server: " , comstr);
    exec(comstr, function(error,stdout,stderr){
      sys.print('stdout: '+stdout);
      callback(stdout);
      sys.print('stderr: '+ error);
      if (error !== null) {
        console.log('exec error: '+error);
      }
    });
  }
  exports.openFileByPath = openFileByPath;

  function closeVNCandWebsockifyServer(port,callback){
    var  exec = require('child_process').exec;
    var comstr = "bash ./backend/vnc/close.sh \"" + port + "\"";
    //var comstr = "xdg-open " + path;
    console.log("closr vncserver and websockify server ......");
    exec(comstr, function(error,stdout,stderr){
      sys.print('stdout: '+stdout);
      callback(stdout);
      sys.print('stderr: '+ error);
      if (error !== null) {
        console.log('exec error: '+error);
      }
    });
  }
  exports.closeVNCandWebsockifyServer = closeVNCandWebsockifyServer;

  function mkdirSync(dirpath, mode, callback) {
    path.exists(dirpath, function(exists) {
      if(exists) {
        callback(dirpath);
      } 
      else {
      //尝试创建父目录，然后再创建当前目录
      mkdirSync(path.dirname(dirpath), mode, function(){
        fs.mkdir(dirpath, mode, callback);
      });
    }
  });

};
exports.mkdirSync = mkdirSync;

function firstSync(){
  resourceRepo.repoMergeForFirstTime(device.devicesList[0].name,
                                     device.devicesList[0].branchName,
                                     device.devicesList[0].ip,
                                     device.devicesList[0].resourcePath,
                                     function(){
    console.log("merge success!");
  });
}
exports.firstSync = firstSync;

/**
 * @method initDatabase
 *    Database initialize.
 */
exports.initDatabase = function(){
  commonDAO.initDatabase();
}

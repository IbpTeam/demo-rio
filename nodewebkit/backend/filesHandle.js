var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var git = require("nodegit");
var fs = require('fs');
var os = require('os');
var config = require("./config");
var dataDes = require("./DataDescription/BuildDescription");
var resourceRepo = require("./repo");
var util = require('util');
var events = require('events'); 


var PORT = 8888;

var writeDbNum=0;
var dataPath;

function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
};
exports.sleep = sleep;

var initCommit;
var repoCommitStatus =  'idle';
exports.repoCommitStatus = repoCommitStatus;
var addCommitList = new Array();
var rmCommitList = new Array();
var chCommitList = new Array();
var monitorFilesStatus =  false;
exports.repoCommitStatus = repoCommitStatus;
var chokidar = require('chokidar'); 
var watcher;

function addData(itemPath,itemDesPath,commitId,isLoadEnd,loadResourcesCb){
  var pointIndex=itemPath.lastIndexOf('.');
  var itemPostfix=itemPath.substr(pointIndex+1);
  var nameindex=itemPath.lastIndexOf('/');
  var itemFilename=itemPath.substring(nameindex+1,pointIndex);
  if(itemPostfix == 'contacts'){
/*    config.riolog("postfix= "+itemPostfix);
    var currentTime = (new Date()).getTime();
    fs.readFile(itemPath, function (err, data) {
      var json=JSON.parse(data);
      config.riolog(json);
      writeDbNum+=json.length-1;
      config.riolog('writeDbNum= '+writeDbNum);
      json.forEach(function(each){
        var category='Contacts';
        var newItem={
          id:null,
          name:each.name,
          phone:each.phone,
          sex:each.sex,
          age:each.age,
          email:each.email,
          photoPath:each.photoPath,
          createTime:null,
          lastModifyTime:null,
          lastAccessTime:currentTime,
          commit_id:commitId,
          is_delete:0
        };
        dataDes.createItem(category,newItem,itemDesPath,isLoadEnd,loadResourcesCb);
      });
    });*/
  }
  else{
    function getFileStatCb(error,stat)
    {
      var mtime=stat.mtime;
      var ctime=stat.ctime;
      var size=stat.size;
      if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == 'zip' || itemPostfix == 'sh' || itemPostfix == 'gz' || itemPostfix == 'html' || itemPostfix == 'et' || itemPostfix == 'odt' || itemPostfix == 'pdf'){
        var category='Documents';
        var newItem={
          id:null,
          filename:itemFilename,
          postfix:itemPostfix,
          size:size,
          path:itemPath,
          project:'上海专项',
          createTime:ctime,
          lastModifyTime:mtime,
          lastAccessTime:ctime,
          others:null,
          commit_id:commitId,
          is_delete:0
        };
        dataDes.createItem(category,newItem,itemDesPath,isLoadEnd,loadResourcesCb);
      }
      else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
        var category='Pictures';
        var newItem={
          id:null,
          filename:itemFilename,
          postfix:itemPostfix,
          size:size,
          path:itemPath,
          createTime:ctime,
          lastModifyTime:mtime,
          lastAccessTime:ctime,
          others:null,
          commit_id:commitId,
          is_delete:0
        };
        dataDes.createItem(category,newItem,itemDesPath,isLoadEnd,loadResourcesCb);
      }
      else if(itemPostfix == 'mp3' || itemPostfix == 'ogg' ){
        var category='Music'; 
        var newItem={
          id:null,
          filename:itemFilename,
          postfix:itemPostfix,
          size:size,
          path:itemPath,
          album:'流行',
          createTime:ctime,
          lastModifyTime:mtime,
          lastAccessTime:ctime,
          others:null,
          commit_id:commitId,
          is_delete:0
        };
        dataDes.createItem(category,newItem,itemDesPath,isLoadEnd,loadResourcesCb);
      } 
      else{
        writeDbNum --;
      }     
    }
    fs.stat(itemPath,getFileStatCb);
  }
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

function repoCommitCb(commitId,op){
  if(op=='New'){
    writeDbNum++;
    addData(addCommitList.shift(),commitId.sha(),function(){
      if(addCommitList[0]!=null){
        resourceRepo.repoAddCommit(dataPath,addCommitList[0],'add',repoCommitCb);
      }
      else if(rmCommitList[0]!=null){
        resourceRepo.repoRmCommit(dataPath,rmCommitList[0],repoCommitCb);
      }  
      else if(chCommitList[0]!=null){
        resourceRepo.repoAddCommit(dataPath,chCommitList[0],'change',repoCommitCb);
      } 
      else{
        repoCommitStatus = 'idle';  
        util.log("commit complete");
      }
    });
  }
  else if(op=='Delete'){
    commonDAO.getItemByPath(rmCommitList.shift(),function (item){
      var updateItem = {
        is_delete:1,
        commit_id:commitId.sha()
      };
      commonDAO.updateItemValue(item.URI,item.version,updateItem,function(){
        if(rmCommitList[0]!=null){
          resourceRepo.repoRmCommit(dataPath,rmCommitList[0],repoCommitCb);
        } 
        else if(addCommitList[0]!=null){
          resourceRepo.repoAddCommit(dataPath,addCommitList[0],'add',repoCommitCb);
        }
        else if(chCommitList[0]!=null){
          resourceRepo.repoAddCommit(dataPath,chCommitList[0],'change',repoCommitCb);
        }       
        else{
          repoCommitStatus = 'idle';  
          util.log("commit complete");
        }
      }); 
    });
  }
  else if(op=='Change'){
    commonDAO.getItemByPath(chCommitList.shift(),function (item){
      fs.stat(item.path,function (error,stat){
        var currentTime = (new Date()).getTime();
        var updateItem = {
          lastModifyTime:currentTime,
          size:stat.size,
          commit_id:commitId.sha()
        };
        commonDAO.updateItemValue(item.URI,item.version,updateItem,function(){
          if(rmCommitList[0]!=null){
            resourceRepo.repoRmCommit(dataPath,rmCommitList[0],repoCommitCb);
          } 
          else if(addCommitList[0]!=null){
            resourceRepo.repoAddCommit(dataPath,addCommitList[0],'add',repoCommitCb);
          }
          else if(chCommitList[0]!=null){
            resourceRepo.repoAddCommit(dataPath,chCommitList[0],'change',repoCommitCb);
          }       
          else{
            repoCommitStatus = 'idle';  
            util.log("commit complete");
          }
        });  
      });
    });
  }
}

function addFile(path,resourcePath){
  dataPath=resourcePath;
  util.log("new file "+path);
  addCommitList.push(path);
  if(repoCommitStatus == 'idle'){
    util.log("emit commit "+addCommitList[0]);
    repoCommitStatus = 'busy';  
    resourceRepo.repoAddCommit(resourcePath,addCommitList[0],'add',repoCommitCb);
  }
}

function rmFile(path,resourcePath){
  dataPath=resourcePath;
  util.log("remove file "+path);
  rmCommitList.push(path);
  if(repoCommitStatus == 'idle'){
    util.log("emit commit "+rmCommitList[0]);
    repoCommitStatus = 'busy';  
    resourceRepo.repoRmCommit(resourcePath,rmCommitList[0],repoCommitCb);
  }
}

function chFile(path,resourcePath){
  dataPath=resourcePath;
  util.log("new file "+path);
  chCommitList.push(path);
  if(repoCommitStatus == 'idle'){
    util.log("emit commit "+chCommitList[0]);
    repoCommitStatus = 'busy';  
    resourceRepo.repoAddCommit(resourcePath,chCommitList[0],'change',repoCommitCb);
  }
}

function monitorFilesCb(path,event){
  util.log(event+'  :  '+path);
  var resourcePath=require(config.USERCONFIGPATH+"config.js").dataDir;
  var res = path.match(/.git/);
  if(res!=null){
    //util.log(res);
  }
  else{
    switch(event){
      case 'add' : {
          addFile(path,resourcePath);
      }
      break;
      case 'unlink' : {
          rmFile(path,resourcePath);
      }
      break;
      case 'change' : {
          chFile(path,resourcePath);
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

function deleteItemCb(uri,result,rmDataByUriCb)
{

  if(result.code=='SQLITE_BUSY'){
    config.riolog(id+'delete error:'+result.code);
    sleep(1000);
    commonDAO.deleteItemByUri(uri,deleteItemCb,rmDataByUriCb);
  }
  else if(result=='successfull'){
    config.riolog(id+'delete:'+result);
    rmDataByUriCb('success');
  }
  else{
    config.riolog(id+'delete:'+result);
    rmDataByUriCb(result);
  }
}
exports.deleteItemCb = deleteItemCb;

function syncDb(loadResourcesCb,resourcePath)
{
  config.riolog("syncDB ..............");
  dataPath=resourcePath;
  fs.mkdir(dataPath+'/.des',function (err){
    if(err) {
      console.log("mk resourcePath error!");
      console.log(err);
      return;
    }else{
      var fileList = new Array();
      var fileDesDir = new Array();
      fs.exists(config.USERCONFIGPATH+"config.js", function (exists) {
        util.log(config.USERCONFIGPATH+"config.js "+ exists);
        if(exists==false){
          var oldDataDir=null;
        }
        else{
          var oldDataDir=require(config.USERCONFIGPATH+"config.js").dataDir;
        }
        util.log("oldDataDir = "+oldDataDir);
        if(oldDataDir==null || oldDataDir!=resourcePath){
          var context="var dataDir = '"+resourcePath+"';\nexports.dataDir = dataDir;";
          util.log("write "+config.USERCONFIGPATH+"config.js : " +context);
          fs.writeFile(config.USERCONFIGPATH+"config.js",context,function(e){
            if(e) throw e;
          });
        }
      });
      function repoInitCb(){
        function walk(path,pathDes){  
          var dirList = fs.readdirSync(path);
          dirList.forEach(function(item){
            if(fs.statSync(path + '/' + item).isDirectory()){
              if(item != '.git' && item != '.des'){
                fs.mkdir(pathDes + '/' + item, function(err){
                  if(err){ 
                    console.log("mkdir error!");
                    console.log(err);
                    return;
                  }
                });              
                walk(path + '/' + item,pathDes + '/' + item);
              }
            }
            else{
              fileDesDir.push(pathDes);
              fileList.push(path + '/' + item);
            }
          });
        }
        walk(resourcePath,resourcePath+'/.des');
        config.riolog(fileList); 
        writeDbNum=fileList.length;
        config.riolog('writeDbNum= '+writeDbNum);
        for(var k=0;k<fileList.length;k++){
          var isLoadEnd = (k == (fileList.length-1));
          addData(fileList[k],fileDesDir[k],initCommit,isLoadEnd,loadResourcesCb);
        }
      }
      git.Repo.init(resourcePath,false,function(initReporError, repo){
        if (initReporError) 
          throw initReporError;
        console.log("Repo init : "+repo);
        var  exec = require('child_process').exec;
        var comstr = 'cd ' + dataPath + ' && git add . && git commit -m "Init"';
        console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn"+comstr);
        exec(comstr, function(error,stdout,stderr){
          resourceRepo.getLatestCommit(dataPath,function (commitId){
            initCommit=commitId.sha();
            util.log("Head : "+commitId);
            monitorFiles(dataPath,monitorFilesCb);
            repoInitCb();
          });
        });
      });
    }
  });
}
exports.syncDb = syncDb;

function monitorNetlink(path){
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
        } else {
                //尝试创建父目录，然后再创建当前目录
                mkdirSync(path.dirname(dirpath), mode, function(){
                        fs.mkdir(dirpath, mode, callback);
                });
        }
    });
};
exports.mkdirSync = mkdirSync;

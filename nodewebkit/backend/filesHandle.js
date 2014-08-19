var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var git = require("nodegit");
var fs = require('fs');
var os = require('os');
var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var resourceRepo = require("./repo");
var util = require('util');
var events = require('events'); 


var PORT = 8888;

var writeDbNum=0;
var writeDbRecentNum=0;
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
        util.log("new file "+path);
        addCommitList.push(path);
        function repoAddCommitCb(){
         //util.log("@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@addCommitList[0]="+addCommitList[0]); 
          if(addCommitList[0]!=null){
            resourceRepo.repoAddCommit(resourcePath,addCommitList.shift(),'add',repoAddCommitCb);
          }      
          else{
            repoCommitStatus = 'idle';  
            util.log("commit complete");
          }
        }
        if(repoCommitStatus == 'idle'){
          util.log("emit commit "+addCommitList[0]);
          repoCommitStatus = 'busy';  
          resourceRepo.repoAddCommit(resourcePath,addCommitList.shift(),'add',repoAddCommitCb);
        }
      }
      break;
    
      case 'unlink' : {
        util.log("remove file "+path);
        rmCommitList.push(path);
        function repoRmCommitCb(){
          if(rmCommitList[0]!=null){
            resourceRepo.repoRmCommit(resourcePath,rmCommitList.shift(),repoRmCommitCb);
          }      
          else{
            repoCommitStatus = 'idle';  
            util.log("commit complete");
          }
        }
        if(repoCommitStatus == 'idle'){
          util.log("emit commit "+rmCommitList[0]);
          repoCommitStatus = 'busy';  
          resourceRepo.repoRmCommit(resourcePath,rmCommitList.shift(),repoRmCommitCb);
        }
      }
      break;

      case 'change' : {
        util.log("new file "+path);
        chCommitList.push(path);
        function repoChCommitCb(){
          if(chCommitList[0]!=null){
            resourceRepo.repoAddCommit(resourcePath,chCommitList.shift(),'change',repoChCommitCb);
          }      
          else{
            repoCommitStatus = 'idle';  
            util.log("commit complete");
          }
        }
        if(repoCommitStatus == 'idle'){
          util.log("emit commit "+chCommitList[0]);
          repoCommitStatus = 'busy';  
          resourceRepo.repoAddCommit(resourcePath,chCommitList.shift(),'change',repoChCommitCb);
        }
      }
      break;
    }
  }
}
exports.monitorFilesCb = monitorFilesCb;

function monitorFiles(monitorPath,callback){

  var chokidar = require('chokidar'); 
  var watcher = chokidar.watch('file or dir', {ignored: /[\/\\]\./, persistent: true});
  watcher
    .on('add', function(path) {
      console.log('File', path, 'has been added');
    })
    .on('addDir', function(path) {
      console.log('Directory', path, 'has been added');
    })
    .on('change', function(path) {
      console.log('File', path, 'has been changed');
    })
    .on('unlink', function(path) {
      console.log('File', path, 'has been removed');
    })
    .on('unlinkDir', function(path) {
      console.log('Directory', path, 'has been removed');
    })
    .on('error', function(error) {
      console.error('Error happened', error);
    })
  watcher.on('change', function(path, stats) {
      console.log('File', path, 'changed size to', stats.size);
    });

  require('chokidar').watch(monitorPath, {ignored: /[\/\\]\./,ignoreInitial: true}).on('all', function(event, path) {
    callback(path,event);
  });
}
exports.monitorFiles = monitorFiles;

function createItemCb(category,item,result,loadResourcesCb)
{

  if(result.code=='SQLITE_BUSY'){
    config.riolog(item.filename+'insert error:'+result.code);
    sleep(1000);
    commonDAO.createItem(category,item,createItemCb,loadResourcesCb);
  }

  else if(result=='successfull'||result.code=='SQLITE_CONSTRAINT'){
    config.riolog(item.filename+'insert:'+result);
    if(category=='recent'){
      writeDbRecentNum--;
    }
    else{
      writeDbNum--;
    }
    config.riolog('writeDbNum= '+writeDbNum);
    config.riolog('writeDbRecentNum= '+writeDbRecentNum);
    if(writeDbNum==0 && writeDbRecentNum==0){
      config.riolog('Read data complete!');
      loadResourcesCb('success');
      monitorFiles(dataPath,monitorFilesCb);
    }
  }
  else{
    config.riolog(item.filename+'insert:'+result);
    config.riolog('Read data failed!');
    loadResourcesCb(result);
  }
}


function deleteItemCb(id,uri,result,rmDataByIdCb)
{

  if(result.code=='SQLITE_BUSY'){
    config.riolog(id+'delete error:'+result.code);
    sleep(1000);
    commonDAO.deleteItemById(id,uri,deleteItemCb,rmDataByIdCb);
  }
  else if(result=='successfull'){
    config.riolog(id+'delete:'+result);
    rmDataByIdCb('success');
  }
  else{
    config.riolog(id+'delete:'+result);
    rmDataByIdCb(result);
  }
}
exports.deleteItemCb = deleteItemCb;



function syncDb(loadResourcesCb,resourcePath)
{
  config.riolog("syncDB ..............");
  dataPath=resourcePath;
  var fileList = new Array();
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
    function walk(path){  
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item){
      if(fs.statSync(path + '/' + item).isDirectory()){
        if(item != '.git'){
          walk(path + '/' + item);
        }
      }
      else{
        fileList.push(path + '/' + item);
      }
    });
  }
  walk(resourcePath);
  config.riolog(fileList); 
  writeDbNum=fileList.length;
  writeDbRecentNum=writeDbNum;
  config.riolog('writeDbNum= '+writeDbNum);
  config.riolog('writeDbRecentNum= '+writeDbRecentNum);
  var contactId=0;
  var documentId=0;
  var pictureId=0;
  var musicId=0;
  fileList.forEach(function(item){
    var pointIndex=item.lastIndexOf('.');
    var itemPostfix=item.substr(pointIndex+1);
    var nameindex=item.lastIndexOf('/');
    var itemFilename=item.substring(nameindex+1,pointIndex);
    config.riolog("read file "+item);

    if(itemPostfix == 'contacts'){
              config.riolog("postfix= "+itemPostfix);
              var currentTime = (new Date()).getTime();
      fs.readFile(item, function (err, data) {
        var json=JSON.parse(data);
        config.riolog(json);
        writeDbNum+=json.length-1;
        writeDbRecentNum+=json.length-1;
        config.riolog('writeDbNum= '+writeDbNum);
        config.riolog('writeDbRecentNum= '+writeDbRecentNum);
        json.forEach(function(each){
          var category='Contacts';
          contactId++;
          var newItem={
            id:contactId,
            name:each.name,
            phone:each.phone,
            sex:each.sex,
            age:each.age,
            email:each.email,
            photoPath:each.photoPath,
            createTime:null,
            lastModifyTime:null,
            lastAccessTime:currentTime
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
          category='recent';
          newItem={
            id:null,
            tableName:'contacts',
            specificId:contactId,
            lastAccessTime:currentTime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
        });
      });
    }
    else{
      function getFileStatCb(error,stat)
      {
        var  exec = require('child_process').exec;
        var comstr = 'cd ' + resourcePath + ' && git add . && git commit -m "Init"';
        console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn"+comstr);
        exec(comstr, function(error,stdout,stderr){
      //repoCommit(resourcePath,item,function (result){
      //  console.log("repoCommit : "+result);
      //  if(result==null)
      //    return;
        var mtime=stat.mtime;
        var ctime=stat.ctime;
        var size=stat.size;
        config.riolog('mtime:'+mtime);
        config.riolog('ctime:'+ctime);
        config.riolog('size:'+size);
        //if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == '' || itemPostfix == 'sh'){
        if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == 'zip' || itemPostfix == 'sh' || itemPostfix == 'gz' || itemPostfix == 'html' || itemPostfix == 'et' || itemPostfix == 'odt' || itemPostfix == 'pdf'){
          var category='Documents';
          documentId++;
          var newItem={
            id:documentId,
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:item,
            project:'上海专项',
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
          category='recent';
          newItem={
            id:null,
            tableName:'documents',
            specificId:documentId,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
        }
        else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
          var category='Pictures';
          pictureId++;
          var newItem={
            id:pictureId,
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:item,
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
          category='recent';
          newItem={
            id:null,
            tableName:'pictures',
            specificId:pictureId,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
        }
        else if(itemPostfix == 'mp3' || itemPostfix == 'ogg' ){
          var category='Music';
          musicId++;
          var newItem={
            id:musicId,
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:item,
            album:'流行',
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
          category='recent';
          newItem={
            id:null,
            tableName:'music',
            specificId:musicId,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
        } 
        else{
          writeDbNum --;
          writeDbRecentNum --;  
        }     
        });
      }
      fs.stat(item,getFileStatCb);

    }
  });
  }
  git.Repo.init(resourcePath,false,function(initReporError, repo){
    if (initReporError) 
      throw initReporError;
    console.log("Repo init : "+repo);
    repoInitCb();
  });

  

}
exports.syncDb = syncDb;

function addNewFolder(addNewFolderCb,resourcePath) {
  config.riolog("add new folders to DB ..............");
  var fileList = new Array();
  function walk(path){  
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item){
      if(fs.statSync(path + '/' + item).isDirectory()){
        walk(path + '/' + item);
      }
      else{
        fileList.push(path + '/' + item);
      }
    });
  }
  walk(resourcePath);
  config.riolog(fileList); 
  writeDbNum=fileList.length;
  writeDbRecentNum=writeDbNum;
  config.riolog('writeDbNum= '+writeDbNum);
  config.riolog('writeDbRecentNum= '+writeDbRecentNum);
  commonDAO.getMaxIdByCategory("Music", function(maxidMusic){
    var musicId = maxidMusic.maxid;
    commonDAO.getMaxIdByCategory("Documents", function(maxidDocuments){
      var documentId = maxidDocuments.maxid;
      console.log("documentId ======: ", documentId);
      commonDAO.getMaxIdByCategory("Pictures", function(maxidPictures){
        var pictureId = maxidPictures.maxid;
        fileList.forEach(function(item){
          var pointIndex=item.lastIndexOf('.');
          var itemPostfix=item.substr(pointIndex+1);
          var nameindex=item.lastIndexOf('/');
          var itemFilename=item.substring(nameindex+1,pointIndex);
          config.riolog("read file "+item);  
          function getFileStatCb(error,stat)
      {
        var mtime=stat.mtime;
        var ctime=stat.ctime;
        var size=stat.size;
        config.riolog('mtime:'+mtime);
        config.riolog('ctime:'+ctime);
        config.riolog('size:'+size);
        if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == 'zip' || itemPostfix == 'sh' || itemPostfix == 'gz' || itemPostfix == 'html' || itemPostfix == 'et' || itemPostfix == 'odt' || itemPostfix == 'pdf'){
          var category='Documents';
          documentId++;
          var newItem={
            id:documentId,
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:item,
            project:'上海专项',
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,addNewFolderCb);
          category='recent';
          newItem={
            id:null,
            tableName:'documents',
            specificId:documentId,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,addNewFolderCb);
        }
        else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
          var category='Pictures';
          pictureId++;
          var newItem={
            id:pictureId,
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:item,
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,addNewFolderCb);
          category='recent';
          newItem={
            id:null,
            tableName:'pictures',
            specificId:pictureId,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,addNewFolderCb);
        }
        else if(itemPostfix == 'mp3' || itemPostfix == 'ogg' ){
          var category='Music';
          musicId++;
          var newItem={
            id:musicId,
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:item,
            album:'流行',
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,addNewFolderCb);
          category='recent';
          newItem={
            id:null,
            tableName:'music',
            specificId:musicId,
            lastAccessTime:ctime,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,addNewFolderCb);
        }
        else{
          writeDbNum --;
          writeDbRecentNum --;
        }        
      }     
          fs.stat(item,getFileStatCb);
        });
      });
    });
  });
}
exports.addNewFolder = addNewFolder;

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
/*
function mkdirSync(url,mode,cb){
    var path = require("path"), arr = url.split("/");
                util.log("mkdir "+cur);
    mode = mode || 0755;
    cb = cb || function(){};
    if(arr[0]==="."){//处理 ./aaa
        arr.shift();
    }
    if(arr[0] == ".."){//处理 ../ddd/d
        arr.splice(0,2,arr[0]+"/"+arr[1])
    }
    function inner(cur){
        if(!path.existsSync(cur)){//不存在就创建一个
            util.log("mkdir "+cur);
            fs.mkdirSync(cur, mode);
        }
        if(arr.length){
            inner(cur + "/"+arr.shift());
        }else{
            cb();
        }
    }
    arr.length && inner(arr.shift());
}
*/
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

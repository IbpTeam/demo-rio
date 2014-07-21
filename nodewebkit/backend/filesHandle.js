var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");

var PORT = 8888;

var writeDbNum=0;
var writeDbRecentNum=0;

function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
};
exports.sleep = sleep;

function createItemCb(category,item,result,loadResourcesCb)
{

  if(result.code=='SQLITE_BUSY'){
    config.riolog(item.filename+'insert error:'+result.code);
    sleep(1000);
    commonDAO.createItem(category,item,createItemCb,loadResourcesCb);
  }
  else if(result=='successfull'){
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
      
    }
  }
  else{
    config.riolog(item.filename+'insert:'+result);
    config.riolog('Read data failed!');
    loadResourcesCb(result);
  }
}


function deleteItemCb(id,result,rmDataByIdCb)
{

  if(result.code=='SQLITE_BUSY'){
    config.riolog(id+'delete error:'+result.code);
    sleep(1000);
    commonDAO.deleteItemById(id,deleteItemCb,rmDataByIdCb);
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
            lastModifyTime:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
          category='recent';
          newItem={
            id:null,
            tableName:'contacts',
            specificId:contactId,
            lastAccessTime:null,
            others:null
          };
          commonDAO.createItem(category,newItem,createItemCb,loadResourcesCb);
        });
      });
    }
    else{
      function getFileStatCb(error,stat)
      {
        var mtime=stat.mtime;
        var ctime=stat.ctime;
        var size=stat.size;
        config.riolog('mtime:'+mtime);
        config.riolog('ctime:'+ctime);
        config.riolog('size:'+size);
        if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == '' || itemPostfix == 'sh'){
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

      }
      fs.stat(item,getFileStatCb);

    }
  });

}
exports.syncDb = syncDb;

function monitorFiles(path){
  fs.watch(path, function (event, filename) {
    config.riolog('event is: ' + event);
    if(filename){
      config.riolog('filename provided: ' + filename);
    } 
    else{
      config.riolog('filename not provided');
    }
  });
}
exports.monitorFiles = monitorFiles;

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

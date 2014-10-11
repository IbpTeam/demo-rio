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
var commonDAO = require("./DAO/CommonDAO");
var resourceRepo = require("./FilesHandle/repo");
var device = require("./devices");
var util = require('util');
var events = require('events'); 
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");
var tagsHandles = require("./tagsHandle");

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
var monitorFiles1Status =  false;
exports.monitorFiles1Status = monitorFiles1Status;
var chokidar = require('chokidar'); 
var watcher1;
var watcher2;
var isPulledFile;

function getCategory(path){
  var pointIndex=path.lastIndexOf('.');
    if(pointIndex == -1){
      var itemPostfix= "none";
      var nameindex=path.lastIndexOf('/');
      var itemFilename=path.substring(nameindex+1,path.length);
  }else{
      var itemPostfix=path.substr(pointIndex+1);
      var nameindex=path.lastIndexOf('/');
      var itemFilename=path.substring(nameindex+1,pointIndex);
  }
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
    return {category:"Documents",filename:itemFilename,postfix:itemPostfix};
  }
  else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
    return {category:"Pictures",filename:itemFilename,postfix:itemPostfix};
  }
  else if(itemPostfix == 'mp3' || itemPostfix == 'ogg'){
    return {category:"Music",filename:itemFilename,postfix:itemPostfix};
  }
}

function addData(itemPath,itemDesPath,isLoadEnd,callback){
  function getFileStatCb(error,stat){
    var mtime=stat.mtime;
    var ctime=stat.ctime;
    var size=stat.size;
    var cate=getCategory(itemPath);
    var category=cate.category;
    var itemFilename=cate.filename;
    var itemPostfix=cate.postfix;
    var someTags = tagsHandles.getTagsByPath(itemPath);
    switch (category) {
      case "Documents":{
        uniqueID.getFileUid(function(uri){
          var oNewItem={
            id:"",
            URI:uri + "#" + category,
            category:category,
            is_delete:0,
            others:someTags.join(","),
            filename:itemFilename,
            postfix:itemPostfix,
            size:size,
            path:itemPath,
            project:'上海专项',
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            createDev:config.uniqueID,
            lastModifyDev:config.uniqueID,
            lastAccessDev:config.uniqueID
          };
          function createItemCb(){
            callback(isLoadEnd,oNewItem);
          }
          dataDes.createItem(oNewItem,itemDesPath,createItemCb);
        });
        break;
      }
      case "Pictures":{
        uniqueID.getFileUid(function(uri){
          var oNewItem={
            URI:uri + "#" + category,
            category:category,
            is_delete:0,
            others:someTags.join(","),
            postfix:itemPostfix,
            filename:itemFilename,
            id:null,
            size:size,
            path:itemPath,
            location:"Mars",
            createTime:ctime,
            lastModifyTime:mtime,
            lastAccessTime:ctime,
            createDev:config.uniqueID,
            lastModifyDev:config.uniqueID,
            lastAccessDev:config.uniqueID
          };
          function createItemCb(){
            callback(isLoadEnd,oNewItem);
          }
          dataDes.createItem(oNewItem,itemDesPath,createItemCb);
        });
        break;
      }
      case "Music":{
        uniqueID.getFileUid(function(uri){
          var oNewItem = {
            id:null,
            URI:uri + "#" + category,
            category:category,
            is_delete:0,
            others:someTags.join(","),
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
            createDev:config.uniqueID,
            lastModifyDev:config.uniqueID,
            lastAccessDev:config.uniqueID
          };
          function createItemCb(){
            callback(isLoadEnd,oNewItem);
          }
          dataDes.createItem(oNewItem,itemDesPath,createItemCb);
        });
        break;
      }
      default:{
        writeDbNum --;    
      }
    }
  }
  fs.stat(itemPath,getFileStatCb);
}

function rmData(itemPath,itemDesPath,rmDataCb){
  console.log("rm itemDesPath = "+itemDesPath);
  dataDes.deleteItem(itemPath,itemDesPath,rmDataCb);
}

function chData(itemPath,attrs,itemDesPath,chDataCb){
  console.log("ch itemDesPath = "+itemDesPath);
  dataDes.updateItem(itemPath,attrs,itemDesPath,chDataCb);
}

function watcher1Start(monitorPath,callback){
  watcher1 = chokidar.watch(monitorPath, {ignored: /[\/\\]\./,ignoreInitial: true});
  watcher1.on('all', function(event, path) {
    callback(path,event);
  });
}
exports.watcher1Start = watcher1Start;

function watcher1Stop(callback){
  watcher1.close();
  callback();
}
exports.watcher1Stop = watcher1Stop;

function watcher2Start(monitorPath,callback){
  watcher2 = chokidar.watch(monitorPath, {ignoreInitial: true});
  watcher2.on('all', function(event, path) {
    callback(path,event);
  });
}
exports.watcher2Start = watcher2Start;

function watcher2Stop(callback){
  watcher2.close();
  callback();
}
exports.watcher2Stop = watcher2Stop;

function addFileCb(lastCallback){
  /******************
  *write DB
  ******************/
  if(lastCallback!=null){
    lastCallback();
    return;
  }
  addCommitList.shift();
  if(addCommitList[0]!=null){
    var path=addCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    var isLoadEnd=true;
    addData(path,itemDesPath,isLoadEnd,function(isLoadEnd,oNewItem){
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
        lastModifyTime:(new Date()).getTime(),
        lastModifyDev:config.uniqueID
      };
      chData(path,attrs,itemDesPath,function(){
        attrs.conditions=["path='"+path+"'"];
        attrs.category=getCategory(path).category;
        var items= new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb);
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
      var attrs={
        conditions:["path='"+path+"'"],
        category:getCategory(path).category,
        is_delete:1
      };
      var items= new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb);
    });
  }
  else{
    repoCommitStatus = 'idle';  
    util.log("commit complete");
  }
}

function rmFileCb(lastCallback){
  /******************
  *write DB
  ******************/
  if(lastCallback!=null){
    lastCallback();
    return;
  }
  rmCommitList.shift();
  if(rmCommitList[0]!=null){
    var path=rmCommitList[0];
    var nameindex=path.lastIndexOf('/');
    var addPath=path.substring(config.RESOURCEPATH.length+1,nameindex);
    var itemDesPath=config.RESOURCEPATH+"/.des/"+addPath;
    var fileName=path.substring(nameindex+1,path.length);
    var desFilePath=itemDesPath+"/"+fileName+".md";
    rmData(path,itemDesPath,function(){
      var attrs={
        conditions:["path='"+path+"'"],
        category:getCategory(path).category,
        is_delete:1
      };
      var items= new Array();
      items.push(attrs);
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
    var isLoadEnd=true;
    addData(path,itemDesPath,isLoadEnd,function(isLoadEnd,oNewItem){
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
        lastModifyTime:(new Date()).getTime(),
        lastModifyDev:config.uniqueID
      };
      chData(path,attrs,itemDesPath,function(){
        attrs.conditions=["path='"+path+"'"];
        attrs.category=getCategory(path).category;
        var items= new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb);
      });
    });
  }
  else{
    repoCommitStatus = 'idle';  
    util.log("commit complete");
  }
}

function chFileCb(lastCallback){
  /******************
  *write DB
  ******************/
  if(lastCallback!=null){
    lastCallback();
    return;
  }
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
        lastModifyTime:(new Date()).getTime(),
        lastModifyDev:config.uniqueID
      };
      chData(path,attrs,itemDesPath,function(){
        attrs.conditions=["path='"+path+"'"];
        attrs.category=getCategory(path).category;
        var items= new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb);
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
    var isLoadEnd=true;
    addData(path,itemDesPath,isLoadEnd,function(isLoadEnd,oNewItem){
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
      var attrs={
        conditions:["path='"+path+"'"],
        category:getCategory(path).category,
        is_delete:1
      };
      var items= new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb);
    });
  }
  else{
    repoCommitStatus = 'idle';  
    util.log("commit complete");
  }
}

function addFile(path,callback){
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
    var isLoadEnd=true;
    console.log("itemDesPath="+itemDesPath);
    addData(path,itemDesPath,isLoadEnd,function(isLoadEnd,oNewItem){
      resourceRepo.repoAddCommit(config.RESOURCEPATH,path,desFilePath,addFileCb,callback);
    });
  }
}
exports.addFile = addFile;

function rmFile(path,callback){
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
      var attrs={
        conditions:["path='"+path+"'"],
        category:getCategory(path).category,
        is_delete:1
      };
      var items= new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH,path,desFilePath,rmFileCb,callback);
    });
  }
}
exports.rmFile = rmFile;

function chFile(path,callback){
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
        lastModifyTime:stat.mtime,
        lastModifyDev:config.uniqueID
      };
      chData(path,attrs,itemDesPath,function(){
        attrs.conditions=["path='"+path+"'"];
        attrs.category=getCategory(path).category;
        var items= new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH,path,desFilePath,chFileCb,callback);
      });
    });
  }
}
exports.chFile = chFile;


/**
 * @method getAllCate
 *   查询所有基本分类
 *
 * @param1 getAllCateCb
 *   回调函数
 *   @result
 *     array[cate]: 分类数组
 *        cate{
 *           id;
 *           type;
 *           path;
 *        }
 */
function getAllCate(getAllCb) {
  function getCategoriesCb(err,items)
  {
    if(err){
      console.log(err);
      return;
    }
    var cates = new Array();
    items.forEach(function (each){
      cates.push({
        URI:each.id,
        version:each.version,
        type:each.type,
        path:each.logoPath,
        desc:each.desc
      });
    });
    getAllCb(cates);
  }
  commonDAO.findItems(null,['category'],null,null,getCategoriesCb);
}
exports.getAllCate = getAllCate;

/**
 * @method getAllDataByCate
 *   查询某基本分类下的所有数据
 *
 * @param1 getAllDataByCateCb
 *   回调函数
 *   @result
 *     array[cate]: 数据数组
 *        如果是联系人，则返回数据如下：
 *        cate{
 *           URI;
 *           version;
 *           name;
 *           photPath;
 *        }
 *        如果是其他类型，则返回数据如下：
 *        cate{
 *           URI;
 *           version;
 *           filename;
 *           postfix;
 *           path;
 *        }
 */
function getAllDataByCate(getAllData,cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
    function getAllByCaterotyCb(err,items)
    {
      if(err){
        console.log(err);
        return;
      }
      var cates = new Array();
      items.forEach(function (each){
        cates.push({
          URI:each.URI,
          version:each.version,
          filename:each.filename,
          postfix:each.postfix,
          path:each.path
        });
      });
      getAllData(cates);
    }
    function getAllDevicesCb(err, items){
      if(err){
        console.log(err);
        return;
      }
      getAllData(items);
    }
    var cateArray = new Array();
    cateArray.push(cate);
    if(cate == "Devices"){
      commonDAO.findItems(null,cateArray,null,null,getAllDevicesCb);
    }
    else{
      var conditions = ["is_delete = 0"];
      commonDAO.findItems(null,cateArray,conditions,null,getAllByCaterotyCb);
    }
}
exports.getAllDataByCate = getAllDataByCate;

function monitorDesFilesCb(path,event){
  util.log(event+'  :  '+path);
  switch(event){
    case 'add' : {
      console.log("add des file @@@@@@@@@@@@@@@@@@@@@");
      dataDes.getAttrFromFile(path,function(item){
        commonDAO.createItem(item,function(result){
          console.log(result);
        });
      });
    }
    break;
    case 'unlink' : {
      console.log("unlink des file @@@@@@@@@@@@@@@@@@@@@");
      var desPathIndex=path.lastIndexOf(".des");
      var filePath=path.substring(desPathIndex,path.length);
      var nextIndex=filePath.indexOf("/");
      filePath=filePath.substring(nextIndex+1,filePath.length);
      console.log("filePath = "+filePath);
      var mdIndex=filePath.lastIndexOf(".md");
      var origPath=config.RESOURCEPATH+"/"+filePath.substring(0,mdIndex);
      console.log("origPath = "+origPath);
      var attrs={
        conditions:["path='"+origPath+"'"],
        category:getCategory(origPath).category,
        is_delete:1,
        lastModifyTime:(new Date()),
        lastModifyDev:config.uniqueID
      };
      var items=new Array();
      items.push(attrs);
      commonDAO.updateItems(items,function(result){
        console.log(result);
      });
    }
    break;
    case 'change' : {
      console.log("change des file @@@@@@@@@@@@@@@@@@@@@");
      dataDes.getAttrFromFile(path,function(item){
        if(item.category=="Contacts"){
          console.log("contacts info change");
        }else{
          var column = ["uri"];
          var table = [item.category];
          var condition = ["path='"+item.path+"'"];
          commonDAO.findItems(column,table,condition,null,function(err,resultFind){
            if(err){
              console.log(err);
              return;
            }
            if(resultFind.length == 1){
              var tags = (resultFind[0].others).split(",");
              var itemToDelete = [];
              for(var k in tags){
                var itemTemp = {file_uri:item.uri,category:"tags",tag:tags[k]};
                itemToDelete.push(itemTemp);
              }
              commonDAO.deleteItems(itemToDelete,function(resultDelete){
                if(resultDelete == "success"){
                  item.conditions=["path='"+item.path+"'"];
                  var items=new Array();
                  items.push(item);
                  commonDAO.updateItems(items,function(resultUpdate){
                    console.log(resultUpdate);
                  });
                }else{
                  console.log("delete items error!");
                  return;
                }
              });
            }else{
              console.log("findItems result size error!");
              return;
            }
          })
        }
      });
    }
    break;
  }
}
exports.monitorDesFilesCb = monitorDesFilesCb;

function monitorFilesCb(path,event){
  util.log(event+'  :  '+path);
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
  if(monitorFiles1Status==true){
    return;
  }
  monitorFiles1Status=true;
  watcher1Start(monitorPath,callback);
}
exports.monitorFiles = monitorFiles;

function initData(loadResourcesCb,resourcePath){
  config.riolog("initData ..............");
  dataPath=resourcePath;
  fs.mkdir(dataPath+'/.des',function (err){
    if(err) {
      console.log("mk resourcePath error!");
      console.log(err);
      return;
    }
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
    var fileList = new Array();
    var fileDesDir = new Array();
    function walk(path,pathDes){  
      var dirList = fs.readdirSync(path);
      dirList.forEach(function(item){
        if(fs.statSync(path + '/' + item).isDirectory()){
          if(item != '.git' && item != '.des' && item != 'contacts'){
            fs.mkdirSync(pathDes + '/' + item);              
            walk(path + '/' + item,pathDes + '/' + item);
          }
        }else{
          var sPosIndex = (item).lastIndexOf(".");
          var sPos = item.slice(sPosIndex+1,item.length);
          if(sPos != 'csv' && sPos != 'CSV'){
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

        var oTags = (oNewItem.others).split(",");
        for(var k in oTags){
          var item ={
            category:"tags",
            tag:oTags[k],
            file_URI:oNewItem.URI
          }
          oNewItems.push(item);
        }

        if(isLoadEnd){
          isEndCallback();
          commonDAO.createItems(oNewItems,function(result){
            console.log(result);
            console.log("initData is end!!!");
          });
        }
      });
    }
  });
}
exports.initData = initData;

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
function updateDataValue(updateDataValueCb,item){
  var oItems = item;//all items should include it's file path
  console.log("Request handler 'updateDataValue' was called.");
  function updateItemValueCb(result){
    config.riolog("update DB: "+ result);
    if(result!='commit'){
      console.log("Error : result : "+result)
    }
    else{
      dataDes.updateItems(oItems,function(result){
        if(result === "success"){
          updateDataValueCb('success');
        }else{
          console.log("error in update des file!");
          return;
        }
      });
    }
  }
}
exports.updateDataValue = updateDataValue;

//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataByUri(rmDataByUriCb, uri) {
  var rm_result;
  function getItemByUriCb(err,items){
    if(items == null){
       rm_result='success';
       rmDataByUriCb(rm_result);
    }
    else{
      function ulinkCb(result){
        config.riolog("delete result:"+result);
        if(result==null){
          result='success';

          var pos = (items[0].URI).lastIndexOf("#");
          var sTableName = (items[0].URI).slice(pos+1,uri.length);
          items[0].category = sTableName;
          commonDAO.deleteItems(items,rmDataByUriCb);
        }
        else{
          result='error';
          rmDataByUriCb(result);
        }
      }
      fs.unlink(items[0].path,ulinkCb);
    }
  }

  var pos = uri.lastIndexOf("#");
  var sTableName = uri.slice(pos+1,uri.length);
  commonDAO.findItems(null,[sTableName],["URI = "+"'"+uri+"'"],null,getItemByUriCb);
}
exports.rmDataByUri = rmDataByUri;


//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByUri(getDataCb,uri) {
    console.log("read data : "+ uri);
  function getItemByUriCb(err,items){
    if(err){
      console.log(err)
      return;
    }
    getDataCb(items);
  }

  var pos = uri.lastIndexOf("#");
  var sTableName = uri.slice(pos+1,uri.length);
  commonDAO.findItems(null,[sTableName],["URI = "+"'"+uri+"'"],null,getItemByUriCb);
}
exports.getDataByUri = getDataByUri;


//API getDataSourceByUri:通过Uri获取数据资源地址
//返回类型：
//result{
//  openmethod;//三个值：'direct'表示直接通过http访问;'remote'表示通过VNC远程访问;'local'表示直接在本地打开
//  content;//如果openmethod是'direct'或者'local'，则表示路径; 如果openmethod是'remote'，则表示端口号
//}
function getDataSourceByUri(getDataSourceCb,uri){
  function getItemByUriCb(err,items){
    if(err){
      console.log(err);
      return;
    }    
    var item = items[0];
    if(item==null){
      config.riolog("read data : "+ item);
      getDataSourceCb('undefined');
    }
    else{
      config.riolog("read data : "+ item.path);
      if(item.postfix==null){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix=='none'||
              item.postfix=='jpg'||
              item.postfix=='png'||
              item.postfix=='txt'||
              item.postfix=='ogg'){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix == 'ppt' ||
              item.postfix == 'pptx'|| 
              item.postfix == 'doc'|| 
              item.postfix == 'docx'|| 
              item.postfix == 'wps'|| 
              item.postfix == 'odt'|| 
              item.postfix == 'et'||  
              item.postfix == 'xls'|| 
              item.postfix == 'xlsx'){
        item.path = decodeURIComponent(item.path);
        var source={
          openmethod:'local',
          content:item.path
        };
      }
      else {
        item.path = decodeURIComponent(item.path);
        var source={
          openmethod:'local',
          content:item.path
        };
      }
      getDataSourceCb(source);

      var currentTime = (new Date());
      config.riolog("time: "+ currentTime);
      var updateItem = item;
      //console.log(updateItem);
      updateItem.lastAccessTime = currentTime;
      updateItem.lastAccessDev = config.uniqueID;
      var item_uri = item.URI;
      var pos = (item_uri).lastIndexOf("#");
      var sTableName = (item_uri).slice(pos+1,updateItem.length);
      updateItem.category = sTableName;

      function updateItemValueCb(result){
        config.riolog("update DB: "+ result);
        if(result!='commit'){
          console.log("Error : updateItems result : "+ ressult);
          return;
        }
        else{
          var desFilePath = (item.path).replace(/\/resources\//,'/resources/.des/');
          desFilePath = desFilePath + '.md';
          dataDes.updateItem(item.path,{lastAccessTime:currentTime},desFilePath,function(){
            console.log("success");
          })
        }
      }
    }
  }
  var pos = uri.lastIndexOf("#");
  var sTableName = uri.slice(pos+1,uri.length);
  commonDAO.findItems(null,[sTableName],["URI = "+"'"+uri+"'"],null,getItemByUriCb);
}
exports.getDataSourceByUri = getDataSourceByUri;


//API getRecentAccessData:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getRecentAccessData(getRecentAccessDataCb,num){
  var cateNum = 0;
  var Data = {};
  var DataSort = [];
  function getAllCateCb(categories){
    cateNum = categories.length;
    for(var k in categories){
      var sType = categories[k].type;
      function findItemsCb(err,items){
        if(err){
          console.log(err);
          return;
        }
        cateNum--;
        for(var k=0;k<items.length;k++){
          var item = items[k];
          var sKey =Date.parse(item.lastAccessTime);
          Data[sKey+k] = item;
          DataSort.push(sKey+k);
        }
        if(cateNum == 2){
          var oNewData = [];
          DataSort.sort();
          for(var k in DataSort){
            oNewData.push(Data[DataSort[k]]);
          }
          var DataByNum = oNewData.slice(0,num);
          getRecentAccessDataCb(DataByNum);
          for(var k in DataByNum){
            console.log(DataByNum[k].lastAccessTime);
          }
        }
      }
      if(sType != "Devices" && sType != "Contacts"){
        var sCondition = " order by date(lastAccessTime) desc,  time(lastAccessTime) desc limit "+"'"+num+"'";
        commonDAO.findItems(null,[sType],null,[sCondition],findItemsCb);
      }  
    }
  }
  getAllCate(getAllCateCb);
}
exports.getRecentAccessData = getRecentAccessData;


function monitorNetlink(path){
  util.log('neeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeet '+path);
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

  resourceRepo.pullFromOtherRepo("192.168.160.72",
                                 "/home/v1/resources",
                                 function(){
    console.log("merge success!");
  });
}
exports.firstSync = firstSync;

/**
 * @method initDatabase
 *    Database initialize.
 * @param callaback
 *    Callback
 */
exports.initDatabase = function(callback){
  commonDAO.initDatabase(callback);
}

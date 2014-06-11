var http = require("http");
var url = require("url");
var sys = require('sys');
var path = require('path');
var fs = require('fs');
var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");

var PORT = 8888;

var writeDbNum=0;

function sleep(milliSeconds) { 
    var startTime = new Date().getTime(); 
    while (new Date().getTime() < startTime + milliSeconds);
};

function createItemCb(category,item,result,loadResourcesCb)
{

  if(result.code=='SQLITE_BUSY'){
    console.log(item.filename+'insert error:'+result.code);
    sleep(1000);
    commonDAO.createItem(category,item,createItemCb,loadResourcesCb);
  }
  else if(result=='successfull'){
    console.log(item.filename+'insert:'+result);
    writeDbNum--;
    console.log('writeDbNum= '+writeDbNum);
    if(writeDbNum==0){
      console.log('Read data complete!');
      loadResourcesCb('success');
    }
  }
  else{
    console.log(item.filename+'insert:'+result);
    console.log('Read data failed!');
    loadResourcesCb(result);
  }
}

function deleteItemCb(id,result,rmDataByIdCb)
{

  if(result.code=='SQLITE_BUSY'){
    console.log(id+'delete error:'+result.code);
    sleep(1000);
    commonDAO.deleteItemById(id,deleteItemCb,rmDataByIdCb);
  }
  else if(result=='successfull'){
    console.log(id+'delete:'+result);
    rmDataByIdCb('success');
  }
  else{
    console.log(id+'delete:'+result);
    rmDataByIdCb(result);
  }
}
exports.deleteItemCb = deleteItemCb;

function syncDb(loadResourcesCb,resourcePath)
{
  console.log("syncDB ..............");
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
  console.log(fileList); 
  writeDbNum=fileList.length;
  console.log('writeDbNum= '+writeDbNum);
  fileList.forEach(function(item){
    var pointIndex=item.lastIndexOf('.');
    var itemPostfix=item.substr(pointIndex+1);
    var nameindex=item.lastIndexOf('/');
    var itemFilename=item.substring(nameindex+1,pointIndex);
    console.log("read file "+item);

    if(itemPostfix == 'contacts'){
              console.log("postfix= "+itemPostfix);
      fs.readFile(item, function (err, data) {
        var json=JSON.parse(data);
        console.log(json);
        writeDbNum+=json.length-1;
        console.log('writeDbNum= '+writeDbNum);
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
            lastModifyTime:null
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
        console.log('mtime:'+mtime);
        console.log('ctime:'+ctime);
        console.log('size:'+size);
        if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx'){
          var category='Documents';
          var newItem={
            id:null,
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
        }
        else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
          var category='Pictures';
          var newItem={
            id:null,
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
        }
        else if(itemPostfix == 'mp3' ){
          var category='Music';
          var newItem={
            id:null,
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
        }        

      }
      fs.stat(item,getFileStatCb);

    }
  });

}

exports.syncDb = syncDb;

function start(route, handle) {
  function onRequest(request, response) {
    var postData = "";
        console.log(url.parse(request.url));
    var pathname = url.parse(request.url).pathname;
    var absolute = url.parse(request.url).query;

    console.log("Request for " + pathname + " received.");
    console.log("Request for " + absolute );
    request.setEncoding("utf8");

    request.addListener("data", function(postDataChunk) {
      postData += postDataChunk;
      console.log("Received POST data chunk '"+ postDataChunk + "'.");
    });
    request.addListener("end", function() {
      route(handle, pathname, absolute, response, postData);
    });

  }

  http.createServer(onRequest).listen(PORT);
  console.log("Server has started.");
}

exports.start = start;

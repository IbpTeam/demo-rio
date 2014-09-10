//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var fileTranfer = require("./fileTransfer");//2014.7.18 by shuanzi
var fs = require('fs');
var config = require('./config');
var dataDes = require("./DataDescription/BuildDescription");

var localflag=1;
exports.localflag = localflag;

function loadResourcesFromLocal(loadResourcesCb,path) {
  filesHandle.syncDb(loadResourcesCb,path);
}
exports.loadResourcesFromLocal = loadResourcesFromLocal;

function addNewFolderFromLocal(addNewFolderCb,path) {
  filesHandle.addNewFolder(addNewFolderCb,path);
}
exports.addNewFolderFromLocal = addNewFolderFromLocal;

function getAllCateFromLocal(getAllCateCb) {
  var cates = new Array();
  dataDes.getAttrValues("category",function(files){
    files.forEach(function(file){
      var item = {
        type:file
      };
      cates.push(item);
    });
    getAllCateCb(cates);
  });
}
exports.getAllCateFromLocal = getAllCateFromLocal;

function getAllDataByCateFromLocal(getAllDataByCateCb,cate) {
  console.log("================----------------------++++++++++++++++++++=");
  function getAllByCaterotyCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        URI:each.URI,
        version:each.version,
        filename:each.filename,
        postfix:each.postfix,
        path:each.path
      });
    });
    getAllDataByCateCb(cates);
  }
  commonDAO.getAllByCateroty(cate,getAllByCaterotyCb);
  
}
exports.getAllDataByCateFromLocal = getAllDataByCateFromLocal;

function getAllContactsFromLocal(getAllContactsCb) {
  function getAllByCaterotyCb(data)
  {
    var contacts = new Array();
    data.forEach(function (each){
      contacts.push({
        version:each.version,
        URI:each.URI,
        name:each.name,
        photoPath:each.path
      });
    });
    getAllContactsCb(contacts);
  }
  commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
  
}
exports.getAllContactsFromLocal = getAllContactsFromLocal;

function rmDataByUriFromLocal(rmDataByUriCb,uri) {
  function getItemByUriCb(item){
    if(item == null){
       result='success';
       rmDataByUriCb(result);
    }
    else{
//      console.log("delete : "+ item.path);
      function ulinkCb(result){
        config.riolog("delete result:"+result);
        if(result==null){
          result='success';
          commonDAO.deleteItemByUri(uri,server.deleteItemCb,rmDataByUriCb);
        }
        else{
          result='error';
          rmDataByUriCb(result);
        }
      }
      fs.unlink(item.path,ulinkCb);
    }
  }
  commonDAO.getItemByUri(id,getItemByUriCb);
}
exports.rmDataByUriFromLocal = rmDataByUriFromLocal;

function getDataByUriFromLocal(getDataByUriCb,uri) {
    console.log("read data : ========================="+ uri);
  function getItemByUriCb(item){
    console.log("read data : ========================="+ item.URI);
    getDataByUriCb(item);
  }
  commonDAO.getItemByUri(uri,getItemByUriCb);
}
exports.getDataByUriFromLocal = getDataByUriFromLocal;

function getDataSourceByUriFromLocal(getDataSourceByUriCb,uri) {
  function getItemByUriCb(item){
    if(item==null){
      config.riolog("read data : "+ item);
      getDataSourceByUriCb('undefined');
    }
    else{
      config.riolog("read data : "+ item.path);
      if(item.postfix==null){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix=='jpg'||item.postfix=='png'||item.postfix=='txt'||item.postfix=='ogg'){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix == 'ppt' || item.postfix == 'pptx'|| item.postfix == 'doc'|| item.postfix == 'docx'|| item.postfix == 'wps'|| item.postfix == 'odt'|| item.postfix == 'et'||  item.postfix == 'xls'|| item.postfix == 'xlsx'){
        item.path = decodeURIComponent(item.path);
        var source={
          openmethod:'local',
          content:item.path
        };
      }
      getDataSourceByUriCb(source);
      
      var currentTime = (new Date()).getTime();
      config.riolog("time: "+ currentTime);
      function updateItemValueCb(uri,version,cbItem,result){
        config.riolog("update DB: "+ result);
        if(result!='successfull'){
          filesHandle.sleep(1000);
          commonDAO.updateItemValue(uri,version,cbItem,updateItemValueCb);
        }
        else{
          function updateRecentTableCb(uri,time,result){
            config.riolog("update recent table: "+ result);
            if(result!='successfull'){
              filesHandle.sleep(1000);
              commonDAO.updateRecentTable(uri,parseInt(currentTime),updateRecentTableCb);
            }
          }
          commonDAO.updateRecentTable(uri,parseInt(currentTime),updateRecentTableCb);
        }
      }
      var updateItem = {
        lastAccessTime:parseInt(currentTime)
      };
      commonDAO.updateItemValue(item.URI,item.version,updateItem,updateItemValueCb);
    }
  }
  commonDAO.getItemByUri(uri,getItemByUriCb);
}
exports.getDataSourceByUriFromLocal = getDataSourceByUriFromLocal;

function updateDataValueFromLocal(updateDataValueCb,uri,version,item) {
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
exports.updateDataValueFromLocal = updateDataValueFromLocal;

function getRecentAccessDataFromLocal(getRecentAccessDataCb,num) {
  function getRecentByOrderCb(recentResult){
    if(recentResult[0]==null){
      return;
    }
    while(recentResult.length>num){
      recentResult.pop();
    }
    var data = new Array();
    var iCount = 0;
    function getItemByUriCb(result){
      //console.log(result);
      if(result){
        
        data.push(result);
        if(data.length==num){
          getRecentAccessDataCb(data);
        }
        else{
          iCount++;
          commonDAO.getItemByUri(recentResult[iCount].file_uri,getItemByUriCb);
        }
      }
      else{
        console.log("No data");
      }
    }
    commonDAO.getItemByUri(recentResult[iCount].file_uri,getItemByUriCb);
  }
  commonDAO.getRecentByOrder(getRecentByOrderCb);
}
exports.getRecentAccessDataFromLocal = getRecentAccessDataFromLocal;

function getServerAddressFromLocal(getServerAddressCb) {
  var address={
    ip:config.SERVERIP,
    port:config.SERVERPORT
  };
  getServerAddressCb(address);
}
exports.getServerAddressFromLocal = getServerAddressFromLocal;

//add function for file transfer 
//2014.7.18 by xiquan
function sendFileFromLocal(host){
  fileTranfer.startSending(host);
}
exports.sendFileFromLocal = sendFileFromLocal;

//add function for file transfer 
//2014.7.21 by xiquan
function receiveFileFromLocal(path){
  fileTranfer.startReceiving(path);
}
exports.receiveFileFromLocal = receiveFileFromLocal;

function getDataDirFromLocal(getDataDirFromLocalCb){
  var cp = require('child_process');
  cp.exec('echo $USER',function(error,stdout,stderr){
    var usrname=stdout.replace("\n","");
    var data = require('/home/'+usrname+'/.demo-rio/config');
    getDataDirFromLocalCb(data.dataDir);
 });
}
exports.getDataDirFromLocal = getDataDirFromLocal;

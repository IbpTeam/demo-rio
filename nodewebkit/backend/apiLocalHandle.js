//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var fileTranfer = require("./fileTransfer");//2014.7.18 by shuanzi
var fs = require('fs');
var config = require('./config');

var localflag=1;
exports.localflag = localflag;

function loadResourcesFromLocal(loadResourcesCb,path) {
  filesHandle.syncDb(loadResourcesCb,path);
}
exports.loadResourcesFromLocal = loadResourcesFromLocal;

function getAllCateFromLocal(getAllCateCb) {
  function getCategoriesCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        id:each.id,
        type:each.type,
        path:each.logoPath,
        desc:each.desc
      });
    });
    getAllCateCb(cates);
  }
  commonDAO.getCategories(getCategoriesCb);
}
exports.getAllCateFromLocal = getAllCateFromLocal;

function getAllDataByCateFromLocal(getAllDataByCateCb,cate) {
  function getAllByCaterotyCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        id:each.id,
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
        id:each.id,
        name:each.name,
        photoPath:each.photoPath
      });
    });
    getAllContactsCb(contacts);
  }
  commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
  
}
exports.getAllContactsFromLocal = getAllContactsFromLocal;

function rmDataByIdFromLocal(rmDataByIdCb,id,uri) {
  function getItemByIdCb(item){
    if(item == null){
       result='success';
       rmDataByIdCb(result);
    }
    else{
//      console.log("delete : "+ item.path);
      function ulinkCb(result){
        config.riolog("delete result:"+result);
        if(result==null){
          result='success';
          commonDAO.deleteItemById(id,uri,server.deleteItemCb,rmDataByIdCb);
        }
        else{
          result='error';
          rmDataByIdCb(result);
        }
      }
      fs.unlink(item.path,ulinkCb);
    }
  }
  commonDAO.getItemById(id,getItemByIdCb);
}
exports.rmDataByIdFromLocal = rmDataByIdFromLocal;

function getDataByIdFromLocal(getDataByIdCb,id) {
  function getItemByIdCb(item){
 //   console.log("read data : "+ item.filename);
    getDataByIdCb(item);
  }
  commonDAO.getItemById(id,getItemByIdCb);
}
exports.getDataByIdFromLocal = getDataByIdFromLocal;

function getDataSourceByIdFromLocal(getDataSourceByIdCb,id) {
  function getItemByIdCb(item){
    if(item==null){
      config.riolog("read data : "+ item);
      getDataSourceByIdCb('undefined');
    }
    else{
      config.riolog("read data : "+ item.path);
      if(item.postfix==null){
        var source={
          openmethod:'direct',
          content:item.photoPath
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
      getDataSourceByIdCb(source);
      
      var currentTime = (new Date()).getTime();
      config.riolog("time: "+ currentTime);
      function updateItemValueCb(id,uri,key,value,result){
        config.riolog("update DB: "+ result);
        if(result!='successfull'){
          filesHandle.sleep(1000);
          commonDAO.updateItemValue(id,item.URI,'lastAccessTime',parseInt(currentTime),updateItemValueCb);
        }
        else{
          var index=id.indexOf('#');
          var tableId=id.substring(0,index);
          var dataId=id.substr(index+1);
          var tableName;
          switch(tableId){
            case '1' :{
              tableName='contacts';
            }
            break;
            case '2' :{
              tableName='pictures';
            }
            break;
            case '3' :{
              tableName='videos';
            }
            break;
            case '4' :{
              tableName='documents';
            }
            break;
            case '5' :{
              tableName='music';
            }
            break;                                    
          }
          function updateRecentTableCb(tableName,dataId,time,result){
            config.riolog("update recent table: "+ result);
            if(result!='successfull'){
              filesHandle.sleep(1000);
              commonDAO.updateRecentTable(tableName,dataId,parseInt(currentTime),updateRecentTableCb);
            }
          }
          commonDAO.updateRecentTable(tableName,dataId,parseInt(currentTime),updateRecentTableCb);
        }
      }
      commonDAO.updateItemValue(id,item.URI,'lastAccessTime',parseInt(currentTime),updateItemValueCb);
    }
  }
  commonDAO.getItemById(id,getItemByIdCb);
}
exports.getDataSourceByIdFromLocal = getDataSourceByIdFromLocal;

function updateDataValueFromLocal(updateDataValueCb,id,uri,key,value) {
  function updateItemValueCb(id,uri,key,value,result){
    config.riolog("update DB: "+ result);
    if(result!='successfull'){
      filesHandle.sleep(1000);
      commonDAO.updateItemValue(id,uri,key,value,updateItemValueCb);
    }
    else{
      updateDataValueCb('success');
    }
  }
  commonDAO.updateItemValue(id,uri,key,value,updateItemValueCb);
}
exports.updateDataValueFromLocal = updateDataValueFromLocal;

function getRecentAccessDataFromLocal(getRecentAccessDataCb,num) {
  function getRecentByOrderCb(result){
    while(result.length>num){
      result.pop();
    }
    var data = new Array();
    var id;
    var index=0;
    function getid(){
      switch (result[index].tableName){
        case  'contacts':{
          id='1#'+result[index].specificId;
        }
        break;
        case  'pictures':{
          id='2#'+result[index].specificId;
        }
        break;
        case  'videos':{
          id='3#'+result[index].specificId;
        }
        break;
        case  'documents':{
          id='4#'+result[index].specificId;
        }
        break;
        case  'music':{
          id='5#'+result[index].specificId;
        }
        break;
      }
      index++;
      return id;
    }
    function getItemByIdCb(result){
      //console.log(result);
      if(result){
        
        data.push(result);
        if(data.length==num){
          getRecentAccessDataCb(data);
        }
        else{
          commonDAO.getItemById(getid(),getItemByIdCb);
        }
      }
    }
    commonDAO.getItemById(getid(),getItemByIdCb);

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

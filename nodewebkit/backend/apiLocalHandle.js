//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var fs = require('fs');

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

function rmDataByIdFromLocal(rmDataByIdCb,id) {
  function getItemByIdCb(item){
    if(item == null){
       result='success';
       rmDataByIdCb(result);
    }
    else{
//      console.log("delete : "+ item.path);
      function ulinkCb(result){
        console.log("delete result:"+result);
        if(result==null){
          result='success';
          commonDAO.deleteItemById(id,server.deleteItemCb,rmDataByIdCb);
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
      console.log("read data : "+ item);
      getDataSourceByIdCb('undefined');
    }
    else{
      console.log("read data : "+ item.path);
      if(item.path!=null){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else{
        var source={
          openmethod:'direct',
          content:item.photoPath
        };
      }
      getDataSourceByIdCb(source);
      
      var currentTime = (new Date()).getTime();
      console.log("time: "+ currentTime);
      function updateItemValueCb(id,key,value,result){
        console.log("update DB: "+ result);
        if(result!='successfull'){
          commonDAO.updateItemValue(id,'lastAccessTime',parseInt(currentTime),updateItemValueCb);
        }
      }
      commonDAO.updateItemValue(id,'lastAccessTime',parseInt(currentTime),updateItemValueCb);
    }
  }
  commonDAO.getItemById(id,getItemByIdCb);
}
exports.getDataSourceByIdFromLocal = getDataSourceByIdFromLocal;


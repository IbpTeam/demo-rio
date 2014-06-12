//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");
var filesHandle = require("./filesHandle");
var fs = require('fs');

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
    console.log("read data : "+ item.path);
    var source={
      openmethod:'direct',
      content:item.path
    };
    getDataSourceByIdCb(source);
  }
  commonDAO.getItemById(id,getItemByIdCb);
}
exports.getDataSourceByIdFromLocal = getDataSourceByIdFromLocal;


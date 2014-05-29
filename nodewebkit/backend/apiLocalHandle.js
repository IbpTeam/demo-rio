var config = require("./config");
var categoryDAO = require("../DAO/CategoryDAO");
var contactsDAO = require("../DAO/ContactsDAO");
var picturesDAO = require("../DAO/PicturesDAO");
var videosDAO = require("../DAO/VideosDAO");

function getAllCateFromLocal(getAllCateCb) {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var json = JSON.stringify(data);
    getAllCateCb(json);
  });
}
exports.getAllCateFromLocal = getAllCateFromLocal;

function getAllDataByCateFromLocal(getAllDataByCateCb,cate) {
  switch(cate){
  case 'Contacts' : {
    contactsDAO.findAll();
    contactsDAO.getEmitter().once('findAll', function(data){
      var json = JSON.stringify(data);
      getAllDataByCateCb(json);
  });
  }
  break;
  
  case 'Pictures' : {
    picturesDAO.findAll();
    picturesDAO.getEmitter().once('findAll', function(data){
      var json = JSON.stringify(data);
      getAllDataByCateCb(json);
  });
  }
  break;
    
  case 'Videos' : {
    videosDAO.findAll();
    videosDAO.getEmitter().once('findAll', function(data){
      var json = JSON.stringify(data);
      getAllDataByCateCb(json);
  });
  }
  break;
  }

}
exports.getAllDataByCateFromLocal = getAllDataByCateFromLocal;

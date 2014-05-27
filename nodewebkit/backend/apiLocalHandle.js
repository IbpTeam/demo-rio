var config = require("./config");
var categoryDAO = require(config.projecthome+"/DAO/CategoryDAO");
var contactsDAO = require(config.projecthome+"/DAO/ContactsDAO");
var picturesDAO = require(config.projecthome+"/DAO/PicturesDAO");
var videosDAO = require(config.projecthome+"/DAO/VideosDAO");

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

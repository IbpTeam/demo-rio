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

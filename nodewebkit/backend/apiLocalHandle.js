var config = require("./config");
var categoryDAO = require(config.projecthome+"/DAO/CategoryDAO");

function getAllCateFromLocal(getAllCateCb) {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var json = JSON.stringify(data);
    getAllCateCb(json);
  });
}

exports.getAllCateFromLocal = getAllCateFromLocal;

//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");

function getAllCateFromLocal(getAllCateCb) {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var json = JSON.stringify(data);
    getAllCateCb(json);
  });
}
exports.getAllCateFromLocal = getAllCateFromLocal;

function getAllDataByCateFromLocal(getAllDataByCateCb,cate) {
  commonDAO.getAllByCateroty(getAllDataByCateCb,cate);
  
}
exports.getAllDataByCateFromLocal = getAllDataByCateFromLocal;

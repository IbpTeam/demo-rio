//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");

function getAllCateFromLocal(getAllCateCb) {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        type:each.type,
        source:"./resource/contacts.png"
      });
    });
    getAllCateCb(cates);
  });
}
exports.getAllCateFromLocal = getAllCateFromLocal;

function getAllDataByCateFromLocal(getAllByCategroyCb,cate) {
 // function getAllDataByCateCb
  commonDAO.getAllByCateroty(getAllByCategroyCb,cate);
  
}
exports.getAllDataByCateFromLocal = getAllDataByCateFromLocal;

function rmDataByIdFromLocal(rmDataByIdCb,id) {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var json = JSON.stringify(data);
    getAllCateCb(json);
  });
}
exports.getAllCateFromLocal = getAllCateFromLocal;

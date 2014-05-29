//var config = require("./config");
var commonDAO = require("./DAO/CommonDAO");


function getAllCateFromLocal(getAllCateCb) {
  function getCategoriesCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        id:each.id,
        type:each.type,
        path:each.logoPath
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
  commonDAO.getAllByCateroty(getAllByCaterotyCb,cate);
  
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

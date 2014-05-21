var config = require("./config");
var categoryDAO = require(config.projecthome+"/DAO/CategoryDAO");

function LoadDataFromLocal(cb) {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var json = JSON.stringify(data);
    cb(json);
  });
}

exports.LoadDataFromLocal = LoadDataFromLocal;

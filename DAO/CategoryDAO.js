var sqlite3 = require('sqlite3');

//查询category表中所有数据
exports.findAll = function(callback){
  var category = new Array();
  //var id = 0;
  var db = new sqlite3.Database('/home/cos/sqlite3/rio');
  db.all("select * from Category", callback);
  //.log(id);
  db.close();
  return category;
}  


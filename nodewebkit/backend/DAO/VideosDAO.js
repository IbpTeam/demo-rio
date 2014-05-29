var sqlite3 = require('sqlite3');

//连接数据库
function openDB(){
  return new sqlite3.Database('./db/rio');
}

//关闭数据库
function closeDB(database){
  database.close();
}

/**
 * @method findAll
 *   查询videos表中所有数据
 * @param null
 *
 * @return videos
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all("select * from videos", findAllCallBack);
  closeDB(db);
}  

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   videos表中的主键
 * @return videos
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id, findByIdCallBack){
  var db = openDB();
  db.get("select * from videos where id = ?", id, findByIdCallBack);
  closeDB();
}

/**
 * @method countTotal
 *   查询videos表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get("select count(*) as total from videos", countTotalCallBack);
  closeDB();  
}

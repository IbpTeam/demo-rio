var sqlite3 = require('sqlite3');

//连接数据库
function openDB(){
  return new sqlite3.Database('./backend/db/rio');
}

//关闭数据库
function closeDB(database){
  database.close();
}

/**
 * @method findAll
 *   查询pictures表中所有数据
 * @param null
 *
 * @return pictures
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all("select * from pictures", findAllCallBack);
  closeDB(db);
}  

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   pictures表中的主键
 * @return pictures
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id, findByIdCallBack){
  var db = openDB();
  db.get("select * from pictures where id = ?", id, findByIdCallBack);
  closeDB();
}

/**
 * @method countTotal
 *   查询pictures表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get("select count(*) as total from pictures", countTotalCallBack);
  closeDB();  
} 

/**
 * @method createItem
 *   增加一条图片信息
 * @param item
 *   包含图片信息的数据对象
 */
exports.createItem = function(item, createItemCallBack){
  var db = openDB();
  db.get("insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,othors) values (null,?,?,?,?,?,?,?,?)", item, createItemCallBack);
  closeDB();
}

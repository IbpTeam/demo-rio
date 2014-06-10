var sqlite3 = require('sqlite3');
var SQLSTR = require("./SQL/SQLStr.js");

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
 *   查询category表中所有数据
 * @param null
 *
 * @return category
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all(SQLSTR.FINDALLCATEGORIES, findAllCallBack);
  closeDB(db);
}

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   category表中的主键
 * @return category
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id, findByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.FINDCATEGORYBYID, id, findByIdCallBack);
  closeDB();
}

/**
 * @method countTotal
 *   查询Category表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALCATEGORIES, countTotalCallBack);
  closeDB();  
}

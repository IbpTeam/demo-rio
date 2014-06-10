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
 * @method countTotal
 *   查询musics表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALMUSICS, countTotalCallBack);
  closeDB();  
} 

/**
 * @method findAll
 *   查询musics表中所有数据
 * @param null
 *
 * @return musics
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all(SQLSTR.FINDALLMUSICS, findAllCallBack);
  closeDB(db);
}  

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   musics表中的主键
 * @return musics
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id, findByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.FINDMUSICBYID, id, findByIdCallBack);
  closeDB(db);
}

/**
 * @method createItem
 *   增加一条音乐信息
 * @param item
 *   包含音乐信息的数据对象
 */
exports.createItem = function(item, createItemCallBack){
  var db = openDB();
  db.get(SQLSTR.CREATEMUSIC, item.filename, item.postfix, item.size, item.path, item.album, item.composerName, item.actorName, item.createTime, item.lastModifyTime,item.lastAccessTime, item.others, createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemById
 *   根据ID删除表中指定数据
 * @param id
 *   musics表中的主键
 */
exports.deleteItemById = function(id, deleteItemByIdCallBack){
  console.log("delete music id : " + id);
  var db = openDB();
  db.get(SQLSTR.DELETEMUSIC, id, deleteItemByIdCallBack);
  closeDB(db);
}

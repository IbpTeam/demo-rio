var sqlite3 = require('sqlite3');
var SQLSTR = require("./SQL/SQLStr.js");
var config = require("../config");

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
 *   查询music表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALRECENT, countTotalCallBack);
  closeDB(db);  
} 

/**
 * @method findAll
 *   查询recent表中所有数据
 * @param null
 *
 * @return recent
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all(SQLSTR.FINDALLRECENT, findAllCallBack);
  closeDB(db);
}  

/**
 * @method findAll
 *   查询recent表中所有数据
 * @param null
 *
 * @return recent
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAllByOrder = function(findAllCallBack){
  var db = openDB();
  db.all(SQLSTR.FINDALLRECENTBYORDER, findAllCallBack);
  closeDB(db);
}  

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   recent表中的主键
 * @return recent
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id, findByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.FINDRECENTBYID, id, findByIdCallBack);
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
  db.get(SQLSTR.CREATERECENT,item.fileUri,item.lastAccessTime,createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemById
 *   根据ID删除表中指定数据
 * @param id
 *   recent表中的主键
 */
exports.deleteItemById = function(id, deleteItemByIdCallBack){
  config.dblog("delete recent id : " + id);
  var db = openDB();
  db.get(SQLSTR.DELETERECENT, id, deleteItemByIdCallBack);
  closeDB(db);
}

/**
 * @method updateItemValue
 *   更新指定ID的某一个key
 * @param id
 *   recent表中的主键
 */
exports.updateItemValue = function(id,key,value, updateItemValueCallBack){
  var db = openDB();
  config.dblog("udpate recent id : " + id);
  config.dblog("udpate key=" + key + 'value='+value);
  //db.run(SQLSTR.UPDATEPICTURE, key, value, id, updateItemValueCallBack);
  var sqlstr="UPDATE recent SET "+key+" = '"+value+"' WHERE id = "+id;
  config.dblog("sqlstr:" +sqlstr);
  db.run(sqlstr,updateItemValueCallBack);
  closeDB(db);
}

/**
 * @method updateTime
 *   更新最近访问时间
 * @param tableName,dataId,time
 *   
 */
exports.updateTime = function(uri,time, updateTimeCb){
  var db = openDB();
  config.dblog("udpate recent id : " + dataId);
  //console.log("udpate key=" + key + 'value='+value);

  var sqlstr="UPDATE recent SET lastAccessTime = '"+time+"' WHERE file_uri = "+uri;
  config.dblog("sqlstr:" +sqlstr);
  db.run(sqlstr,updateTimeCb);
  closeDB(db);
}

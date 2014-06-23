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
 *   查询videos表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALVIDEOS, countTotalCallBack);
  closeDB(db);  
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
  db.all(SQLSTR.FINDALLVIDEOS, findAllCallBack);
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
  db.get(SQLSTR.FINDVIDEOBYID, id, findByIdCallBack);
  closeDB();
}

/**
 * @method createItem
 *   增加一条视频信息
 * @param item
 *   包含视频信息的数据对象
 */
exports.createItem = function(item, createItemCallBack){
  var db = openDB();
  db.get(SQLSTR.CREATEVIDEO, item.id,item.filename, item.postfix, item.size, item.path, item.location, item.createTime, item.lastModifyTime,item.lastAccessTime, item.others, createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemById
 *   根据ID删除表中指定数据
 * @param id
 *   videos表中的主键
 */
exports.deleteItemById = function(id, deleteItemByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.DELETEVIDEO, id, deleteItemByIdCallBack);
  closeDB(db);
}

/**
 * @method updateItemValue
 *   更新指定ID的某一个key
 * @param id
 *   pictures表中的主键
 */
exports.updateItemValue = function(id,key,value, updateItemValueCallBack){
  var db = openDB();
    config.dblog("udpate vidoes id : " + id);
        config.dblog("udpate key=" + key + 'value='+value);
  //db.run(SQLSTR.UPDATEPICTURE, key, value, id, updateItemValueCallBack);
  var sqlstr="UPDATE vidoes SET "+key+" = '"+value+"' WHERE id = "+id;
  config.dblog("sqlstr:" +sqlstr);
  db.run(sqlstr,updateItemValueCallBack);
  closeDB(db);
}

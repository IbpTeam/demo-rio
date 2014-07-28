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
 *   查询pictures表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALPICTURES, countTotalCallBack);
  closeDB();  
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
  db.all(SQLSTR.FINDALLPICTURES, findAllCallBack);
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
  db.get(SQLSTR.FINDPICTUREBYID, id, findByIdCallBack);
  closeDB(db);
}

/**
 * @method createItem
 *   增加一条图片信息
 * @param item
 *   包含图片信息的数据对象
 */
exports.createItem = function(item, createItemCallBack){
  var db = openDB();
  db.get(SQLSTR.CREATEPICTURE, item.id,item.filename, item.postfix, item.size, item.path, item.location, item.createTime, item.lastModifyTime, item.lastAccessTime, item.others, item.URI, createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemByUri
 *   根据uri删除表中指定数据
 * @param uri
 *   contacts表中的URI
 */
exports.deleteItemByUri = function(uri, deleteItemByIdCallBack){
  config.dblog("delete picture uri : " + uri);
  var db = openDB();
  db.get(SQLSTR.DELETEPICTURE, uri, deleteItemByIdCallBack);
  closeDB(db);
}

/**
 * @method updateItemValue
 *   更新指定ID的某一个key
 * @param id
 *   pictures表中的主键
 */
exports.updateItemValueByUri = function(uri,key,value, updateItemValueCallBack){
  var db = openDB();
    config.dblog("udpate picture uri : " + uri);
        config.dblog("udpate key=" + key + 'value='+value);
  //db.run(SQLSTR.UPDATEPICTURE, key, value, uri, updateItemValueCallBack);
  var sqlstr="UPDATE pictures SET "+key+" = '"+value+"' WHERE URI = "+uri;
  config.dblog("sqlstr:" +sqlstr);
  db.run(sqlstr,updateItemValueCallBack);
  closeDB(db);
}

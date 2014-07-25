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
 * @method createInsertItem
 *   增加一条新建数据信息
 * @param dataURI
 *   数据统一资源标识符
 */
exports.createInsertItem = function(dataURI, createInsertItemCallBack){
  var db = openDB();
  db.run(SQLSTR.CREATEINSERTITEM, dataURI, createInsertItemCallBack);
  closeDB(db);
}

/**
 * @method createDeleteItem
 *   增加一条删除记录
 * @param dataURI
 *   数据统一资源标识符
 */
exports.createDeleteItem = function(dataURI, createDeleteItemCallBack){
  var db = openDB();
  db.run(SQLSTR.CREATEDELETEITEM, dataURI, createDeleteItemCallBack);
  closeDB(db);
}

/**
 * @method createUpdateItem
 *   增加一条更新数据信息
 * @param dataURI 
 *   数据统一资源标识符
 * @param key 
 *   所修改字段名
 * @param value 
 *   所修改值
 */
exports.createUpdateItem = function(dataURI, key, value, createUpdateItemCallBack){
  var db = openDB();
  db.run(SQLSTR.CREATEUPDATEITEM, dataURI, key, value, createUpdateItemCallBack);
  closeDB(db);
}

/**
 * @method RemoveUpdateItem
 *   删除某一数据的更新记录
 * @param dataURI
 *   数据统一资源标识符
 */
exports.removeUpdateItem = function(dataURI, removeUpdateItemCallBack){
  var db = openDB();
  db.run(SQLSTR.REMOVEUPDATEITEM, dataURI, removeUpdateItemCallBack);
  closeDB(db);
}

/**
 * @method RemoveInsertItem
 *   删除某一数据的更新记录
 * @param dataURI
 *   数据统一资源标识符
 */
exports.removeInsertItem = function(dataURI, removeInsertItemCallBack){
  var db = openDB();
  db.run(SQLSTR.REMOVEINSERTITEM, dataURI, removeInsertItemCallBack);
  closeDB(db);
}



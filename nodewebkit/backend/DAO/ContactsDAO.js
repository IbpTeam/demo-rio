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
 *   查询contacts表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALCONTACTS, countTotalCallBack);
  closeDB();  
}

/**
 * @method findAll
 *   查询contacts表中所有数据
 * @param null
 *
 * @return contacts
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all(SQLSTR.FINDALLCONTACTS, findAllCallBack);
  closeDB(db);
}  

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   contacts表中的主键
 * @return contacts
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id){
  var db = openDB();
  db.get(SQLSTR.FINDCONTACTBYID, id, findByIdCallBack);
  closeDB(db);
}

/**
 * @method createItem
 *   增加一条新联系人信息
 * @param item
 *   包含联系人信息的数据对象
 */
exports.createItem = function(item, createItemCallBack){
  var db = openDB();
  db.run(SQLSTR.CREATECONTACT, item.name, item.phone, item.sex, item.age, item.email, item.photoPath, item.createTime, item.lastModifyTime, createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemById
 *   根据ID删除表中指定数据
 * @param id
 *   pictures表中的主键
 */
exports.deleteItemById = function(id, deleteItemByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.DELETECONTACT, id, deleteItemByIdCallBack);
  closeDB(db);
}

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
 *   查询documents表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(countTotalCallBack){
  var db = openDB();
  db.get(SQLSTR.COUNTTOTALDOCUMENTS, countTotalCallBack);
  closeDB();  
} 

/**
 * @method findAll
 *   查询documents表中所有数据
 * @param null
 *
 * @return documents
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(findAllCallBack){
  var db = openDB();
  db.all(SQLSTR.FINDALLDOCUMENTS, findAllCallBack);
  closeDB(db);
}  

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   documents表中的主键
 * @return documents
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id, findByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.FINDDOCUMENTBYID, id, findByIdCallBack);
  closeDB(db);
}

/**
 * @method createItem
 *   增加一条文档信息
 * @param item
 *   包含文档信息的数据对象
 */
exports.createItem = function(item, createItemCallBack){
  var db = openDB();
  db.get(SQLSTR.CREATEDOCUMENT, item.id,item.filename, item.postfix, item.size, item.path, item.project, item.createTime, item.lastModifyTime,item.lastAccessTime, item.others, createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemById
 *   根据ID删除表中指定数据
 * @param id
 *   documents表中的主键
 */
exports.deleteItemById = function(id, deleteItemByIdCallBack){
  console.log("delete document id : " + id);
  var db = openDB();
  db.get(SQLSTR.DELETEDOCUMENT, id, deleteItemByIdCallBack);
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
    console.log("udpate documents id : " + id);
        console.log("udpate key=" + key + 'value='+value);
  //db.run(SQLSTR.UPDATEPICTURE, key, value, id, updateItemValueCallBack);
  var sqlstr="UPDATE documents SET "+key+" = '"+value+"' WHERE id = "+id;
  console.log("sqlstr:" +sqlstr);
  db.run(sqlstr,updateItemValueCallBack);
  closeDB(db);
}

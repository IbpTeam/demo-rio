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
exports.findById = function(id,findByIdCallBack){
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
  db.run(SQLSTR.CREATECONTACT, item.id,item.name, item.phone, item.sex, item.age, item.email, item.photoPath, item.createTime, item.lastModifyTime,item.lastAccessTime, item.URI, createItemCallBack);
  closeDB(db);
}

/**
 * @method deleteItemByUri
 *   根据uri删除表中指定数据
 * @param uri
 *   pictures表中的URI
 */
exports.deleteItemByUri = function(uri, deleteItemByIdCallBack){
  var db = openDB();
  db.get(SQLSTR.DELETECONTACT, uri, deleteItemByIdCallBack);
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
    config.dblog("udpate contacts uri : " + uri);
        config.dblog("udpate key=" + key + 'value='+value);
  //db.run(SQLSTR.UPDATEPICTURE, key, value, id, updateItemValueCallBack);
  var sqlstr="UPDATE contacts SET "+key+" = '"+value+"' WHERE URI = '"+uri+"'";
  config.dblog("sqlstr:" +sqlstr);
  db.run(sqlstr, updateItemValueCallBack);
  closeDB(db);
}

exports.findAllByStr = function(str, findAllByStrCallBack){
  var db = openDB();
  var contacts = {};
  config.dblog("find all by str : " + str);
  db.run("select * from contacts where name like '%" + str + "%'", function(err, nameRows){
    if(err) {
      config.dblog(err);
    }
    else{
      contacts.push(nameRows);
      db.run("select * from contacts where phone like '%" + str + "%'", function(err, phoneRows){
        if(err){
          config.dblog(err);
        }
        else{
          contacts.push(phoneRows);
          findAllByStrCallBack(contacts);
        }
      });
    }
  });
}
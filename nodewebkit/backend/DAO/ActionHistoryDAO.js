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

/**
 * @method findAll
 *   查询UpdateHistory表中所有数据
 * @param null
 *
 * @return update history
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(action, findAllCallBack){
  var sqlStr = null;
  switch(action){
    case "update":{
      sqlStr = SQLSTR.FINDALLUPDATES;
    }
    break;
    case "delete":{
      sqlStr = SQLSTR.FINDALLDELETES;
    }
    break;
    case "insert":{
      sqlStr = SQLSTR.FINDALLINSERTS;
    }
    break;
    default:{
      console.log("no action found!");
    }
  }
  var db = openDB();
  db.all(sqlStr, findAllCallBack);
  closeDB(db);
}  

/**
 * @method createAll
 *   delete items first and then
 *   insert all items into the insert history from an Array
 * @param List
 * List is an Array
 *
 */
exports.createAll = function(action,List,callback){
  var db = openDB();
  switch(action){
    case "insert": {
      List.forEach(function(item){
        db.run(SQLSTR.CREATEINSERTITEM, item.dataURI,callback);
      });
    }
    break;
    case "delete": {
      List.forEach(function(item){
        //create delete history
        db.run(SQLSTR.CREATEDELETEITEM, item.dataURI,callback);
        //then delete insert & update history
        db.run(SQLSTR.REMOVEINSERTITEM, item.dataURI);
        db.run(SQLSTR.REMOVEUPDATEITEM, item.dataURI);
      });
    }
    break;
    case "update": {
      List.forEach(function(item){
        db.run(SQLSTR.CREATEUPDATEITEM, item.dataURI, item.key, item.value,callback);     
      });
    }
    break;
    default: {
      console.log("Error: not found");
    }
  }
  closeDB(db);
}


//init a list of action history
exports.test = function(){
  var db = openDB();

  db.run(SQLSTR.CREATEINSERTITEM, "testSync_1");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_2");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_3");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_4");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_5");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_6");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_7");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_8");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_9");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_0");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_10");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_11");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_12");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_13");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_14");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_15");
  db.run(SQLSTR.CREATEINSERTITEM, "testSync_16");

  db.run(SQLSTR.CREATEDELETEITEM, "testSync_1");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_2");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_3");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_17");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_18");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_4");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_5");
  db.run(SQLSTR.CREATEDELETEITEM, "testSync_6");

  closeDB(db);
}


/**
 * @method deleteAll
 *   insert all items into the insert history from an Array
 * @param List
 * List is an Array
 *
 *
exports.deleteAll = function(List,deleteInsertCallback){
  var db = openDB();
  List.forEach(function(item){
    //delete insert history
    db.run(SQLSTR.REMOVEINSERTITEM, item.dataURI, deleteInsertCallback);
    //delete update history
    //db.run(SQLSTR.REMOVEUPDATEITEM, item.dataURI, deleteUpdateCallback);
  });
  closeDB(db);
}
*/
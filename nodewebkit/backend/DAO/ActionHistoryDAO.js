var sqlite3 = require('sqlite3');
var SQLSTR = require("./SQL/SQLStr.js");
var config = require("../config");
var uniqueId = require("../uniqueID");

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
exports.createInsertItem = function(dataURI, version, createInsertItemCallBack){
  var db = openDB();  
  db.run(SQLSTR.CREATEINSERTITEM, dataURI,version,createInsertItemCallBack);
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
exports.createUpdateHistoryItem = function(dataURI, key, value, version, newVersion, createUpdateItemCallBack){
  var db = openDB();
  db.run(SQLSTR.FINDUPDATEHISTORYBYVERSION, version, function(err,record){
    if (err) {
      console.log("Error: find update history error" + err);
      createUpdateItemCallBack(null);
    }else{
      var childrenStr = null;
      var parentsStr = null;
      var origin_version = null;
      if (record == null) {
        var sqlStr = "select * from inserthistory where file_uri = '" + dataURI +"'";
        db.run(sqlStr, function(err,item){
          if (err) {
            console.log("Error: select item from insert history error ! " + err);
          }else{
            var parents = new Array();
            parents.push(item.origin_version);
            parentsStr = JSON.stringify(parents);
            origin_version = item.origin_version;
            db.run(SQLSTR.CREATEUPDATEITEM, newVersion, parentsStr, childrenStr, origin_version,function(err){
              if (err) {
                console.log("Error: create update history item error! " + err);
              }else{
                db.run(SQLSTR.CREATEUPDATEOPERATIONS, newVersion, dataURI, key, value, createUpdateItemCallBack);
              }
            });
          }
        });
      }else{
        if (record.children == null) {
          var children = new Array();
          children.push(newVersion);
          childrenStr = JSON.stringify(children);
        }else{
          var children = JSON.parse(record.children);
          children.push(newVersion);
          childrenStr = JSON.stringify(children);
        }
        var parents = new Array();
        parents.push(version);
        parentsStr = JSON.stringify(parents);
        origin_version = record.origin_version;
        modifyUpdateHistoryItem(version,"children",childrenStr,function(err){
          if (err) {
            console.log("Error: modify UpdateHistory table error!  " + err);
          }else{
            db.run(SQLSTR.CREATEUPDATEITEM, newVersion, parentsStr, childrenStr, origin_version,function(err){
              if (err) {
                console.log("Error: create update history item error! " + err);
              }else{
                db.run(SQLSTR.CREATEUPDATEOPERATIONS, newVersion, dataURI, key, value, createUpdateItemCallBack);
              }
            });
          }
        });
      }
    }
  });
  closeDB(db);
}

/**
 * @method modifyUpdateHistoryItem
 *   修改一条更新数据信息
 * @param version 
 *   
 * @param key 
 *   所修改字段名
 * @param value 
 *   所修改值
 */
exports.modifyUpdateHistoryItem = function(version, key, value, modifyUpdateItemCallBack){
  var db = openDB();
  var sqlstr="UPDATE UpdateHistory SET "+key+" = '"+value+"' WHERE version = '"+version+"'";
  db.run("update UpdateHistory set ", dataURI, key, value, randomId,createInsertItemCallBack);
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
/*
exports.findItemByUri = function(tableName, uri){

}
*/
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
        db.run(SQLSTR.CREATEINSERTITEM, item.file_uri,callback);
      });
    }
    break;
    case "delete": {
      List.forEach(function(item){
        //then delete insert & update history
        db.run(SQLSTR.REMOVEINSERTITEM, item.file_uri);
        db.run(SQLSTR.REMOVEUPDATEITEM, item.file_uri);
        //create delete history
        db.run(SQLSTR.CREATEDELETEITEM, item.file_uri,callback);
      });
    }
    break;
    case "update": {
      List.forEach(function(item){
        db.run(SQLSTR.CREATEUPDATEITEM, item.file_uri, item.key, item.value,callback);     
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
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_01", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_02", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_03", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_04", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_05", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_06", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_07", "filename" , "book.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_01", "author" , "xiquan");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_02", "filename" , "yourbook.pdf");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_03", "author" , "notxiquan");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_04", "time" , "2014.8.8");
  db.run(SQLSTR.CREATEUPDATEITEM, "testUpdate_05", "filename" , "mybook.pdf");
  closeDB(db);
}
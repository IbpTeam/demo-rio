/**
 * @Copyright:
 * 
 * @Description: Data access object api, used in file handle to connect database.
 *
 * @author: Yuanzhe
 *
 * @Data:2014.9.11
 *
 * @version:0.2.1
 **/

var categoryDAO = require("./CategoryDAO");
var contactsDAO = require("./ContactsDAO");
var picturesDAO = require("./PicturesDAO");
var videosDAO = require("./VideosDAO");
var documentsDAO = require("./DocumentsDAO");
var musicDAO = require("./MusicDAO");
var recentDAO = require("./RecentDAO");
var config = require("../config");
var uniqueID = require("../uniqueID");
var sqlite3 = require('sqlite3');
var SQLSTR = require("./SQL/SQLStr.js");
var createTableTimes = 0;

// @const
var BEGIN_TRANS = "BEGIN TRANSACTION;";
var ROLLBACK_TRANS = "ROLLBACK";
var COMMIT_TRANS = "COMMIT;";

/**
 * @method openDB
 *    Open the database.
 * @return db
 *    The database object.
 */
function openDB(){
  return new sqlite3.Database(config.DATABASEPATH);
}

/**
 * @method closeDB
 *    Close the database.
 * @param database
 *    The database object.
 */
function closeDB(database){
  database.close();
}

/**
 * @method createTables
 *    Use SQL to create tables in database.
 * @param sqlStr
 *    The specific SQL string.
 */
function createTables = function(db,sqlStr){
  if(!sqlStr){
    console.log("Error: SQL is null when create tabale ");
    return;
  }
  console.log("Start to create tables with SQL :" + sqlStr);
  if(!db){
    db = openDB();
  }
  db.exec(sqlStr,function(err){
    createComplete(err,db,sqlStr);
  });
}

/**
 * @method createComplete
 *    Callback after create tables.
 * @param err
 *    Null/error.
 * @param db
 *    The database object.
 * @param db
 *    The specific SQL string used to create tables.
 */
function createComplete(err,db,sqlStr){
  if(err){
    console.log(err);
    console.log("Roll back");
    if(createTableTimes < 5){
      createTableTimes++;      
      db.run("ROLLBACK",function(err){
        if(err) throw err;
        createTables(db,sqlStr);
      });
    }else{
      createTableTimes = 0;
      console.log("create table fail.");
    }
    return;
  }
  createTableTimes = 0;
  db.run("COMMIT",function(err){
    if(err) throw err;
    closeDB(db);
  });
}

/**
 * @method initDatabase
 *    Database initialize.
 */
exports.initDatabase = function(){
  var sInitDbSQL = SQLSTR.INITDB;
  createTables(null,sInitDbSQL);
}

exports.countTotalByCategory = function(category, callback) {

  var countDao = null;

  switch(category){
    case 'Contacts' : {
      countDao = contactsDAO;
    }
    break;
  
    case 'Pictures' : {
      countDao = picturesDAO;
    }
    break;
    
    case 'Videos' : {
      countDao = videosDAO;
    }
    break;
    
    case 'Documents' : {
      countDao = documentsDAO;
    }
    break;
    
    case 'Music' : {
      countDao = musicDAO;
    }
    break;
  }

  countDao.countTotal(function(err, countNum){
    if(err){
      config.dblog(err);
      callback(null);
    }
    callback(countNum);
  });
}

exports.getMaxIdByCategory = function(category, callback) {
  switch(category){ 
    case 'Pictures' : {
      picturesDAO.getMaxId(function(err, picturesMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(picturesMaxid);
      });
    }
    break;
    
    case 'Videos' : {
      videosDAO.getMaxId(function(err, videosMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(videosMaxid);
      });
    }
    break;
    
    case 'Documents' : {
      documentsDAO.getMaxId(function(err, documentsMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(documentsMaxid);
      });
    }
    break;
    
    case 'Music' : {
      musicDAO.getMaxId(function(err, musicMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(musicMaxid);
      });
    }
    break;
  }
}

exports.getAllByCateroty = function(caterogy, callback) {

  var dao = null;
  var prefix = null;

  switch(caterogy){
    case 'Contacts' : {
      dao = contactsDAO;
      //prefix = "1#";
    }
    break;
  
    case 'Pictures' : {
      dao = picturesDAO;
      //prefix = "2#";
    }
    break;
    
    case 'Videos' : {
      dao = videosDAO;
      //prefix = "3#";
    }
    break;
    
    case 'Documents' : {
      dao = documentsDAO;
      //prefix = "4#";
    }
    break;
    
    case 'Music' : {
      dao = musicDAO;
      //prefix = "5#";
    }
    break;
  }

  dao.findAll(function(err, items){
    if(err){
      config.dblog(err);
      callback(null);
    }
    //items.forEach(function(item){
    //  item.id = prefix + item.id;
    //});
    callback(items);
  });
}

exports.getCategories = function(callback){
  categoryDAO.findAll(function(err, categories){
    if(err){
      config.dblog(err);
      callback(null);
    }
    categories.forEach(function(categorie){
      categorie.id = "0#" + categorie.id;
    });
    callback(categories)
  });
}

exports.getItemByUri = function(uri, callback){
  config.dblog("Get item by uri: " + uri);
  
  var aUri = uri.split('#');
  if (aUri.length != 3) {
    config.dblog("Error: uri is wrong in getItemByUri!");
    callback(null);
    return;
  }
  var sTableName = aUri[2];
  config.dblog("GetItemByUri: TableName is:" + sTableName);

  var oDao = null;

  switch(sTableName){
    case 'contacts' : {
      oDao = contactsDAO;
    }
    break;
    case 'pictures' : {
      oDao = picturesDAO;
    }
    break;
    case 'videos' : {
      oDao = videosDAO;
    }
    break;
    case 'documents' : {
      oDao = documentsDAO;
    }
    break;
    case 'music' : {
      oDao = musicDAO;
    }
    break;
    default:{
      config.dblog("GetItemByUri: this is default in switch!");
    }
  }

  //Find item by uri in specific table
  oDao.findByUri(uri,function(err,item){
    if(err){
      callback(null);
    }
    else{
      item.path=item.path.replace(/\s/g, "%20");
      callback(item);
    }
  });
}

exports.getItemByPath = function(path, callback){
  var createDAO = null;
  var pointIndex=path.lastIndexOf('.');
  var itemPostfix=path.substr(pointIndex+1);
  var nameindex=path.lastIndexOf('/');
  var itemFilename=path.substring(nameindex+1,pointIndex);
  if(itemPostfix == 'contacts'){
    createDAO = contactsDAO;
  }
  else if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == 'zip' || itemPostfix == 'sh' || itemPostfix == 'gz' || itemPostfix == 'html' || itemPostfix == 'et' || itemPostfix == 'odt' || itemPostfix == 'pdf'){
    createDAO = documentsDAO;
  }
  else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
    createDAO = picturesDAO;
  }
  else if(itemPostfix == 'mp3' || itemPostfix == 'ogg' ){
    createDAO = musicDAO;
  } 
  else {
    callback(null);
    return;
  } 
  if(createDAO==contactsDAO){
    function findByNameCb(err,item){
      if(err){
        createDAO.findByName(path,findByNameCb);
      }
      else{
        callback(item);
      }
    }
    createDAO.findByName(path,findByNameCb);
  }
  else{
    function findByPathCb(err,item){
      if(err){
        createDAO.findByPath(path,findByPathCb);
      }
      else{
        callback(item);       
      }
    }
    createDAO.findByPath(path,findByPathCb);
  }
}

/**
 * @method execSQL
 *    Execute the specific sql string.
 * @param sql
 *    Specific SQL string to execute.
 * @param callback
 *    If provided,this function will be called when the sql was executed successfully
 *    or when an err occurred, if successfull will return string "commit", otherwise "rollback"
 */
function execSQL(sql,callback){
  //Open database
  var oDb = openDB();
  oDb.exec(sql,function(err){
    if(err){
      console.log("Error:execute SQL error.");
      console.log("Info :" + err);
      rollbackTrans(oDb,callback);
      return;
    }
    commitTrans(oDb,callback);
  });
}

/**
 * @method rollbackTrans
 *    If an err occurred,this method will be executed, rollback.
 * @param db
 *    The database obj.
 * @param callback
 */
function rollbackTrans(db,callback){
  db.run(ROLLBACK_TRANS,function(err){
    if(err) throw err;
    callback("rollback");
    closeDB(db);
  });
}

/**
 * @method commitTrans
 *    If execute successfully, this method will be executed, commit transaction.
 * @param sql
 *    The database obj.
 * @param callback
 */
function commitTrans(db,callback){
  db.run(COMMIT_TRANS,function(err){
    if(err) throw err;
    callback("commit");
    closeDB(db);
  });
}

/**
 * @method createItems
 *    Insert data into database, support batch execute.
 * @param items
 *    An obj Array, each obj must has attribute category&&URI match table&&URI,
 *    other attributes match field in table.
 * @param callback
 *    Retrive "commit" when successfully
 *    Retrive "rollback" when error
 */
exports.createItems = function(items,callback){
  //var aSqlArray = new Array();
  var sSqlStr = BEGIN_TRANS;
  items.forEach(function(item){
    var oTempItem = item;
    sSqlStr = sSqlStr + "insert into " + oTempItem.category;
    //Delete attribute category and id from this obj.
    delete oTempItem.category;
    delete oTempItem.id;
    var sKeyStr = " (id";
    var sValueStr = ") values (null";
    for(var key in oTempItem){
      sKeyStr = sKeyStr + "," + key;
      if(typeof oTempItem[key] == 'string')
        oTempItem[key] = oTempItem[key].replace("'","''");
      sValueStr = sValueStr + ",'" + oTempItem[key] + "'";
    }
    sSqlStr = sSqlStr + sKeyStr + sValueStr + ");";
    sSqlStr = sSqlStr + "insert into recent (file_uri,lastAccessTime) values ('" + oTempItem.URI + "','" + oTempItem.lastAccessTime + "');";
  });
  //console.log("INSERT Prepare SQL is : "+sSqlStr);

  // Exec sql
  execSQL(sSqlStr,callback);
}

exports.deleteItemByUri = function(uri, callback ,rmDataByUriCb){
  config.dblog("delete uri:" + uri);
  
  var aUri = uri.split('#');
  if (aUri.length != 3) {
    config.dblog("Error: uri is wrong in getItemByUri!");
    callback(uri,"Error: uri is wrong in getItemByUri!",rmDataByUriCb);
    return;
  }
  var sTableName = aUri[2];
  config.dblog("GetItemByUri: TableName is:" + sTableName);

  var oDeleteDao = null;

  switch(sTableName){
    case 'contacts' : {
      oDeleteDao = contactsDAO;
    }
    break;
    case 'pictures' : {
      oDeleteDao = picturesDAO;
    }
    break;
    case 'videos' : {
      oDeleteDao = videosDAO;
    }
    break;
    case 'documents' : {
      oDeleteDao = documentsDAO;
    }
    break;
    case 'music' : {
      oDeleteDao = musicDAO;
    }
    break;
    default:{
      config.dblog("GetItemByUri: this is default in switch!");
    }
  }

  oDeleteDao.deleteItemByUri(uri, function(err){
    if(err){
      callback(uri,err,rmDataByUriCb);
    }else{
      callback(uri,"successfull",rmDataByUriCb);
    }
  })
}

/**
 * @method updateItems
 *   Update data by URI, support batch execute.
 * @param items
 *    An obj Array, each obj must has attribute category&&URI match table&&URI,
 *    other attributes match field in table.
 * @param callback
 *    Retrive "commit" when successfully
 *    Retrive "rollback" when error
 */
exports.updateItems = function(items,callback){
  var sSqlStr = BEGIN_TRANS;
  items.forEach(function(item){
    var oTempItem = item;
    var sItemUri = oTempItem.URI;
    sSqlStr = sSqlStr + "Update " + oTempItem.category + " set URI='" + sItemUri + "'";
    //Delete attribute category and id from this obj.
    delete oTempItem.category;
    delete oTempItem.id;
    delete oTempItem.URI;
    for(var key in oTempItem){
      if(typeof oTempItem[key] == 'string')
        oTempItem[key] = oTempItem[key].replace("'","''");
      sSqlStr = sSqlStr + "," + key + "='" + oTempItem[key] + "'";
    }
    sSqlStr = sSqlStr + " where URI='" + sItemUri + "';";
    sSqlStr = sSqlStr + "Update recent set lastAccessTime='" + oTempItem.lastAccessTime + "' where file_uri='" + sItemUri + "';";
  });
  console.log("UPDATE Prepare SQL is : "+sSqlStr);

  // Exec sql
  execSQL(sSqlStr,callback);
}

exports.modifyOrInsertUpdateItems = function(modifyHistoryItems, createHistoryItems, createOperationItems){
  if(modifyHistoryItems != ""){
    modifyHistoryItems.forEach(function(modifyItem){    
      var sqlstr="UPDATE UpdateHistory SET parents='"+modifyItem.parents+"',children='"+modifyItem.children+"' WHERE version_id='"+modifyItem.version_id+"'";
      function modifyUpdateCb(err,sql){
        if (err) {
          console.log("Error: modify update history error ! " + err);
          actionHistoryDAO.modifyUpdateHistoryItem(sql,modifyUpdateCb);
        }
      }
      actionHistoryDAO.modifyUpdateHistoryItem(sqlstr,modifyUpdateCb);
    });
  }
  if(createHistoryItems != ""){
    createHistoryItems.forEach(function(newHistoryItem){
      function insertUpdateHistoryCb(err,historyItem){
        if (err) {
          console.log("Error: insert update history error ! " + err);
          actionHistoryDAO.insertUpdateHistoryItem(historyItem,insertUpdateHistoryCb);
        }
      }
      actionHistoryDAO.insertUpdateHistoryItem(newHistoryItem,insertUpdateHistoryCb);
    });
  }
  if(createOperationItems != ""){
    createOperationItems.forEach(function(newOperationItem){
      function insertUpdateOperationCb(err,operationItem){
        if (err) {
          console.log("Error: insert update operation error ! " + err);
          actionHistoryDAO.insertUpdateOperationItem(operationItem,insertUpdateOperationCb);
        }
      }
      actionHistoryDAO.insertUpdateOperationItem(newOperationItem,insertUpdateOperationCb);
    });
  }
}

exports.updateRecentTable = function(uri,time,callback){
  recentDAO.updateTime(uri,time, function(err){
    if(err){
      callback(uri,time,err);
    }
    else{
      config.dblog("update recent successfull");
      callback(uri,time,'successfull');
    }
  });  
}

exports.getRecentByOrder = function(callback){
  recentDAO.findAllByOrder(function(err, recent){
    if(err){
      config.dblog(err);
      callback(null);
    }
    callback(recent);
  });
}

exports.queryItemInAllByStr = function(str, callback){
  var itemArray = {};
  contactsDAO.findAllByStr(str, function(contacts){
    itemArray.push(items);
    callback(itemArray);
});
}

exports.findEachActionHistory = function(action, callback){
  actionHistoryDAO.findAll(action, function(err, actions){
    if(err){
      config.dblog(err);
      callback(null);
    }
    callback(actions);
  });
}

exports.findAllActionHistory = function(callback){
  var insertActions = null;
  var deleteActions = null;
  var updateActions = null;

  actionHistoryDAO.findAll("insert", function(err, insActions){
    if(err){
      config.dblog(err);
      callback(null);
    }else{
      insertActions = insActions;
      actionHistoryDAO.findAll("delete", function(err, delActions){
        if(err){
          config.dblog(err);
          callback(null);
        }else{
          deleteActions = delActions;
          actionHistoryDAO.findAll("update", function(err, updActions){
            if(err){
              config.dblog(err);
              callback(null);
            }else{
              updActions.forEach(function(updAction){
                updAction.parents = JSON.parse(updAction.parents);
                if(updAction.children != "")
                  updAction.children = JSON.parse(updAction.children);
                //console.log("============================================zfbfd:");
                //console.log(updAction.parents);
                //console.log(updAction.children);
              });
              updateActions = updActions;
              callback(insertActions, deleteActions, updateActions);
            }
          });
        }
      });
    }
  });
}

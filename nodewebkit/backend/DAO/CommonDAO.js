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
  console.log("config database path: " + config.DATABASEPATH);
  return new sqlite3.Database(config.DATABASEPATH);
}

/**
 * @method closeDB
 *    Close the database.
 * @param database
 *    The database object.
 * @param callback
 *    Callback
 */
function closeDB(database,callback){
  database.close(callback);
}

/**
 * @method createTables
 *    Use SQL to create tables in database.
 * @param sqlStr
 *    The specific SQL string.
 * @param callback
 *    Callback
 */
function createTables(db,sqlStr,callback){
  if(!sqlStr){
    console.log("Error: SQL is null when create tabale ");
    return;
  }
  console.log("Start to create tables with SQL :" + sqlStr);
  if(!db){
    db = openDB();
  }
  db.exec(sqlStr,function(err){
    createComplete(err,db,sqlStr,callback);
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
 * @param callback
 *    Callback
 */
function createComplete(err,db,sqlStr,callback){
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
      callback(null);
    }
    return;
  }
  createTableTimes = 0;
  db.run("COMMIT",function(err){
    if(err) throw err;
    console.log("Msg: create tables successfully");
    closeDB(db,callback);
  });
}

/**
 * @method initDatabase
 *    Database initialize.
 * @param callback
 *    Callback
 */
exports.initDatabase = function(callback){
  var sInitDbSQL = SQLSTR.INITDB;
  createTables(null,sInitDbSQL,callback);
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
 * @method allSQL
 *    Execute the specific sql string.
 * @param sql
 *    Specific SQL string to execute.
 * @param callback
 *    If provided,this function will be called when the sql was executed successfully
 *    or when an err occurred, if successfull will return string "commit", otherwise "rollback"
 */
function allSQL(sql,callback){
  //Open database
  var oDb = openDB();
  oDb.all(sql,function(err,rows){
    if(err){
      console.log("Error:execute SQL error.");
      console.log("Info :" + err);
      callback(err,null);
      return;
    }
    callback(null,rows);
    closeDB(oDb);
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
 * @method createItem
 *    Insert one data into database.
 * @param item
 *    An data object, it has attribute category&&URI match table&&URI,
 *    other attributes match field in table.
 * @param callback
 *    Retrive "commit" when successfully
 *    Retrive "rollback" when error
 */
exports.createItem = function(item,callback){
  //SQL string
  var sSqlStr = BEGIN_TRANS;
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
  console.log("INSERT Prepare SQL is : "+sSqlStr);

  // Exec sql
  execSQL(sSqlStr,callback);
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
  //SQL string
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
  });
  //console.log("INSERT Prepare SQL is : "+sSqlStr);

  // Exec sql
  execSQL(sSqlStr,callback);
}

/**
 * @method deleteItems
 *    Delete data from database, support batch execute.
 * @param items
 *    An obj Array, each obj must has attribute category&&URI match table&&URI,
 *    other attributes match field in table.
 * @param callback
 *    Retrive "commit" when successfully
 *    Retrive "rollback" when error
 */
exports.deleteItems = function(items,callback){
  //var aSqlArray = new Array();
  var sSqlStr = BEGIN_TRANS;
  items.forEach(function(item){
    var oTempItem = item;
    sSqlStr = sSqlStr + "delete from " + oTempItem.category + " where 1=1";
    //Delete attribute category from this obj.
    delete oTempItem.category;
    var sKeyStr = " (id";
    var sValueStr = ") values (null";
    for(var key in oTempItem){
      if(typeof oTempItem[key] == 'string')
        oTempItem[key] = oTempItem[key].replace("'","''");
      sSqlStr = sSqlStr + " and " + key + "='" + oTempItem[key] + "'";
    }
    sSqlStr = sSqlStr + ";";
  });
  //console.log("DELETE Prepare SQL is : "+sSqlStr);

  // Exec sql
  execSQL(sSqlStr,callback);
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
  });
  console.log("UPDATE Prepare SQL is : "+sSqlStr);

  // Exec sql
  execSQL(sSqlStr,callback);
}

/**
 * @method findItems
 *   Find datas with conditions.
 * @param columns
 *    An array, if you want to specific column in results,put the column's name in this array.
 *    If you want select all columns, set it null.
 * @param tables
 *    A table's name array, like ["table1","table2"].
 * @param conditions
 *    A conditions array, for example ["condition1='xxxxxx'","condition2=condition3='xxxx'"].
 *    If you want select all rows, set it null.
 * @param extras
 *    An extra conditions array, for example ["group by xxx","order by xxx"].
 *    If you want select all rows, set it null.
 * @param callback
 *    All results in array.
 */
exports.findItems = function(columns,tables,conditions,extras,callback){
  var sColStr = "select ";
  var sTablesStr = " from ";
  var sCondStr = " where 1=1";
  var sExtraStr = "";
  var sQueryStr;
  if(!columns){
    sColStr =sColStr + "*";
  }else{
    columns.forEach(function(col){
      sColStr = sColStr + col + ",";
    });
    sColStr = sColStr.substring(0,sColStr.length-1);
  }
  if(!tables){
    console.log("Error: table's name is null!");
    callback("error");
    return;
  }else{
    tables.forEach(function(table){
      sTablesStr = sTablesStr + table + ",";
    });
    sTablesStr = sTablesStr.substring(0,sTablesStr.length-1);
  }
  if(conditions){
    conditions.forEach(function(condition){
      sCondStr = sCondStr + " and " + condition;
    });
  }
  if(extras){
    extras.forEach(function(extra){
      sExtraStr = sExtraStr + extra;
    });
  }

  // Make query string
  sQueryStr = sColStr + sTablesStr + sCondStr + sExtraStr;
  console.log("SELECT Prepare SQL is :" + sQueryStr);

  // Runs the SQL query
  allSQL(sQueryStr,callback);
}

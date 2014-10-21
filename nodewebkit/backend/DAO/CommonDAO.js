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
var createTableTimes = 0;

// @const
var BEGIN_TRANS = "BEGIN TRANSACTION;";
var ROLLBACK_TRANS = "ROLLBACK";
var COMMIT_TRANS = "COMMIT;";

//Resolve multiple exec
var prepArray = new Array();
var isDbBusy = false;
var prepDb;

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
 * @method runSQL
 *    Execute the specific sql string.
 * @param sql
 *    Specific SQL string to execute.
 * @param callback
 *    If provided,this function will be called when the sql was executed successfully
 *    or when an err occurred, if successfull will return string "commit", otherwise "rollback"
 */
function runSQL(sql,callback){
  prepDb.run(sql,function(err){
    if(err){
      console.log("Error:execute SQL error.");
      console.log("Info :" + err);
      callback(err);
      checkPrepArray();
      return;
    }
    callback();
    checkPrepArray();
  });
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
  prepDb.exec(sql,function(err){
    if(err){
      console.log("Error:execute SQL error.");
      console.log("Info :" + err);
      rollbackTrans(callback);
      return;
    }
    commitTrans(callback);
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
function rollbackTrans(callback){
  prepDb.run(ROLLBACK_TRANS,function(err){
    if(err) throw err;
    callback("rollback");
    checkPrepArray();
  });
}

/**
 * @method commitTrans
 *    If execute successfully, this method will be executed, commit transaction.
 * @param sql
 *    The database obj.
 * @param callback
 */
function commitTrans(callback){
  prepDb.run(COMMIT_TRANS,function(err){
    if(err) throw err;
    callback("commit");
    checkPrepArray();
  });
}

/**
 * @method checkPrepArray
 *    Check prepare sql Array,run it if not null.
 */
function checkPrepArray(){
  var prepItem = prepArray.shift();
  if(prepItem != undefined){
    var sSqlStr = prepItem.sqlStr;
    var fCallback = prepItem.prepCallback;
    var sMethod = prepItem.prepMethod

    //Run/Exec sql
    switch(sMethod){
      case "run":
        runSQL(sSqlStr,fCallback);
        break;
      case "exec":
        execSQL(sSqlStr,fCallback);
        break;
    }
  }else{
    closeDB(prepDb);
    isDbBusy = false;
  }
}

/**
 * @method createItem
 *    Insert one data into database.
 * @param item
 *    An data object, it has attribute category&&URI match table&&URI,
 *    other attributes match field in table.
 * @param callback
 *    Retrive null when successfully
 *    Retrive err when error
 */
exports.createItem = function(item,callback){
  //SQL string
  var oTempItem = item;
  var sSqlStr;
  sSqlStr = "insert into " + oTempItem.category;
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
  //console.log("INSERT Prepare SQL is : "+sSqlStr);

  //If db is busy, push sql string into array,
  //else run it.
  if(isDbBusy){
    var prepItem = {
      prepMethod:"run",
      sqlStr:sSqlStr,
      prepCallback:callback
    };
    prepArray.push(prepItem);
  }else{
    isDbBusy = true;
    
    //Open database
    prepDb = openDB();
    //Run SQL
    runSQL(sSqlStr,callback);
  }
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
 // console.log("INSERT Prepare SQL is : "+sSqlStr);

  //If db is busy, push sql string into array,
  //else run it.
  if(isDbBusy==true){
    var prepItem = {
      prepMethod:"exec",
      sqlStr:sSqlStr,
      prepCallback:callback
    };
    console.log(prepItem);
    prepArray.push(prepItem);
  }else{
    isDbBusy = true;
    
    //Open database
    prepDb = openDB();
    //Exec SQL
    execSQL(sSqlStr,callback);

  }
}

/**
 * @method deleteItem
 *    Delete data from database.
 * @param items
 *    An obj, must has attribute category&&conditions match table&&conditions.
 *    Conditions is a condition array,like["condition1='xxx'","condition2='x' or condition3='xx'"],
 *    Each condition in array will combine with "and".
 * @param callback
 *    Retrive null when successfully
 *    Retrive err when error
 */
exports.deleteItem = function(item,callback){
  var oTempItem = item;
  var sSqlStr;
  var sCondStr = " where 1=1";
  sSqlStr = "delete from " + oTempItem.category;
  //Make conditions
  var aConditions = new Array();
  if(oTempItem.conditions != undefined){
    aConditions = oTempItem.conditions;
    aConditions.forEach(function(condition){
      sCondStr = sCondStr + " and " + condition; 
    });
  }
  sSqlStr = sSqlStr + sCondStr;
  //console.log("DELETE Prepare SQL is : "+sSqlStr);

  //If db is busy, push sql string into array,
  //else run it.
  if(isDbBusy){
    var prepItem = {
      prepMethod:"run",
      sqlStr:sSqlStr,
      prepCallback:callback
    };
    prepArray.push(prepItem);
  }else{
    isDbBusy = true;
    
    //Open database
    prepDb = openDB();
    //Run sql
    runSQL(sSqlStr,callback);
  }
}

/**
 * @method deleteItems
 *    Delete data from database, support batch execute.
 * @param items
 *    An obj Array, each obj must has attribute category&&conditions match table&&conditions.
 *    Conditions is a condition array,like["condition1='xxx'","condition2='x' or condition3='xx'"],
 *    Each condition in array will combine with "and".
 * @param callback
 *    Retrive "commit" when successfully
 *    Retrive "rollback" when error
 */
exports.deleteItems = function(items,callback){
  //var aSqlArray = new Array();
  var sSqlStr = BEGIN_TRANS;
  items.forEach(function(item){
    var oTempItem = item;
    var sCondStr = " where 1=1";
    sSqlStr = sSqlStr + "delete from " + oTempItem.category;
    //Make conditions
    var aConditions = new Array();
    if(oTempItem.conditions != undefined){
      aConditions = oTempItem.conditions;
      aConditions.forEach(function(condition){
        sCondStr = sCondStr + " and " + condition; 
      });
    }
    sSqlStr = sSqlStr + sCondStr + ";";
  });
  //console.log("DELETE Prepare SQL is : "+sSqlStr);

  //If db is busy, push sql string into array,
  //else run it.
  if(isDbBusy){
    var prepItem = {
      prepMethod:"exec",
      sqlStr:sSqlStr,
      prepCallback:callback
    };
    prepArray.push(prepItem);
  }else{
    isDbBusy = true;
    
    //Open database
    prepDb = openDB();
    //Exec SQL
    execSQL(sSqlStr,callback);
  }
}

/**
 * @method updateItem
 *   Update data by specific condition, support batch execute.
 * @param items
 *    An obj, must has attribute category match table,
 *    other attributes match field in table.
 *    There is a specific attribute: "conditions".It's an contidion array, 
 *    for example ["condition1='xxx'","condition2='x' or condition3='xx'"],
 *    Each condition in array will combine with "and".
 *    If you want to update items by any contidions,you could put them here.
 *    Default is update by URI if this attribute is undefined(Must have attribute URI).
 * @param callback
 *    Retrive null when successfully
 *    Retrive err when error
 */
exports.updateItem = function(item,callback){
  var sCondStr = " where 1=1";
  var sSqlStr;
  var oTempItem = item;
  var sItemUri = oTempItem.URI;
  var aConditions = new Array();
  if(oTempItem.conditions == undefined){
    sCondStr = sCondStr + " and URI='" + sItemUri + "'";
  }else{
    aConditions = oTempItem.conditions;
    delete oTempItem.conditions;
    aConditions.forEach(function(condition){
      sCondStr = sCondStr + " and " + condition; 
    });
  }
  sSqlStr = "Update " + oTempItem.category + " set ";
  //Delete attribute category and id from this obj.
  delete oTempItem.category;
  delete oTempItem.id;
  delete oTempItem.URI;
  for(var key in oTempItem){
    if(typeof oTempItem[key] == 'string')
      oTempItem[key] = oTempItem[key].replace("'","''");
    sSqlStr = sSqlStr + key + "='" + oTempItem[key] + "',";
  }
  sSqlStr = sSqlStr.substring(0,sSqlStr.length-1);
  sSqlStr = sSqlStr + sCondStr + ";";
  console.log("UPDATE Prepare SQL is : "+sSqlStr);

  //If db is busy, push sql string into array,
  //else run it.
  if(isDbBusy){
    var prepItem = {
      prepMethod:"run",
      sqlStr:sSqlStr,
      prepCallback:callback
    };
    prepArray.push(prepItem);
  }else{
    isDbBusy = true;
    
    //Open database
    prepDb = openDB();
    //Run SQL
    runSQL(sSqlStr,callback);
  }
}

/**
 * @method updateItems
 *   Update data by specific condition, support batch execute.
 * @param items
 *    An obj Array, each obj must has attribute category match table,
 *    other attributes match field in table.
 *    There is a specific attribute: "conditions".It's an contidion array,
 *    for example ["condition1='xxx'","condition2='x' or condition3='xx'"],
 *    Each condition in array will combine with "and".
 *    If you want to update items by any contidions,you could put them here.
 *    Default is update by URI if this attribute is undefined(Must have attribute URI).
 * @param callback
 *    Retrive "commit" when successfully
 *    Retrive "rollback" when error
 */
exports.updateItems = function(items,callback){
  var sCondStr = " where 1=1";
  var sSqlStr = BEGIN_TRANS;
  items.forEach(function(item){
    var oTempItem = item;
    var sItemUri = oTempItem.URI;
    var aConditions = new Array();
    if(oTempItem.conditions == undefined){
      sCondStr = sCondStr + " and URI='" + sItemUri + "'";
    }else{
      aConditions = oTempItem.conditions;
      delete oTempItem.conditions;
      aConditions.forEach(function(condition){
        sCondStr = sCondStr + " and " + condition; 
      });
    }
    sSqlStr = sSqlStr + "Update " + oTempItem.category + " set ";
    //Delete attribute category and id from this obj.
    delete oTempItem.category;
    delete oTempItem.id;
    delete oTempItem.URI;
    for(var key in oTempItem){
      if(typeof oTempItem[key] == 'string')
        oTempItem[key] = oTempItem[key].replace("'","''");
      sSqlStr = sSqlStr + key + "='" + oTempItem[key] + "',";
    }
    sSqlStr = sSqlStr.substring(0,sSqlStr.length-1);
    sSqlStr = sSqlStr + sCondStr + ";";
    sCondStr = " where 1=1";
  });
  console.log("UPDATE Prepare SQL is : "+sSqlStr);

  //If db is busy, push sql string into array,
  //else run it.
  if(isDbBusy){
    var prepItem = {
      prepMethod:"exec",
      sqlStr:sSqlStr,
      prepCallback:callback
    };
    prepArray.push(prepItem);
  }else{
    isDbBusy = true;
    
    //Open database
    prepDb = openDB();
    //Exec SQL

    execSQL(sSqlStr,callback);
  }
}

/**
 * @method findItems
 *   Find datas with conditions.
 * @param columns
 *    An array, if you want to specific column in results,put the column's name in this array.
 *    If you want select all columns, set it null.
 * @param tables
 *    A table's name,if you want to select from multi-table,put them in array, like ["table1","table2"].
 * @param conditions
 *    A conditions array, for example ["condition1='xxx'","condition2='x' or condition3='xx'"],
 *    Each condition in array will combine with "and".
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
  }else if(typeof tables == 'string'){
    sTablesStr = sTablesStr + tables;
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

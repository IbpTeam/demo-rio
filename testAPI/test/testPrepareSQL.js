function testInsert(items){
  var aSqlArray = new Array();
  var sSqlStr = "begin transaction;";
  items.forEach(function(item){
    var oTempItem = item;
    sSqlStr = sSqlStr + "insert into " + oTempItem.category;
    delete oTempItem.category;
    delete oTempItem.id;
    var sKeyStr = " (id";
    var sValueStr = ") values (null";
    for(var key in oTempItem){
      sKeyStr = sKeyStr + "," + key;
      if(typeof oTempItem[key] == 'string')
        //console.log("=====================" + oTempItem[key]);
        oTempItem[key] = oTempItem[key].replace("'","''");
      sValueStr = sValueStr + "," + oTempItem[key];
    }
    sSqlStr = sSqlStr + sKeyStr + sValueStr + ");";  
  });
    console.log(sSqlStr);   
}

function testUpdate(items){
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
  console.log("Prepare SQL is : "+sSqlStr);
}

function findItems(columns,tables,conditions,callback){
  var sColStr = "select ";
  var sTablesStr = " from ";
  var sCondStr = " where 1=1";
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

  // Make query string
  sQueryStr = sColStr + sTablesStr + sCondStr;
  console.log("SELECT Prepare SQL is :" + sQueryStr);
  callback();
}

function testFindItems(){
  var columns = ["test1","test2","test3","test4"];
  var tables = ["table1","table2"];
  var conditions = ["condition1=1","condition2=condition22=222"];

  findItems(null,tables,conditions,function(){});
}

var BEGIN_TRANS = "BEGIN TRANSACTION;";
var items = new Array();

item1 = {
  category:"test1",
  name:1,
  age:"et'fff",
  sex:"444"
};
item2 = {
  category:"test2",
  name:2,
  age:22,
  sex:555,
  phone:"888",
  id:null
};
item3 = {
  category:"test3",
  name:3
};

items.push(item1);
items.push(item2);
//items.push(item3);

//testObj(items);
//testUpdate(items);

testFindItems();

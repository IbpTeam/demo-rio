var sqlite3 = require('sqlite3');
var events = require('events');
var categoryEmitter = new events.EventEmitter();
//连接数据库
function openDB(){
  return new sqlite3.Database('/home/cos/demo-rio/nodewebkit/db/rio');
}

//关闭数据库
function closeDB(database){
  database.close();
}

//获取EventEmitter
exports.getEmitter = function(){
  var emitter = categoryEmitter;
  return emitter;
}

//查询category表中所有数据
exports.findAll = function(){
  var db = openDB();
  db.all("select * from Category", findAllCallBack);
  //.log(id);
  closeDB(db);
}  

function findAllCallBack(err, rows){
  var category = new Array();
  rows.forEach(function (row){
    category.push({
      id:row.id,
      type:row.type,
      desc:row.desc
    });
  });
  console.log('=========================');
  console.log(category);
  categoryEmitter.emit('findAll', category);
}

//根据ID查询表中指定数据
exports.findById = function(id, callback){
  var db = openDB();
}

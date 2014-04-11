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

/**
 * @method findAll
 *   查询category表中所有数据
 * @param null
 *
 * @return category
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(){
  var db = openDB();
  db.all("select * from Category", findAllCallBack);
  closeDB(db);
}  
//findAll方法回调函数
function findAllCallBack(err, rows){
  if(err){
    console.log(err);
    categoryEmitter.emit('findAll', null);
    return;
  }
  var category = new Array();
  rows.forEach(function (row){
    category.push({
      id:row.id,
      type:row.type,
      desc:row.desc
    });
  });
  categoryEmitter.emit('findAll', category);
}

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   category表中的主键
 * @return category
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id){
  var db = openDB();
  db.get("select * from Category where id = ?", id, findByIdCallBack);
  closeDB();
}
//findById方法回调函数
function findByIdCallBack(err, row){
  if(err){
    console.log(err);
    categoryEmitter.emit('findById', null);
  }
  var category = new Array();
  category.push({
    id:row.id,
    type:row.type,
    desc:row.desc
  });
  categoryEmitter.emit('findById', category);
}
/**
 * @method countTotal
 *   查询Category表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(){
  var db = openDB();
  db.get("select count(*) as total from Category", countTotalCallBack);
  closeDB();  
}
//countTotal方法回调函数
function countTotalCallBack(err, row){
  if(err){
    console.log(err);
    categoryEmitter.emit('countTotal', null);
  }
  var total = row.total;
  category.Emitter.emit('countTotal', total);
}

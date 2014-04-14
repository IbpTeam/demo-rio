var sqlite3 = require('sqlite3');
var events = require('events');
var picturesEmitter = new events.EventEmitter();

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
  var emitter = picturesEmitter;
  return emitter;
}

/**
 * @method findAll
 *   查询pictures表中所有数据
 * @param null
 *
 * @return pictures
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(){
  var db = openDB();
  db.all("select * from pictures", findAllCallBack);
  closeDB(db);
}  
//findAll方法回调函数
function findAllCallBack(err, rows){
  if(err){
    console.log(err);
    picturesEmitter.emit('findAll', null);
    return;
  }
  var pictures = new Array();
  rows.forEach(function (row){
    pictures.push({
      id:row.id,
      filename:row.filename,
      path:row.path,
      size:row.size,
      location:row.location,
      postfix:row.postfix,
      createTime:row.createTime,
      lastModifyTime:row.lastModifyTime,
      others:row.others
    });
  });
  picturesEmitter.emit('findAll', pictures);
}

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   pictures表中的主键
 * @return pictures
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id){
  var db = openDB();
  db.get("select * from pictures where id = ?", id, findByIdCallBack);
  closeDB();
}
//findById方法回调函数
function findByIdCallBack(err, row){
  if(err){
    console.log(err);
    picturesEmitter.emit('findById', null);
  }
  var pictures = new Array();
  pictures.push({
    id:row.id,
    filename:row.filename,
    path:row.path,
    size:row.size,
    location:row.location,
    postfix:row.postfix,
    createTime:row.createTime,
    lastModifyTime:row.lastModifyTime,
    others:row.others
  });
  picturesEmitter.emit('findById', pictures);
}
/**
 * @method countTotal
 *   查询pictures表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(){
  var db = openDB();
  db.get("select count(*) as total from pictures", countTotalCallBack);
  closeDB();  
}
//countTotal方法回调函数
function countTotalCallBack(err, row){
  if(err){
    console.log(err);
    picturesEmitter.emit('countTotal', null);
  }
  var total = row.total;
  pictures.Emitter.emit('countTotal', total);
}

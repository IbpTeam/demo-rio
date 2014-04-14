var sqlite3 = require('sqlite3');
var events = require('events');
var videosEmitter = new events.EventEmitter();

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
  var emitter = videosEmitter;
  return emitter;
}

/**
 * @method findAll
 *   查询videos表中所有数据
 * @param null
 *
 * @return videos
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(){
  var db = openDB();
  db.all("select * from videos", findAllCallBack);
  closeDB(db);
}  
//findAll方法回调函数
function findAllCallBack(err, rows){
  if(err){
    console.log(err);
    videosEmitter.emit('findAll', null);
    return;
  }
  var videos = new Array();
  rows.forEach(function (row){
    videos.push({
      id:row.id,
      name:row.name,
      postfix:row.postfix,
      path:row.path,
      size:row.size,
      type:row.type,
      createTime:row.createTime,
      lastModifyTime:row.lastModifyTime,
      others:row.others
    });
  });
  videosEmitter.emit('findAll', videos);
}

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   videos表中的主键
 * @return videos
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id){
  var db = openDB();
  db.get("select * from videos where id = ?", id, findByIdCallBack);
  closeDB();
}
//findById方法回调函数
function findByIdCallBack(err, row){
  if(err){
    console.log(err);
    videosEmitter.emit('findById', null);
  }
  var videos = new Array();
  videos.push({
    id:row.id,
    name:row.name,
    postfix:row.postfix,
    path:row.path,
    size:row.size,
    type:row.type,
    createTime:row.createTime,
    lastModifyTime:row.lastModifyTime,
    others:row.others
  });
  videosEmitter.emit('findById', videos);
}
/**
 * @method countTotal
 *   查询videos表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(){
  var db = openDB();
  db.get("select count(*) as total from videos", countTotalCallBack);
  closeDB();  
}
//countTotal方法回调函数
function countTotalCallBack(err, row){
  if(err){
    console.log(err);
    videosEmitter.emit('countTotal', null);
  }
  var total = row.total;
  videos.Emitter.emit('countTotal', total);
}

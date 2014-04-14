var sqlite3 = require('sqlite3');
var events = require('events');
var contactsEmitter = new events.EventEmitter();

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
  var emitter = contactsEmitter;
  return emitter;
}

/**
 * @method findAll
 *   查询contacts表中所有数据
 * @param null
 *
 * @return contacts
 *   数组对象，数组中每一个元素都是一条数据对象
 */
exports.findAll = function(){
  var db = openDB();
  db.all("select * from Contacts", findAllCallBack);
  closeDB(db);
}  
//findAll方法回调函数
function findAllCallBack(err, rows){
  if(err){
    console.log(err);
    contactsEmitter.emit('findAll', null);
    return;
  }
  var contacts = new Array();
  rows.forEach(function (row){
    contacts.push({
      id:row.id,
      name:row.name,
      phone:row.phone,
      sex:row.sex,
      age:row.age,
      email:row.email,
      createTime:row.createTime,
      lastModifyTime:row.lastModifyTime
    });
  });
  contactsEmitter.emit('findAll', contacts);
}

/**
 * @method findById
 *   根据ID查询表中指定数据
 * @param id
 *   contacts表中的主键
 * @return contacts
 *   数组对象，数组中仅有一条指定返回的数据对象
 */
exports.findById = function(id){
  var db = openDB();
  db.get("select * from contacts where id = ?", id, findByIdCallBack);
  closeDB();
}
//findById方法回调函数
function findByIdCallBack(err, row){
  if(err){
    console.log(err);
    contactsEmitter.emit('findById', null);
  }
  var contacts = new Array();
  contacts.push({
    id:row.id,
    name:row.name,
    phone:row.phone,
    sex:row.sex,
    age:row.age,
    email:row.email,
    createTime:row.createTime,
    lastModifyTime:row.lastModifyTime
  });
  contactsEmitter.emit('findById', contacts);
}
/**
 * @method countTotal
 *   查询contacts表中类别总数
 * @param null
 *   
 * @return total
 *   Integer 表中类别总数
 */
exports.countTotal = function(){
  var db = openDB();
  db.get("select count(*) as total from contacts", countTotalCallBack);
  closeDB();  
}
//countTotal方法回调函数
function countTotalCallBack(err, row){
  if(err){
    console.log(err);
    contactsEmitter.emit('countTotal', null);
  }
  var total = row.total;
  contactsEmitter.emit('countTotal', total);
}

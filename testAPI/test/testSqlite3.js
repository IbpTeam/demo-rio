/**
 * @Copyright:
 * 
 * @Description: test sqlite3,init database and use transaction.
 *
 * @author: Yuanzhe
 *
 * @Data:2014.9.11
 *
 * @version:0.2.1
 **/
var sqlite3 = require("sqlite3");
var path = require("path");
var fs = require("fs");
var dir = path.join(process.cwd(),"db");
var name = "rio";
var db;
var createTableTimes = 0;
console.log("Path is: " + dir);

fs.exists(dir, function(isExist){
  if(!isExist){
    console.log("create directory.");
    fs.mkdir(dir, createDb);
    return;
  }
  console.log("database is exist.");
  createDb();
});


function createDb(){
  console.log("Create db");
  db = new sqlite3.Database(path.join(dir,name), createTableExec);
}

function createTableExec(err){
  if (err) throw err;
  db.exec("BEGIN TRANSACTION;CREATE TABLE IF NOT EXISTS category (logoPath TEXT, id INTEGER PRIMARY KEY, type TEXT, desc TEXT);INSERT INTO category VALUES('./resources/logo/contacts.png',101,'Contacts','联系人');INSERT INTO category VALUES('./resources/logo/pictures.png',102,'Pictures','图片');INSERT INTO category VALUES('./resources/logo/videos.png',103,'Videos','视频');INSERT INTO category VALUES('./resources/logo/documents.png',104,'Documents','文档');INSERT INTO category VALUES('./resources/logo/music.png',105,'Music','音乐');CREATE TABLE IF NOT EXISTS contacts (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, photoPath TEXT, createTime TEXT, lastModifyTime TEXT, id INTEGER PRIMARY KEY, name TEXT, phone NUMERIC, sex TEXT, age NUMERIC, email TEXT);CREATE TABLE IF NOT EXISTS devices (lastSyncTime TEXT, branchName TEXT, resourcePath TEXT, ip TEXT, name TEXT, id INTEGER PRIMARY KEY, device_id TEXT);CREATE TABLE IF NOT EXISTS documents (commit_id TEXT, version TEXT, URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, project TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT);CREATE TABLE IF NOT EXISTS music (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, album TEXT, composerName TEXT, actorName TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT);CREATE TABLE IF NOT EXISTS pictures (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, location TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT);CREATE TABLE IF NOT EXISTS recent (lastAccessTime TEXT, id INTEGER PRIMARY KEY, file_uri TEXT);CREATE TABLE IF NOT EXISTS tags (file_URI TEXT, tag TEXT);CREATE TABLE IF NOT EXISTS videos (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, name TEXT, others TEXT, path TEXT, id INTEGER PRIMARY KEY, size TEXT, type TEXT, createTime TEXT, lastModifyTime TEXT);",initComplete);
}

function initComplete(err){
  if(err){
    console.log(err);
    console.log("Roll back");
    if(createTableTimes < 5){
      createTableTimes++;      
      db.run("ROLLBACK",createTableExec);
    }else{
      createTableTimes = 0;
      console.log("create table fail.");
    }
    return;
  }
  db.run("COMMIT",closeDb);
}

function createTable(err){
  if (err) throw err;
  console.log("createTable category");
  db.serialize(function(){
    db.run("BEGIN TRANSACTION");
    db.run("CREATE TABLE category (logoPath TEXT, id INTEGER PRIMARY KEY, type TEXT, desc TEXT)");
    db.run("CREATE TABLE contacts (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, photoPath TEXT, createTime TEXT, lastModifyTime TEXT, id INTEGER PRIMARY KEY, name TEXT, phone NUMERIC, sex TEXT, age NUMERIC, email TEXT)");
    db.run("CREATE TABLE documents (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, project TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT)");
    db.run("CREATE TABLE music (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, album TEXT, composerName TEXT, actorName TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT)");
    db.run("CREATE TABLE pictures (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, location TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT)");
    db.run("CREATE TABLE recent (lastAccessTime TEXT, id INTEGER PRIMARY KEY, file_uri TEXT)");
    db.run("CREATE TABLE tags (file_URI TEXT, tag TEXT)");
    db.run("CREATE TABLE videos (commit_id TEXT, version TEXT,  URI TEXT, lastAccessTime TEXT, postfix TEXT, name TEXT, others TEXT, path TEXT, id INTEGER PRIMARY KEY, size TEXT, type TEXT, createTime TEXT, lastModifyTime TEXT)");
    db.run("CREATE TABLE devices (lastSyncTime TEXT, branchName TEXT, resourcePath TEXT, ip TEXT, name TEXT, id INTEGER PRIMARY KEY, device_id TEXT)");
    console.log("init category");
   /**
    var stmt = db.prepare("insert into category values (?,?,?,?)");
    stmt.run('./resources/logo/contacts.png',101,'Contacts','联系人');
    stmt.run('./resources/logo/pictures.png',102,'Pictures','图片');
    stmt.run('./resources/logo/videos.png',103,'Videos','视频');
    //stmt.run('./resources/logo/documents.png','Documents','文档',function(err){if(err){console.log("9999999999999");rollbackDb()}});
    stmt.run('./resources/logo/documents.png',104,'Documents','文档');
    stmt.run('./resources/logo/music.png',105,'Music','音乐');
    stmt.finalize();
    */
    db.run();
    db.run("COMMIT");
    //closeDb();
  });
  //initCategory();
  closeDb();
}

function initCategory(){
  console.log("init category");
  var stmt = db.prepare("insert into category values (?,?,?,?)");
  stmt.run('./resources/logo/contacts.png',101,'Contacts','联系人');
  stmt.run('./resources/logo/pictures.png',102,'Pictures','图片');
  stmt.run('./resources/logo/videos.png',103,'Videos','视频');
  stmt.run('./resources/logo/documents.png',104,'Documents','文档');
  stmt.run('./resources/logo/music.png',105,'Music','音乐');
  stmt.finalize(closeDb);
}

function closeDb(err){
  if (err) throw err;
  console.log("close ");
  db.close();
}

function rollbackDb(){
  db.run("ROLLBACK",closeDb);
}

function commitDb(){
  db.run("COMMIT",closeDb);
}

function runTest(){
  createDb();
}

//runTest();

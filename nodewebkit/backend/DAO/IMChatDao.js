var sqlite3 = require('sqlite3');


function openDB(){
  return new sqlite3.Database('./db/IMdata');
  // Only for testing
  // TODO : this part should be replaced by DataAccess Layer 
}

function closeDB(database){
  database.close();
}



var insertrecvSQL = "insert into receivedHistory (id,src,des,message,type,time) values (null,?,?,?,?,?)";

var findrecvbySRC = "select * from receivedHistory where src = ?";

var findrecvbyDES = "select * from receivedHistory where des = ?"

var insertsentSQL = "insert into sentHistory (id,src,des,message,type,time) values (null,?,?,?,?,?)";

var findsentbySRC =  "select * from sentHistory where src = ?";

var findsentbyDES = "select * from sentHistory where des = ?";

exports.dbrecvInsert = function(src,des,message,type,time,dbinsertcallback)
{
	var db = openDB();
	db.run(insertrecvSQL,src,des,message,type,time,dbinsertcallback);
	closeDB(db);
}

exports.recvQuerybysender = function(src,dbquerycallback)
{
	var db = openDB();
	db.all(findrecvbySRC,src,dbquerycallback);
	closeDB(db);
}

exports.recvQuerybyreceiver = function(des,dbquerycallback)
{
	var db = openDB();
	db.all(findrecvbyDES,des,dbquerycallback);
	closeDB(db);
}

exports.dbsentInsert = function(src,des,message,type,time,dbinsertcallback)
{
	var db = openDB();
	db.run(insertsentSQL,src,des,message,type,time,dbinsertcallback);
	closeDB(db);
}

exports.sentQuerybysender = function(src,dbquerycallback)
{
	db = openDB();
	db.all(findsentbySRC,src,dbquerycallback);
	closeDB(db);
}

exports.sentQuerybyreceiver = function(des,dbquerycallback)
{
	db = openDB();
	db.all(findsentbyDES,des,dbquerycallback);
	closeDB(db);
}

var deleteDao= require("./DAO/ActionHistoryDAO.js");
var HashTable = require('hashtable');
var trans = require('./msgtransfer');

/**
 * @method createHash
 *   将一个数据库表生成hashtable
 * @param table
 *  待生成的表数据
 * @return  hashtable
 *   返回生成的hashtable
 */
function  createHash(table)
{
	var hashtable = new HashTable();
	for(var  tmp in table)
	{
		hashtable.put(table[tmp].dataURI,table[tmp].id);
	}
	return hashtable;
}

/**
 * @method getDiff
 *   计算系统中的表和接收到的表的差值
 * @param table
 *   接收到的表的JSON数据
  * @param Htable
 *   本地数据库表的HashTable
 * @return  diff
 *   返回差值，JSON格式
 */
function getDiff(table,Htable)
{
	var diff = [];
	for(var del in table)
	{
		res = Htable.get(table[del].dataURI);
		if (typeof res == "undefined" ) 
		{
			var tmpdif = {};
			tmpdif["id"] = table[del].id;
			tmpdif["dataURI"] = table[del].dataURI;
			diff.push(tmpdif);
		};
	}
	return diff;
}

function sendDelSYNC(IP)
{
	deleteDao.findAll(function(err,rows){
		var msg = {};
		msg['msgTYPE'] = 'SYNC_DELETE';
		rows.push(msg);
		var sendtmp = JSON.stringify(rows);
		trans.sendMsg(IP,sendtmp);
	});
}

function rplyDelSYNC(IP)
{
	deleteDao.findAll(function(err,rows){
		var msg = {};
		msg['msgTYPE'] =  'DELETE_ARRIVE';
		rows.push(msg);
		var sendtmp = JSON.stringify(rows);
		trans.sendMsg(IP,sendtmp);
	});
}

function insertDelete(dataURI)
{
	deleteDao.createDeleteItem (dataURI,function(){
		console.log("insert into delete History values: "+dataURI);
	});
}

function syncDelete(table)
{
	deleteDao.findAll(function(err,rows){
		var htable = createHash(rows);
		var dif = getDiff(table,htable);
		for(var tmp in dif)
		{
			console.log("diff msg to be inserted: "+dif[tmp].dataURI);
		}
	});
}


function echodelete(err,rows)
{
	if (err) 
	{
		console.log(err);
	};
	

	var htable = createHash(rows);

	var tmp = {};
	tmp["id"] = 656;
	tmp["dataURI"] = "thisisdif";
	rows.push(tmp);

	var c = getDiff(rows,htable);

	console.log(c);

/*	
	rows.forEach(function(rows){
		console.log(htable.get(rows.dataURI));
	});

	var js1 = [];

	for(var a in rows)
	{
		var b = {};
		b["id"]=rows[a].id;
		b["dataURI"]=rows[a].dataURI
		js1.push(b);
	}

	var str2= JSON.stringify(js1);

	var str = JSON.stringify(rows);
	console.log("final:"+str);
	console.log("bbbb:"+str2);
*/

}

exports.createHash = createHash;
exports.getDiff = getDiff;
exports.sendDelSYNC = sendDelSYNC;
exports.rplyDelSYNC = rplyDelSYNC;
exports.insertDelete=insertDelete;
exports.syncDelete = syncDelete;

//sendDelSYNC("127.0.0.1");

//rplyDelSYNC("127.0.0.1");
//.echo();

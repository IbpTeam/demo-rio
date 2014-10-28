/**
 * @Copyright:
 * 
 * @Description: Chat Handle.
 *
 * @author: Yuanzhe
 *
 * @Data:2014.10.16
 *
 * @version:0.2.2
 **/
var commmonDao = require("../DAO/commonDAO");

// Before save chat record, make sure table exist.
var sCreateTable = "CREATE TABLE IF NOT EXISTS #$# (\
                     id INTEGER PRIMARY KEY, sORr TEXT, \
                     message TEXT, time TEXT, \
                     type TEXT, device_id TEXT);";

function newChatRecord(record){
  
}

exports.newSendRecord(){

}

exports.newReceiveRecord(){
	
}
/**
 * @Title: DataSync.js
 * @Description: Function for data sync
 * @author: yuanzhe
 * @version: 0.0.1
 **/

var msgTransfer = require("./msgtransfer");
var commonDAO = require("./DAO/CommonDAO");
var config = require("./config");

//Init method,retrive data from db
function init(initCallback){
  console.log("init update history!");
  commonDAO.findAllActionHistory("update", initCallback);
}

//Sync delete action
function syncDeleteAction(deleteCallBack){
	//To-Do
	deleteCallBack();
}

//Sync insert action
function syncInsertAction(insertCallBack){
	//To-Do
	insertCallBack();
}

//Sync insert action
function syncUpdateAction(updateCallBack){
	//To-Do
	updateCallBack();
}

//Send sync request when other devices connect the net.
function syncRequest(ip){
//  console.log("get ip from internet discovery : " + ip);
  var requestMsg = {
  	type: "syncRequest",
  	account: config.ACCOUNT
  };
  var requestStr = JSON.stringify(requestMsg);
  var ipStr = JSON.stringify(ip);
  msgTransfer.sendMsg(ipStr,requestStr);
//  init();
}

//Confirm request
function syncResponse(remoteIP){
	var jsonStr = null;
	init(function(updateActions){
		console.log(updateActions);
		msgTransfer.sendMsg(remoteIP, JSON.stringify(updateActions));
	});
}

//Start sync data
function syncStart(syncData){
	var insertActions = syncData.insertActions;
	var deleteActions = syncData.deleteActions;
	var updateActions = syncData.updateActions;

	//Sync data, delete > insert > update
	syncDeleteAction(function(){

		//Retrive actions after delete, start to sync insert actions 
		syncInsertAction(function(){

			////Retrive actions after insert, start to sync update actions 
			syncUpdateAction(function(){

			});
		});
	});
}

//Sync complete
function syncComplete(){
	//To-Do
}

//Export method
exports.syncStart = syncStart;
exports.syncRequest = syncRequest;
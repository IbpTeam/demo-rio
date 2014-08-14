/**
 * @Title: DataSync.js
 * @Description: Function for data sync
 * @author: yuanzhe
 * @version: 0.0.1
 **/

var msgTransfer = require("./msgtransfer");
var commonDAO = require("./DAO/CommonDAO");
var config = require("./config");

var state = {
	SYNC_IDLE:0,
	SYNC_REQUEST:1,
	SYNC_START:2,
	SYNC_COMPLETE:3
};

var currentState = state.SYNC_IDLE;
console.log("current state is : " + currentState);

var syncList = {};

//Init method,retrive data from db
function syncInitActions(initCallback){
  console.log("init actions history!");
  commonDAO.findAllActionHistory(initCallback);
}

//Sync send message method
//@param Obj
//     turn to jsonStr
function syncSendMessage(address, msgObj){
	
	var msgStr = JSON.stringify(msgObj);
  	msgTransfer.sendMsg(address,msgStr);
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
function syncRequest(address){
  // console.log("get address from internet discovery : " + address);
  switch(currentState){
	case state.SYNC_IDLE: {
		console.log("syncRequest=========================================" + currentState);
		currentState = state.SYNC_REQUEST;
		var requestMsg = {
  		type: "syncRequest",
  		account: config.ACCOUNT
  		};
  		syncSendMessage(address[0],requestMsg);
	}
	break;
	case 'syncResponse': {
		//console.log("=========================================");
		dataSync.syncStart(msgObj, remoteAD);
	}
	break;
//	case 'syncStart': {
//		//console.log("=========================================");
//		dataSync.syncStart(msgObj, remoteAD);
//	}
//	break;
	case 'syncComplete': {
		//console.log("=========================================");
		//dataSync.syncStart(msgObj, remoteAD);
	}
	break;
	default: {
		console.log("this is in default switch on data");
		//console.log(data);
	}
  }
}

//Confirm request
function syncResponse(msgObj, address){
	var resultValue = null;
	//ToDo something to confirm
	//example account , list for sync and so on... 
	resultValue = "False";
	if (typeof(msgObj.result) != "undefined") {
		//Get and transfer actions
		var insertActions = null;
		var deleteActions = null;
		var updateActions = null;
		syncInitActions(function(insertArray, deleteArray, updateArray){
			insertActions = insertArray;
			deleteActions = deleteArray;
			updateActions = updateArray;

			if (insertActions != null && deleteActions != null && updateActions != null) {
				resultValue = "OK";
			}

			var syncDataObj = {
				type: "syncResponse",
				account:config.ACCOUNT,
				result: resultValue,
				insertActions: insertActions,
				deleteActions: deleteActions,
				updateActions: updateActions
			};

			syncSendMessage(address, syncDataObj);
		});
	}

//	var responseStr = JSON.stringify(responseMsg);
//	console.log(address);
	syncSendMessage(address,responseMsg);
}

/*
//Check Response
function syncCheckResponse(msgObj, address){
	//TODO check response
	if (typeof(msgObj.result) != "undefined" && msgObj.result == "OK") {
		//Get and transfer actions
		var insertActions = null;
		var deleteActions = null;
		var updateActions = null;
		syncInitActions(function(insertArray, deleteArray, updateArray){
			insertActions = insertArray;
			deleteActions = deleteArray;
			updateActions = updateArray;

			var syncDataObj = {
				type: "syncStart",
				account:config.ACCOUNT,
				insertActions: insertActions,
				deleteActions: deleteActions,
				updateActions: updateActions
			};

			syncSendMessage(address, syncDataObj);
		});
	}
}
*/

//Start sync data
function syncStart(syncData, adress){
	var insertActions = syncData.insertActions;
	var deleteActions = syncData.deleteActions;
	var updateActions = syncData.updateActions;

	console.log("insert actions: " + JSON.stringify(insertActions));
	console.log("delete actions: " + JSON.stringify(deleteActions));
	console.log("update actions: " + JSON.stringify(updateActions));

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
exports.syncResponse = syncResponse;
//exports.syncCheckResponse = syncCheckResponse;
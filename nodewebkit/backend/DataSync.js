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
function syncRequest(deviceName,deviceId,deviceAddress){
  // console.log("get address from internet discovery : " + address);
  if (deviceId.localeCompare(config.uniqueID) <= 0) {
  	syncError("device id in request is wrong!");
  	return;
  }

  switch(currentState){
	case state.SYNC_IDLE: {
		console.log("syncRequest==========" + currentState);
		currentState = state.SYNC_REQUEST;
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "sync"
		};
		syncList.push(syncDevice);
		var requestMsg = {
  		type: "syncRequest",
  		account: config.ACCOUNT,
  		deviceId: config.uniqueID
  		};
  		syncSendMessage(deviceAddress[0],requestMsg);
	}
	break;
	case state.SYNC_REQUEST: {
		console.log("syncRequest=============" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "wait"
		};
		syncList.push(syncDevice);
	}
	break;
	case state.SYNC_START: {
		console.log("syncRequest============" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "wait"
		};
		syncList.push(syncDevice);
	}
	break;
	case state.SYNC_COMPLETE: {
		console.log("syncRequest==========" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "wait"
		};
		syncList.push(syncDevice);
	}
	break;
	default: {
		console.log("this is in default switch in syncRequest");
		//console.log(data);
	}
  }
}

//Confirm request
function syncResponse(syncData, address){

	switch(currentState){
	case state.SYNC_IDLE: {
		console.log("syncResponse=========================================" + currentState);
		currentState = state.SYNC_REQUEST;
		var syncDevice = {
			deviceName: syncData.deviceName,
			deviceId: syncData.deviceId,
			status: "sync"
		};
		syncList.push(syncDevice);

  		var resultValue = "False";
		if (typeof(msgObj.result) != "undefined") {
			//Get and transfer actions
			var insertActions = null;
			var deleteActions = null;
			var updateActions = null;
			syncInitActions(function(insertArray, deleteArray, updateArray){
				insertActions = insertArray;
				deleteActions = deleteArray;
				updateActions = updateArray;

				resultValue = "OK";

				var syncDataObj = {
					type: "syncResponse",
					account:config.ACCOUNT,
					deviceId:config.uniqueID,
					result: resultValue,
					insertActions: insertActions,
					deleteActions: deleteActions,
					updateActions: updateActions
				};

				syncSendMessage(address, syncDataObj);
			});
		}
	}
	break;
	case state.SYNC_REQUEST: {
		console.log("syncResponse=========================================" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "wait"
		};
		syncList.push(syncDevice);
	}
	break;
	case state.SYNC_START: {
		console.log("syncResponse=========================================" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "wait"
		};
		syncList.push(syncDevice);
	}
	break;
	case state.SYNC_COMPLETE: {
		console.log("syncResponse=========================================" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			status: "wait"
		};
		syncList.push(syncDevice);
	}
	break;
	default: {
		console.log("this is in default switch in syncRequest");
		//console.log(data);
	}
  }
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
	deviceID = syncData.deviceId;
	if (deviceID.localeCompare(config.uniqueID) >0) {

	}
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

//Sync error
function syncError(err){
	console.log("Sync Error: " + err);
}

//Export method
exports.syncStart = syncStart;
exports.syncRequest = syncRequest;
exports.syncResponse = syncResponse;
//exports.syncCheckResponse = syncCheckResponse;
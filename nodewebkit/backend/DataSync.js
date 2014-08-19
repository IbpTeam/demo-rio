/**
 * @Title: DataSync.js
 * @Description: Function for data sync
 * @author: yuanzhe
 * @version: 0.0.1
 **/

 var msgTransfer = require("./msgtransfer");
 var commonDAO = require("./DAO/CommonDAO");
 var config = require("./config");
 var hashTable = require("./hashTable");
 var llist = require("./linkedlist")

var ActionHistory = require("./DAO/ActionHistoryDAO");//

var state = {
	SYNC_IDLE:0,
	SYNC_REQUEST:1,
	SYNC_START:2,
	SYNC_COMPLETE:3
};

var isRemoteComplete = false;
var remoteDeviceId = null;

var currentState = state.SYNC_IDLE;
console.log("current state is : " + currentState);

var syncList = new Array();

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
function syncDeleteAction(other_deleteHistory,deleteCallBack){
	commonDAO.findEachActionHistory("delete",function(my_deleteHistory){
		deleteCallBack(other_deleteHistory,my_deleteHistory);
	});
}

//Sync insert action
function syncInsertAction(other_insertHistory,insertCallBack){
	commonDAO.findEachActionHistory("insert",function(my_insertHistory){
		insertCallBack(other_insertHistory,my_insertHistory);
	});
}

//Sync insert action
function syncUpdateAction(other_updateHistory,updateCallBack){
	commonDAO.findEachActionHistory("update",function(my_updateHistory){
		updateCallBack(other_updateHistory,my_updateHistory);
	});
}

//deal with version control
function versionCtrl(myTrees,other_trees,versionCtrlCB,CBsyncComplete){
	versionCtrlCB(myTrees,other_trees);
}

//Send sync request when other devices connect the net.
function syncRequest(deviceName,deviceId,deviceAddress){
  // console.log("get address from internet discovery : " + address);
  /*if (deviceId.localeCompare(config.uniqueID) <= 0) {
  	syncError("device id in request is wrong!");
  	return;
  }*/

  switch(currentState){
	case state.SYNC_IDLE: {
		console.log("syncRequest==========" + currentState);
		currentState = state.SYNC_REQUEST;
		remoteDeviceId = deviceId;
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			deviceAddress: deviceAddress,
			status: "sync"
		};
		syncList.unshift(syncDevice);
		var requestMsg = {
  			type: "syncRequest",
  			account: config.ACCOUNT,
  			deviceId: config.uniqueID,
  			deviceAddress: config.SERVERIP
  		};
  		syncSendMessage(deviceAddress[0],requestMsg);
	}
	break;
	case state.SYNC_REQUEST: {
		console.log("syncRequest=============" + currentState);
		var syncDevice = {
			deviceName: deviceName,
			deviceId: deviceId,
			deviceAddress: deviceAddress,
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
			deviceAddress: deviceAddress,
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
			deviceAddress: deviceAddress,
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
			remoteDeviceId = syncData.deviceId;
			var syncDevice = {
				deviceName: syncData.deviceName,
				deviceId: syncData.deviceId,
				deviceAddress: syncData.deviceAddress,
				status: "sync"
			};
			syncList.push(syncDevice);

			var resultValue = "False";
			//Get and transfer actions
			var insertActions = null;
			var deleteActions = null;
			var updateActions = null;
			syncInitActions(function(insertArray, deleteArray, updateArray){
				insertActions = JSON.stringify(insertArray);
				deleteActions = JSON.stringify(deleteArray);
				updateActions = JSON.stringify(updateArray);

				resultValue = "OK";

				var syncDataObj = {
					type: "syncResponse",
					account:config.ACCOUNT,
					deviceId:config.uniqueID,
					deviceAddress:config.SERVERIP,
					isRemoteStart:false,
					result: resultValue,
					insertActions: insertActions,
					deleteActions: deleteActions,
					updateActions: updateActions
				};

				syncSendMessage(address, syncDataObj);
			});
		}
		break;
		case state.SYNC_REQUEST: {
			console.log("syncResponse=========================================" + currentState);
			var syncDevice = {
				deviceName: syncData.deviceName,
				deviceId: syncData.deviceId,
				deviceAddress: syncData.deviceAddress,
				status: "wait"
			};
			syncList.push(syncDevice);
		}
		break;
		case state.SYNC_START: {
			console.log("syncResponse=========================================" + currentState);
			var syncDevice = {
				deviceName: syncData.deviceName,
				deviceId: syncData.deviceId,
				deviceAddress: syncData.deviceAddress,
				status: "wait"
			};
			syncList.push(syncDevice);
		}
		break;
		case state.SYNC_COMPLETE: {
			console.log("syncResponse=========================================" + currentState);
			var syncDevice = {
				deviceName: syncData.deviceName,
				deviceId: syncData.deviceId,
				deviceAddress: syncData.deviceAddress,
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
		//ActionHistory.test();//generate fake update hsitory for test
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
function syncStart(syncData, address){
	if (remoteDeviceId != syncData.deviceId) {
		console.log("Sync Start Error: retrive data from different device!");
		return;
	}
	isRemoteStart = syncData.isRemoteStart;
	if (!isRemoteStart) {
		var resultValue = "False";
		//Get and transfer actions
		var insertActions = null;
		var deleteActions = null;
		var updateActions = null;
		syncInitActions(function(insertArray, deleteArray, updateArray){
			insertActions = JSON.stringify(insertArray);
			deleteActions = JSON.stringify(deleteArray);
			updateActions = JSON.stringify(updateArray);

			resultValue = "OK";

			var syncDataObj = {
				type: "syncResponse",
				account:config.ACCOUNT,
				deviceId:config.uniqueID,
				deviceAddress:config.SERVERIP,
				isRemoteStart:true,
				result: resultValue,
				insertActions: insertActions,
				deleteActions: deleteActions,
				updateActions: updateActions
			};

			syncSendMessage(address, syncDataObj);
		});
	}

	//Change state, start to sync
	currentState = state.SYNC_START;

	//ActionHistory.test();

	var insertActions = JSON.parse(syncData.insertActions);
	var deleteActions = JSON.parse(syncData.deleteActions);
	var updateActions = JSON.parse(syncData.updateActions);

	console.log("insert actions: ");
	console.log(insertActions);
	console.log("delete actions: ");
	console.log(deleteActions);
	console.log("update actions: ");
	console.log(updateActions);

	//var deletetList = new Array();
	//var insertList = new Array();
	var updateList = new Array();
	var conflictList = new Array();

	//Sync data, delete > insert > update
	syncDeleteAction(deleteActions,function(deleteActions,my_deleteHistory){
		var myDelete = new hashTable.HashTable();
		myDelete.createHash(my_deleteHistory);

		console.log("==========start sync delete!!!==========");
		var newDelete = myDelete.getDiff(deleteActions,myDelete);
		console.log("==========new delete history==========");
		console.log(newDelete);
		ActionHistory.createAll("delete",newDelete,function(){console.log("==========delete insert done!!!==========")});

		//Retrive actions after delete, start to sync insert actions 
		syncInsertAction(insertActions,function(insertActions,my_insertHistory){
			var myInsert = new hashTable.HashTable();
			myInsert.createHash(my_insertHistory);

			//remove some repeat insert items in insertActions
			insertActions = myInsert.getDiff(insertActions,myDelete);
            
			console.log("==========start sync insert!!!==========");
			var newInsert = myInsert.getDiff(insertActions,myInsert);

            console.log("==========new insert history==========");
			console.log(newInsert);
			ActionHistory.createAll("insert",newInsert,function(){console.log("==========insert done!!!==========")});

			////Retrive actions after insert, start to sync update actions 
			syncUpdateAction(updateActions,function(updateActions,my_updateHistory){
				console.log("==========start sync update!!!==========");
				console.log("----------my update actions----------");
				console.log(updateActions);
			    var myUpdate = new hashTable.HashTable();
			    myUpdate.createHash(my_updateHistory);

			    //condition #1 : no conflict oprate on data; new upadte history
				updateActions.forEach(function(updateItem){
					if(!isExist(my_updateHistory,updateItem))
						newUpdateList.push(updateItem);
				});
				//ActionHistory.createAll("update",newUpdateList,function(){console.log("---insert update done!!!---")});

                //condition #2 : there are conflicts on operating data
                //1>no conflict: operate on the same data but the results are the same
                //2>is conflict: operate on same data and same key

			    //insert items (need it's edit_id) should be 
			    //the head all each version tree
			    var initTreeHead = my_insertHistory.concat(newInsert);
			    console.log("----------init heads----------");
			    console.log(initTreeHead);

			    //when all heads are ready 
			    //then we begin to build all version tree in local
			    console.log("----------building trees----------")
			    var myTrees = new Array();//new hashTable.HashTable();
			    for(var k in initTreeHead){
			    	var newTree = new llist.linklist();
			    	newTree.init(initTreeHead[k]);
			    	newTree.createFromArray(my_updateHistory);
			    	myTrees.push(newTree);
			    	console.log("<show me the linklist>")
			    	newTree.print()
			    	//myTrees.put(newTree.head.data.dataURI,newTree);
			    }
			    console.log("----------my tree----------")
			    console.log(myTrees);


                //build trees from other devices 
                var other_trees = new Array();
			    for(var k in initTreeHead){
			    	var newTree = new llist.linklist();
			    	newTree.init(initTreeHead[k]);
			    	newTree.createFromArray(newTree.head,updateActions);
			    	myTrees.push(newTree);
			    	console.log("<show me the linklist>")
			    	newTree.print()
			    	//myTrees.put(newTree.head.data.dataURI,newTree);
			    }
			    console.log("----------other tree----------")
			    console.log(myTrees);

                //do version control stuff
                //is it OK to put syncComplete here?
                versionCtrl(myTrees,other_trees,versionCtrlCB,syncComplete);

                /*
				console.log("==========start sync update!!!==========");
				updateActions.forEach(function(updateItem){
					if(isExist(my_updateHistory,updateItem)){
						console.log('==========operate on the same file==========');
						console.log(updateItem);
						if(isConflict(my_updateHistory,updateItem)){
							console.log("conflict!!!!!!!!!!!");
							conflictList.push(updateItem);
						}else{
							console.log("it's ok!!!!!!!!!!!");
							updateList.push(updateItem);
						}
					}else{
						console.log("==========We got a new update:==========");
						console.log(updateItem);
						updateList.push(updateItem);
					};
				});
                */
				//
				//console.log("==========here are conflicts==========")
				//console.log(updateList);
				//versionCtrl(conflictList);
				//ActionHistory.createAll("update",updateList,function(){console.log("---insert update done!!!---")});
			});
		});
});
}

//deal with the conflict situation 
function versionCtrlCB(myTrees,other_trees){                                                                                                                                                                                                                                                                                                                                                                                                           
    //to be continue ......

}

//check is exist or not
function isExist(List,item){
	var flag = false;
	if(List === null)
		return false;
	List.forEach(function(listItem){
		if(item.dataURI === listItem.dataURI){
			flag = true;
		}
	});
	return flag;
}

//check if the two versions are the same
function isSame(node_1,node_2){
	if(node_1.data.dataURI !== node_2.data.dataURI){
		console.log("Error! : not the same data! ");
		return;
	}

	if(node_1.data.edit_id === node_2.data.edit_id){
		return true;
	}else{
		if(node_1.data.key === node_2.data.key && node_1.data.value === node_2.data.value)
			return true;
		else
			return false;
	}
	//to be continue ...
	//need to compare with data
}

//check the data is conflict or not
//need more detail
//to be continue
/*
function isConflict(List,item){
	var flag = false;
	if(List === null)
		return false;
	List.forEach(function(listItem){
		if(item.dataURI === listItem.dataURI && item.key === listItem.key){
			flag = true;
		}
	});
	return flag;
};
*/

//Sync complete
function syncComplete(isLocal,isComplete,deviceId,deviceAddress){
	if (deviceId != remoteDeviceId) {
		console.log("Sync Complete Error: retrive data from different device!");
		return;
	}
	if (isLocal && isComplete) {
		currentState = state.SYNC_COMPLETE;
	}else {
		isRemoteComplete = isComplete;
	}

	if (syncList.length < 1) {
		console.log("Sync List Error: List length < 1!");
		return;
	}

	if (isRemoteComplete && currentState == state.SYNC_COMPLETE) {
		console.log("Data Sync is Done!");
		currentState = state.SYNC_IDLE;
		isRemoteComplete = false;
		if (syncList[0].deviceId = deviceId) {
			syncList.shift();
		}else{
			console.log("Sync list may be wrong!")
			for (var i = 0; i < syncList.length; i++) {
				if (syncList[i].deviceId == deviceId) {
					syncList.splice(i,1);
					break;	
				}
			}
		}

		if (syncList.length < 1) {
			currentState = state.SYNC_IDLE;
		}else{
			currentState = state.SYNC_REQUEST;
			syncRequest(syncList[0].deviceName,syncList[0].deviceId,syncList[0],deviceAddress);
		}
	}
	else if(currentState == state.SYNC_COMPLETE){
		var syncDataObj = {
			type: "syncComplete",
  			account: config.ACCOUNT,
  			deviceId: config.uniqueID,
  			isComplete: true,
		};

		syncSendMessage(deviceAddress, syncDataObj);
	}

}

//Sync error
function syncError(err){
	console.log("Sync Error: " + err);
}

//Export method
//exports.createHash = createHash;
//exports.getDiff = getDiff;
exports.syncStart = syncStart;
exports.syncRequest = syncRequest;
exports.syncResponse = syncResponse;
//exports.syncCheckResponse = syncCheckResponse;

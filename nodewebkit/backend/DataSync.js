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
var ActionHistory = require("./DAO/ActionHistoryDAO");

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

//Sync update action
function syncUpdateAction(other_update,updateCallBack){
	commonDAO.findEachActionHistory("update",function(my_update){
		updateCallBack(other_update,my_update);
	});
}

//deal with version control
function versionCtrl(my_versions,other_versions,versionCtrlCB,CBsyncComplete){
	versionCtrlCB(my_versions,other_versions);
}

//deal with the conflicts
function dealConflict(my_version,other_version,dealConflictCB){
	dealConflictCB(my_version,other_version);
}

//to set a update_history with new child or parent
function setUpdate(newUpdateHistory,newUpdateEntry,newOperations,SetUpdateCB){
	SetUpdateCB(newUpdateHistory,newUpdateEntry,newOperations)
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

	////Sync data, delete > insert > update
	syncDeleteAction(deleteActions,function(deleteActions,my_deleteHistory){
		var myDelete = new hashTable.hashTable();
		myDelete.createHash(my_deleteHistory);

		console.log("==========start sync delete!!!==========");
		//these are new delete actions
		var newDelete = myDelete.getDiff(deleteActions);

		console.log("==========new delete history==========");
		console.log(newDelete);

		//create delete hository
        var new_delete = newDelete;
		ActionHistory.createAll("delete",new_delete,function(){console.log("==========delete insert done!!!==========")});

		////Retrive actions after delete, start to sync insert actions 
		syncInsertAction(insertActions,function(insertActions,my_insertHistory){
			var myInsert = new hashTable.hashTable();
			myInsert.createHash(my_insertHistory);

			//remove some repeat insert items in insertActions
			insertActions = myInsert.getDiff(insertActions);

			console.log("==========start sync insert!!!==========");
			//these are new insert actions
			var newInsert = myInsert.getDiff(insertActions);

			console.log("==========new insert history==========");
			console.log(newInsert);
			//create insert hository
			var new_insert = newInsert
			ActionHistory.createAll("insert",new_insert,function(){console.log("==========insert done!!!==========")});

			////Retrive actions after insert, start to sync update actisons 
			syncUpdateAction(updateActions,function(updateActions,my_updateActions){//////////////
				console.log("==========start sync update!!!==========");
				//console.log(updateActions);
                
                //trans children and parents from string to array
				for(var k in my_updateActions){
					my_updateActions[k].children = JSON.parse(my_updateActions[k].children);
					my_updateActions[k].parents = JSON.parse(my_updateActions[k].parents);
				}

				//console.log("==========my update actions==========");
				//console.log(my_updateActions);

				var myVersions = null;
                var otherVersion = null;

                var my_versions = {
                	head: "",
                	tail: "",
                	versions: null,
                	operations: null
                };

                var m_tmpVersion = new hashTable.hashTable();
                var m_tmpOperation = new hashTable.hashTable();
                m_tmpVersion.initVersionHash(my_updateActions);
                m_tmpOperation.initOperationHash(my_updateActions);
                //console.log("----------my tmpversion----------");
				//console.log(m_tmpVersion);

                my_versions.versions = m_tmpVersion;
                my_versions.operations = m_tmpOperation;
                my_versions.head = m_tmpVersion.head;
                my_versions.tail = m_tmpVersion.tail;


                var other_versions = {
                	head: "",
                	tail: "",
                	versions: null,
                	operations: null,
                };

                var o_tmpVersion = new hashTable.hashTable();
                var o_tmpOperation = new hashTable.hashTable();
                o_tmpVersion.initVersionHash(updateActions);
                o_tmpOperation.initOperationHash(updateActions);
                //console.log("----------other tmpversion----------");
				//console.log(o_tmpVersion);

                other_versions.versions = o_tmpVersion;
                other_versions.operations = o_tmpOperation;
                other_versions.head = o_tmpVersion.head;
                other_versions.tail = o_tmpVersion.tail;

                //do version control stuff
                //is it OK to put syncComplete here?

                //console.log("-------------------------------------------------------")
                //console.log(my_versions);
                //console.log(other_versions);
                //console.log("------------------------------------------------------")

                myVersions = my_versions;
                otherVersion = other_versions;
                //console.log("--------------------------- myVersion");
				//console.log(myVersions);
                //console.log("--------------------------- otherVersion");
				//console.log(otherVersion);				
                versionCtrl(myVersions,otherVersion,versionCtrlCB,syncComplete);

        });
});
});
}



//deal with the conflict situation 
function versionCtrlCB(my_versions,other_versions){                                                                                                                                                                                                                                                                                                                                                                                                           
    console.log("==========start dealing with version control==========");
    //console.log("-------------------------------------------------------")
	var my_head = my_versions.head;
	var my_tail = my_versions.tail;
	var my_version = my_versions.versions;
	//var my_operations = my_versions.operations;
	var my_version_id = my_versions.versions.getAll();
	var other_head = other_versions.head;
	var other_tail = other_versions.tail;
	var other_version = other_versions.versions;
	var other_operations = other_versions.operations;
	var other_version_id = other_versions.versions.getAll();

    //fisrt compare the final version
    ////not the same
	if(!isSame(my_tail,my_version,other_tail,other_version)){
		var my_coPoint = my_version.isExist(other_tail);
		var other_coPoint = other_version.isExist(my_tail);

        //the final version is not same and is not any prev version of another linklist
        //considered as a conlict occur
		if(!my_version.isExist(other_tail) && !other_version.isExist(my_tail)){
			dealConflict(my_tail,other_tail,dealConflictCB);
		}
		// #1: other_tail is a prev version of my_linklist
		else if(my_version.isExist(other_tail) || other_version.isExist(my_tail)){
			console.log("+++++++++++++++++++++++++++++++++++++++++++++++++ #11111111");
			var newUpdateHistory = new Array();
			var newUpdateEntry = new Array();
			var newOperations = new Array();

            //these are new version's version_id, from other_versions
            //console.log("*****************************************version_id")
            var newVersion = my_version.getDiffUpdate(other_version_id);
            //console.log("*****************************************newVersionnnnnnnnnnnnnnnnnnnnnnnnnn")
            //console.log("******************other version")

            //check each versoin's parents/children if exist in my_versions
            for(var k in newVersion){
            	var tmpParents = newVersion[k].parents;
            	var tmpChildren = newVersion[k].children;

            	for(var i in tmpParents){
            		//if this version has a parent exists in my_versions
            		if(my_version.isExist(tmpParents[i])){
            			var tmp = my_version.getValue(tmpParents[j])[0];

            			tmp.children.push(newVersion[k].version_id);
            			var newEntry = {
            				"version_id": tmp.version_id,
            				"parents": tmp.parents,
            				"children": tmp.children,
            				"origin_version": tmp.origin_version
            			}
            			newUpdateHistory.push(tmp);
                    }
                }
                for(var j in tmpChildren){
            		//if this version has a child exists in my_versions
            		if(my_version.isExist(tmpChildren[j])){
            			var tmp = my_version.getValue(tmpChildren[j])[0];
            			//console.log(tmp);
            			tmp.parents.push(newVersion[k].version_id);
            			var newEntry = {
            				"version_id": tmp.version_id,
            				"parents": tmp.parents,
            				"children": tmp.children,
            				"origin_version": tmp.origin_version
            			}
            			newUpdateHistory.push(tmp);
            		}
            	}
            	newOperations.push(other_operations.getValue(newVersion[k].version_id));
            	newUpdateEntry.push(newVersion[k]);
            }

			//console.log("************************************************ update")
			//console.log(newUpdateHistory);
			console.log("************************************************ updates & operations")
			console.log(newOperations);	
			//then we need modify related data and renew then in db 
			setUpdate(newUpdateHistory,newUpdateEntry,newOperations,setUpdateCB);
		}
	////final version is the same
	// #2: final version is same
}else{
	console.log("+++++++++++++++++++++++++++++++++++++++++++++++++ #22222222");
	var newUpdateHistory = new Array();
	var newUpdateEntry = new Array();
	var newOperations = new Array();
        //get the last same node of 2 linklist, from this node we start merge

		//reset head of my_linklist; would contain 2 children
		//setUpdateHistory("child",other_linklist.head.next,my_linklist.head.version_id);

		newUpdateCB(newUpdateHistory,newOperations);

        //this array will be inserted into db
        
	}
}


//callback when conflict occurs
function dealConflictCB(my_version,other_version){
	//to be continue ...

}


//add new update information into db
function SetUpdateCB(newUpdateHistory,newUpdateEntry,newOperations){
    console.log("==========dealing with new update==========");
	console.log(newUpdateHistory);
	console.log(newUpdateEntry)
	console.log(newOperations);	

}

//compare the data to decide if the version is same or not
function isFileSame(){
	//to be continue ...
}

//check if the two versions are the same
function isSame(my_version,my_versions,other_version,other_versions){
	//need to compare with data
    //var tmpversion = my_versions.operations;
	//var my_operations = tmpversion.getValue(my_version);
	//var other_operations = other_versions.operations[other_version];
	if(my_version === other_version)
		return true;
	return false;
}

//check if my_version is a prev version in other_linklist
function isPrevVersion(version_id,my_version){
	if(my_version.isExist(version_id))
		return my_version.get(version_id);
}

//check if keys are conflict
function isConflict(my_operation,other_operation){
	if(my_operation === null || other_operation){
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		console.log("Error: operations of this version in update_operations list is EMPTY");
		console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
		return undefined;
	}
	my_operation.forEach(function(myItem){
		other_operation.forEach(function(otherItem){
			if(myItem.key === otherItem)
				return true;
		});
	});
	return false;
}

//get operations with specific version_id
function getOperations(version_id,operations){
	var allOperations = new Array();
	for(var k in operations){
		if(operations[k].version_id === version_id)
			allOperations.push(operations[k]);
	}
	return allOperations;
}

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
exports.syncStart = syncStart;
exports.syncRequest = syncRequest;
exports.syncResponse = syncResponse;
//exports.syncCheckResponse = syncCheckResponse;

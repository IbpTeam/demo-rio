//hashtable in js

function hashTable(){
	this.hashtable = {};
	this.head = "";
	this.tail = "";
	this.isEmpty = true;
	this.add = _add;
	this.del = _del;
	this.getAll = _getAll;
	this.getValue = _getValue;
	this.isExist = _isExist;
	//this.initVersionHash = _initVersionHash;
	this.initHash = _initHash;
	this.getDiff = _getDiff;
	this.getDiffUpdate = _getDiffUpdate;
}

function _add(key,value){
	if(this.isExist[key]){
		this.hashtable[key].push(value);
	}else{
		var oTempEntry = new Array();
		oTempEntry.push(value);
		this.hashtable[key] = oTempEntry;
	}
}

function _del(key){
	if(this.isExist[key]){
		delete(this.hashtable[key]);
		console.log("delete done!");
	}else{
		console.log("already exsit!")
	}
}

function _getValue(key){
	if(this.isExist[key])
		return this.hashtable[key];
	else
		return "undefined";
}

function _getAll(){
	var list = new Array();
	if(this.isEmpty == false){
		for(k in this.hashtable){
			for(var j in this.hashtable[k])
				list.push(this.hashtable[k][j]);
		}
	}else{
		return list;
	}
}

function _isExist(key){
	if(this.hashtable[key] == "undefined")
		return false;
	else
		return true;
}

/*
function _initVersionHash(List){
	if(List != ""){
		this.isEmpty = false;
		for(var k in List){
			var oTempEntry = List[k];
			if(this.isExist[oTempEntry.version_id])
				continue;
			if(typeof oTempEntry.parents == "string"){
				oTempEntry.parents = JSON.parse(oTempEntry.parents);
			}
			if(oTempEntry.children == "" || oTempEntry.children == "null"){
			//this.head = oVersion.origin_version;
			//this.tail = oVersion.version_id;
		}else{
			if(typeof oTempEntry.children == "string"){
				oTempEntry.children = JSON.parse(oTempEntry.children);		
			}	
		}
		var oVersion = {
			version_id : oTempEntry.version_id,
			parents : oTempEntry.parents,
			children : oTempEntry.children,
			origin_version : oTempEntry.origin_version
		}
		this.add(oVersion.version_id,oVersion);
	}
}else{
	return this.hashtable;
}
}
*/

function _initOperationHash(List){
	if(List != "" ){
		this.isEmpty = false;
		for(var k in List){
			var oTempEntry = List[k];
			var oOperation = {
				version_id : oTempEntry.version_id,
				file_uri : oTempEntry.file_uri,
				key : oTempEntry.key,
				value : oTempEntry.value
			}
			this.add(oTempEntry.version_id,oOperation);
		}
	}else{
		return this.hashtable;
	}
}

function _initHash(sKey,List){
	if(List != ""){
		this.isEmpty = false;
		switch(sKey){
			case "file_uri":{
				for(var k in List)
					this.add(List[k].file_uri,List[k].id);
			}
			break;
			case "origin_version":{
				for(var k in List)
					this.add(List[k].origin_version,List[k].id);
			}
			break;
			case "version_id":{
				for(var k in List)
					this.add(List[k].version_id,List[k].id);
			}
			break;
			case "operation":{
				for(var k in List){
					var oTempEntry = List[k];
					var oOperation = {
						version_id : oTempEntry.version_id,
						file_uri : oTempEntry.file_uri,
						key : oTempEntry.key,
						value : oTempEntry.value
					}
					this.add(oTempEntry.version_id,oOperation);
				}
			}
			break;
			case "version":{
				this.isEmpty = false;
				for(var k in List){
					var oTempEntry = List[k];
					if(this.isExist[oTempEntry.version_id])
						continue;
					if(typeof oTempEntry.parents == "string")
						oTempEntry.parents = JSON.parse(oTempEntry.parents);
					if(oTempEntry.children == "" || oTempEntry.children == "null"){
						this.head = oVersion.origin_version;
						this.tail = oVersion.version_id;
					}else{
						if(typeof oTempEntry.children == "string")
							oTempEntry.children = JSON.parse(oTempEntry.children);		
					}
					var oVersion = {
						version_id : oTempEntry.version_id,
						parents : oTempEntry.parents,
						children : oTempEntry.children,
						origin_version : oTempEntry.origin_version
					}
					this.add(oVersion.version_id,oVersion);
				}				
			}
			break;				
			default:{
				console.log("===================");
				console.log("NOT a correct sKey!");
				console.log("===================");
				return "undefined";
			}
		}
	}else{
		return this.hashtable;
	}
	
}

function _getDiff(sKey,array){
	var oDiff = [];
	if(this.isEmpty == true){
		return array;
	}
	else if(array != ""){
		if(sKey == "file_uri"){
			for(var del in array){
				var res = this.getValue(array[del].file_uri);
				if (res == "undefined"){
					var tmpdif = {};
					tmpdif["id"] = array[del].id;
					tmpdif["file_uri"] = array[del].file_uri;
					oDiff.push(tmpdif);
				};
			}
		}
		else if(sKey == "version_id"){
			for(var del in array){
				var res = this.getValue(array[del].version_id);
				if (res == "undefined"){
					oDiff.push(array[del]);
				};
			}
		}else{
			console.log("===================");
			console.log("NOT a correct sKey!");
			console.log("===================");
			return "undefined";
		}
	}else{
		return oDiff;
	}
}

//function _getDiffUpdate(array){
//	var oDiff = [];
//	if(this.isEmpty == true){
//		return array;
//	}
//	else if(array != ""){
//		for(var del in array){
//			var res = this.getValue(array[del].version_id);
//			if (res == "undefined"){
//				oDiff.push(array[del]);
//			};
//		}
//	}else{
//		return oDiff;
//	}
//}

exports.hashTable = hashTable;

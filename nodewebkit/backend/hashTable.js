//hashtable in js

//hashtable in javascript


function hashTable(){
	this.hashtable = {};
	this.head = null;
	this.tail = null;
	this.add = _add;
	this.del = _del;
	this.getAll = _getAll;
	this.getValue = _getValue;
	this.isExist = _isExist;
	this.initVersionHash = _initVersionHash;
	this.initOperationHash =_initOperationHash;
	this.createHash = _createHash;
	this.getDiff = _getDiff;
}

function _add(key,value){
	if(this.hashtable.hasOwnProperty(key)){
		var tmpEntry = this.hashtable[key];
		console.log("+++++++++++++++");
		console.log(tmpEntry);
		console.log("+++++++++++++++");
		for(var k in tmpEntry){
			if(value === tmpEntry[k]){
				console.log("+++++++++++++++");
				console.log(" key is Exist!");
				console.log("+++++++++++++++");
				return;
			}
		}
		this.hashtable[key].push(value);
	}
	else{
		var tmp = new Array();
		tmp.push(value);
		this.hashtable[key] = tmp;
	}
}

function _del(key){
	if(this.hashtable.hasOwnProperty(key)){
		delete(this.hashtable[key]);
		console.log("delete done!");
	}else{
		console.log("already exsit!")
	}
}

function _getValue(key){
	if(this.hashtable.hasOwnProperty(key))
		return this.hashtable[key];
	else
		return "undefined";
}

function _getAll(){
	var list = new Array();
	for(k in this.hashtable){
		//console.log(this.hashtable[k]);
		list.push(this.hashtable[k][0]);
	}
	return list;
}

function _isExist(key){
	if(this.hashtable.hasOwnProperty(key))
		return true;
	return false;
}

function _initVersionHash(List){
	for(var k in List){
		var tmpEntry = List[k];
		//console.log(tmpEntry);
		var version = {
			version_id : tmpEntry.version_id,
			parents : tmpEntry.parents,
			children : tmpEntry.children,
			origin_version : tmpEntry.origin_version
		}
		if(version.children === null){
			//console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++==")
			//console.log("head: "+version.origin_version);
			//console.log("tail: "+version.version_id);
			this.head = JSON.stringify(version.origin_version);
			this.tail = JSON.stringify(version.version_id);
		}
		this.add(version.version_id,version);
	}
	return this.hashtable;
}

function _initOperationHash(List){
	for(var k in List){
		var tmpEntry = List[k];
		//console.log(tmpEntry);
		var operation = {
			version_id : tmpEntry.version_id,
			file_uri : tmpEntry.file_uri,
			key : tmpEntry.key,
			value : tmpEntry.value
		}
		this.add(operation.version_id,operation);
	}
	return this.hashtable;
}

function _createHash(List){
	for(var k in List)
		this.add(List[k].version_id,List[k].id);
	return this.hashtable;
}

function _getDiff(array){
	var diff = [];
	for(var del in array)
	{
		res = this.getValue(array[del].version_id);
		if (typeof res == "undefined" ) 
		{
			var tmpdif = {};
			tmpdif["id"] = array[del].id;
			tmpdif["file_uri"] = array[del].file_uri;
			diff.push(tmpdif);
		};
	}
	return diff;
}

exports.hashTable = hashTable;

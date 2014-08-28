//hashtable in js

//hashtable in javascript


function hashTable(){
	this.hashtable = {};
	this.head = "";
	this.tail = "";
	this.addChildren = _addChildren;
	this.addParents = _addParents;
	this.add = _add;
	this.del = _del;
	this.getAll = _getAll;
	this.getValue = _getValue;
	this.isExist = _isExist;
	this.initVersionHash = _initVersionHash;
	this.initOperationHash =_initOperationHash;
	this.createHash = _createHash;
	this.getDiff = _getDiff;
	this.getDiffUpdate = _getDiffUpdate;
}

function _addChildren(version_id,newChildren){
	if(this.hashtable[version_id].children == ""){
		var children = new Array();
		children.push(newChildren);
		this.hashtable[version_id].children = children;
	}else{
		this.hashtable[version_id].children.push(newChildren);
	}
}

function _addParents(version_id,newParents){
	//console.log(this.hashtable[version_id].parents);
	this.hashtable[version_id].parents.push(newParents);
}

function _add(key,value){
	if(this.hashtable.hasOwnProperty(key)){
		var tmpEntry = this.hashtable[key];
		//console.log("+++++++++++++++");
		//console.log(tmpEntry);
		//console.log("+++++++++++++++");
		for(var k in tmpEntry){
			if(value.version_id === tmpEntry[k].version_id){
				if(value.file_uri != tmpEntry[k].file_uri)
					this.hashtable[key].push(value);;
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
	else
		return false;
}

function _initVersionHash(List){
	//console.log("===========================my list")
	//console.log(List);
	for(var k in List){
		var tmpEntry = List[k];
		//console.log(tmpEntry);
		if(tmpEntry.children == ""){
			var version = {
				version_id : tmpEntry.version_id,
				parents : tmpEntry.parents,
				children : "",
				origin_version : tmpEntry.origin_version
			}
			this.head = version.origin_version;
			this.tail = version.version_id;
			this.add(version.version_id,version);
		}else{
			var version = {
				version_id : tmpEntry.version_id,
				parents : tmpEntry.parents,
				children : tmpEntry.children,
				origin_version : tmpEntry.origin_version
			}
			this.add(version.version_id,version);
		}
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
		this.add(List[k].file_uri,List[k].id);
	return this.hashtable;
}

function _getDiff(array){
	var diff = [];
	for(var del in array)
	{
		var res = this.getValue(array[del].file_uri);
		if ( res == "undefined" ) 
		{
			var tmpdif = {};
			tmpdif["id"] = array[del].id;
			tmpdif["file_uri"] = array[del].file_uri;
			diff.push(tmpdif);
		};
	}
	return diff;
}

function _getDiffUpdate(array){
	var diff = [];
	for(var del in array)
	{
		var res = this.getValue(array[del].version_id);
		//console.log(array[del].version_id);
		if (res == "undefined" ) 
		{
			diff.push(array[del]);
		};
	}
	return diff;
}

exports.hashTable = hashTable;

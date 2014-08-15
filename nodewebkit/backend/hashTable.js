//hashtable in javascript

function hashTable(){
	this.hashtable = new object();
	this.add = _add;
	this.del = _del;
	this.getAll = _getAll;
	this.getValue = _getValue;
	this.isExist = _isExist;
	this.createHash = _createHash;
}

function _add(key,value){
	if(key in hashTable)
		console.log("key is Exist!");
	else
		hashTable[key] = value;
}

function _del(key){
	if(key in hashTable){
		delete(hashTable[key]);
		console.log("delete done!");
	}else{
		console.log("already exsit!")
	}
}

function _getValue(key){
	if(key in hashTable)
		return hashTable[key];
	else
		return "undefined";
}

function _getAll(){
	var list = {};
	for(var k in hashTable){
		console.log(hashTable[k]);
		list.push(hashTable[k])
	}
	return list;
}

function _isExist(key){
	var exist = false;
	if(key in hashTable)
		exist = true;
	return exist;
}

function _createHash(List){
	for(k in List)
		add(item[k].dataURI,item[k].id);
	return hashtable;
}


//exports.add = add;
//exports.del = del;
//exports.getAll = getAll;
//exports.getValue = getValue;
//exports.isExist = isExist;
//exports.createHash = createHash;
exports.hashTable = hashTable;
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
	this.initHash = _initHash;
	this.createHash = _createHash;
}

function _add(key,value){
	if(this.hashtable.hasOwnProperty(key)){
		var tmpEntry = this.hashtable[key];
		for(var k in tmpEntry){
			if(value === tmpEntry[k]){
				console.log("key is Exist!");
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

function _initHash(List){
	this.head = List[0].base_id;
	for(var k in List){
		if(List[k].child === null)
			this.tail = List[k].version_id;
		this.add(List[k].version_id,List[k]);
	}
	return this.hashtable;
}

function _createHash(List){
	for(var k in List)
		this.add(List[k].version_id,List[k]);
	return this.hashtable;
}

exports.hashTable = hashTable;


/*
//hashTable.js
//a hashtable implementation

var Table = require('hashtable');

function HashTable(){
	var table = new Table();
	this.put = function (key,value){
		table.put(key,value)
	}
	this.get = function (key){
		return table.get(key);
	}
	this.remove = function(key){
		table.remove(key);
	}
	this.clear = function(){
		table.clear();
	}
	this.size = function(){
		return table.size();
	}
	this.rehash =function(new_size){
		return table.rehash(new_size);
	}
	this.createHash = function(array){
		for(var  tmp in array)
		{
			table.put(array[tmp].file_uri,array[tmp].id);
		}
		return table;
	}
	this.getDiff = function(array,Htable){
		var diff = [];
		for(var del in array)
		{
			res = Htable.get(array[del].file_uri);
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
	this.getNotDiff = function(array,Htable){
		var Nodiff = [];
		for(var del in array)
		{
			res = Htable.get(array[del].file_uri);
			if (typeof res != "undefined" && typeof res != null) 
			{
				var tmpdif = {};
				tmpdif["id"] = array[del].id;
				tmpdif["file_uri"] = array[del].file_uri;
				Nodiff.push(tmpdif);
			};
		}
		return Nodiff;		
	}
}
exports.HashTable = HashTable;

*/
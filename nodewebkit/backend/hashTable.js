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
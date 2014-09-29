var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var os = require('os');
var config = require("./config");
var dataDes = require("./FilesHandle/desFilesHandle");
var commonDAO = require("./DAO/CommonDAO");
var resourceRepo = require("./FilesHandle/repo");
var device = require("./devices");
var util = require('util');
var events = require('events'); 
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");

/**
 * @method pickTags
 *   pick possible tags from path
 *   this will check the string between each two "/"
 *
 * @param1 oTag
 *		object, to store tags we picked
 * 	
 * @param2 rePos 
 *		the regExp position in the path string
 *
 * @param2 path
 *		string, the target path of data
 * 
 */
function pickTags(oTag,rePos,path){
	if(path.length <= 2){
		return;
	}
	var sStartPart = path.slice(rePos,path.length);
	var startPos = sStartPart.indexOf('/');
	if(startPos == -1){
		return;
	}
	var sTag = sStartPart.substring(0,startPos);
	oTag.push(sTag);
	var sNewStart = sStartPart.slice(startPos+1,sStartPart.length);
	pickTags(oTag,0,sNewStart);
}

/**
 * @method getTagsByPath
 *   get tags from a path
 *   return an array of tags
 *
 * @param path
 *		string, the target path of data
 * 
 */
function getTagsByPath(path){
	var oTags = [];
	var regPos = path.search(/picture|photo|\u56fe|contact|music|document|video/i);
	if(regPos>-1){
		pickTags(oTags,regPos,path);
	}
	return oTags;
}
exports.getTagsByPath = getTagsByPath;

/**
 * @method getAllTagsByCategory
 *   get all tags of specific category
 *
 * @param1 category
 *		string, a spcific category we want
 * 
 * @param2 callback
 * 		all result in array
 *
 */
function getAllTagsByCategory(category,callback){
	var TagFile = {tags:[],tagFiles:{}};
	function findItemsCb(err,items){
		if(err){
			console.log(err);
			return;
		}
		for(var k in items){
			items[k].others = (items[k].others).split(",");
			var oItem = items[k];
			for(var j in oItem.others){
				var sTag = oItem.others[j];
				var sUri = oItem.URI;
				var sFilename = oItem.filename;
				if(sTag != null && sTag != ""){
					if(TagFile.tagFiles.hasOwnProperty(sTag)){
						TagFile.tagFiles[sTag].push([sUri,sFilename]);
					}else{
						TagFile.tagFiles[sTag] = [[sUri,sFilename]];
						TagFile.tags.push(sTag);
					}
				}
			}
		}
		callback(TagFile);
	}
	commonDAO.findItems(['others','filename','uri'],[category],null,null,findItemsCb);
}
exports.getAllTagsByCategory = getAllTagsByCategory;


/**
 * @method getAllTags
 *   get all tags in db
 * 
 * @param callback
 * 		all result in array
 *
 */
function getAllTags(callback){
	var TagFile = {};
	function findItemsCb(err,items){
		if(err){
			console.log(err);
			return;
		}
		for(var k in items){
			if(TagFile.hasOwnProperty(items[k].tag)){
				TagFile[items[k].tag].push(items[k].file_URI);
			}else{
				TagFile[items[k].tag] = [items[k].file_URI];
			}
			callback(TagFile);
		}
	}
	commonDAO.findItems(null,['tags'],null,null,findItemsCb)
}
exports.getAllTags = getAllTags;

/**
 * @method getAllTags
 *   get all tags in db
 * 
 * @param callback
 * 		all result in array
 *
 */
function setTagByUri(oTags,oUri,callback){
  function findItemsCb(err,items){
  	if(err){
  		console.log(err);
  		return;
  	}
  	for(var k in items){
  		items[k].others = (items[k].others).concat(oTags.join(","));
  	}
  	updateItems(items,callback);
  }

	for(var k in oUri){
		//commonDAO.findItems(null,,,null,findItemsCb)
	}
}
exports.setTagByUri = setTagByUri;
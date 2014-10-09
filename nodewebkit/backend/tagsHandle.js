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
	//var regPos = path.search(/resources/i);
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
function getAllTagsByCategory(callback,category){
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
 * @param1 callback
 * 		all result in array
 *
 * @param2 oTags
 * 		array, an array of tags to be set
 *
 * @param3 sUri
 * 		string, a specific uri
 *
 *
*/
function setTagByUri(callback,oTags,sUri){
	var pos = sUri.lastIndexOf("#");
	var sTableName = sUri.slice(pos+1,sUri.length);
	function findItemsCb(err,items){
		if(err){
			console.log(err);
			return;
		}

		var category = sTableName;
		var tmpDBItem = [];
		var tmpDesItem = [];
		for(var k in items){
			var item = items[k];
			
			if(!item.others){
				var newTags = oTags.join(",");
			}else{
				item.others = item.others+ ",";
				var newTags = (item.others).concat(oTags.join(","));
			}
			tmpDBItem.push({URI:item.URI,others:newTags,category:category});
			tmpDesItem.push({path:item.path,others:newTags});
		}
		commonDAO.updateItems(tmpDBItem,function(result){
			if(result != "commit"){
				console.log(err);
				return;
			}
			dataDes.updateItems(tmpDesItem,function(){
				callback("success");
			});
		})
	}
	commonDAO.findItems(null,[sTableName],["URI = "+"'"+sUri+"'"],null,findItemsCb)
}
exports.setTagByUri = setTagByUri;


/**
 * @method getFilesByTags
 *   get all files with specific tags
 * 
 * @param1 callback
 * 		all result in array
 *
 * @param2 oTags
 * 		array, an array of tags
 *
*/
/*
function getFilesByTags(callback,oTags){
	var condition = [];
	for(var k in oTags){
		condition.push("tag='"+oTags[k]+"'");
	}
	function findItemsUriCb(err,oUri){
		if(err){
			console.log(err);
			return;
		}
		var uri = [];
		for(var k in oUri){
			uri.push("URI='"+oUri[k]+"'");
		}
		function findItemsCb (err,result) {
			if(err){
				console.log(err);
				return;
			}
			callback(result);			
		}
		console.log(oUri);
		commonDAO.findItems(null,['documents','music'],uri,null,findItemsCb);
	}
	commonDAO.findItems(['file_URI'],['tags'],condition,null,findItemsUriCb);
}
exports.getFilesByTags = getFilesByTags;
*/

function getFilesByTags(callback,oTags){
	var allFiles = [];
	var condition = [];
	for(var k in oTags){
		condition.push("others like '%"+oTags[k]+"%'");
	}
	var sCondition = (oTags.length>1) ? [condition.join(' or ')] : ["others like '%"+oTags[0]+"%'"];
	function findItemsUriCb(err,result){
		if(err){
			console.log(err);
			return;
		}
	}
	commonDAO.findItems(null,['documents'],sCondition,null,function(err,resultDoc){
		if(err){
			console.log(err);
			return;
		}
		allFiles = allFiles.concat(resultDoc);
		commonDAO.findItems(null,['music'],sCondition,null,function(err,resultMusic){
			if(err){
				console.log(err);
				return;
			}
			allFiles = allFiles.concat(resultMusic);
			commonDAO.findItems(null,['pictures'],sCondition,null,function(err,resultPic){
				if(err){
					console.log(err);
					return;
				}
				allFiles = allFiles.concat(resultPic);
				commonDAO.findItems(null,['videos'],sCondition,null,function(err,resultVideo){
					if(err){
						console.log(err);
						return;
					}
					allFiles = allFiles.concat(resultVideo);
					callback(allFiles);
				})
			})
		})		
	});
}
exports.getFilesByTags = getFilesByTags;



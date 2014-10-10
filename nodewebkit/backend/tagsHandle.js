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
 *     example:
 *     TagFile = {
 *									tags:[tag1,tag2,tag3],
 *									tagFiles:{
 *															tag1:[
 *																			[uri1,filename1],
 *																			[uri2,filenamw2]
 *																		]
 *															tag2:[
 *																			[uri3,filename3],
 *																			[uri4,filename4]
 *																		]
 *															tag3:[
 *																			[uri4,filename5]
 *																		]
 *														}
 *      					}
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
 *    example:
 *    TagFile = {
 *								tag1:[file_uri1,file_uri3]
 *								tag2:[file_uri2]
 *							}
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
 * @method getTagsByUri
 *   get tags with specifc uri
 * 
 * @param1 callback
 * 		all result in array
 *
 * @param2 sUri
 * 		string, uri
 *
*/
function getTagsByUri(callback,sUri){
  var sTableName = getCategoryByUris(sUri);
  var condition = ["uri = '"+sUri+"'"];
  var column = ["others"]
  function findItemsCb(err,result){
  	if(err){
  		console.log(err);
  		return;
  	}
  	var tags = result[0].others;
  	tags = tags.split(",")
  	callback(tags);
  }
  commonDAO.findItems(null,sTableName,condition,null,findItemsCb);
}
exports.getTagsByUri = getTagsByUri;


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
function getFilesByTags(callback,oTags){
	var allFiles = [];
	var condition = [];
	for(var k in oTags){
		condition.push("others like '%"+oTags[k]+"%'");
	}
	//(more than one tag) ? combine them with 'or' : make it a single sentence
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
				//item has no tags 
				var newTags = oTags.join(",");
			}else{
				//item has tag(s)
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
			dataDes.updateItems(tmpDesItem,function(result){
				if(result === "success"){
					callback("success");
				}else{
					console.log("error in update des file!");
					return;
				}
			});
		})
	}
	commonDAO.findItems(null,[sTableName],["URI = "+"'"+sUri+"'"],null,findItemsCb)
}
exports.setTagByUri = setTagByUri;



function rmTagsByUri(callback,oTags,sUri){
  var sTableName = getCategoryByUris(sUri);
  var condition = ["uri = '"+sUri+"'"];
  var column = ["others"]
  function findItemsCb(err,result){
  	if(err){
  		console.log(err);
  		return;
  	}
  	var tags = result[0].others;
  	tags = tags.split(",")
  	callback(tags);
  }
  commonDAO.findItems(null,sTableName,condition,null,findItemsCb);
}
exports.rmTagsByUri = rmTagsByUri;


/**
 * @method rmTagsAll
 *   remove tags from all data base and des files
 * 
 * @param1 callback
 * 		return success if successed
 *
 * @param2 oTags
 * 		array, an array of tags to be removed
 *
 *
*/
function rmTagsAll(callback,oTags){
	var allFiles = [];
	var condition = [];
	var deleteTags = [];
	for(var k in oTags){
		condition.push("others like '%"+oTags[k]+"%'");
		deleteTags.push({category:'tags',tag:oTags[k]})
	}
	commonDAO.deleteItems(deleteTags,function(result){
		if(result !== "commit"){
			console.log("error in delete items!")
			return;
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
			buildDeleteItems(allFiles,resultDoc)
			commonDAO.findItems(null,['music'],sCondition,null,function(err,resultMusic){
				if(err){
					console.log(err);
					return;
				}
				buildDeleteItems(allFiles,resultMusic)
				commonDAO.findItems(null,['pictures'],sCondition,null,function(err,resultPic){
					if(err){
						console.log(err);
						return;
					}
					buildDeleteItems(allFiles,resultPic)
					commonDAO.findItems(null,['videos'],sCondition,null,function(err,resultVideo){
						if(err){
							console.log(err);
							return;
						}
						buildDeleteItems(allFiles,resultVideo)
						var resultItems = doDeleteTags(allFiles,oTags);
						dataDes.updateItems(resultItems,function(result){
							if(result === "success"){
								commonDAO.updateItems(resultItems,function(result){
									if(result === "commit"){
										callback(result);
									}
								})
							}else{
								console.log("error in update des files");
								return;
							}
						})
					})
				})
			})		
		});
	})
}
exports.rmTagsAll = rmTagsAll;

function buildDeleteItems(allFiles,result){
	if(result.length>0){
		var sUri = result[0].URI;
		var category = getCategoryByUri(sUri);
		for(var k in result){
			var newDoc = {path:result[k].path,category:category,URI:result[k].URI,others:result[k].others};
			allFiles.push(newDoc);				
		}
	}
}

function doDeleteTags(oAllFiles,oTags){
	var resultFiles = [];
	for(var j in oAllFiles){
		var tags = (oAllFiles[j].others).split(',');
		var newTags = [];
		if(tags){
			for(var i in tags){
				var isExist = false;
				for(var k in oTags){
					if(tags[i]==oTags[k]){
						isExist = true;
					}
				}
				if(!isExist){
					newTags.push(tags[i]);
				}
			}
		}
		(oAllFiles[j]).others = newTags.join(',');
	}
	return oAllFiles;
}

function getCategoryByUri(sUri){
	var pos = sUri.lastIndexOf("#");
	var cate = sUri.slice(pos+1,sUri.length);
	return cate;
}
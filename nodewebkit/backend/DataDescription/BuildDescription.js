//BuildDescription.js
/**
 * @Copyright:
 * 
 * @Description: support API 
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.9.9
 *
 * @version:0.2.1
 **/
var config = require("../config");
var uniqueID = require("../uniqueID");
var fs = require('fs');
var path = require("path");

// @const
var TAG_PATH = ".tags"; //Directory .tags,include attribute and tags
var TAGS_DIR = "#tags"; //Directory #tags,include tag values
var FILE_CONFIG = "config.js";
var ABSOLUTE_PATH = require(config.USERCONFIGPATH + FILE_CONFIG).dataDir;

function createDesFile(newItem){
  var sItem = JSON.stringify(newItem,null,4);
  var sFileName = newItem.filename || newItem.name;
  var spath = config.RESOURCEPATH+'/.des/'+sFileName+'.txt'
  console.log(config.RESOURCEPATH);
  fs.writeFile(spath, sItem,{flag:'w+'},function (err) {
    if (err) {
      console.log("writeFile error!");
      throw err;
    }else{
      console.log("successful");
    }
  });
}

function sortObj(Item,callback){
  var sTags = [];
  var oNewItem = {}
  for(var k in Item){
    sTags.push(k);
  }
  sTags.sort();
  for(var k in sTags){
    oNewItem[sTags[k]] = Item[sTags[k]];
  }
  callback(oNewItem);
}

exports.createItem = function(category,item,loadResourcesCb){
  
  //Get uniform resource identifier
  var uri = "specificURI";

  uniqueID.getFileUid(function(uri){
    item.category = category;
    if (uri != null) {
      item.URI = uri + "#" + category;
      sortObj(item,createDesFile)
    }
    else{
      console.log("Exception: randomId is null.");
      return;
    }
  });
}

/** 
 * @Method: getAllValues
 *    Get values of an attribute/all tags.
 * @patam: key
 *    Attribute's key or string "#tags" for tags
 * @patam: callback
 *    No arguments other than a file name array are given to the completion callback.
 **/
function getAllValues(key,callback){
  //Through path module,get key's full path
  var sFullPath = path.join(ABSOLUTE_PATH,TAG_PATH,key);
  console.log("Full path: " + sFullPath);

  //Read dir,get file name array
  fs.readdir(sFullPath,function(err,files){
    if (err) throw err;
    callback(files);
  });
}

/** 
 * @Method: getAllTags
 *    Get all tags.
 * @patam: callback
 *    No arguments other than a values array of tags are given to the completion callback.
 **/
exports.getAllTags = function(callback){
  getAllValues(TAGS_DIR,callback);
}

/** 
 * @Method: getAttrValues
 *    Get all tags.
 * @patam: attrKey
 *    Key of the specific attribute 
 * @patam: callback
 *    No arguments other than a values array of specific are given to the completion callback.
 **/
exports.getAttrValues = function(attrKey, callback){
  getAllValues(attrKey,callback);
}

/** 
 * @Method: getFiles
 *    Get file contents.
 * @patam: path
 *    Full path 
 * @patam: callback
 *    No arguments other than an array of specific are given to the completion callback.
 *    In array, each element match one line in file.
 **/
function getFiles(path, callback){
  fs.readFile(path, function(err, data){
  	if (err) throw err;

  });
}

/** 
 * @Method: getTagFiles
 *    Get files by specific tag.
 * @patam: tag
 *    Specific tag
 * @patam: callback
 *    No arguments other than an array of specific are given to the completion callback.
 *    In array, each element match one line in file.
 **/
exports.getTagFiles = function(tag,callback){
  var sFullPath = path.join(ABSOLUTE_PATH,TAG_PATH,TAGS_DIR,tag);
  console.log("Full path: " + sFullPath);
  getFiles(sFullPath,callback);
}

/** 
 * @Method: getTagFiles
 *    Get files by specific tag.
 * @patam: attrKey
 *    Specific attribute
 * @patam: attrValue
 *    Value of this attribute
 * @patam: callback
 *    No arguments other than an array of specific are given to the completion callback.
 *    In array, each element match one line in file.
 **/
exports.getAttrFiles = function(attrKey,attrValue,callback){
  var sFullPath = path.join(ABSOLUTE_PATH,TAG_PATH,attrKey,attrValue);
  console.log("Full path: " + sFullPath);
  getFiles(sFullPath,callback);
}
/**
 * @Copyright:
 * 
 * @Description: support API for ../fileHandle.js
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
var bfh = require("./basicFileHandle");
var repo = require("./repo");
var filesHandle = require("../filesHandle");


// @const
var TAG_PATH = ".tags"; //Directory .tags,include attribute and tags
var TAGS_DIR = "#tags"; //Directory #tags,include tag values
var FILE_CONFIG = "config.js";


/** 
 * @Method: createDesFile
 *    create description file for specific file in its target dir.
 * @param: newItem
 *    a new item object with informations for description.
 * @param: isLoadEnd
 *    a boolean var to tell the resource loading is end or not.
 *    @param: "successful"
 * @param: isEndCallback
 *    callback when loading resouce ends.
 **/
function createDesFile(newItem,itemDesPath,isLoadEnd,isEndCallback){
  //console.log(newItem.path)
  var sItem = JSON.stringify(newItem,null,4);
  var sFileName = newItem.filename || newItem.name;
  var posIndex = (newItem.path).lastIndexOf(".");
  var pos = (posIndex == -1) ? "" : (newItem.path).substring(posIndex,(newItem.path).length);
  var sPath = itemDesPath+'/'+sFileName+pos+'.md';
  fs.writeFile(sPath, sItem,{flag:'wx'},function (err) {
    if (err) {
      console.log("================");
      console.log("writeFile error!");
      console.log(err);
      if(isLoadEnd){
        isEndCallback("successful");
      }
      return;
    }else{
      //console.log("write description file success");
      if(isLoadEnd){
        isEndCallback("successful");
      }
    }
  });
}


/** 
 * @Method: sortObj
 *    sort the object element by tags.
 * @param: Item
 *    an item object with informations for description.
 * @param: callback
 *    No arguments other than a file name array are given to the completion callback.
 **/
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


/** 
 * @Method: createItem
 *    create description file.
 * @param: item
 *    an item object with informations for description.
 * @param: itemDesPath
 *    the path that a description file shoud be writen at.
 * @param: isLoadEnd
 *    a boolean var to tell the resource loading is end or not. 
 * @param: callback
 *    No arguments other than a file name array are given to the completion callback.
 * @param: isEndCallback
 *    callback when loading resouce ends.
 **/
exports.createItem = function(category,item,itemDesPath,isLoadEnd,isEndCallback){

  //Get uniform resource identifier
  var uri = "specificURI";
  uniqueID.getFileUid(function(uri){
    item.category = category;
    if (uri != null) {
      item.URI = uri + "#" + category;
      sortObj(item,function(oNewItem){
        createDesFile(oNewItem,itemDesPath,isLoadEnd,isEndCallback);
      });
    }
    else{
      console.log("Exception: URI is null.");
      return;
    }
  });
}

/** 
 * @Method: deleteItem
 *    create description file.
 * @param: item
 *    an item object with informations for description.
 * @param: itemDesPath
 *    the path that a description file shoud be writen at.
 * @param: callback
 *    No arguments other than a file name array are given to the completion callback.
 **/
exports.deleteItem = function(rmItem,itemDesPath,callback){
  var nameindex=rmItem.lastIndexOf('/');
  var fileName=rmItem.substring(nameindex+1,rmItem.length);
  var desFilePath=itemDesPath+"/"+fileName+".md";
  fs.unlink(desFilePath,function (err) {
    if (err) {
      console.log("delete error!");
    }
    else{
      console.log("delete description file success");
      callback();
    } 
  });
}

/** 
 * @Method: updateItem
 *    create description file.
 * @param: item
 *    an item object with informations for description.
 * @param: itemDesPath
 *    the path that a description file shoud be writen at.
 * @param: callback
 *    No arguments other than a file name array are given to the completion callback.
 **/
exports.updateItem = function(chItem,attrs,itemDesPath,callback){
  var nameindex=chItem.lastIndexOf('/');
  var fileName=chItem.substring(nameindex+1,chItem.length);
  var desFilePath=itemDesPath+"/"+fileName+".md";
  fs.readFile(desFilePath,'utf8',function(err,data){
    if (err) {
      console.log("read file error!");
    }
    else{
      var json=JSON.parse(data);
      for(var attr in attrs){
        json[attr]=attrs[attr];
      }
      var sItem = JSON.stringify(json,null,4);
      fs.open(desFilePath,"w",0644,function(err,fd){
        if(err){
          console.log("open des file error!");         
        }
        else{
          fs.write(fd,sItem,0,'utf8',function(err){  
            if (err) {
              console.log("write des file error!");
              console.log(err);
            }
            else{
              callback();
            }
          });
        }
      });
    } 
  });
}

/** 
 * @Method: getAllTags
 *    Get all tags.
 * @param: callback
 *    No arguments other than a values array of tags are given to the completion callback.
 **/
exports.getAllTags = function(callback){
  bfh.getAllValues(TAGS_DIR,callback);
}

/** 
 * @Method: getAttrValues
 *    Get all tags.
 * @param: attrKey
 *    Key of the specific attribute 
 * @param: callback
 *    No arguments other than a values array of specific are given to the completion callback.
 **/
exports.getAttrValues = function(attrKey, callback){
  bfh.getAllValues(attrKey,callback);
}

/** 
 * @Method: getTagFiles
 *    Get files by specific tag.
 * @param: tag
 *    Specific tag
 * @param: callback
 *    No arguments other than an array of specific are given to the completion callback.
 *    In array, each element match one line in file.
 **/
exports.getTagFiles = function(tag,callback){
  var sAbsolutePath = require(config.USERCONFIGPATH + FILE_CONFIG).dataDir;
  var sFullPath = path.join(sAbsolutePath,TAG_PATH,TAGS_DIR,tag);
  console.log("Full path: " + sFullPath);
  bfh.getFiles(sFullPath,callback);
}

/** 
 * @Method: getTagFiles
 *    Get files by specific tag.
 * @param: attrKey
 *    Specific attribute
 * @param: attrValue
 *    Value of this attribute
 * @param: callback
 *    No arguments other than an array of specific are given to the completion callback.
 *    In array, each element match one line in file.
 **/
exports.getAttrFiles = function(attrKey,attrValue,callback){
  var sAbsolutePath = require(config.USERCONFIGPATH + FILE_CONFIG).dataDir;
  var sFullPath = path.join(sAbsolutePath,TAG_PATH,attrKey,attrValue);
  console.log("Full path: " + sFullPath);
  bfh.getFiles(sFullPath,callback);
}

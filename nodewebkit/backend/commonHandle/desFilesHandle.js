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
var filesHandle = require("../filesHandle");
var commonDAO = require("./CommonDAO");


// @const
var TAG_PATH = ".tags"; //Directory .tags,include attribute and tags
var TAGS_DIR = "#tags"; //Directory #tags,include tag values
var FILE_CONFIG = "config.js";

/** 
 * @Method: createDesFile
 *    create description file for specific file in its target dir.
 * @param: newItem
 *    object : with informations for description.
 * @param: isLoadEnd
 *    boolean : tell the resource loading is end or not.
 *    @param: "successful"
 * @param: callback
 *    callback when loading resouce ends.
 *    @param: isLoadEnd
 *    boolean
 **/
exports.getAttrFromFile = function (path,callback){
  fs.readFile(path,'utf8',function(err,data){
    if (err) {
      console.log("read file error!");
       console.log(err);
    }
    else{
      var json=JSON.parse(data);
             console.log(json);
      callback(json);
    }
  });
}

/** 
 * @Method: createDesFile
 *    create description file for specific file in its target dir.
 * @param: newItem
 *    object : with informations for description.
 * @param: isLoadEnd
 *    boolean : tell the resource loading is end or not.
 *    @param: "successful"
 * @param: callback
 *    callback when loading resouce ends.
 *    @param: isLoadEnd
 *    boolean
 **/
function createDesFile(newItem,itemDesPath,callback){
  var sItem = JSON.stringify(newItem,null,4);
  var sFileName = newItem.filename || newItem.name;
  var itemPath = newItem.path;
  var sPos = "";
  if(itemPath){
    var sPosIndex = itemPath.lastIndexOf('.');
    if(sPosIndex > 0){
      sPos = itemPath.substring(sPosIndex,itemPath.length);
    }
  }
  var sPath = itemDesPath+'/'+sFileName+sPos+'.md';
  fs.writeFile(sPath, sItem,{flag:'wx'},function (err) {
    if(err){
      console.log("================");
      console.log("writeFile error!");
      console.log(err);
      return;
    }
    callback();
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
 exports.createItem = function(Item,itemDesPath,callback){
  var sTags = [];
  var oNewItem = {};
  for(var k in Item){
    sTags.push(k);
  }
  sTags.sort();
  for(var k in sTags){
    oNewItem[sTags[k]] = Item[sTags[k]];
  }
  createDesFile(oNewItem,itemDesPath,callback);
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
  var desFilePath = itemDesPath+"/"+fileName+".md";
  fs.readFile(desFilePath,'utf8',function(err,data){
    if (err) {
      console.log("read file error!");
       console.log(err);
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
 * @Method: updateItems
 *    update description files.
 * @param: oItem
 *    an item object with informations for description.
 *    !!! all items in this object should have 'path'!!!
 * @param: callback
 *    No arguments other than a file name array are given to the completion callback.
 **/
var length;
exports.updateItems = function(oItems,callback){
  console.log("{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{");
  console.log(oItems);
  length = oItems.length;
  for(var k in oItems){
    var item = oItems[k];
    var category = item.category;
    var filePath = "";
    var desFilePath = "";
    if(category === "Contacts"){
      desFilePath = config.RESOURCEPATH + '/.des/contacts/'+item.name+'.md';
    }else{
      filePath = item.path;
      desFilePath = (filePath.replace(/\/resources\//,'/resources/.des/')) + '.md';
    }
    updateItemsHelper(callback,desFilePath,item);
  }
}

//combine data with callback
function updateItemsHelper(callback,desFilePath,item){
  fs.readFile(desFilePath,'utf8',function(err,data){
    if (err) {
      console.log("read file error!");
      return;
    }
    else{
      var json=JSON.parse(data);
      for(var attr in item){
        json[attr]=item[attr];
      }
      var sItem = JSON.stringify(json,null,4);
      fs.open(desFilePath,"w",0644,function(err,fd){
        if(err){
          console.log("open des file error!");  
          return;       
        }
        else{
          fs.write(fd,sItem,0,'utf8',function(err){  
            if (err) {
              console.log("write des file error!");
              console.log(err);
              return;
            }
            else{
              length--;
              if(length == 0){
                callback("success");
                console.log("write des file success!");
              }
            }
          });
        }
      });
    }   
  })
}

/** 
 * @Method: getAllTags
 *    Get all tags.
 * @param: callback
 *    No arguments other than a values array of tags are given to the completion callback.
 **/
exports.getAllTags = function(callback){

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

}

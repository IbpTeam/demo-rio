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
var fs = require('../fixed_fs');
//var fs = require('fs');
var fs_extra = require('fs-extra');
var path = require("path");
var commonDAO = require("./CommonDAO");
var utils = require('../utils');

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
function createDesFile(newItem, itemDesPath, callback) {
  var sItem = JSON.stringify(newItem, null, 4);
  var sFileName = newItem.filename || newItem.name;
  var itemPath = newItem.path;
  var sPos = '';
  if (itemPath) {
    sPos = newItem.postfix;
    sPos = (sPos === 'none') ? '' : '.' + sPos;
  }
  var sPath = itemDesPath + '/' + sFileName + sPos + '.md';
  fs_extra.writeFile(sPath, sItem, function(err) {
    if (err) {
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
 * @Method: readDesFiles
 *    Read describe file and generate desObj.
 * @param: categoryName
 *    Category name.
 * @param: filePaths
 *    An array of describe file path.
 * @param: callback
 *    Callback return all describe object.
 **/
function readDesFiles(categoryName,filePaths,callback){
  var aDesObj = new Array();
  var iFileNum = 0;
  filePaths.forEach(function(filePath){
    readDesFile(categoryName,filePath,function(fileObj){
      iFileNum++;
      if(fileObj != null)
        aDesObj.push(fileObj);
      if(iFileNum == filePaths.length)
        callback(aDesObj);
    });
  });
}
exports.readDesFiles = readDesFiles;

/** 
 * @Method: readDesFile
 *    Read describe file and generate desObj.
 * @param: categoryName
 *    Category name.
 * @param: filePath
 *    Describe file path.
 * @param: callback
 *    Callback return all describe object.
 **/
function readDesFile(categoryName,filePath,callback){
  fs.exists(filePath,function(isFileExist){
    if (!isFileExist){
      //delete data from database
      var conditionsArr = new Array();
      switch(categoryName){
        case "contact":{
          var baseName = path.basename(filePath);
          var contactName = baseName.split(".md");
          var conditionStr = "name='" + contactName[0] + "'";
          conditionsArr.push(conditionStr);
        }
        break;
        default:{
          var baseName = path.basename(filePath);
          var contactName = baseName.split(".md");
          var sRealPath = utils.getRealPath(categoryName,contactName[0]);
          var conditionStr = "path='" + sRealPath + "'";
          conditionsArr.push(conditionStr);
        }
      }
      var oDeleteItem = {
        category:categoryName,
        conditions:conditionsArr
      };
      commonDAO.deleteItem(oDeleteItem,function(err){
        if(err){
          callback(err);
        }else{
          callback("done");
        }
      });
    }else{
      fs.readFile(filePath,'utf8',function(err,data){
        if(err){
          console.log("read file error!");
          console.log(err);
          callback(null);
          return;
        }
        callback(JSON.parse(data));
      });
    }
  });
}
exports.readDesFile = readDesFile;

/** 
 * @Method: writeDesObjs2Db
 *    Write desObj to database.
 * @param: desObjs
 *    An array of desObj.
 * @param: callback
 *    Callback.
 **/
function writeDesObjs2Db(desObjs,callback){
  var iSum = 0;
  desObjs.forEach(function(desObj){
    if(desObj.URI == null || desObj.URI == undefined){
      iSum++;
    }else{
      var conditions = ["URI = " + "'" + desObj.URI + "'"];
      commonDAO.findItems(null,[desObj.category],conditions,null,function(err,items){
        if(err){
          console.log(err);
          callback("error");
          return;
        }
        if(items.length > 0){
          //TODO do update
          commonDAO.updateItem(desObj,function(err){
            iSum++;
            if(iSum == desObjs.length)
              callback("done");
          });
        }else{
          commonDAO.createItem(desObj,function(err){
            iSum++;
            if(iSum == desObjs.length)
              callback("done");
          });
        }
      });
    }
  });
}
exports.writeDesObjs2Db = writeDesObjs2Db;

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
      console.log("delete error!" + err);
    }
    else{
      //console.log("delete description file success");
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
exports.updateItem = function(file, attrs, callback) {
  //console.log("update::::::::::", file);
  fs.readFile(file, 'utf8', function(err, data) {
    if (err) {
      console.log("read file error!" + err);
      return;
    }
    var json = JSON.parse(data);
    for (var attr in attrs) {
      json[attr] = attrs[attr];
    }
    var sItem = JSON.stringify(json, null, 4);
    fs.open(file, "w", 0644, function(err, fd) {
      if (err) {
        return //console.log("open des file error!");
      }
      fs.write(fd, sItem, 0, 'utf8', function(err) {
        if (err) {
          console.log("write des file error!"+err);
          return;
        }
        //console.log('update item success!', file);
        callback("success");
      });
    });
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
exports.updateItems = function(oItems, callback) {
  //console.log(oItems);
  length = oItems.length;
  for (var k in oItems) {
    var item = oItems[k];
    var category = item.category;
    var filePath = "";
    var desFilePath = "";
    if (category === "contact") {
      desFilePath = config.RESOURCEPATH + '/contactDes/data/' + item.name + '.md';
    } else {
      filePath = item.path;
      var re = new RegExp('/' + category.toLowerCase() + '/', "i");
      desFilePath = (filePath.replace(re, '/' + category.toLowerCase() + 'Des/')) + '.md';
    }
    updateItemsHelper(callback, desFilePath, item);
  }
}

//combine data with callback
function updateItemsHelper(callback, desFilePath, item) {
  fs.readFile(desFilePath, 'utf8', function(err, data) {
    if (err) {
      console.log("read file error!"+err);
      return;
    }
    var json = JSON.parse(data);
    for (var attr in item) {
      json[attr] = item[attr];
    }
    var sItem = JSON.stringify(json, null, 4);
    fs.open(desFilePath, "w", 0644, function(err, fd) {
      if (err) {
        console.log("open des file error!"+err);
        return;
      }
      fs.write(fd, sItem, 0, 'utf8', function(err) {
        if (err) {
          console.log("write des file error!", sItem);
          console.log(err);
          return;
        }
        length--;
        if (length == 0) {
          //console.log("write des file success!");
          callback("success");
        } else {
          //console.log("write des file error!", sItem);
          return;
        }
      });
    });
  })
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
  //console.log("Full path: " + sFullPath);
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
  //console.log("Full path: " + sFullPath);
  bfh.getFiles(sFullPath,callback);
}

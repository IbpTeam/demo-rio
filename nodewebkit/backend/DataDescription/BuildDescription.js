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
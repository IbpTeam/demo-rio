/**
 * @Copyright:
 * 
 * @Description: Documents Handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.10.28
 *
 * @version:0.3.0
 **/

var commonDao = require("../commonHandle/CommonDAO");
var commonHandle = require("../commonHandle/commonHandle");
var fs = require("fs");

//@const
var CATEGORY_NAME = "documents";

exports.removeDocumentByUri = function(uri,callback){
  commonHandle.getItemByUri(CATEGORY_NAME,uri,function(err,items){
  	if(err)
  	  console.log(err);
  	fs.unlink(items[0].path,function(err){ 
      if(err){
        console.log(err);
        callback("error");
      }
      else{
      	commonHandle.removeFile(CATEGORY_NAME,items[0],callback);
      }
    }); 
  });
}

exports.getDocumentByUri = function(uri,callback){
  commonHandle.getItemByUri(CATEGORY_NAME,uri,callback);
}

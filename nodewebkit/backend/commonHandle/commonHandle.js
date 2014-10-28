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
var commonDao = require("./CommonDAO");
var utils = require("../utils");
var repo = require("./repo");


exports.getItemByUri = function(category,uri,callback){
  var conditions = ["URI = "+"'"+uri+"'"];
  commonDAO.findItems(null,category,conditions,null,callback);
}

exports.deleteItemByUri = function(category,uri,callback){
  var aConditions = ["URI = "+"'"+uri+"'"];
  var oItem = {
  	category:category,
  	conditions:aConditions
  };
  commonDAO.deleteItem(item,callback);
}

exports.removeFile = function(category,item,callback){
  //TODO delete desFile
  var sFullName = item.filename + "." + postfix;
  var sDesFullName = sFullName + ".md";
  var sDesPath = utils.getDesPath(category,sFullName);
  fs.unlink(sDesPath,function(err){
  	if(err)
  	  console.log(err);
    //TODO delete data from db
  	deleteItemByUri(category,item.URI,function(isSuccess){
      if(isSuccess == "rollback"){
      	callback("error");
      	return;
      }
      //TODO git commit
      var aRealFiles = [sFullName];
      var sRealDir = utils.getRealDir(category);
      repo.repoRmsCommit(sRealDir,aRealFiles,function(){
        var aDesFiles = [sDesFullName];
        var sDesDir =   utils.getDesDir(category);
        repo.repoRmsCommit(sDesDir,sDesFullName,callback);
      });
  	});
  });
};
/**
 * @Copyright:
 * 
 * @Description: File process for tag/des file handle
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.9.11
 *
 * @version:0.2.1
 **/

/** 
 * @Method: getAllValues
 *    Get values of an attribute/all tags.
 * @param: key
 *    Attribute's key or string "#tags" for tags
 * @param: callback
 *    No arguments other than a file name array are given to the completion callback.
 **/
exports.getAllValues = function(key,callback){
  var sAbsolutePath = require(config.USERCONFIGPATH + FILE_CONFIG).dataDir;
  //Through path module,get key's full path
  var sFullPath = path.join(sAbsolutePath,TAG_PATH,key);
  console.log("Full path: " + sFullPath);

  //Read dir,get file name array
  fs.readdir(sFullPath,function(err,files){
    if (err) throw err;
    callback(files);
  });
}

/** 
 * @Method: getFiles
 *    Get file contents.
 * @param: path
 *    Full path 
 * @param: callback
 *    No arguments other than an array of specific are given to the completion callback.
 *    In array, each element match one line in file.
 **/
exports.getFiles = function(path, callback){
  fs.readFile(path, function(err, data){
  	if (err) throw err;

  });
}
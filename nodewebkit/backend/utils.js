var path = require("path");

function parsePath(path){
  var pathNodes = path.split('/');
  var pathNew = '';
  for(var i=0; i<pathNodes.length; i++){
    if(pathNodes[i].indexOf(' ') != -1){
      pathNew += '"'+pathNodes[i]+'"/';
    }
    else{
      pathNew += pathNodes[i]+'/';
    }
  }
  pathNew = pathNew.substring(0, pathNew.length-1);
  return pathNew;
}
exports.parsePath = parsePath;

//get the catefory from URI
exports.getCategoryByUri = function(sUri){
  var pos = sUri.lastIndexOf("#");
  var cate = sUri.slice(pos+1,sUri.length);
  return cate;
}

exports.getDesPath = function(category,fullName){
  var sDirName = category + "Des";
  var sDesName = fullName+".md";
  return path.join(process.env["HOME"],".resources",sDirName,sDesName);
}

exports.getRealDir = function(category){
  return path.join(process.env["HOME"],".resources",category);
}

exports.getDesDir = function(category){
  var sDirName = category + "Des";
  return path.join(process.env["HOME"],".resources",sDirName);
}
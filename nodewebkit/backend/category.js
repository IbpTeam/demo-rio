var commonDAO = require("./commonHandle/CommonDAO");
var config = require('./config');

function getCategoryByPath(path){
  var pointIndex=path.lastIndexOf('.');
    if(pointIndex == -1){
      var itemPostfix= "none";
      var nameindex=path.lastIndexOf('/');
      var itemFilename=path.substring(nameindex+1,path.length);
  }else{
      var itemPostfix=path.substr(pointIndex+1);
      var nameindex=path.lastIndexOf('/');
      var itemFilename=path.substring(nameindex+1,pointIndex);
  }
  if(itemPostfix == 'none' || 
     itemPostfix == 'ppt' || 
     itemPostfix == 'pptx'|| 
     itemPostfix == 'doc'|| 
     itemPostfix == 'docx'|| 
     itemPostfix == 'wps'|| 
     itemPostfix == 'odt'|| 
     itemPostfix == 'et'|| 
     itemPostfix == 'txt'|| 
     itemPostfix == 'xls'|| 
     itemPostfix == 'xlsx' || 
     itemPostfix == 'ods' || 
     itemPostfix == 'zip' || 
     itemPostfix == 'sh' || 
     itemPostfix == 'gz' || 
     itemPostfix == 'html' || 
     itemPostfix == 'et' || 
     itemPostfix == 'odt' || 
     itemPostfix == 'pdf' ||
     itemPostfix == 'html5ppt'){
    return "Documents";
  }
  else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
    return "Pictures";
  }
  else if(itemPostfix == 'mp3' || itemPostfix == 'ogg'){
    return "Music";
  }
  else if(itemPostfix == 'conf' || itemPostfix == 'desktop'){
    return "Configuration";
  }
}
exports.getCategoryByPath = getCategoryByPath;

//get the catefory from URI
function getCategoryByUri(sUri){
  var pos = sUri.lastIndexOf("#");
  var cate = sUri.slice(pos+1,sUri.length);
  return cate;
}
exports.getCategoryByUri = getCategoryByUri;
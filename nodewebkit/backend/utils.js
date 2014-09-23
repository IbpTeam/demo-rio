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

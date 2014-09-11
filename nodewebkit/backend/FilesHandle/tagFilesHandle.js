var fs = require('fs');
var path = require('path');

var ignoreAttrList=["path"];

function addAttr(key,value,context,tagPath,callback){
  if(ignoreAttrList.indexOf(key)==0){
    return;
  }
  console.log("Add key="+key+", value="+value);
  path.exists(tagPath, function(exists){
    if(exists){
      var dirPath=tagPath+"/"+key;
      var filePath=dirPath+"/"+value;
      path.exists(dirPath,function(exists){
        if(exists){
          fs.exists(filePath,function(exists){
            if(exists){
              fs.readFile(filePath,"utf-8",function(err,data){
                if(err){
                  throw Error("read "+filePath+" error!"); 
                }
                console.log("data = "+data);
                var fileList = data.split('\n');
                if(fileList.indexOf(context)!=0){
                  fileList.push(context);
                  fileList.sort();
                }
                fs.writeFile(filePath,fileList.join("\n"),function(err){
                  if(err){
                    throw Error("write "+filePath+" error!"); 
                  }
                });   
              });
            }
            else{
              console.log("#30 write file : "+filePath);
              fs.writeFile(filePath,context,function(err){
                if(err){
                  throw Error("write"+filePath+" error!"); 
                }
              });     
            }
          });
        }
        else{
          fs.mkdir(dirPath,0755,function(err){
            if(err){
              console.log("mkdir "+dirPath+" error:"+err);
            }
            console.log("#44 write file : "+filePath);
            fs.writeFile(filePath,context,function(err){
              if(err){
                throw err; 
              }
            });  
          });
        }
      });
    } 
    else{
      throw new Error("tagPath error!");  
    }
  });
}

function addData(dataJson,tagPath,callback){
  var json=JSON.stringify(dataJson);
  console.log(json);
  for(var attr in dataJson){
    if(attr=="tags"){
      for(var tag in dataJson[attr]){
        addAttr("#tags",dataJson[attr][tag],dataJson.path,tagPath,callback);        
      }
    }
    else{
      addAttr(attr,dataJson[attr],dataJson.path,tagPath,callback);
    }
  }
}
exports.addData = addData;
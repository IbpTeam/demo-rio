<<<<<<< HEAD
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
var config = require('../config');
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

//API openDataByUri:通过Uri获取数据资源地址
//返回类型：
//result{
//  openmethod;//三个值：'direct'表示直接通过http访问;'remote'表示通过VNC远程访问;'local'表示直接在本地打开
//  content;//如果openmethod是'direct'或者'local'，则表示路径; 如果openmethod是'remote'，则表示端口号
//}
function openDataByUri(openDataByUriCb,uri){
  function getItemByUriCb(err,items){
    if(err){
      console.log(err);
      return;
    }    
    var item = items[0];
    if(item==null){
      config.riolog("read data : "+ item);
      openDataByUriCb('undefined');
    }
    else{
      config.riolog("read data : "+ item.path);
      var source;
      if(item.postfix==null){
        source={
          openmethod: 'alert',
          content:    item.path + ' can not be recognized.'
        };
      } else {
        switch(item.postfix){
          case 'txt':
            source={
              openmethod: 'html',
              format:     'txtfile',
              title:      '文件浏览',
              content:    item.path
            }
            break;
          case 'html5ppt':
            source={
              openmethod: 'html',
              format:     'html5ppt',
              title:      '文件浏览',
              content:    item.path.substring(0, item.path.lastIndexOf('.'))+'/index.html'
            }
            break;
          case 'ogg':
            source={
              openmethod: 'html',
              format:     'audio',
              title:      '文件浏览',
              content:    item.path
            }
            break;
          case 'none':
            source={
              openmethod: 'alert',
              content:    item.path + ' can not be recognized.'
            };
            break;
          default:
            /*
             * TODO: The opening DOC/PPT/XLS files way need to be supported by noVNC.
             * var host = window.location.host.split(':')[0];       //localhost run
             * console.log(host);
             * var password = "demo123";
             * function turnToVNC()
             * {
             *   window.open("../backend/vnc/noVNC/vnc.html?host="+host+"&port="+content+"&password="+password+"&autoconnect=true");
             * }
             * setTimeout(turnToVNC,1000);
             **/

            source={
              openmethod: 'html',
              format:     'txt',
              title:      '文件浏览',
              content:    "成功打开文件" + item.path
            }

            var exec = require('child_process').exec;
            var s_command;
            var supportedKeySent=false;
            var s_windowname;//表示打开文件的窗口名称，由于无法直接获得，因此一般设置成文件名，既可以查找到对应的窗口
            switch(item.postfix){
              case 'ppt':
                s_command  = "wpp \"" + item.path + "\"";
                supportedKeySent=true;
                var h=item.path.lastIndexOf('/');
                s_windowname=item.path.substring(h<0?0:h+1, item.path.length);
                break;
              case 'pptx':
                s_command  = "wpp \"" + item.path + "\"";
                supportedKeySent=true;
                var h=item.path.lastIndexOf('/');
                s_windowname=item.path.substring(h<0?0:h+1, item.path.length);
                break;
              case 'doc':
                s_command  = "wps \"" + item.path + "\"";
                break;
              case 'docx':
                s_command  = "wps \"" + item.path + "\"";
                break;
              case 'xls':
                s_command  = "et \"" + item.path + "\"";
                break;
              case 'xlsx':
                s_command  = "et \"" + item.path + "\"";
                break;
              default:
                s_command  = "xdg-open \"" + item.path + "\"";
                break;
            }
            var child = exec(s_command, function(error,stdout,stderr){});
            if (supportedKeySent===true){
              source.windowname=s_windowname;
            }
            break;
        }
      }
      var nameindex=item.path.lastIndexOf('/');
      var addPath=item.path.substring(config.RESOURCEPATH.length+1,nameindex);
      var itemDesPath=[config.RESOURCEPATH+"/.des/"+addPath];
      dataDes.updateItems(item.path,{lastAccessTime:currentTime},itemDesPath,function(){
        resourceRepo.repoChsCommit(config.RESOURCEPATH,null,itemDesPath,function(){
          var currentTime = (new Date());
          var updateItem = item;
          updateItem.lastAccessTime = currentTime;
          updateItem.lastAccessDev = config.uniqueID;
          updateItem.category = "Documents";
          var updateItems=new Array();
          var condition = [];
          condition.push("URI='"+item.URI+"'");
          updateItems.conditions = condition;
          updateItems.push(updateItem);
          commonDAO.updateItems(updateItems,function(result){
            console.log(result);
            openDataByUriCb(source);
          });
        });
      });
    }
  }
  commonDAO.findItems(null,"Documents",["URI = "+"'"+uri+"'"],null,getItemByUriCb);
}
exports.openDataByUri = openDataByUri;
=======
>>>>>>> 3b6762c7308a16b24d378e0d1e6fe943ccf491fd

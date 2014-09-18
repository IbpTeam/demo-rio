var commonDAO = require("./DAO/CommonDAO");
var fs = require('fs');
var config = require('./config');


//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmData(rmDataCb, uri) {
  function getItemByUriCb(item){
    if(item == null){
       result='success';
       rmDataByIdCb(result);
    }
    else{
//      console.log("delete : "+ item.path);
      function ulinkCb(result){
        config.riolog("delete result:"+result);
        if(result==null){
          result='success';
          commonDAO.deleteItemByUri(uri,server.deleteItemCb,rmDataByUriCb);
        }
        else{
          result='error';
          rmDataCb(result);
        }
      }
      fs.unlink(item.path,ulinkCb);
    }
  }
  commonDAO.getItemByUri(uri,getItemByUriCb);
}
exports.rmData = rmData;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getData(getDataCb,uri) {
    console.log("read data : ========================="+ uri);
  function getItemByUriCb(item){
    console.log("read data : ========================="+ item.URI);
    getDataCb(item);
  }
  commonDAO.getItemByUri(uri,getItemByUriCb);
}
exports.getData = getData;


//API getDataSourceByUri:通过Uri获取数据资源地址
//返回类型：
//result{
//  openmethod;//三个值：'direct'表示直接通过http访问;'remote'表示通过VNC远程访问;'local'表示直接在本地打开
//  content;//如果openmethod是'direct'或者'local'，则表示路径; 如果openmethod是'remote'，则表示端口号
//}

function getDataSource(getDataSourceCb,id){
  function getItemByUriCb(item){
    if(item==null){
      config.riolog("read data : "+ item);
      getDataSourceCb('undefined');
    }
    else{
      config.riolog("read data : "+ item.path);
      if(item.postfix==null){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix=='none'||
              item.postfix=='jpg'||
              item.postfix=='png'||
              item.postfix=='txt'||
              item.postfix=='ogg'){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix == 'ppt' ||
              item.postfix == 'pptx'|| 
              item.postfix == 'doc'|| 
              item.postfix == 'docx'|| 
              item.postfix == 'wps'|| 
              item.postfix == 'odt'|| 
              item.postfix == 'et'||  
              item.postfix == 'xls'|| 
              item.postfix == 'xlsx'){
        item.path = decodeURIComponent(item.path);
        var source={
          openmethod:'local',
          content:item.path
        };
      }
      else {
        item.path = decodeURIComponent(item.path);
        var source={
          openmethod:'local',
          content:item.path
        };
      }
      getDataSourceCb(source);
      
      var currentTime = (new Date()).getTime();
      config.riolog("time: "+ currentTime);
      function updateItemValueCb(uri,version,cbItem,result){
        config.riolog("update DB: "+ result);
        if(result!='successfull'){
          filesHandle.sleep(1000);
          commonDAO.updateItemValue(uri,version,cbItem,updateItemValueCb);
        }
        else{
          function updateRecentTableCb(uri,time,result){
            config.riolog("update recent table: "+ result);
            if(result!='successfull'){
              filesHandle.sleep(1000);
              commonDAO.updateRecentTable(uri,parseInt(currentTime),updateRecentTableCb);
            }
          }
          commonDAO.updateRecentTable(uri,parseInt(currentTime),updateRecentTableCb);
        }
      }
      var updateItem = {
        lastAccessTime:parseInt(currentTime)
      };
      commonDAO.updateItemValue(item.URI,item.version,updateItem,updateItemValueCb);
    }
  }
  commonDAO.getItemByUri(id,getItemByUriCb);
}
exports.getDataSource = getDataSource;
var commonDAO = require("../../backend/DAO/CommonDAO");
var filesHandle = require("../../backend/filesHandle");
var fileTranfer = require("../../backend/fileTransfer");//2014.7.18 by shuanzi
var fs = require('fs');
var config = require('../../backend/config');
//API loadResources:读取某个资源文件夹到数据库
//返回字符串：
//成功返回success;
//失败返回失败原因
function loadResources(loadResourcesCb,path) {
  console.log("Request handler 'loadResources' was called.");
  filesHandle.initData(loadResourcesCb,path);
}
exports.loadResources = loadResources;

//API addNewFolder:添加某个资源文件夹到数据库
//返回字符串：
//成功返回success;
//失败返回失败原因
function addNewFolder(addNewFolderCb,path) {
  console.log("Request handler 'addNewFolder' was called.");
  filesHandle.addNewFolder(addNewFolderCb,path);
}
exports.addNewFolder = addNewFolder;

//API getAllCate:查询所有基本分类
//返回cate型array：
//cate{
//  id;
//  type;
//  path;
//}
function getAllCate(getAllCateCb) {
  console.log("Request handler 'getAllCate' was called.");
  function getCategoriesCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        URI:each.URI,
        version:each.version,
        type:each.type,
        path:each.logoPath,
        desc:each.desc
      });
    });
    getAllCateCb(cates);
  }
  commonDAO.getCategories(getCategoriesCb);
}
exports.getAllCate = getAllCate;

//API getAllDataByCate:查询某基本分类下的所有数据,此方法不能用来查看联系人分类
//图片视频等返回data型array：
//data{
//  id;
//  filename;
//  postfix:;
//  path;
//}
//联系人返回contacts类型array：
//contacts{
//  id;
//  name;
//  photoPath;
//}

function getAllDataByCate(getAllDataByCateCb,cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  function getAllByCaterotyCb(data)
  {
    var cates = new Array();
    data.forEach(function (each){
      cates.push({
        URI:each.URI,
        version:each.version,
        filename:each.filename,
        postfix:each.postfix,
        path:each.path
      });
    });
    getAllDataByCateCb(cates);
  }
  commonDAO.getAllByCateroty(cate,getAllByCaterotyCb);
}
exports.getAllDataByCate = getAllDataByCate;

//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataByUri(rmDataByUriCb, uri) {
  console.log("Request handler 'rmDataById' was called.");
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
          rmDataByUriCb(result);
        }
      }
      fs.unlink(item.path,ulinkCb);
    }
  }
  commonDAO.getItemByUri(uri,getItemByUriCb);
}
exports.rmDataByUri = rmDataByUri;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByUri(getDataByUriCb,uri) {
    console.log("read data : ========================="+ uri);
  function getItemByUriCb(item){
    console.log("read data : ========================="+ item.URI);
    getDataByUriCb(item);
  }
  commonDAO.getItemByUri(uri,getItemByUriCb);
}
exports.getDataByUri = getDataByUri;

//API getDataSourceByUri:通过Uri获取数据资源地址
//返回类型：
//result{
//  openmethod;//三个值：'direct'表示直接通过http访问;'remote'表示通过VNC远程访问;'local'表示直接在本地打开
//  content;//如果openmethod是'direct'或者'local'，则表示路径; 如果openmethod是'remote'，则表示端口号
//}

function getDataSourceByUri(getDataSourceByUriCb,id){
  console.log("Request handler 'getDataSourceById' was called.");
  function getItemByUriCb(item){
    if(item==null){
      config.riolog("read data : "+ item);
      getDataSourceByUriCb('undefined');
    }
    else{
      config.riolog("read data : "+ item.path);
      if(item.postfix==null){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix=='jpg'||item.postfix=='png'||item.postfix=='txt'||item.postfix=='ogg'){
        var source={
          openmethod:'direct',
          content:item.path
        };
      }
      else if(item.postfix == 'ppt' || item.postfix == 'pptx'|| item.postfix == 'doc'|| item.postfix == 'docx'|| item.postfix == 'wps'|| item.postfix == 'odt'|| item.postfix == 'et'||  item.postfix == 'xls'|| item.postfix == 'xlsx'){
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
      getDataSourceByUriCb(source);
      
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
exports.getDataSourceByUri = getDataSourceByUri;

//API openDataSourceById: 打开数据
//返回类型：
//回调函数带一个参数，内容是一个div，用于显示应用数据，如果是本地打开文件，则显示成功打开信息
function openLocalDataSourceByPath(openDataSourceByPathCb, content){
  var sys = require('sys');
  var exec = require('child_process').exec;
  var commend = "xdg-open \"" + content + "\"";
  exec(commend, function(error,stdout,stderr){
    sys.print('stdout: ' + stdout);
    sys.print('stderr: ' + error);
  });
  file_content = "成功打开文件" + content;
  openDataSourceByPathCb(file_content);
}
exports.openLocalDataSourceByPath = openLocalDataSourceByPath;

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb,uri,version,item){
  console.log("Request handler 'updateDataValue' was called.");
  function updateItemValueCb(uri,version,item,result){
    config.riolog("update DB: "+ result);
    if(result!='successfull'){
      filesHandle.sleep(1000);
      commonDAO.updateItemValue(uri,version,item,updateItemValueCb);
    }
    else{
      updateDataValueCb('success');
    }
  }
  commonDAO.updateItemValue(uri,version,item,updateItemValueCb);
}
exports.updateDataValue = updateDataValue;

//API getRecentAccessData:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组

function getRecentAccessData(getRecentAccessDataCb,num){
  console.log("Request handler 'getRecentAccessData' was called.");
  function getRecentByOrderCb(recentResult){
    if(recentResult[0]==null){
      return;
    }
    while(recentResult.length>num){
      recentResult.pop();
    }
    var data = new Array();
    var iCount = 0;
    function getItemByUriCb(result){
      //console.log(result);
      if(result){
        
        data.push(result);
        if(data.length==num){
          getRecentAccessDataCb(data);
        }
        else{
          iCount++;
          commonDAO.getItemByUri(recentResult[iCount].file_uri,getItemByUriCb);
        }
      }
      else{
        console.log("No data");
      }
    }
    commonDAO.getItemByUri(recentResult[iCount].file_uri,getItemByUriCb);

  }
  commonDAO.getRecentByOrder(getRecentByOrderCb);
}
exports.getRecentAccessData = getRecentAccessData;

//API getServerAddress:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组

function getServerAddress(getServerAddressCb){
  console.log("Request handler 'getServerAddress' was called.");
  var address={
    ip:config.SERVERIP,
    port:config.SERVERPORT
  };
  getServerAddressCb(address);
}
exports.getServerAddress = getServerAddress;

function getAllContacts(getAllContactsCb) {
  function getAllByCaterotyCb(data)
  {
    var contacts = new Array();
    data.forEach(function (each){
      contacts.push({
        URI:each.URI,
        name:each.name,
        photoPath:each.photoPath
      });
    });
    getAllContactsCb(contacts);
  }
  commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
}
exports.getAllContacts = getAllContacts;


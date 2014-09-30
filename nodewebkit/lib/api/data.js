var commonDAO = require("../../backend/DAO/CommonDAO");
var filesHandle = require("../../backend/filesHandle");
var utils = require("../../backend/utils");
var contacts = require("../../backend/contacts");
var devices =  require("../../backend/devices");
var fs = require('fs');
var config = require('../../backend/config');
var cp = require('child_process');
var path = require('path');
//var utils = require('util');
//var io=require('../../node_modules/socket.io/node_modules/socket.io-client/socket.io.js');
/**
 * @method loadResources
 *   读取某个资源文件夹到数据库
 *
 * @param1 loadResourcesCb
 *   回调函数
 *   @result
 *      string，success代表成功，其他代表失败原因
 *
 * @param2 path
 *   string，要加载资源的路径
 */
function loadResources(loadResourcesCb,path) {
  console.log("Request handler 'loadResources' was called.");
  filesHandle.initData(loadResourcesCb,path);
}
exports.loadResources = loadResources;

/**
 * @method loadContacts
 *   读取某个contact文件夹到数据库
 *
 * @param1 loadResourcesCb
 *   回调函数
 *   @result
 *      string，success代表成功，其他代表失败原因
 *
 * @param2 path
 *   string，要加载资源的路径
 */
function loadContacts(loadContactCb,path) {
  console.log("Request handler 'loadContacts' was called.");
  contacts.initContacts(loadContactCb,path);
}
exports.loadContacts = loadContacts;

/**
 * @method getAllCate
 *   查询所有基本分类
 *
 * @param1 getAllCateCb
 *   回调函数
 *   @result
 *     array[cate]: 分类数组
 *        cate{
 *           id;
 *           type;
 *           path;
 *        }
 */
function getAllCate(getAllCateCb) {
  console.log("Request handler 'getAllCate' was called.");
  filesHandle.getAllCate(getAllCateCb)
}
exports.getAllCate = getAllCate;

/**
 * @method getAllDataByCate
 *   查询某基本分类下的所有数据
 *
 * @param1 getAllDataByCateCb
 *   回调函数
 *   @result
 *     array[cate]: 数据数组
 *        如果是联系人，则返回数据如下：
 *        cate{
 *           URI;
 *           version;
 *           name;
 *           photPath;
 *        }
 *        如果是其他类型，则返回数据如下：
 *        cate{
 *           URI;
 *           version;
 *           filename;
 *           postfix;
 *           path;
 *        }
 */
 function getAllDataByCate(getAllDataByCateCb,cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  if(cate == 'Contacts' || cate == 'contacts'){
    contacts.getAllContacts(getAllDataByCateCb);
  }else{
    filesHandle.getAllDataByCate(getAllDataByCateCb,cate)
  }
}
exports.getAllDataByCate = getAllDataByCate;

/**
 * @method getAllContacts
 *   获得所有联系人数组
 *
 * @param1 getAllContactsCb
 *   回调函数
 *   @result
 *     array[cate]: 联系人数组
 *        cate数据如下：
 *        cate{
 *           URI;
 *           version;
 *           name;
 *           photPath;
 *        }
 */
function getAllContacts(getAllContactsCb) {
  contacts.getAllContacts(getAllContactsCb);
}
exports.getAllContacts = getAllContacts;

//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataByUri(rmDataByUriCb, uri) {
  console.log("Request handler 'rmDataById' was called.");
  filesHandle.rmDataByUri(rmDataByUriCb, uri);
}
exports.rmDataByUri = rmDataByUri;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByUri(getDataByUriCb,uri) {
  filesHandle.getDataByUri(getDataByUriCb,uri);
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
  filesHandle.getDataSourceByUri(getDataSourceByUriCb,id);
}
exports.getDataSourceByUri = getDataSourceByUri;

//API openDataSourceById: 打开数据
//返回类型：
//回调函数带一个参数，内容是一个div，用于显示应用数据，如果是本地打开文件，则显示成功打开信息
function openLocalDataSourceByPath(openDataSourceByPathCb, content){
  filesHandle.openLocalDataSourceByPath(openDataSourceByPathCb, content);
}
exports.openLocalDataSourceByPath = openLocalDataSourceByPath;

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb,item){
  console.log("Request handler 'updateDataValue' was called.");
  filesHandle.updateDataValue(updateDataValueCb,item);
}
exports.updateDataValue = updateDataValue;

//API getRecentAccessData:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getRecentAccessData(getRecentAccessDataCb,num){
  console.log("Request handler 'getRecentAccessData' was called.");
  filesHandle.getRecentAccessData(getRecentAccessDataCb,num);
}
exports.getRecentAccessData = getRecentAccessData;

//API getServerAddress:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组

function getServerAddress(getServerAddressCb){
  console.log("Request handler 'getServerAddress' was called.");
  devices.getServerAddress(getServerAddressCb);
}
exports.getServerAddress = getServerAddress;

//API getDeviceDiscoveryService:使用设备发现服务
//参数分别为设备发现和设备离开的回调函数
var SOCKETIOPORT=8891;
function getDeviceDiscoveryService(getDeviceDiscoveryServiceCb){
  console.log("Request handler 'getDeviceDiscoveryService' was called.");
  function getServerAddressCb(result){
    var add='ws://'+result.ip+':'+SOCKETIOPORT+'/';
    var socket = require('socket.io-client')(add);  
    socket.on('mdnsUp', function (data) { //接收来自服务器的 名字叫server的数据
      getDeviceDiscoveryServiceCb('mdnsUp',data);
    });
    socket.on('mdnsDown', function (data) { //接收来自服务器的 名字叫server的数据
      getDeviceDiscoveryServiceCb('mdnsDown',data);
    });
  }
  getServerAddress(getServerAddressCb);
}
exports.getDeviceDiscoveryService = getDeviceDiscoveryService;

function pullFromOtherRepo(){
  console.log("Request handler 'pullFromOtherRepo' was called.");
  filesHandle.firstSync();
}
exports.pullFromOtherRepo = pullFromOtherRepo;

//API pasteFile:粘贴一个数据文件
//参数：要添加的数据的json描述和目的路径
//返回类型：成功返回success;失败返回失败原因
function pasteFile(pasteFileCb, sourcePath, desPath){
  console.log("Request handler 'pasteFile' was called.");
  if(sourcePath.indexOf(desPath) != -1){
    var filename = path.basename(sourcePath);
    var postfix = path.extname(filename);
    filename = path.basename(sourcePath, postfix);
    desPath = utils.parsePath(desPath + '/' + filename + '_copy' + postfix);
  }
  var sourcePathNew = utils.parsePath(sourcePath);
  console.log("cp "+sourcePathNew+" "+desPath);
  cp.exec("cp "+sourcePathNew+" "+desPath, function (error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      pasteFileCb(false);
    }
    pasteFileCb(true);
  });
}
exports.pasteFile = pasteFile;

//API getResourceDataDir:获得resource数据路径
//返回类型：
//返回resource数据路径
function getResourceDataDir(getResourceDataDirCb){
  console.log("Request handler 'getResourceDataDir' was called.");
  cp.exec('echo $USER',function(error,stdout,stderr){
    var usrname=stdout.replace("\n","");
    var data = require('/home/'+usrname+'/.demo-rio/config');
    getResourceDataDirCb(data.dataDir);
  });
}
exports.getResourceDataDir = getResourceDataDir;

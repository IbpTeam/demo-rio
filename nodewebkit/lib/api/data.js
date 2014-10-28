var commonDAO = require("../../backend/commonHandle/CommonDAO");
var filesHandle = require("../../backend/filesHandle");
var utils = require("../../backend/utils");
var desktopConf = require("../../backend/data/desktop");
var contacts = require("../../backend/data/contacts");
var documents = require("../../backend/data/document");
var pictures = require("../../backend/data/picture");
var video = require("../../backend/data/video");
var music = require("../../backend/data/music");
var devices = require("../../backend/data/device");
var tagsHandle = require("../../backend/commonHandle/tagsHandle");
var commonHandle = require("../../backend/commonHandle/commonHandle");
var imChat = require("../../backend/IM/IMChatNoRSA");
var fs = require('fs');
var config = require('../../backend/config');
var cp = require('child_process');
var path = require('path');
var docHandle = require('../../backend/data/desktop/document');
var picHandle = require('../../backend/data/desktop/picture');
var musHandle = require('../../backend/data/desktop/music');
var dskhandle = require('../../backend/data/desktop/desktop');

/*
*IMChat
*/
function startIMChatServer(startIMChatServerCb){
  imChat.initIMServerNoRSA(6986, function(msgobj){
    startIMChatServerCb(msgobj);
  });
}
exports.startIMChatServer = startIMChatServer;

function sendIMMsg(sendIMMsgCb,ipset, msg){
  imChat.sendMSGbyUIDNoRSA(ipset,"rtty123", msg, 6986, sendIMMsgCb);
}
exports.sendIMMsg=sendIMMsg;

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
function loadResources(loadResourcesCb, path) {
  console.log("Request handler 'loadResources' was called.");
  var DocList = [];
  var MusList = [];
  var PicList = [];
  var DskList = [];

  function walk(path, pathDes) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      if (fs.statSync(path + '/' + item).isDirectory()) {
        if (item != '.git' && item != '.des' && item != 'contacts') {
          if (item == 'html5ppt') {
            var html5pptList = fs.readdirSync(path + '/' + item);
            for (var i = 0; i < html5pptList.length; i++) {
              var filename = item + '/' + html5pptList[i] + '.html5ppt';
              fileList.push(path + '/' + filename);
            }
          } else {
            walk(path + '/' + item);
          }
        }
      } else {
        var sPosIndex = (item).lastIndexOf(".");
        var sPos = item.slice(sPosIndex + 1, item.length);
        if (sPos != 'csv' && sPos != 'CSV') {
          if (itemPostfix == 'none' ||
            itemPostfix == 'ppt' ||
            itemPostfix == 'pptx' ||
            itemPostfix == 'doc' ||
            itemPostfix == 'docx' ||
            itemPostfix == 'wps' ||
            itemPostfix == 'odt' ||
            itemPostfix == 'et' ||
            itemPostfix == 'txt' ||
            itemPostfix == 'xls' ||
            itemPostfix == 'xlsx' ||
            itemPostfix == 'ods' ||
            itemPostfix == 'zip' ||
            itemPostfix == 'sh' ||
            itemPostfix == 'gz' ||
            itemPostfix == 'html' ||
            itemPostfix == 'et' ||
            itemPostfix == 'odt' ||
            itemPostfix == 'pdf' ||
            itemPostfix == 'html5ppt') {
            DocList.push(path + '/' + item);
          } else if (itemPostfix == 'jpg' || itemPostfix == 'png') {
            PicList.push(path + '/' + item);
          } else if (itemPostfix == 'mp3' || itemPostfix == 'ogg') {
            MusList.push(path + '/' + item);
          } else if (itemPostfix == 'conf' || itemPostfix == 'desktop') {
            DskList.push(path + '/' + item);
          }
        }
      }
    });
  }
  walk(path);
  docHandle.createData(DocList, function(err, result) {
    if (err) {
      console.log(err);
      callback(err, null);
    } else {
      picHandle.createData(PicList, function(err, result) {
        if (err) {
          console.log(err);
          callback(err, null);
        } else {
          musHandle.createData(MusList, function(err, result) {
            if (err) {
              console.log(err);
              callback(err, null);
            } else {
              loadResourcesCb('success');
            }
          })
        }
      })
    }
  })
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
function loadContacts(loadContactCb, path) {
  console.log("Request handler 'loadContacts' was called.");
  contacts.initContacts(loadContactCb, path);
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
function getAllDataByCate(getAllDataByCateCb, cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  if (cate == 'Contacts' || cate == 'contacts') {
    contacts.getAllContacts(getAllDataByCateCb);
  } else {
    filesHandle.getAllDataByCate(getAllDataByCateCb, cate)
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
  var cate = utils.getCategoryByUri(uri);
  switch(cate){
    case "contacts":{

    }
    break;
    case "pictures":{
      
    }
    break;
    case "documents":{
      documents.removeDocumentByUri(uri,rmDataByUriCb);
    }
    break;
    case "music":{
      
    }
    break;
    case "videos":{
      
    }
    break;
  }
}
exports.rmDataByUri = rmDataByUri;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByUri(getDataByUriCb, uri) {
  filesHandle.getDataByUri(getDataByUriCb, uri);
}
exports.getDataByUri = getDataByUri;

/**
 * @method openDataByUri
 *   打开URI对应的数据
 *
 * @param1 openDataByUriCb
 *   回调函数
 *   @result
 *     object: 显示数据或结果
 *        结构如下：
 *        {
 *            openmethod: 'html',
 *            format:     'audio',
 *            title:      '文件浏览',
 *            content:    item.path
 *        }
 *        其中具体说明如下：
 *        openmethod: 打开方式，支持 html, alert两种
 *          如果是alert，则只有content属性，为alert需要输出的结果
 *          如果是html则具有format, title, content三种属性
 *        title: 是返回结果的标题，如果显示则可以用这个为标题
 *        format和content: 分别表示结果的格式和内容。
 *          format:audio 音频格式，content是具体的音频引用路径
 *          format:div   表示结果是一个div封装的字符串，可以直接显示在界面中
 *          format:txtfile 表示结果是一个txt文件，可以通过load进行加载
 *          format:other  其他结果都默认是一个div或html格式的字符串，可直接显示
 *
 * @param2 uri
 *   string，要打开数据的URI
 */
function openDataByUri(openDataByUriCb, uri) {
  console.log("Request handler 'openDataByUri' was called.");
  filesHandle.openDataByUri(function(result) {
    if (result.format === "html5ppt") {
      console.log("open html5ppt:" + result.content);
      window.open(result.content);
      result.content = "成功打开文件" + result.content;
      setTimeout(openDataByUriCb(result), 0);
    } else {
      setTimeout(openDataByUriCb(result), 0);
    }
  }, uri);
}
exports.openDataByUri = openDataByUri;

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb, item) {
  console.log("Request handler 'updateDataValue' was called.");
  filesHandle.updateDataValue(updateDataValueCb, item);
}
exports.updateDataValue = updateDataValue;

//API getRecentAccessData:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getRecentAccessData(getRecentAccessDataCb, num) {
  console.log("Request handler 'getRecentAccessData' was called.");
  filesHandle.getRecentAccessData(getRecentAccessDataCb, num);
}
exports.getRecentAccessData = getRecentAccessData;

//API getServerAddress:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组

function getServerAddress(getServerAddressCb) {
  console.log("Request handler 'getServerAddress' was called.");
  devices.getServerAddress(getServerAddressCb);
}
exports.getServerAddress = getServerAddress;

//API getDeviceDiscoveryService:使用设备发现服务
//参数分别为设备发现和设备离开的回调函数
var SOCKETIOPORT = 8891;

function getDeviceDiscoveryService(getDeviceDiscoveryServiceCb) {
  console.log("Request handler 'getDeviceDiscoveryService' was called.");

  function getServerAddressCb(result) {
    var add = 'ws://' + result.ip + ':' + SOCKETIOPORT + '/';
    var socket = require('socket.io-client')(add);
    socket.on('mdnsUp', function(data) { //接收来自服务器的 名字叫server的数据
      getDeviceDiscoveryServiceCb('mdnsUp', data);
    });
    socket.on('mdnsDown', function(data) { //接收来自服务器的 名字叫server的数据
      getDeviceDiscoveryServiceCb('mdnsDown', data);
    });
  }
  getServerAddress(getServerAddressCb);
}
exports.getDeviceDiscoveryService = getDeviceDiscoveryService;

function pullFromOtherRepo() {
  console.log("Request handler 'pullFromOtherRepo' was called.");
  filesHandle.firstSync();
}
exports.pullFromOtherRepo = pullFromOtherRepo;

//API pasteFile:粘贴一个数据文件
//参数：要添加的数据的json描述和目的路径
//返回类型：成功返回success;失败返回失败原因
function pasteFile(pasteFileCb, sourcePath, desPath) {
  console.log("Request handler 'pasteFile' was called.");
  var filename = path.basename(sourcePath);
  var postfix = path.extname(filename);
  if (sourcePath.indexOf(desPath) != -1) {
    filename = path.basename(sourcePath, postfix);
    desPath = utils.parsePath(desPath + '/' + filename + '_copy' + postfix);
  } else {
    desPath = utils.parsePath(desPath + '/' + filename);
  }
  var sourcePathNew = utils.parsePath(sourcePath);
  cp.exec("cp " + sourcePathNew + " " + desPath, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      pasteFileCb(false);
    }
    //    filesHandle.addFile(desPath, pasteFileCb(true));
    pasteFileCb(true);
  });
}
exports.pasteFile = pasteFile;

//API createFile:新建一个文档
//参数：新建文档的类型，以及新建文档的路径
//返回类型：成功返回success;失败返回失败原因
function createFile(creatFileCb, filePostfix, desPath) {
  console.log("Request handler 'createFile' was called.");
  var data = new Date();
  desPath = utils.parsePath(desPath + '/NewFile_' + data.toLocaleString().replace(' ', '_') + '.' + filePostfix);
  cp.exec("touch " + desPath, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      creatFileCb(false);
    } else {
      creatFileCb(true);
    }
  });
}
exports.createFile = createFile;

//API getResourceDataDir:获得resource数据路径
//返回类型：
//返回resource数据路径3
function getResourceDataDir(getResourceDataDirCb) {
  console.log("Request handler 'getResourceDataDir' was called.");
  cp.exec('echo $USER', function(error, stdout, stderr) {
    var usrname = stdout.replace("\n", "");
    var data = require('/home/' + usrname + '/.demo-rio/config');
    getResourceDataDirCb(data.dataDir);
  });
}
exports.getResourceDataDir = getResourceDataDir;


/**
 * @method : getAllTagsByCategory
 *
 * @param1 : getAllTagsByCategoryCb 回调函数
 *   @result : string
 *
 * @param2 : category, array
 */
function getAllTagsByCategory(getAllTagsByCategoryCb, category) {
  console.log("Request handler 'getAllTagsByCategory' was called.");
  tagsHandle.getAllTagsByCategory(getAllTagsByCategoryCb, category);
}
exports.getAllTagsByCategory = getAllTagsByCategory;

/**
 * @method getTagsByUri
 *   get tags with specifc uri
 *
 * @param1 getTagsByUriCb
 *    all result in array
 *
 * @param2 sUri
 *    string, uri
 *
 */
function getTagsByUri(getTagsByUriCb, sUri) {
  console.log("Request handler 'getAllTagsByCategory' was called.");
  tagsHandle.getTagsByUri(getTagsByUriCb, sUri);
}
exports.getTagsByUri = getTagsByUri;

/**
 * @method : setTagByUri
 *
 * @param1 : setTagByUriCb 回调函数
 *   @result : string
 *
 * @param2 : oTags, array
 *
 *    oTags example:
 *    var oTags = ['documents','music','picture']
 *
 * @param3 : oUri, array
 *
 *    oUri example:
 *    var oUri = ['some_uri_1','some_uri_2','some_uri_2']
 *
 *
 */
function setTagByUri(setTagByUriCb, oTags, oUri) {
  console.log("Request handler 'setTagByUri' was called.");
  tagsHandle.setTagByUri(setTagByUriCb, oTags, oUri);
}
exports.setTagByUri = setTagByUri;

/**
 * @method getFilesByTag
 *   get all files with specific tags
 *
 * @param1 callback
 *    all result in array
 *
 * @param2 oTags
 *    array, an array of tags
 *
 *    oTags example:
 *    var oTags = ['documents','music','picture']
 *
 */
function getFilesByTags(getFilesByTagsCb, oTags) {
  console.log("Request handler 'getFilesByTags' was called.");
  tagsHandle.getFilesByTags(getFilesByTagsCb, oTags);
}
exports.getFilesByTags = getFilesByTags;


/**
 * @method rmTagsAll
 *   remove tags from all data base and des files
 *
 * @param1 callback
 *    @result
 *    string, return 'sucess' if successed
 *
 * @param2 oTags
 *    array, an array of tags to be removed
 *
 *    oTags example:
 *    var oTags = ['documents','music','picture']
 *
 */
function rmTagsAll(rmTagsAllCb, oTags) {
  console.log("Request handler 'rmTagsAll' was called.");
  tagsHandle.rmTagsAll(rmTagsAllCb, oTags);
}
exports.rmTagsAll = rmTagsAll;

/**
 * @method rmTagsByUri
 *   remove a tag from some files with specific uri
 *
 * @param1 callback
 *    @result
 *    string, return 'commit' if successed
 *
 * @param2 oTags
 *    array, an array of tags to be removed
 *
 *    oTags example:
 *    var oTags = ['documents','music','picture']
 *
 */
function rmTagsByUri(rmTagsByUriCb, sTag, oUri) {
  console.log("Request handler 'rmTagsByUri' was called.");
  tagsHandle.rmTagsByUri(rmTagsByUriCb, sTag, oUri);
}
exports.rmTagsByUri = rmTagsByUri;

/** 
 * @Method: readThemeConf
 *    read file Theme.conf
 *
 * @param: readThemeConfCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "readThemeConf : read Theme config file error!"
 *
 *    @param2: result,
 *        object, the result in object
 *
 *    object example:
 *    {
 *       "icontheme": {
 *           "name": "Mint-X",
 *           "active": true,
 *           "icon": null,
 *           "path": "$HOME",
 *           "id": "computer",
 *           "pos": {
 *               "x": null,
 *               "y": null
 *           }
 *       },
 *     "computer": {
 *           ...
 *           }
 *          ...
 *    }
 *
 **/
function readThemeConf(readThemeConfCb) {
  console.log("Request handler 'readThemeConf' was called.");
  desktopConf.readThemeConf(readThemeConfCb);
}
exports.readThemeConf = readThemeConf;

/** 
 * @Method: writeThemeConf
 *    modify file Theme.conf
 *
 * @param: readThemeConfCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "writeThemeConf : read Theme.conf error!"
 *                write error : "writeThemeConf : write Theme config file error!"
 *
 *    @param2: result,
 *        string, retrieve success when success
 *
 * @param: oTheme
 *    object, only content that needs to be modified
 *
 *    oThem example:
 *    var oTheme =
 *    {
 *       "icontheme": {
 *           "name": "Mint-X",
 *           "active": true,
 *           "icon": null,
 *           "path": "$HOME",
 *           "id": "computer",
 *           "pos": {
 *               "x": null,
 *               "y": null
 *           }
 *       },
 *     "computer": {
 *           ...
 *           }
 *          ...
 *    }
 *
 *
 **/
function writeThemeConf(writeThemeConfCb, oTheme) {
  console.log("Request handler 'writeThemeConf' was called.");
  desktopConf.writeThemeConf(writeThemeConfCb, oTheme);
}
exports.writeThemeConf = writeThemeConf;

/** 
 * @Method: readWidgetConf
 *    read file Widget.conf
 *
 * @param: readWidgetConfCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error : "readWidgetConf : read Theme config file error!"
 *
 *    @param2: result,
 *        object, the result in object
 *
 *    result example:
 *    {
 *       "icontheme": {
 *           "name": "Mint-X",
 *           "active": true,
 *           "icon": null,
 *           "path": "$HOME",
 *           "id": "computer",
 *           "pos": {
 *               "x": null,
 *               "y": null
 *           }
 *       },
 *     "computer": {
 *           ...
 *           }
 *          ...
 *    }
 *
 **/
function readWidgetConf(readWidgetConfCb) {
  console.log("Request handler 'readWidgetConf' was called.");
  desktopConf.readWidgetConf(readWidgetConfCb);
}
exports.readWidgetConf = readWidgetConf;

/** 
 * @Method: writeThemeConf
 *    modify file Theme.conf
 *
 * @param: writeWidgetConfCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error : "writeWidgetConf: read Widget.conf error!"
 *                write error: "writeWidgetConf: write Widget config file error!"
 *
 *    @param2: result,
 *        object, the result in object
 *
 *    result example:
 *    {
 *       "icontheme": {
 *           "name": "Mint-X",
 *           "active": true,
 *           "icon": null,
 *           "path": "$HOME",
 *           "id": "computer",
 *           "pos": {
 *               "x": null,
 *               "y": null
 *           }
 *       },
 *     "computer": {
 *           ...
 *           }
 *          ...
 *    }
 *
 **/
function writeWidgetConf(writeWidgetConfCb, oWidget) {
  console.log("Request handler 'writeWidgetConf' was called.");
  desktopConf.writeWidgetConf(writeWidgetConfCb, oWidget);
}
exports.writeWidgetConf = writeWidgetConf;

/** 
 * @Method: readDesktopFile
 *   find a desktop file with name of sFilename
 *   exmple: var sFileName = 'cinnamon';
 *
 * @param: readDesktopFileCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "readDesktopFile : desktop file NOT FOUND!"
 *                parse file error : "readDesktopFile : parse desktop file error!"
 *
 *    result example:
 *    {
 *      Type: Application
 *      Name: Cinnamon
 *      Comment: Window management and application launching
 *      Exec: /usr/bin / cinnamon - launcher
 *      X - GNOME - Bugzilla - Bugzilla: GNOME
 *      X - GNOME - Bugzilla - Product: cinnamon
 *      X - GNOME - Bugzilla - Component: general
 *      X - GNOME - Bugzilla - Version: 1.8.8
 *      Categories: GNOME;GTK;System;Core;
 *      OnlyShowIn: GNOME;
 *      NoDisplay: true
 *      X - GNOME - Autostart - Phase: WindowManager
 *      X - GNOME - Provides: panel;windowmanager;
 *      X - GNOME - Autostart - Notify: true
 *      X - GNOME - AutoRestart: true
 *    }
 *
 * @param2: sFileName
 *    string,name of target file ,suffix is not required
 *    example: var sFileName = 'cinnamon';
 *
 **/
function readDesktopFile(readDesktopFileCb, sFileName) {
  console.log("Request handler 'readDesktopFile' was called.");
  desktopConf.readDesktopFile(readDesktopFileCb, sFileName);
}
exports.readDesktopFile = readDesktopFile;

/** 
 * @Method: writeDesktopFile
 *    modify a desktop file
 *
 * @param: writeDesktopFileCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error  : "writeDesktopFile: desktop file NOT FOUND!"
 *                write error : "writeDesktopFile: write desktop file error!"
 *                parse error : "writeDesktopFile: parse desktop file error!"
 *                parse error : "writeDesktopFile: deparse desktop file error!"
 *                input  error: "writeDesktopFile: entry content empty!"
 *
 *    @param2: result
 *        string, retrieve 'success' when success
 *
 * @param2: sFileName
 *    string, a file name
 *    exmple: var sFileName = 'cinnamon';
 *
 * @param3: oEntries
 *    object, this object indludes those entries that you want
 *            to change in this desktop file.
 *
 *    example:
 *    var oEntries = {
 *      "[Desktop Entry]": {
 *        "Name": "Videos",
 *        "Name[zh_CN]": "test",
 *        "Comment": "test",
 *        "Comment[zh_CN]": "test",
 *        "Keywords": "test",
 *        "Exec": "test",
 *        "Icon": "test",
 *        "Terminal": "false",
 *        "Type": "test",
 *        "Categories": "test",
 *      },
 *      "[Desktop Action Play]": {
 *        "Name": "test/test",
 *        "Exec": "test --play-pause",
 *        "OnlyShowIn": "test;"
 *      },
 *      "[Desktop Action Next]": {
 *        "Name": "test",
 *        "Exec": "test --next",
 *        "OnlyShowIn": "Unity;"
 *      }
 *    }
 *
 **/
function writeDesktopFile(writeDesktopFileCb, sFileName, oEntries) {
  console.log("Request handler 'writeDesktopFile' was called.");
  desktopConf.writeDesktopFile(writeDesktopFileCb, sFileName, oEntries);
}
exports.writeDesktopFile = writeDesktopFile;

/** 
 *
 * THIS IS NOT AN API FOR APPLICATIONS, ONLY HERE FOR TEST
 *
 * @Method: findAllDesktopFiles
 *    find all .desktop files in system
 *
 * @param: callback
 *    @result
 *    object, an array of all desktop file's full path
 *
 *    example:
 *        [
 *         "/usr/share/xfce4/helpers/urxvt.desktop",
 *         "/usr/share/xfce4/helpers/lynx.desktop",
 *         "/usr/share/xfce4/helpers/rodent.desktop",
 *         "/usr/share/xfce4/helpers/icecat.desktop",
 *         "/usr/share/xfce4/helpers/pcmanfm.desktop",
 *         "/usr/share/xfce4/helpers/mozilla-browser.desktop",
 *        ]
 *
 **/
function findAllDesktopFiles(findAllDesktopFilesCb) {
  console.log("Request handler 'findAllDesktopFiles' was called.");
  desktopConf.findAllDesktopFiles(findAllDesktopFilesCb);
}
exports.findAllDesktopFiles = findAllDesktopFiles;

/** 
 * @Method: CreateWatcher
 *    To create a wacther on a dir. This wacther would listen on 3 type of ev-
 *    -ent:
 *      'add'   : a new file or dir is added;
 *      'delete': a file or dir is deleted;
 *      'rename': a file is renamed;
 *      'error' : something wrong with event.
 *
 * @param: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                read error   : "CreateWatcher : echo $HOME error!"
 *                read error   : "CreateWatcher : readdir error!"
 *
 *                A watcher on linstening would catch this type of err:
 *                _watcher.on('error',function(err){});
 *                watch error  :'CreateWatcher : watch error!'
 *
 *    @param2: result
 *        string, retrieve 'success' when success
 *
 * @param2: watchDir
 *    string, a dir under user path
 *    exmple: var watchDir = '/resources/.desktop/desktopadwd'
 *    (compare with a full path: '/home/xiquan/resources/.desktop/desktopadwd')
 *
 *
 **/
function CreateWatcher(CreateWatcherCb, watchDir) {
  console.log("Request handler 'CreateWatcher' was called.");
  return desktopConf.CreateWatcher(CreateWatcherCb, watchDir);
}
exports.CreateWatcher = CreateWatcher;

/** 
 * @Method: shellExec
 *    execute a shell command
 *
 * @param1: shellExecCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                exec error   : "shellExec : [specific err info]"
 *
 *    @param2: result,
 *        string, stdout info in string as below
 *                '/usr/share/cinnamon:/usr/share/gnome:/usr/local/share/:/usr/-
 *                -share/:/usr/share/mdm/'
 *
 * @param2: command
 *    string, a shell command
 *    exmple: var command = 'echo $XDG_DATA_DIRS'
 *
 *
 **/
function shellExec(shellExecCb, command) {
  console.log("Request handler 'shellExec' was called.");
  desktopConf.shellExec(shellExecCb, command);
}
exports.shellExec = shellExec;

/** 
 * @Method: copyFile
 *    To copy a file or dir from oldPath to newPath.
 *    !!!The dir CAN have content,just like command cp -r.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                echo error : 'copyFile : echo $HOME error'
 *                copy error : 'copyFile : copy error'
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 * @param2: oldPath
 *    string, a dir under user path
 *    exmple: var oldPath = '/resources/.desktop/Theme.conf'
 *    (compare with a full path:'/home/xiquan/resources/.desktop/Theme.conf')
 *
 * @param3: newPath
 *    string, a dir under user path
 *    exmple: var newPath = '/resources/.desktop/BadTheme.conf'
 *    (compare with a full path:'/home/xiquan/resources/.desktop/BadTheme.conf')
 *
 **/
function copyFile(copyFileCb, fromPath, toPath) {
  console.log("Request handler 'copyFile' was called.");
  desktopConf.copyFile(copyFileCb, fromPath, toPath);
}
exports.copyFile = copyFile;

/** 
 * @Method: moveFile
 *    To move a file or dir from oldPath to newPath.
 *    !!!The dir CAN have content and contend would be move to new dir as well.
 *    !!!Notice that if you are moving a dir, the newPath has to be a none exist
 *    !!!new dir, otherwise comes error.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                echo error : 'moveFile : echo $HOME error'
 *                move error : 'moveFile : move error'
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 * @param2: oldPath
 *    string, a dir under user path
 *    exmple: var oldPath = '/resources/.desktop/Theme.conf'
 *    (compare with a full path:'/home/xiquan/resources/.desktop/Theme.conf')
 *
 * @param3: newPath
 *    string, a dir under user path
 *    exmple: var newPath = '/resources/.desktop/BadTheme.conf'
 *    (compare with a full path:'/home/xiquan/resources/.desktop/BadTheme.conf')
 *
 **/
function moveFile(moveFileCb, oldPath, newPath) {
  console.log("Request handler 'moveFile' was called.");
  desktopConf.moveFile(moveFileCb, oldPath, newPath);
}
exports.moveFile = moveFile;

/** 
 * @Method: renameDesktopFile
 *    To rename a desktop file
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                write error : 'renameDesktopFile : specific error'
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 * @param2: oldName
 *    string, file name of specific file you need to rename
 *    exmple: var oldName = 'example.desktop'
 *
 * @param3: newName
 *    string, a new name that you want to set
 *    example: var newName = 'newName'
 *
 **/
function renameDesktopFile(renameDesktopFileCb, oldName, newName) {
  console.log("Request handler 'renameDesktopFile' was called.");
  desktopConf.renameDesktopFile(renameDesktopFileCb, oldName, newName);
}
exports.renameDesktopFile = renameDesktopFile;

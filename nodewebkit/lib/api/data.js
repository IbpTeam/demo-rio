var commonDAO = require("../../backend/commonHandle/CommonDAO");
var utils = require("../../backend/utils");
var desktopConf = require("../../backend/data/desktop");
var contacts = require("../../backend/data/contacts");
var documents = require("../../backend/data/document");
var other = require("../../backend/data/other");
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
var repo = require('../../backend/commonHandle/repo');

/*
 *getLocalData
 */
function getLocalData(getLocalDataCb) {
  var localJson = {};
  localJson['account'] = imChat.LOCALACCOUNT;
  localJson['UID'] = imChat.LOCALUUID;

  getLocalDataCb(localJson);
}
exports.getLocalData = getLocalData;

/*
 *IMChat
 */
function startIMChatServer(startIMChatServerCb) {
  imChat.initIMServerNoRSA(6986, function(msgobj) {
    startIMChatServerCb(msgobj);
  });
}
exports.startIMChatServer = startIMChatServer;

function sendIMMsg(sendIMMsgCb, ipset, toAccount, msg) {
  imChat.sendMSGbyUIDNoRSA(ipset, toAccount, msg, 6986, sendIMMsgCb);
}
exports.sendIMMsg = sendIMMsg;

/**
 * @method loadFile
 *    To load one single file into datamgr.
 *
 * @param1 loadFileCb
 *   回调函数(err,result)
 *   @err
 *      string, specific err info
 *   @result
 *      array，object array, include file info of name exist file.
 *
 * @param1: sFilePath
 *    string, a file path as, '/home/xiquan/mydir/myfile.txt'.
 *
 */
function loadFile(loadFileCb, sFilePath) {
  console.log("Request handler 'loadFile' was called.");
  var sPosIndex = (sFilePath).lastIndexOf(".");
  var sPos = sFilePath.slice(sPosIndex + 1, sFilePath.length);
  var category = null;
  if (sPos != 'csv' && sPos != 'CSV') {
    if (sPos == 'none' ||
      sPos == 'ppt' ||
      sPos == 'pptx' ||
      sPos == 'doc' ||
      sPos == 'docx' ||
      sPos == 'wps' ||
      sPos == 'odt' ||
      sPos == 'et' ||
      sPos == 'txt' ||
      sPos == 'xls' ||
      sPos == 'xlsx' ||
      sPos == 'ods' ||
      sPos == 'zip' ||
      sPos == 'sh' ||
      sPos == 'gz' ||
      sPos == 'html' ||
      sPos == 'et' ||
      sPos == 'odt' ||
      sPos == 'pdf' ||
      sPos == 'html5ppt') {
      category = 'document';
    } else if (sPos == 'jpg' || sPos == 'png') {
      category = 'picture';
    } else if (sPos == 'mp3') {
      category = 'music';
    } else if (sPos == 'ogg') {
      category = 'video';
    } else if (sPos == 'conf' || sPos == 'desktop') {
      var _err = 'this is a desktop config file ...'
      return loadFileCb(_err, null);
    } else {
      category = 'other';
    }
  }
  var cate = utils.getCategoryObject(category);
  cate.createData(sFilePath, function(err, result) {
    if (err !== 'sucess') {
      console.log(err);
      return loadFileCb(err, null);
    }
    loadFileCb(null, result);
  })
}
exports.loadFile = loadFile;

//var utils = require('util');
//var io=require('../../node_modules/socket.io/node_modules/socket.io-client/socket.io.js');
/**
 * @method loadResources
 *   读取某个资源文件夹到数据库
 *
 * @param1 loadResourcesCb
 *   回调函数(err,result)
 *   @err
 *      string, specific err info
 *   @result
 *      array，object array, include file info of name exist file.
 *  
 *   example:
 *   [{
 *     "origin_path": "/home/xiquan/WORK_DIRECTORY/resources/pictures/city1.jpg",
 *     "old_name": "city1.jpg",
 *     "re_name": "duplicate_at_2014年12月17日_下午1:30:40_duplicate_at_2014年12月17日_下午1:30:40_city1.jpg"
 *   }, {
 *     "origin_path": "/home/xiquan/WORK_DIRECTORY/resources/pictures/city3.jpg",
 *     "old_name": "city3.jpg",
 *     "re_name": "duplicate_at_2014年12月17日_下午1:30:40_duplicate_at_2014年12月17日_下午1:30:40_city3.jpg"
 *   }]
 *  
 * @param2 path
 *   string，要加载资源的路径
 */
function loadResources(loadResourcesCb, path) {
  console.log("Request handler 'loadResources' was called.");
  var DocList = [];
  var MusList = [];
  var VidList = [];
  var PicList = [];
  var DskList = [];
  var OtherList = [];
  var existFile = [];

  function walk(path) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      if (fs.lstatSync(path + '/' + item).isSymbolicLink()) {
        console.log('SymbolicLink: ' + path + '/' + item);
      } else if (fs.statSync(path + '/' + item).isDirectory()) {
        if (item != '.git' && item != '.des' && item != 'contacts') {
          if (item == 'html5ppt') {
            /*var html5pptList = fs.readdirSync(path + '/' + item);
            for (var i = 0; i < html5pptList.length; i++) {
              var filename = item + '/' + html5pptList[i] + '.html5ppt';
              fileList.push(path + '/' + filename);
            }*/
          } else {
            walk(path + '/' + item);
          }
        }
      } else if (fs.statSync(path + '/' + item).isFile()) {
        var sPosIndex = (item).lastIndexOf(".");
        var sPos = item.slice(sPosIndex + 1, item.length);
        if (sPos != 'csv' && sPos != 'CSV') {
          if (sPos == 'none' ||
            sPos == 'ppt' ||
            sPos == 'pptx' ||
            sPos == 'doc' ||
            sPos == 'docx' ||
            sPos == 'wps' ||
            sPos == 'odt' ||
            sPos == 'et' ||
            sPos == 'txt' ||
            sPos == 'xls' ||
            sPos == 'xlsx' ||
            sPos == 'ods' ||
            sPos == 'zip' ||
            sPos == 'sh' ||
            sPos == 'gz' ||
            sPos == 'html' ||
            sPos == 'et' ||
            sPos == 'odt' ||
            sPos == 'pdf' ||
            sPos == 'html5ppt') {
            DocList.push(path + '/' + item);
          } else if (sPos == 'jpg' || sPos == 'png') {
            PicList.push(path + '/' + item);
          } else if (sPos == 'mp3') {
            MusList.push(path + '/' + item);
          } else if (sPos == 'ogg') {
            VidList.push(path + '/' + item);
          } else if (sPos == 'conf' || sPos == 'desktop') {
            DskList.push(path + '/' + item);
          } else {
            OtherList.push(path + '/' + item);
          }
        }
      } else {
        console.log("can't detect type ...");
      }
    });
  }
  walk(path);

  documents.createData(DocList, function(err, result) {
    if (err) {
      console.log(err);
      return loadResourcesCb(err, null);
    }
    if (result != '' && result != null && typeof result === 'object') {
      existFile = existFile.concat(result);
    }
    pictures.createData(PicList, function(err, result) {
      if (err) {
        console.log(err);
        return loadResourcesCb(err, null);
      }
      if (result != '' && result != null && typeof result === 'object') {
        existFile = existFile.concat(result);
      }
      music.createData(MusList, function(err, result) {
        if (err) {
          console.log(err);
          return loadResourcesCb(err, null);
        }
        if (result != '' && result != null && typeof result === 'object') {
          existFile = existFile.concat(result);
        }
        video.createData(VidList, function(err, result) {
          if (err) {
            console.log(err);
            return loadResourcesCb(err, null);
          }
          if (result != '' && result != null && typeof result === 'object') {
            existFile = existFile.concat(result);
          }
          other.createData(OtherList, function(err, result) {
            if (err) {
              console.log(err);
              return loadResourcesCb(err, null);
            }
            if (result != '' && result != null && typeof result === 'object') {
              existFile = existFile.concat(result);
            }
            console.log("load resources success!", existFile);
            loadResourcesCb(null, existFile);
          });
        });
      });
    });
  });
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
  commonHandle.getAllCate(getAllCateCb)
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
  if (cate == 'Contact' || cate == 'contact') {
    contacts.getAllContacts(getAllDataByCateCb);
  } else {
    commonHandle.getAllDataByCate(getAllDataByCateCb, cate)
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
  console.log("Request handler 'getAllContacts' was called.");
  contacts.getAllContacts(getAllContactsCb);
}
exports.getAllContacts = getAllContacts;

//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataByUri(rmDataByUriCb, uri) {
  console.log("Request handler 'rmDataByUri' was called.");
  var cate = utils.getCategoryObjectByUri(uri);
  console.log("Request handler 'rmDataByUri' was called. ====" + cate);
  cate.removeByUri(uri, rmDataByUriCb);
}
exports.rmDataByUri = rmDataByUri;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByUri(getDataByUriCb, uri) {
  console.log("Request handler 'getDataByUri' was called.");
  var cate = utils.getCategoryObjectByUri(uri);
  cate.getByUri(uri, getDataByUriCb);
}
exports.getDataByUri = getDataByUri;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByPath(getDataByPathCb, sPath) {
  console.log("Request handler 'getDataByPath' was called.");
  if(sPath.substr(sPath.length-3,sPath.length-1) === '.md'){
    sPath = sPath.substr(0,sPath.length-3);
  }
  var cate = utils.getCategoryByPath(sPath);
  var category = cate.category;
  var filename = cate.filename;
  var postfix = cate.postfix;
  var sCondition = ["postfix='" + postfix + "'", "filename='" + filename + "'"];
  commonDAO.findItems(null, category, sCondition, null, function(err, result) {
    if (err) {
      return getDataByPathCb(err, null);
    } else if (result == '' || result === null) {
      return getDataByPathCb(sPath + ': not found in database ...', null);
    }
    var uri = result[0].URI;
    var cateObject = utils.getCategoryObject(category);
    cateObject.getByUri(uri, getDataByPathCb);
  })
}
exports.getDataByPath = getDataByPath;

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
  var cate = utils.getCategoryObjectByUri(uri);
  cate.openDataByUri(function(result) {
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

/**
 * @method openDataByPath
 *   打开path对应的数据
 *
 * @param1: sPath
 *   string，要打开数据的FullPath
 *
 * @param2: callback
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
 */
function openDataByPath(openDataByPathCb, sPath) {
  console.log("Request handler 'openDataByPath' was called.");
  var category = utils.getCategoryByPath(sPath).category;
  var cate = utils.getCategoryObject(category);
  var sCondition = ["path = '" + sPath + "'"];
  commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
    if (err) {
      console.log(err);
      return openDataByPathCb(err, null);
    } else if (result == [] || result == '') {
      var _err = 'file ' + sPath + ' not found in db!';
      console.log(_err);
      return openDataByPathCb(_err, null);
    }
    var sUri = result[0].URI;
    var sFullName = result[0].filename + result[0].postfix;

    function openDataByUriCb(result) {
      openDataByPathCb(null, result);
    }
    cate.openDataByUri(openDataByUriCb, sUri);
  })
}
exports.openDataByPath = openDataByPath;

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb, item) {
  console.log("Request handler 'updateDataValue' was called.");
  var cate = utils.getCategoryObject(item[0].category);
  cate.updateDataValue(item[0], updateDataValueCb);
}
exports.updateDataValue = updateDataValue;

//API getRecentAccessData:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getRecentAccessData(getRecentAccessDataCb, category, num) {
  console.log("Request handler 'getRecentAccessData' was called.");
  var cate = utils.getCategoryObject(category);
  cate.getRecentAccessData(num, function(err, result) {
    if (err) {
      console.log(err);
      return getRecentAccessDataCb(err, null);
    }
    getRecentAccessDataCb(null, result);
  })
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

//API pasteFile:粘贴一个数据文件
//参数：要添加的数据的json描述和目的路径
//返回类型：成功返回success;失败返回失败原因
function pasteFile(pasteFileCb, filename, category) {
  console.log("Request handler 'pasteFile' was called.");
  var name = path.basename(filename);
  var postfix = path.extname(filename);
  name = path.basename(filename, postfix);
  var desPath = '/tmp/' + name + '_copy' + postfix;
  filename = utils.parsePath(filename);
  var desPathParse = utils.parsePath(desPath);
  console.log("cp " + filename + " " + desPath);
  cp.exec("cp " + filename + " " + desPathParse, function(error, stdout, stderr) {
    if (error !== null) {
      console.log('exec error: ' + error);
      pasteFileCb(false);
    } else {
      if (category == 'document' || category == 'music' || category == 'picture' || category == 'video') {
        var cate = utils.getCategoryObject(category);
        cate.createData([desPath], function(err, result) {
          if (err != null) {
            pasteFileCb(false);
          } else {
            cp.exec("rm " + desPath, function(error, stdout, stderr) {
              pasteFileCb(result);
            });
          }
        });
      }
    }
  });
}
exports.pasteFile = pasteFile;

//API createFile:新建一个文档
//参数：新建文档的类型，以及新建文档的路径
//返回类型：成功返回success;失败返回失败原因
//if catefory is 'contact', then the input 'filename',should be an object that 
//includes all contact info.
function createFile(createFileCb, filename, category) {
  console.log("Request handler 'createFile' was called.");
  if (category === 'contact') {
    if (typeof filename != 'object') {
      var _err = 'bad contact input data ...';
      return callback(_err, null);
    }
    contacts.createData(filename, createFileCb);
  } else {
    var desPath = '/tmp/' + filename;
    cp.exec("touch " + desPath, function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
        creatFileCb(false);
      } else {
        if (category !== 'contact') {
          var cate = utils.getCategoryObject(category);
          cate.createData([desPath], function(err, result) {
            if (err != null) {
              createFileCb(false);
            } else {
              cp.exec("rm " + desPath, function(error, stdout, stderr) {
                createFileCb(result);
              });
            }
          });
        }
      }
    });
  }
}
exports.createFile = createFile;

//API getResourceDataDir:获得resource数据路径
//返回类型：
//返回resource数据路径3
function getResourceDataDir(getResourceDataDirCb) {
  console.log("Request handler 'getResourceDataDir' was called.");
  cp.exec('echo $USER', function(error, stdout, stderr) {
    var usrname = stdout.replace("\n", "");
    var data = '/home/' + usrname + '/.demo-rio/config';
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
 * @method getTagsByUris
 *   get tags with specifc uris
 *
 * @param1 callback
 *    all result in array
 *
 * @param2 oUris
 *    array, an array of uris, uris should in the same category
 *
 */
function getTagsByUris(getTagsByUrisCb, oUris) {
  console.log("Request handler 'getTagsByUris' was called.");
  tagsHandle.getTagsByUris(getTagsByUrisCb, oUris);
}
exports.getTagsByUris = getTagsByUris;

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
 * @method setTagByUriMulti
 *   set tags to multiple files by uri
 *
 * @param1 callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, return specific error info
 *
 *    @param: result,
 *        string, retieve 'success' when success
 *
 * @param2 oTags
 *    array, an array of tags to be set
 *
 * @param3 oUri
 *    array, an array of uri
 *
 */
function setTagByUriMulti(setTagByUriMultiCb, oTags, oUri) {
  console.log("Request handler 'setTagByUriMulti' was called.");
  tagsHandle.setTagByUriMulti(setTagByUriMultiCb, oTags, oUri);
}
exports.setTagByUriMulti = setTagByUriMulti;

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


function getFilesByTagsInCategory(getFilesByTagsInCategoryCb, category, sTag) {
  console.log("Request handler 'getFilesByTagsInCategory' was called.");
  tagsHandle.getFilesByTagsInCategory(getFilesByTagsInCategoryCb, category, sTag);
}
exports.getFilesByTagsInCategory = getFilesByTagsInCategory;

/**
 * @method getCategoryFilesByTags
 *   get all files with specific tags
 *
 * @param1 getFilesCb
 *    all result in array
 *
 * @param2 category
 *    string, a category name.
 *
 * @param3 sTags
 *    string, a tag name.
 *
 */
function getCategoryFilesByTag(getFilesCb, category, sTag) {
  console.log("Request handler 'getCategoryFilesByTag' was called.");
  var cate = utils.getCategoryObject(category);
  cate.getFilesByTag(sTag, getFilesCb);
}
exports.getCategoryFilesByTag = getCategoryFilesByTag;

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


function initDesktop(initDesktopCb) {
  console.log("Request handler 'initDesktop' was called.");
  desktopConf.initDesktop(initDesktopCb);
}
exports.initDesktop = initDesktop;


/** 
 *
 * @Method: getAllDesktopFile
 *    get all .desktop files in local
 *
 * @param: callback
 *    @result
 *    object, an array of all desktop file's name
 *
 *    example:
 *        [
 *         "urxvt.desktop",
 *         "lynx.desktop",
 *         "rodent.desktop",
 *         "icecat.desktop",
 *         "pcmanfm.desktop",
 *         "mozilla-browser.desktop",
 *        ]
 *
 **/
function getAllDesktopFile(getAllDesktopFileCb) {
  console.log("Request handler 'getAllDesktopFile' was called.");
  desktopConf.getAllDesktopFile(getAllDesktopFileCb);
}
exports.getAllDesktopFile = getAllDesktopFile;

/** 
 * @Method: readDesktopConfig
 *    To read desktop config file. Including .conf, .desktop, .list and . cache
 *
 * @param1: sFileName
 *    string, a short name as 'cinnamon.desktop', the postfix is required.
 *
 * @param2: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error info.
 *
 *    @param2: result,
 *        object, result in json, more detail example in specifc function commn-
 *                ent.
 *
 *
 **/
function readDesktopConfig(readDesktopConfigCb, sFileName) {
  console.log("Request handler 'readDesktopConfig' was called.");
  desktopConf.readDesktopConfig(sFileName, readDesktopConfigCb);
}
exports.readDesktopConfig = readDesktopConfig;

/** 
 * @Method: writeDesktopConfig
 *    To modify desktop config file. Including .conf, .desktop, .list and . cac-
 *    he
 *
 * @param1: sFileName
 *    string, a short name as 'cinnamon.desktop', the postfix is required.
 *
 * @param2: oContent
 *    object, content to modify, should a object, more detail example in specifc
 *            function commnent.
 *
 * @param3: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error info.
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 **/
function writeDesktopConfig(writeDesktopConfigCb, sFileName, oContent) {
  console.log("Request handler 'writeDesktopConfig' was called.");
  desktopConf.writeDesktopConfig(sFileName, oContent, writeDesktopConfigCb);
}
exports.writeDesktopConfig = writeDesktopConfig;

/** 
 * @Method: CreateWatcher
 *    To create a wacther on a dir. This wacther would listen on 3 type of even-
 *    t:
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

/** 
 * @Method: linkAppToDesktop
 *    Make a soft link from a desktop file to /desktop or /dock
 *
 * @param2: sApp
 *    string, file name of specific file you need to rename
 *    exmple: var oldName = 'exampleName.desktop'
 *
 * @param3: sType
 *    string, only 2 choices: 'desktop', 'dock'
 *
 * @param1: callback
 *    @result, (_err)
 *
 *    @param: _err,
 *        string, contain error info as below
 *                write error : 'renameDesktopFile : specific error'
 *
 **/
function linkAppToDesktop(linkAppToDesktopCb, sApp, sType) {
  console.log("Request handler 'linkAppToDesktop' was called.");
  desktopConf.linkAppToDesktop(sApp, sType, linkAppToDesktopCb);
}
exports.linkAppToDesktop = linkAppToDesktop;

/** 
 * @Method: unlinkApp
 *    Unlink from a desktop file to /desktop or /dock
 *
 * @param2: sDir
 *    string, a link full path.
 
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain error info as below
 *                write error : 'renameDesktopFile : specific error'
 *
 *    @param: result,
 *        string, retrieve success when success.
 *
 **/
function unlinkApp(unlinkAppCb, sDir) {
  console.log("Request handler 'unlinkApp' was called.");
  desktopConf.unlinkApp(sDir, unlinkAppCb);
}
exports.unlinkApp = unlinkApp;

/** 
 * @Method: moveToDesktopSingle
 *    To drag a file from any where to desktop.
 *
 * @param2: sFilePath
 *    string, a target file path, should be a full path.
 *            example: '/home/xiquan/somedir/somefile.txt'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, the path of target after load into local db.
 *
 **/
function moveToDesktopSingle(moveToDesktopSingleCb, sFilePath) {
  console.log("Request handler 'moveToDesktopSingle' was called.");
  desktopConf.moveToDesktopSingle(sFilePath, moveToDesktopSingleCb);
}
exports.moveToDesktopSingle = moveToDesktopSingle;

/** 
 * @Method: moveToDesktop
 *    To drag multiple files from any where to desktop.
 *
 * @param2: oFilePath
 *    string, array of file path, should be a full path.
 *            example: ['/home/xiquan/somedir/somefile.txt'].
 *
 * @param1: moveToDesktopCb
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, the path of target after load into local db.
 *
 **/
function moveToDesktop(moveToDesktopCb, oFilePath) {
  console.log("Request handler 'moveToDesktop' was called.");
  desktopConf.moveToDesktop(oFilePath, moveToDesktopCb);
}
exports.moveToDesktop = moveToDesktop;

/** 
 * @Method: removeFileFromDB
 *   To remove a file from desktop. This action will remove this file from data
 *   frame also.
 *
 * @param2: sFilePath
 *    string, file path, should be a full path in local.
 *            example: '/home/xiquan/.resource/document/data/somefile.txt'.
 *
 * @param1: removeFileCb
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, retrieve 'success' when success.
 *
 **/
function removeFileFromDB(removeFileFromDBCb, sFilePath) {
  console.log("Request handler 'removeFileFromDB' was called.");
  desktopConf.removeFileFromDB(sFilePath, removeFileFromDBCb);
}
exports.removeFileFromDB = removeFileFromDB;

/** 
 * @Method: removeFileFromDesk
 *   To remove a file from desktop. This action will only remove this file from
 *   desktop.
 *
 * @param2: sFilePath
 *    string, file path, should be a full path in local.
 *            example: '/home/xiquan/.resource/document/data/somefile.txt'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, retrieve 'success' when success.
 *
 **/
function removeFileFromDesk(removeFileFromDeskCb, sFilePath) {
  console.log("Request handler 'removeFileFromDesk' was called.");
  desktopConf.removeFileFromDesk(sFilePath, removeFileFromDeskCb);
}
exports.removeFileFromDesk = removeFileFromDesk;

/** 
 * @Method: getFilesFromDesk
 *   To get all files on desktop.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, array of files on desktop.
 *
 **/
function getFilesFromDesk(getFilesFromDeskCb) {
  console.log("Request handler 'getFilesFromDesk' was called.");
  desktopConf.getFilesFromDesk(getFilesFromDeskCb);
}
exports.getFilesFromDesk = getFilesFromDesk;

/** 
 * @Method: getAllVideo
 *   To get all vidoe files.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, array of file info, as [filePath,inode]
 *
 **/
function getAllVideo(getAllVideoCb) {
  console.log("Request handler 'getAllVideo' was called.");
  desktopConf.getAllVideo(getAllVideoCb);
}
exports.getAllVideo = getAllVideo;

/** 
 * @Method: getAllMusic
 *   To get all music files.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, of all music file info, as {inode:itemPath}
 *
 **/
function getAllMusic(getAllMusicCb) {
  console.log("Request handler 'getAllMusic' was called.");
  desktopConf.getAllMusic(getAllMusicCb);
}
exports.getAllMusic = getAllMusic;

/** 
 * @Method: createFileOnDesk
 *   To create a txt file on desktop.
 *
 * @param1: createFileOnDeskCb
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, file info of the new file, as [filePath, stats.ino].
 *
 *  @param2: sContent
 *        string, content to init.
 *
 **/
function createFileOnDesk(createFileOnDeskCb, sContent) {
  console.log("Request handler 'createFileOnDesk' was called.");
  desktopConf.createFile(sContent, createFileOnDeskCb);
}
exports.createFileOnDesk = createFileOnDesk;

/** 
 * @Method: renameFileOnDesk
 *   To rename a file on desktop. Front end needs to control that the postfix c-
 *   not be change.
 *
 * @param1: renameFileOnDeskCb
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        string, would return 'EXIST' when new file name exists in db; otherwi-
 *                se, return 'success'.
 *
 **/
function renameFileOnDesk(renameFileOnDeskCb, oldName, newName) {
  console.log("Request handler 'renameFileOnDesk' was called.");
  desktopConf.rename(oldName, newName, renameFileOnDeskCb);
}
exports.renameFileOnDesk = renameFileOnDesk;

/** 
 * @Method: getIconPath
 *   To get icon path.
 *
 * @param1: iconName
 *    string, a short icon path.
 *
 * @param2: size
 *    num, size of icon
 *
 * @param3: getIconPathCb
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, contain specific error info.
 *
 *    @param: result,
 *        object, array of icon path.
 *
 **/
function getIconPath(getIconPathCb, iconName, size) {
  console.log("Request handler 'getIconPath' was called.");
  desktopConf.getIconPath(iconName, size, getIconPathCb);
}
exports.getIconPath = getIconPath;

/**
 * @method setRelativeTag
 *   To set a relative tag for a file in order to keep relative relationship of
 *   files on desktop.
 *
 * @param1 setRelativeTagByPathCb
 *    string, the target path of data
 *
 * @param2 sFilePath
 *    string, a full path of a file.
 *
 * @param3 sTags
 *    string, a modified system tag as that could show a relative dir.
 *            as: '$desktop$my_funcy_dir$funcy_as_well$'
 *
 
 *
 */
function setRelativeTagByPath(setRelativeTagByPathCb, sFilePath, sTags) {
  console.log("Request handler 'setRelativeTagByPath' was called.");
  tagsHandle.setRelativeTagByPath(sFilePath, sTags, setRelativeTagByPathCb);
}
exports.setRelativeTagByPath = setRelativeTagByPath;

function pullFromOtherRepoTest() {
  repo.pullFromOtherRepoTest();
}
exports.pullFromOtherRepoTest = pullFromOtherRepoTest;

/** 
 * @Method: getGitLog
 *    To get git log in a specific git repo
 *
 * @param1: getGitLogCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        object, result of git log; the preoperty would be commit id
 *
 *        example:
 *        {
 *            "8fa016846720fe5182113a1880b6623f9e9bec68": {
 *                "commitID": "8fa016846720fe5182113a1880b6623f9e9bec68",
 *                "Author": " “shuanzi” <“daixiquan@gmail.com”>",
 *                "Date": "   Fri Oct 31 13:42:43 2014 +0800",
 *                "content": {
 *                    "relateCommit": "acd5c16b0650dbfbfd20e36a53799a4f9cd40eaf",
 *                    "device": "ace6f9045d75a83682e76288f79dd824",
 *                    "op": "rm",
 *                    "file": [
 *                        "testfile.txt"
 *                    ]
 *                }
 *            },
 *            "dda06b7b042a8256aac6a37843539bd2e7a98821": {
 *                "commitID": "dda06b7b042a8256aac6a37843539bd2e7a98821",
 *                "Author": " “shuanzi” <“daixiquan@gmail.com”>",
 *                "Date": "   Fri Oct 31 11:19:49 2014 +0800",
 *                "content": {
 *                    "relateCommit": "0a14c542fabc48104673c7fbc631bf1e7a3128f6",
 *                    "device": "ace6f9045d75a83682e76288f79dd824",
 *                    "op": "add",
 *                    "file": [
 *                        "/home/xiquan/.resources/document/data/Release_note_0.7.txt",
 *                        "/home/xiquan/.resources/document/data/ReleaseNoteForCDOS1.0RC.txt",
 *                        "/home/xiquan/.resources/document/data/ReleaseNoteForCDOS1.0alpha.txt",
 *                    ]
 *                }
 *            }
 *        }
 *
 *
 * @param2: category
 *    string, a category name, as 'document'
 *
 **/
function getGitLog(getGitLogCb, category) {
  console.log("Request handler 'getGitLog' was called.");
  var cate = utils.getCategoryObject(category);
  cate.getGitLog(getGitLogCb);
}
exports.getGitLog = getGitLog;


/** 
 * @Method: repoReset
 *    To reset git repo to a history commit version. This action would also res-
 *    -des file repo
 *
 * @param1: repoResetCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, retieve 'success' when success
 *
 * @param2: category
 *    string, a category name, as 'document'
 *
 * @param3: commitID
 *    string, a history commit id, as '9a67fd92557d84e2f657122e54c190b83cc6e185'
 *
 **/
function repoReset(repoResetCb, category, commitID) {
  console.log("Request handler 'getGitLog' was called.");
  var cate = utils.getCategoryObject(category);
  cate.repoReset(commitID, function(err, result) {
    if (err) {
      var _err = {
        'data': err
      }
      console.log(_err);
      repoResetCb(_err, null);
    } else {
      commonHandle.updateDB(category, function(err, result) {
        if (err) {
          var _err = {
            'data': err
          }
          console.log(_err, null);
        } else {
          console.log('reset ' + category + ' repo success!');
          repoResetCb(null, result);
        }
      })
    }
  });
}
exports.repoReset = repoReset;

/** 
 * @Method: repoResetFile
 *    To reset a single file to a history commit version. This action would also
 *    reset des file repo
 *
 * @param1: repoResetCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, retieve 'success' when success
 *
 * @param2: category
 *    string, a category name, as 'document'
 *
 * @param3: commitID
 *    string, a history commit id, as '9a67fd92557d84e2f657122e54c190b83cc6e185'
 *
 * @param4: file
 *    string, a file full path, as '/home/xiquan/document/test.txt'
 *
 **/
function repoResetFile(repoResetFileCb, category, commitID, file) {
  console.log("Request handler 'getGitLog' was called.");
  var cate = utils.getCategoryObject(category);
  cate.repoResetFile(commitID, function(err, result) {
    if (err) {
      var _err = {
        'data': err
      }
      console.log(_err);
      repoResetFileCb(_err, null);
    } else {
      commonHandle.updateDB(category, function(err, result) {
        if (err) {
          var _err = {
            'data': err
          }
          console.log(_err, null);
        } else {
          console.log('reset ' + category + ' repo success!');
          repoResetFileCb(null, result);
        }
      })
    }
  });
}
exports.repoResetFile = repoResetFile;


/** 
 * @Method: renameDataByUri
 *    rename a file
 *
 * @param2: category
 *    string, a category name, as 'document'
 *
 * @param3: sUri
 *    string, a specific uri, as '9a67fd92557d84e2f657122e54c190b83cc6e#document'
 *
 * @param4: sNewName
 *    string, a file name, as 'test_rename.txt'
 *
 * @param1: renameDataByUriCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 
 *        string, retieve 'success' when success
 *
 **/
function renameDataByUri(category, sUri, sNewName, renameDataByUriCb) {
  console.log("Request handler 'renameDataByUri' was called.");
  var cate = utils.getCategoryObject(category);
  cate.rename(sUri, sNewName, renameDataByUriCb);
}
exports.renameDataByUri = renameDataByUri;

/** 
 * @Method: deviceInfo
 *    To get device info.
 *
 * @param: renameDataByUriCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *
 *        object, device info
 *
 *        example:
 *         {
 *          "resources_path":"/home/xiquan/.resources",
 *          "server_ip":"192.168.161.65",
 *          "server_name":"xiquan-B75MU3B",
 *          "local_account":"xiquan",
 *          "local_id":"26578"
 *         }
 *
 **/
function deviceInfo(deviceInfoCb) {
  console.log("Request handler 'renameDataByUri' was called.");
  devices.deviceInfo(deviceInfoCb);
}
exports.deviceInfo = deviceInfo;


/** 
 * @Method: getMusicPicData
 *    To get picture (like album's cover) of a music file.
 *
 * @param: getMusicPicDataCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, data is returned in binary encoded with base64. You could acc-
 *                ess the picture like: 
 *                var img = document.getElementById("test_img");
 *                img.src = 'data:image/jpeg;base64,' + result;
 *
 *                You should notice that if the target file contains no pciture,
 *                then the result would be null.
 *
 *  @param2: filePath
 *    string, a specific music file path.To access it, you may use a DataView or
 *            typed array such as Uint8Array.
 *
 *
 **/
function getMusicPicData(getMusicPicDataCb, filePath) {
  console.log("Request handler 'getMusicPicData' was called.");
  music.getMusicPicData(filePath, getMusicPicDataCb);
}
exports.getMusicPicData = getMusicPicData;

/** 
 * @Method: getVideoThumbnail
 *    To get thumbnail of a video.
 *
 * @param: getMusicPicDataCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, data is returned in binary encoded with base64. You could acc-
 *                ess the picture like: 
 *                var img = document.getElementById("test_img");
 *                img.src = 'data:image/jpeg;base64,' + result;
 *
 *
 *  @param2: sPath
 *    string, a specific music file full path.
 *
 *
 **/
function getVideoThumbnail(getVideoThumbnailCb, sPath) {
  console.log("Request handler 'getVideoThumbnail' was called.");
  video.readVideoThumbnail(sPath, getVideoThumbnailCb);
}
exports.getVideoThumbnail = getVideoThumbnail;

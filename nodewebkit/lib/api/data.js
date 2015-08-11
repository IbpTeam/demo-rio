var utils = require("../../backend/utils");
var desktopConf = require("../../backend/data/desktop");
var contacts = require("../../backend/data/contacts");
var devices = require("../../backend/data/device");
var music = require("../../backend/data/music");
var video = require("../../backend/data/video");
var tagsHandle = require("../../backend/commonHandle/tagsHandle");
var commonHandle = require("../../backend/commonHandle/commonHandle");
var typeHandle = require("../../backend/commonHandle/typeHandle");
var fs = require('fs');
var config = require('systemconfig');
var cp = require('child_process');
var path = require('path');
var Q = require('q');

function getLocalData(getLocalDataCb){
  var localJson={};
  localJson['account']=config.ACCOUNT;
  localJson['UID']=config.uniqueID;
  localJson['IP']=config.SERVERIP;
  getLocalDataCb(localJson);
}
exports.getLocalData = getLocalData;
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
  typeHandle.initTypeDef()
  .then(function(){
    return commonHandle.createData([sFilePath])
    .then(function() {
      loadFileCb();
    })
    .fail(function(err) {
      loadFileCb(err);
    })
  })

}
exports.loadFile = loadFile;

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
  var _postfix_list = null;
  var _file_list_mix = [];

  function walk(path) {
    var dirList = fs.readdirSync(path);
    dirList.forEach(function(item) {
      if (fs.lstatSync(path + '/' + item).isSymbolicLink()) {
        console.log('SymbolicLink: ' + path + '/' + item);
      } else if (fs.statSync(path + '/' + item).isDirectory()) {
        if (item != '.git' && item != '.des' && item != 'contacts' && item[0] != '.') {
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
      } else if (fs.statSync(path + '/' + item).isFile() && item[0] != '.') {
        var sPosIndex = (item).lastIndexOf(".");
        var sPos = item.slice(sPosIndex + 1, item.length);
        //push it into _file_list_mix 
        _file_list_mix.push(path + '/' + item);
      } else {
        console.log("can't detect type ...");
      }
    });
  }
  return typeHandle.initTypeDef()
    .then(typeHandle.getPostfixList)
    .then(function(postfix_list_) {
      //resign postfix list to _postfix_list
      _postfix_list = postfix_list_;
      //walk dir and distribute file list by postfix
      walk(path);
      //do createData()
    })
    .then(function() {
      return commonHandle.createData(_file_list_mix);
    })
    .then(function(result) {
      loadResourcesCb(null, result);
    })
    .fail(function(err) {
      loadResourcesCb(err);
    })
    .done();
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
  contacts.initContacts(path)
    .then(loadContactCb)
    .fail(loadContactCb)
    .done();
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
    contacts.getAllContacts()
      .then(function(result) {
        getAllDataByCateCb(null, result);
      })
      .fail(function(err) {
        getAllDataByCateCb(err);
      })
      .done();
  } else {
    commonHandle.getAllDataByCate(cate)
      .then(function(result) {
        getAllDataByCateCb(null, result);
      })
      .fail(function(err) {
        getAllDataByCateCb(err);
      })
      .done();
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
  contacts.getAllContacts()
    .then(function(result) {
      getAllContactsCb(null, result);
    })
    .fail(function(err) {
      getAllContactsCb(err);
    })
    .done();
}
exports.getAllContacts = getAllContacts;

//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataByUri(rmDataByUriCb, uri) {
  console.log("Request handler 'rmDataByUri' was called.");
  var _options = {
    _type: "base",
    _property: "URI",
    _value: uri
  }
  commonHandle.removeItemByProperty(_options)
    .then(function(result) {
      rmDataByUriCb(null, result);
    })
    .fail(function(err) {
      rmDataByUriCb(err);
    })
    .done();
}
exports.rmDataByUri = rmDataByUri;

//API getDataByUri:通过Uri查看数据所有信息
//返回具体数据类型对象
function getDataByUri(getDataByUriCb, uri) {
  console.log("Request handler 'getDataByUri' was called.");
  var _options = {
    _type: "base",
    _property: "URI",
    _value: uri
  }
  commonHandle.getItemByProperty(_options)
    .then(function(result) {
      getDataByUriCb(null, result);
    })
    .fail(function(err) {
      getDataByUriCb(err);
    })
    .done();
}
exports.getDataByUri = getDataByUri;

//API getDataByPath:通过path查看数据所有信息
//返回具体数据类型对象
function getDataByPath(getDataByPathCb, sPath) {
  console.log("Request handler 'getDataByPath' was called.");
  var _options = {
    _type: "base",
    _property: "path",
    _value: sPath
  }
  commonHandle.getItemByProperty(_options)
    .then(function(result) {
      getDataByPathCb(null, result);
    })
    .fail(function(err) {
      getDataByPathCb(err);
    })
    .done();
}
exports.getDataByPath = getDataByPath;


/**
 * @method openDataByUri
 *   打开URI对应的数据
 *
 * @param1 getDataByUriCb
 *   回调函数
 *   @err
 *    return error message
 *
 *   @result
 *     array: 显示数据或结果
 *
 * @param2 options
 *   object, including specific infomation for searhcing data
 *
 *    example:
 *    var options = {
 *                              _type: "base",  
 *                              _property: "URI",
 *                              _value: "ajsdawjdjiajwdj"
 *                              }
 *
 */
function getDataByProperty(getDataByUriCb, options) {
  console.log("Request handler 'getDataByUri' was called.");
  commonHandle.getItemByProperty(options)
    .then(function(items) {
      getDataByUriCb(null, items);
    })
    .fail(function(err) {
      getDataByUriCb(err);
    })
    .done();

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
  var _options = {
    _type: "base",
    _property: "URI",
    _value: uri
  }
  var dataMaker = function(result) {
    return typeHandle.getTypeMethod(result[0].category)
      .then(function(_method) {
        var _source = _method.getOpenInfo(result[0]);
        if (_source.format === "html5ppt") {
          console.log("open html5ppt:" + _source.content);
          window.open(_source.content);
          _source.content = "成功打开文件" + _source.content;
          openDataByUriCb(null, _source);
        } else {
          openDataByUriCb(null, _source);
        }
      })
  }
  return commonHandle.openData(uri)
    .then(function() {
      return commonHandle.getItemByProperty(_options)
    })
    .then(function(result_) {
      return dataMaker(result_);
    })
    .fail(function(err) {
      openDataByUriCb(err);
    })
    .done();
}
exports.openDataByUri = openDataByUri;


//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb, item) {
  console.log("Request handler 'updateDataValue' was called.");
  commonHandle.updatePropertyValue(item)
    .then(function(result) {
      updateDataValueCb(null, result);
    })
    .fail(function(err) {
      updateDataValueCb(err);
    })
    .done();
}
exports.updateDataValue = updateDataValue;

//API getRecentAccessData:获得最近访问数据的信息
//返回类型：
//返回具体数据类型对象数组
function getRecentAccessData(getRecentAccessDataCb, category, num) {
  console.log("Request handler 'getRecentAccessData' was called.");
  commonHandle.getRecentAccessData(category, num)
    .then(function(result) {
      getRecentAccessDataCb(null, result);
    })
    .fail(function(err) {
      console.log(err);
      getRecentAccessDataCb(err);
    })
    .done();
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


function exportData(exportDataCb, sExportPath){
   console.log("Request handler 'exportData' was called.");
   commonHandle.exportData(sExportPath)
   .then(function() {
      exportDataCb();
    })
    .fail(function(err) {
      exportDataCb(err);
    })
    .done();
}
exports.exportData = exportData;

function importData(importDataCb, sTarFilePath){
   console.log("Request handler 'importData' was called.");
   commonHandle.importData(sTarFilePath)
    .then(function() {
      importDataCb();
    })
    .fail(function(err) {
      importDataCb(err);
    })
    .done();
}
exports.importData = importData;


//API createFile:新建一个文档
//参数：新建文档的类型，以及新建文档的路径
//返回类型：成功返回success;失败返回失败原因
//if catefory is 'contact', then the input 'filename',should be an object that 
//includes all contact info.
function createFile(createFileCb, input, category) {
  console.log("Request handler 'createFile' was called.");
  if (category === 'contact') {
    if (input.length == 0 || input === null) {
      var _err = 'bad contact input data ...';
      config.log(_err);
      return callback(_err);
    } else {
      return contacts.ContactInfo(input)
        .then(function() {
          return createFileCb();
        })
        .fail(function(err) {
          return createFileCb(err);
        })
        .done();
      //.notiefy
    }
  } else {
    //input = filename
    var desPath = '/tmp/' + input;
    cp.exec("touch " + desPath, function(error, stdout, stderr) {
      if (error !== null) {
        console.log('exec error: ' + error);
        creatFileCb(false);
      } else {
        if (category !== 'contact') {
          commonHandle.createData([desPath])
            .then(function() {
              cp.exec("rm " + desPath, function(error, stdout, stderr) {
                createFileCb();
              });
            })
            .fail(function() {
              createFileCb(err);
            })
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
    var data = config.USERCONFIGPATH;
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
  tagsHandle.getAllTagsByCategory(category)
    .then(function(results) {
      console.log(results);
      getAllTagsByCategoryCb(null, results);
    })
    .fail(function(err) {
      getAllTagsByCategoryCb(err);
    })
    .done();
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
  console.log("Request handler 'getTagsByUri' was called.");
  tagsHandle.getTagsByUri(sUri)
    .then(function(results) {
      getTagsByUriCb(null, results);
    })
    .fail(function(err) {
      getTagsByUriCb(err);
    })
    .done();
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
  Q.all(oUris.map(tagsHandle.getTagsByUri))
    .then(function(result_) {
      var _tags =[];
      for (var i = 0, l = result_.length; i < l; i++) {
        for (var j = 0, m = result_[i].length; j < m; j++) {
          var isInTags=false;
          for (var k= 0, n = _tags.length; k < n; k++) {
            if(result_[i][j][0] == _tags[k][0]){
              isInTags=true;
              break;
            }
          }
          if(isInTags==false){
            _tags.push(result_[i][j]);
          }
        }
      }
      for (var i = 0, l = _tags.length; i < l; i++) {
        
        if(_tags[i][1]>oUris.length){
          _tags[i][1]=oUris.length;
        }
      }
      getTagsByUrisCb(null, _tags);
    })
    .fail(getTagsByUrisCb)
    .done();
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
 * @param3 : sUri, string
 *
 *    sUri example:
 *    var sUri = 'some_uri_1'
 *
 *
 */
function setTagByUri(setTagByUriCb, oTags, sUri) {
  console.log("Request handler 'setTagByUri' was called.");
  tagsHandle.setTagByUri(oTags, sUri)
    .then(function(results) {
      setTagByUriCb(null, results);
    })
    .fail(function(err) {
      setTagByUriCb(err);
    })
    .done();
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
  tagsHandle.getFilesByTags(oTags)
    .then(function(results) {
      getFilesByTagsCb(null, results);
    })
    .fail(function(err) {
      getFilesByTagsCb(err);
    })
    .done();
}
exports.getFilesByTags = getFilesByTags;

/**
 * @method getFilesByTagsInCategory
 *   get all files with specific tags
 *
 * @param1 getFilesByTagsInCategoryCb
 *    all result in array
 *
 * @param2 category
 *    string, a category name.
 *
 * @param3 oTags
 *    string || object, a tag name or array of names.
 *
 */
function getFilesByTagsInCategory(getFilesByTagsInCategoryCb, category, oTags) {
  console.log("Request handler 'getFilesByTagsInCategory' was called.");
  tagsHandle.getFilesByTagsInCategory(category, oTags)
    .then(function(results) {
      getFilesByTagsInCategoryCb(null, results);
    })
    .fail(function(err) {
      getFilesByTagsInCategoryCb(err);
    })
    .done();
}
exports.getFilesByTagsInCategory = getFilesByTagsInCategory;

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
function rmTagAll(rmTagAllCb, oTags, category) {
  console.log("Request handler 'rmTagAll' was called.");
  tagsHandle.rmTagAll(oTags, category)
    .then(function(results) {
      rmTagAllCb(null, results);
    })
    .fail(function(err) {
      rmTagAllCb(err);
    })
    .done();
}
exports.rmTagAll = rmTagAll;

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
  tagsHandle.rmTagsByUri(sTag, oUri)
    .then(function(results) {
      rmTagsByUriCb(null, results);
    })
    .fail(function(err) {
      rmTagsByUriCb(err);
    })
    .done();
}
exports.rmTagsByUri = rmTagsByUri;

function initDesktop(initDesktopCb) {
  console.log("Request handler 'initDesktop' was called.");
  desktopConf.initDesktop()
    .then(function() {
      initDesktopCb();
    })
    .fail(function(err) {
      initDesktopCb(err);
    })
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
  desktopConf.getAllDesktopFile()
    .then(function(result_) {
      getAllDesktopFileCb(null, result_);
    })
    .fail(function(err) {
      getAllDesktopFileCb(err);
    });
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
  desktopConf.readDesktopConfig(sFileName)
    .then(function(result) {
      readDesktopConfigCb(null, result);
    })
    .fail(function(err) {
      readDesktopConfigCb(err);
    })
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
  desktopConf.writeDesktopConfig(sFileName, oContent)
    .then(function(){
      writeDesktopConfigCb();
    })
    .fail(function(err){
      writeDesktopConfigCb(err);
    })
}
exports.writeDesktopConfig = writeDesktopConfig;

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
  desktopConf.renameDesktopFile(oldName, newName)
    .then(function() {
      renameDesktopFileCb();
    })
    .fail(function(err) {
      renameDesktopFileCb(err);
    })
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
  desktopConf.linkAppToDesktop(sApp, sType)
    .then(function() {
      linkAppToDesktopCb();
    })
    .fail(function(err) {
      linkAppToDesktopCb(err);
    })
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
  desktopConf.unlinkApp(sDir)
    .then(function() {
      unlinkAppCb();
    })
    .fail(function(err) {
      unlinkAppCb(err);
    })
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
  desktopConf.moveToDesktopSingle(sFilePath)
    .then(function(result) {
      moveToDesktopSingleCb(null, result);
    })
    .fail(function(err) {
      moveToDesktopSingleCb(err);
    });
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
  desktopConf.removeFileFromDB(sFilePath)
    .then(function() {
      removeFileFromDBCb();
    })
    .fail(function(err) {
      removeFileFromDBCb(err);
    });
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
  desktopConf.removeFileFromDesk(sFilePath)
    .then(function() {
      removeFileFromDeskCb();
    })
    .fail(function(err) {
      removeFileFromDeskCb(err);
    });
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
  desktopConf.getFilesFromDesk()
    .then(function(result_) {
      getFilesFromDeskCb(null, result_);
    })
    .fail(function(err) {
      getFilesFromDeskCb(err);
    });
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
  desktopConf.getAllVideo()
    .then(function(result_) {
      getAllVideoCb(null, result_);
    })
    .fail(function(err) {
      getAllVideoCb(err);
    });
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
  desktopConf.getAllMusic()
    .then(function(result_) {
      getAllMusicCb(null, result_);
    })
    .fail(function(err) {
      getAllMusicCb(err);
    });
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
  desktopConf.createFile(sContent)
    .then(function() {
      createFileOnDeskCb();
    })
    .fail(function(err) {
      createFileOnDeskCb(err);
    });
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
  desktopConf.rename(oldName, newName)
    .then(function() {
      renameFileOnDeskCb();
    })
    .fail(function(err) {
      renameFileOnDeskCb(err);
    });
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
  tagsHandle.setRelativeTagByPath(sFilePath, sTags)
    .then(function(result){
      setRelativeTagByPathCb(null, result);
    })
    .fail(function(err){
      setRelativeTagByPathCb(err);
    });
}
exports.setRelativeTagByPath = setRelativeTagByPath;


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
  var music = require("../../backend/data/music");
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
  var video = require("../../backend/data/video");
  video.readVideoThumbnail(sPath, getVideoThumbnailCb);
}
exports.getVideoThumbnail = getVideoThumbnail;


/** 
 * @Method: test_rdfHandle
 *    just for testing rdfHandle
 *
 **/
function test_rdfHandle(callback) {
  var rdfHandle = require("../../backend/commonHandle/rdfHandle");
  callback(rdfHandle);
}
exports.test_rdfHandle = test_rdfHandle;


/** 
 * @Method: test_baseinfo
 *    just for testing api
 *
 **/
function test_baseinfo(callback) {
  var element = {
    HOMEFOLDER: path.join(config.HOME),
    RESOURCEFOLDER: path.join(config.HOME, "resources")
  }
  callback(element);
}
exports.test_baseinfo = test_baseinfo;


function renameDataByUri(sUri, sNewName, renameDataByUriCb) {
  console.log("Request handler 'renameDataByUri' was called.");
  commonHandle.renameDataByUri(sUri, sNewName)
    .then(function(result) {
      renameDataByUriCb(null, result);
    })
    .fail(function(err) {
      renameDataByUriCb(err);
    })
    .done();
}
exports.renameDataByUri = renameDataByUri;


/** 
 * @Method: test_typeHandle
 *    just for testing typeHandle
 *
 **/
function test_typeHandle(callback) {
  var typeHandle = require("../../backend/commonHandle/typeHandle");
  callback(typeHandle);
}
exports.test_typeHandle = test_typeHandle;

/** 
 * @Method: test_typeHandle
 *    just for testing typeHandle
 *
 **/
function test_desktop(callback) {
  var desktop = require("../../backend/data/desktop");
  callback(desktop);
}
exports.test_desktop = test_desktop;

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
function getTmpPath(getTmpPathCb) {
  console.log("Request handler 'getTmpPath' was called.");
  if(config.TMPPATH!=null){
      getTmpPathCb(null,config.TMPPATH);
    }
    else{
      getTmpPathCb(new Error("TMPPATH empty"),null);
    }
}
exports.getTmpPath = getTmpPath;


function addPreTag(addPreTagCb, tag, category) {
  console.log("Request handler 'addPreTag' was called.");
  tagsHandle.addPreTag(tag, category)
    .then(function() {
      addPreTagCb();
    })
    .fail(function(err) {
      addPreTagCb(err);
    })
    .done();
}
exports.addPreTag = addPreTag;

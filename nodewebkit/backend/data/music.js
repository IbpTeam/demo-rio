/**
 * @Copyright:
 *
 * @Description: Music Handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.10.28
 *
 * @version:0.3.0
 **/

var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var commonDAO = require("../commonHandle/CommonDAO");
var util = require('util');
var utils = require('../utils');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');



//@const
var CATEGORY_NAME = "music";
var REAL_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME, 'data');



function getTagsFromString(str) {
  var tags={
    format:null,
    bit_rate:null,
    frequency:null,
    track:null,
    TDRC:null,
    APIC:null,
    TALB:null,
    TPE1:null,
    TIT2:null,
    TXXX:null,
    COMM:null
  };
  var line1 = str.split("\n");
  for (var index1 in line1) {
    if (line1[index1] == "") {
      line1.pop(line1[index1]);
    }
    else{
      if(line1[index1].lastIndexOf("- ")>=0){
        var line2 = str.split(",");
        for (var index2 in line2) {
          if(line2[index2].lastIndexOf("MPEG")>=0){
            tags.format=(line2[index2].substring(line2[index2].lastIndexOf("MPEG"),line2[index2].length)).replace(/(^\s*)|(\s*$)/g,'');
          }
          else if(line2[index2].lastIndexOf("bps")>=0){
            tags.bit_rate=(line2[index2].substring(0,line2[index2].lastIndexOf("bps"))).replace(/(^\s*)|(\s*$)/g,'');
          }
          else if(line2[index2].lastIndexOf("Hz")>=0){
            tags.frequency=(line2[index2].substring(0,line2[index2].lastIndexOf("Hz"))).replace(/(^\s*)|(\s*$)/g,'');
          }
          else if(line2[index2].lastIndexOf("seconds")>=0){
            tags.track=(line2[index2].substring(0,line2[index2].lastIndexOf("seconds"))).replace(/(^\s*)|(\s*$)/g,'');
          }
        }
      }
      else if(line1[index1].indexOf("TDRC=")>=0){
        tags.TDRC=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
      else if(line1[index1].indexOf("APIC=")>=0){
        tags.APIC=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
      else if(line1[index1].indexOf("TALB=")>=0){
        tags.TALB=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
      else if(line1[index1].indexOf("TPE1=")>=0){
        tags.TPE1=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
      else if(line1[index1].indexOf("TIT2=")>=0){
        tags.TIT2=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
      else if(line1[index1].indexOf("TXXX=")>=0){
        tags.TXXX=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
      else if(line1[index1].indexOf("COMM=")>=0){
        tags.COMM=(line1[index1].substring(line1[index1].indexOf("=")+1,line1[index1].length)).replace(/(^\s*)|(\s*$)/g,'');
      }
    }
  }
  return tags;
}

function readId3FromMp3(path, callback) {
  console.log(path);
  var cp = require('child_process');
  var cmd = 'mutagen-inspect ' + '"'+path+'"';
  console.log(cmd);
  cp.exec(cmd, function(error, stdout, stderr) {
    if(error){
      console.log(error);
      callback(error);
    }
    else{
      //console.log(stdout);
      callback(error,getTagsFromString(stdout));
    }
  });
}
exports.readId3FromMp3 = readId3FromMp3;

/**
 * @method createData
 *    To create des file, dataBase resocrd and git commit for all data input. T-
 *    -his is only for array or string data input. The proccess would be copy f-
 *    -rst, then create the des file, after all des file done, then write into
 *    data base, final step is commit git.
 *
 * @param1: items
 *    object, an array or string of data full path.
 *    examplt:
 *    var items = '/home/xiquan/resource/documents/test.txt', or
 *    var items = ['/home/xiquan/resource/documents/test1.txt',
 *                 '/home/xiquan/resource/documents/test2.txt'
 *                 '/home/xiquan/resource/documents/test3.txt'].
 *
 * @param2: callback
 *    @result
 *    string, retrieve 'success' when success
 *
 */
function createData(items, callback) {
  if (items == [] || items == "") {
    return callback(null, 'no Music');
  }
  if (typeof items == 'string') {
    fs.stat(items, function(err, stat) {
      if (err) {
        console.log(err);
        return;
      }
      var mtime = stat.mtime;
      var ctime = stat.ctime;
      var size = stat.size;
      var cate = utils.getCategoryByPath(items);
      var category = CATEGORY_NAME;
      var itemFilename = cate.filename;
      var itemPostfix = cate.postfix;
      var someTags = tagsHandle.getTagsByPath(items);
      var resourcesPath = config.RESOURCEPATH + '/' + category;
      uniqueID.getFileUid(function(uri) {
        readId3FromMp3(items,function(err,tags){
          console.log("read mp3 "+items);
          console.log(err);
          console.log(tags);
          var itemInfo = {
            id: null,
            URI: uri + "#" + category,
            category: category,
            others: someTags.join(","),
            filename: itemFilename,
            postfix: itemPostfix,
            size: size,
            path: items,
            format:tags.format,
            bit_rate:tags.bit_rate,
            frequency:tags.frequency,
            track:tags.track,
            TDRC:tags.TDRC,
            APIC:tags.APIC,
            TALB:tags.TALB,
            TPE1:tags.TPE1,
            TIT2:tags.TIT2,
            TXXX:tags.TXXX,
            COMM:tags.COMM,
            createTime: ctime,
            lastModifyTime: mtime,
            lastAccessTime: ctime,
            createDev: config.uniqueID,
            lastModifyDev: config.uniqueID,
            lastAccessDev: config.uniqueID
          };
          console.log(itemInfo);
          commonHandle.createData(itemInfo, function(result, resultFile) {
            if (result === 'success') {
              callback(null, resultFile);
            } 
            else {
              var _err = 'createData: commonHandle createData error!';
              console.log('createData error!');
              callback(_err, null);
            }
          });
        });
      });
    });
  } else if (typeof items == 'object') {
    if (!items.length) {
      console.log('create data input error!');
      var _err = 'createData: items should be an array!';
      callback(_err, null);
    } else {
      var itemInfoAll = [];
      var count = 0;
      var lens = items.length;
      for (var i = 0; i < lens; i++) {
        var item = items[i];
        (function(_item) {
          fs.stat(_item, function(err, stat) {
            if (err) {
              console.log(err);
              var _err = err;
              callback(_err, null);
            } else {
              var mtime = stat.mtime;
              var ctime = stat.ctime;
              var size = stat.size;
              var cate = utils.getCategoryByPath(_item);
              var category = CATEGORY_NAME;
              var itemFilename = cate.filename;
              var itemPostfix = cate.postfix;
              var someTags = tagsHandle.getTagsByPath(_item);
              var resourcesPath = config.RESOURCEPATH + '/' + category;
              uniqueID.getFileUid(function(uri) {
                readId3FromMp3(_item,function(err,tags){
                  console.log("read mp3 "+_item);
                  console.log(err);
                  console.log(tags);
                  var itemInfo = {
                    id: null,
                    URI: uri + "#" + category,
                    category: category,
                    others: someTags.join(","),
                    filename: itemFilename,
                    postfix: itemPostfix,
                    size: size,
                    path: _item,
                    format:tags.format,
                    bit_rate:tags.bit_rate,
                    frequency:tags.frequency,
                    track:tags.track,
                    TDRC:tags.TDRC,
                    APIC:tags.APIC,
                    TALB:tags.TALB,
                    TPE1:tags.TPE1,
                    TIT2:tags.TIT2,
                    TXXX:tags.TXXX,
                    COMM:tags.COMM,
                    createTime: ctime,
                    lastModifyTime: mtime,
                    lastAccessTime: ctime,
                    createDev: config.uniqueID,
                    lastModifyDev: config.uniqueID,
                    lastAccessDev: config.uniqueID
                  };
                  console.log(itemInfo);
                  itemInfoAll.push(itemInfo);
                  var isEnd = (count === lens - 1);
                  if (isEnd) {
                    commonHandle.createDataAll(itemInfoAll, function(err, result) {
                      if (err) {
                        var _err = 'createData: commonHandle createData all error!';
                        console.log('createData error!');
                        return callback(_err, null);
                      }
                      callback(null, result);
                    });
                  }
                  count++;
                });
              });
            }
          });
        })(item)
      }
    }
  } 
  else {
    console.log('input error: items is undefined!');
    var _err = 'createData: input error';
    callback(_err, null);
  }
}
exports.createData = createData;


/**
 * @method removeByUri
 *    Remove Music by uri.
 * @param uri
 *    The Music's URI.
 * @param callback
 *    Callback

function removeByUri(uri, callback) {
  getByUri(uri, function(items) {
    //Remove real file
    fs.unlink(items[0].path, function(err) {
      if (err) {
        console.log(err);
        callback("error");
      } else {
        //Remove Des file
        //Delete in db
        commonHandle.removeFile(CATEGORY_NAME, items[0], callback);
      }
    });
  });
}
exports.removeByUri = removeByUri;
 */
function removeByUri(uri, callback) {
  getByUri(uri, function(items) {
    commonHandle.removeFile(CATEGORY_NAME, items[0], callback);
  });
}
exports.removeByUri = removeByUri;

/**
 * @method confirmRm
 *    confirmRm.
 * @param uri
 *    The music's URI.
 * @param callback
 *    Callback
 */
function confirmRm(uri, callback) {
  getByUri(uri, function(items) {
    //Remove real file
    fs.unlink(items[0].path, function(err) {
      if (err) {
        console.log(err);
        callback("error");
      } else {
        //Remove Des file
        //Delete in db
        //Git commit
        commonHandle.cfremoveFile(CATEGORY_NAME, items[0], callback);
      }
    });
  });
}
exports.confirmRm = confirmRm;

/**
 * @method recoverByUri
 *   recover Music by uri.
 * @param uri
 *    The Music's URI.
 * @param callback
 *    Callback
*/
function recoverByUri(uri, callback){
  getByUri(uri, function(items) {
    commonHandle.recoverFile(CATEGORY_NAME, items[0], callback);
  });
}
exports.recoverByUri = recoverByUri;

/**
 * @method getByUri
 *    Get music info in db.
 * @param uri
 *    The Music's URI.
 * @param callback
 *    Callback
 */
function getByUri(uri, callback) {
  commonHandle.getItemByUri(CATEGORY_NAME, uri, callback);
}
exports.getByUri = getByUri;

//API openDataByUri:通过Uri获取数据资源地址
//返回类型：
//result{
//  openmethod;//三个值：'direct'表示直接通过http访问;'remote'表示通过VNC远程访问;'local'表示直接在本地打开
//  content;//如果openmethod是'direct'或者'local'，则表示路径; 如果openmethod是'remote'，则表示端口号
//}
function openDataByUri(openDataByUriCb, uri) {
  function getItemByUriCb(items) {
    var item = items[0];
    if (item == null) {
      config.riolog("read data : " + item);
      openDataByUriCb('undefined');
    } else {
      config.riolog("read data : " + item.path);
      var source;
      if (item.postfix == null) {
        source = {
          openmethod: 'alert',
          content: item.path + ' can not be recognized.'
        };
      } else {
        switch (item.postfix) {
          case 'ogg':
          case 'OGG':
            source = {
              openmethod: 'html',
              format: 'audio',
              title: '文件浏览',
              content: item.path
            }
            break;
          case 'mp3':
          case 'MP3':
            source = {
              openmethod: 'html',
              format: 'audio',
              title: '文件浏览',
              content: item.path
            }
            break;
          case 'none':
            source = {
              openmethod: 'alert',
              content: item.path + ' can not be recognized.'
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

            source = {
              openmethod: 'html',
              format: 'txt',
              title: '文件浏览',
              content: "成功打开文件" + item.path
            }

            var exec = require('child_process').exec;
            var s_command;
            var supportedKeySent = false;
            var s_windowname; //表示打开文件的窗口名称，由于无法直接获得，因此一般设置成文件名，既可以查找到对应的窗口
            switch (item.postfix) {
              default:
                s_command = "xdg-open \"" + item.path + "\"";
                break;
            }
            var child = exec(s_command, function(error, stdout, stderr) {});
            if (supportedKeySent === true) {
              source.windowname = s_windowname;
            }
            break;
        }
      }
      var currentTime = (new Date());
      var updateItem = item;
      updateItem.lastAccessTime = currentTime;
      updateItem.lastAccessDev = config.uniqueID;
      util.log("item.path=" + item.path);
      updateItem.category = CATEGORY_NAME;
      var updateItems = new Array();
      var condition = [];
      condition.push("URI='" + item.URI + "'");
      updateItems.conditions = condition;
      updateItems.push(updateItem);
      readId3FromMp3(item.path,function(err,tags){
        console.log("read mp3 "+item);
        console.log(err);
        console.log(tags);
      });
      commonDAO.updateItems(updateItems, function(result) {
        console.log(result);
        openDataByUriCb(source);
      });
    }
  }
  getByUri(uri, getItemByUriCb);

}
exports.openDataByUri = openDataByUri;

function getRecentAccessData(num, getRecentAccessDataCb) {
  console.log('getRecentAccessData in ' + CATEGORY_NAME + 'was called!')
  commonHandle.getRecentAccessData(CATEGORY_NAME, getRecentAccessDataCb, num);
}
exports.getRecentAccessData = getRecentAccessData;

function rename(sUri, sNewName, callback) {
  commonHandle.renameDataByUri(CATEGORY_NAME, sUri, sNewName, function(err, result) {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  })
}
exports.rename = rename;

/** 
 * @Method: getFilesByTag
 *    To get files with specific tag.
 *
 * @param2: sTag
 *    string, a tag name, as 'document'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, file info object in array
 *
 **/
function getFilesByTag(sTag, callback) {
  function getFilesCb(err, result) {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  }
  tagsHandle.getFilesByTagsInCategory(getFilesCb, CATEGORY_NAME, sTag);
}
exports.getFilesByTag = getFilesByTag;

function getMusicPicData(filePath, callback) {
  var ID3 = require('id3v2-parser');
  var stream = require('fs').createReadStream(filePath);
  var parser = stream.pipe(new ID3());
  var picData = false;

  function backupIcon(callback_) {
    var option = {
      encoding: 'base64'
    }
    var backup_icon = pathModule.join(config.PROJECTPATH, '/app/demo-rio/newdatamgr/icons/music_180_180.png');
    fs.readFile(backup_icon, option, function(err, buffer_base64) {
      if (err) {
        return callback_(err, null);
      }
      return callback_(null, buffer_base64);
    })
  }
  parser.on('error', function() {
    //if error, then read a backup icon in local.
    return backupIcon(callback);
  });
  parser.on('data', function(tag) {
    if (tag.type == 'APIC') {
      picData = (tag.value.data).toString('base64');
    }
  });
  stream.on('close', function() {
    if (picData) {
      return callback(null, picData);
    }else{
      //if no music thumbnail found, then read a backup icon in local.
      return backupIcon(callback);
    }
  });
}
exports.getMusicPicData = getMusicPicData;

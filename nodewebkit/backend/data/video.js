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

var pathModule = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');
var config = require("../config");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var util = require('util');
var utils = require('../utils');
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');
var dataDes = require('../commonHandle/desFilesHandle');
var uniqueID = require("../uniqueID");
var exec = require('child_process').exec;

//@const
var CATEGORY_NAME = "video";
var DES_NAME = "videoDes";
var REAL_REPO_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME);
var DES_REPO_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME);
var REAL_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME, 'data');



function readVideoMetadata(sPath, callback) {
  var oMetadata = {
    filename: '',
    format_long_name: '',
    width: '',
    height: '',
    display_aspect_ratio: '',
    pix_fmt: '',
    duration: '',
    major_brand: '',
    minor_version: '',
    compatible_brands: '',
  }
  var sCommand = 'avprobe ' + sPath;
  exec(sCommand, function(err, stdout, stderr) {
    var tmpFullname = pathModule.basename(sPath);
    oMetadata.format_long_name = pathModule.extname(tmpFullname);
    oMetadata.filename = pathModule.basename(sPath, oMetadata.pix_fmt);
    if (err) {
      return callback(null, oMetadata);
    }
    try {
      var allContent = stderr.split('\n');
      var reg_major_brand = /major_brand/gi;
      var reg_minor_version = /minor_version/gi;
      var reg_compatible_brands = /compatible_brands/gi;
      var reg_duration = /Duration/gi;
      var reg_Stream = /Stream*Video/gi;
      var reg_creation_time = /creation_time/gi;
      for (var i = 0; i < allContent.length; i++) {
        var item = allContent[i];
        if (reg_major_brand.test(item)) {
          item = item.split(':');
          oMetadata.major_brand = item[1];
        } else if (reg_minor_version.test(item)) {
          item = item.split(':');
          oMetadata.minor_version = item[1];
        } else if (reg_compatible_brands.test(item)) {
          item = item.split(':');
          oMetadata.compatible_brands = item[1];
        } else if (reg_duration.test(item)) {
          item = item.split('Duration:');
          var tmp = item[1].split(',');
          oMetadata.duration = tmp[0];
        } else if (reg_Stream.test(item)) {
          var tmp = item.split('Video:');
          var content = tmp[1];
          content = content.split(',');
          oMetadata.pix_fmt = content[0];
          for (var n in content) {
            if ((/x/g).test(content[n])) {
              var tmp = content[n].split(' ');
              var ratio = tmp[0];
              oMetadata.width = ratio[0];
              oMetadata.height = ratio[1];
              oMetadata.display_aspect_ratio = content[n];
            }
          }
        }
      }
    } catch (err) {
      console.log('just ignore: ',err);
    } finally {
      return callback(null, oMetadata);
    }
    return callback(null, oMetadata);
  })
}

function readVideoThumbnail(sPath, callback) {
  function backupIcon(callback) {
    //if thumbnail read err, then read a backup icon in local.
    var option = {
      encoding: 'base64'
    }
    var backup_icon = pathModule.join(config.PROJECTPATH, '/app/demo-rio/newdatamgr/icons/video_320_180.png');
    fs.readFile(backup_icon, option, function(err, buffer_base64) {
      if (err) {
        return callback(err, null);
      }
      return callback(null, buffer_base64);
    })
  }
  fs.open(sPath, 'r', function(err,fd) {
    if (err) {
      return callback(err, null);
    }
    fs.closeSync(fd);
    var tmpBaseDir = pathModule.join(utils.getHomeDir(), '/tmp');
    fs_extra.ensureDir(tmpBaseDir, function(err) {
      if (err) {
        return callback(err, null);
      }
      var name = pathModule.basename(sPath) + '_snapshot.png';
      var tmpDir = pathModule.join(tmpBaseDir, name);
      var sCommand = 'avconv -i ' + sPath + ' -f image2 -ss 00:05 -vframes 1 -s 640X320 ' + tmpDir;
      exec(sCommand, function(err) {
        if (err) {
          return backupIcon(callback);
        }
        var option = {
          encoding: 'base64'
        }
        fs.readFile(tmpDir, option, function(err, buffer_base64) {
          if (err) {
            return backupIcon(callback);
          } else {
            //remove tmp thumbnail file after scuccessfully get it.
            fs_extra.remove(tmpDir, function(err) {
              return callback(null, buffer_base64);
            })
          }
        })
      })
    })
  })
}
exports.readVideoThumbnail = readVideoThumbnail;

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
    return callback(null, 'no Video');
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
        readVideoMetadata(items, function(err, metadata) {
          if (err) {
            return callback(err, null);
          }
          var itemInfo = {
            id: null,
            URI: uri + "#" + category,
            category: category,
            others: someTags.join(","),
            filename: itemFilename,
            postfix: itemPostfix,
            size: size,
            path: items,
            directorName: "Xiquan",
            actorName: "Xiquan",
            createTime: ctime,
            lastModifyTime: mtime,
            lastAccessTime: ctime,
            createDev: config.uniqueID,
            lastModifyDev: config.uniqueID,
            lastAccessDev: config.uniqueID,
            format_long_name: metadata.format_long_name,
            width: metadata.width,
            height: metadata.height,
            display_aspect_ratio: metadata.display_aspect_ratio,
            pix_fmt: metadata.pix_fmt,
            duration: metadata.duration,
            major_brand: metadata.major_brand,
            minor_version: metadata.minor_version,
            compatible_brands: metadata.compatible_brands,
          };
          commonHandle.createData(itemInfo, function(result, resultFile) {
            if (result === 'success') {
              callback(null, result, resultFile);
            } else {
              var _err = 'createData: commonHandle createData error!';
              console.log('createData error!');
              callback(_err, null, null);
            }
          })
        })
      })
    })
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
                readVideoMetadata(_item, function(err, metadata) {
                  if (err) {
                    return callback(err, null);
                  }
                  var itemInfo = {
                    id: null,
                    URI: uri + "#" + category,
                    category: category,
                    others: someTags.join(","),
                    filename: itemFilename,
                    postfix: itemPostfix,
                    size: size,
                    path: _item,
                    directorName: "",
                    actorName: "",
                    createTime: ctime,
                    lastModifyTime: mtime,
                    lastAccessTime: ctime,
                    createDev: config.uniqueID,
                    lastModifyDev: config.uniqueID,
                    lastAccessDev: config.uniqueID,
                    format_long_name: metadata.format_long_name,
                    width: metadata.width,
                    height: metadata.height,
                    display_aspect_ratio: metadata.display_aspect_ratio,
                    pix_fmt: metadata.pix_fmt,
                    duration: metadata.duration,
                    major_brand: metadata.major_brand,
                    minor_version: metadata.minor_version,
                  };
                  itemInfoAll.push(itemInfo);
                  var isEnd = (count === lens - 1);
                  if (isEnd) {
                    commonHandle.createDataAll(itemInfoAll, function(result) {
                      if (err) {
                        var _err = 'createData: commonHandle createData all error!';
                        console.log('createData error!');
                        return callback(_err, null);
                      }
                      callback(null, result);
                    })
                  }
                  count++;
                })
              })
            }
          })
        })(item)
      }
    }
  } else {
    console.log('input error: items is undefined!');
    var _err = 'createData: input error';
    callback(_err, null);
  }
}
exports.createData = createData;


/**
 * @method removeByUri
 *    Remove Video by uri.
 * @param uri
 *    The Video's URI.
 * @param callback
 *    Callback
 */
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
        //Git commit
        commonHandle.removeFile(CATEGORY_NAME, items[0], callback);
      }
    });
  });
}
exports.removeByUri = removeByUri;

/**
 * @method getByUri
 *    Get Video info in db.
 * @param uri
 *    The Video's URI.
 * @param callback
 *    Callback
 */
function getByUri(uri, callback) {
  commonHandle.getItemByUri(CATEGORY_NAME, uri, callback);
}
exports.getByUri = getByUri;

function getRecentAccessData(num, getRecentAccessDataCb) {
  commonHandle.getRecentAccessData(CATEGORY_NAME, getRecentAccessDataCb, num);
}
exports.getRecentAccessData = getRecentAccessData;


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
          case 'txt':
            source = {
              openmethod: 'html',
              format: 'txtfile',
              title: '文件浏览',
              content: item.path
            }
            break;
          case 'html5ppt':
            source = {
              openmethod: 'html',
              format: 'html5ppt',
              title: '文件浏览',
              content: item.path.substring(0, item.path.lastIndexOf('.')) + '/index.html'
            }
            break;
          case 'ogg':
            source = {
              openmethod: 'html',
              format: 'video',
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
              case 'ppt':
                s_command = "wpp \"" + item.path + "\"";
                supportedKeySent = true;
                var h = item.path.lastIndexOf('/');
                s_windowname = item.path.substring(h < 0 ? 0 : h + 1, item.path.length);
                break;
              case 'pptx':
                s_command = "wpp \"" + item.path + "\"";
                supportedKeySent = true;
                var h = item.path.lastIndexOf('/');
                s_windowname = item.path.substring(h < 0 ? 0 : h + 1, item.path.length);
                break;
              case 'doc':
                s_command = "wps \"" + item.path + "\"";
                break;
              case 'docx':
                s_command = "wps \"" + item.path + "\"";
                break;
              case 'xls':
                s_command = "et \"" + item.path + "\"";
                break;
              case 'xlsx':
                s_command = "et \"" + item.path + "\"";
                break;
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
      var re = new RegExp('/' + CATEGORY_NAME + '/')
      var desFilePath = item.path.replace(re, '/' + CATEGORY_NAME + 'Des/') + ".md";
      util.log("desPath=" + desFilePath);
      dataDes.updateItem(desFilePath, updateItem, function() {
        resourceRepo.repoCommit(utils.getDesDir(CATEGORY_NAME), [desFilePath], null, "open", function() {
          updateItem.category = CATEGORY_NAME;
          var updateItems = new Array();
          var condition = [];
          condition.push("URI='" + item.URI + "'");
          updateItems.conditions = condition;
          updateItems.push(updateItem);
          commonDAO.updateItems(updateItems, function(result) {
            console.log(result);
            openDataByUriCb(source);
          });
        });
      });
    }
  }
  getByUri(uri, getItemByUriCb);
}
exports.openDataByUri = openDataByUri;

/**
 * @method pullRequest
 *    Fetch from remote and merge.
 * @param deviceId
 *    Remote device id.
 * @param deviceIp
 *    Remote device ip.
 * @param deviceAccount
 *    Remote device account.
 * @param resourcesPath
 *    Repository path.
 * @param callback
 *    Callback.
 */
function pullRequest(deviceId, address, account, resourcesPath, callback) {
  var sRepoPath = pathModule.join(resourcesPath, CATEGORY_NAME);
  var sDesRepoPath = pathModule.join(resourcesPath, DES_NAME);
  commonHandle.pullRequest(CATEGORY_NAME, deviceId, address, account, sRepoPath, sDesRepoPath, callback);
}
exports.pullRequest = pullRequest;

/** 
 * @Method: getGitLog
 *    To get git log in a specific git repo
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        array, result of git log
 *
 **/
function getGitLog(callback) {
  console.log('getGitLog in ' + CATEGORY_NAME + 'was called!')
  resourceRepo.getGitLog(DES_REPO_DIR, callback);
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
function repoReset(commitID, callback) {
  getGitLog(function(err, oGitLog) {
    if (err) {
      callback(err, null);
    } else {
      var dataCommitID = oGitLog[commitID].content.relateCommit;
      if (dataCommitID != "null") {
        resourceRepo.repoReset(REAL_REPO_DIR, dataCommitID, null, function(err, result) {
          if (err) {
            console.log(err);
            callback({
              'document': err
            }, null);
          } else {
            resourceRepo.getLatestCommit(REAL_REPO_DIR, function(relateCommitID) {
              resourceRepo.repoReset(DES_REPO_DIR, commitID, relateCommitID, function(err, result) {
                if (err) {
                  console.log(err);
                  callback({
                    'document': err
                  }, null);
                } else {
                  console.log('reset success!')
                  callback(null, result)
                }
              });
            });
          }
        })
      } else {
        resourceRepo.repoReset(DES_REPO_DIR, commitID, null, function(err, result) {
          if (err) {
            console.log(err);
            callback({
              'document': err
            }, null);
          } else {
            console.log('reset success!')
            callback(null, result)
          }
        });
      }
    }
  });
}
exports.repoReset = repoReset;

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


function repoSearch(repoSearchCb, sKey) {
  resourceRepo.repoSearch(CATEGORY_NAME, sKey, repoSearchCb);
}
exports.repoSearch = repoSearch;

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

var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var util = require('util');
var utils = require('../utils');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');
var dataDes = require('../commonHandle/desFilesHandle');

//@const
var CATEGORY_NAME = "document";
var DES_NAME = "documentDes";
var REAL_REPO_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME);
var DES_REPO_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME);
var REAL_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME, 'data');

var watcher;
exports.watcher=watcher;
var watchFilesNum=0;

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
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                error: "createData: commonHandle createData error"
 *                error: "createData: items should be an array"
 *                error: "createData: commonHandle createData all error"
 *                error: "createData: input error"
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 */
function createData(items, callback) {
  commonHandle.dataStore(items, extraInfo, function(err) {
    if (err) {
      return callback(err);
    }
    callback();
  })
}
exports.createData = createData;

function extraInfo(category, callback) {
  var _extra = {
    project: '上海专项',
  }
  callback(null, _extra);
}

/**
 * @method removeDocumentByUri
 *    Remove document by uri.
 * @param uri
 *    The document's URI.
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
 * @method changeData
 *    Change document by filePath.
 * @param filePath
 *    The document's filePath.
 * @param callback
 *    Callback
 */
function changeData(filePath,uri, callback) {
  console.log("change data : "+filePath);
  var currentTime = (new Date());
  var re = new RegExp('/' + CATEGORY_NAME + '/');
  var desFilePath = filePath.replace(re, '/' + CATEGORY_NAME + 'Des/') + ".md";
  fs.stat(filePath, function(err, stat) {
    var updateItem = {
      URI:uri,
      lastModifyTime : currentTime,
      lastModifyDev : config.uniqueID,
      size:stat.size
    }
    dataDes.updateItem(desFilePath, updateItem, function() {
      //resourceRepo.repoCommit(utils.getDesDir(CATEGORY_NAME), [desFilePath], null, "ch", function() {
      var sRealRepoDir=utils.getRepoDir(CATEGORY_NAME);
      var sDesRepoDir=utils.getDesRepoDir(CATEGORY_NAME);
      resourceRepo.repoCommitBoth('ch', sRealRepoDir, sDesRepoDir, [filePath], [desFilePath], function(err, result) {
        updateItem.category = CATEGORY_NAME;
        var updateItems = new Array();
        updateItems.push(updateItem);
        commonDAO.updateItems(updateItems, function(result) {
          if(result!='commit'){
            console.log("DB update error:");
            console.log(result);
            return;
          }
          callback(result);
        });
      });
    });
  });
}
exports.changeData = changeData;

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
          case 'pdf':          
          case 'PDF':
            source = {
              openmethod: 'pdf',
              format: 'pdffile',
              title: '文件浏览',
              content: item.path
            }
            break;
          case 'txt':            
          case 'TXT':
            source = {
              openmethod: 'html',
              format: 'txtfile',
              title: '文件浏览',
              content: item.path
            }
            break;
          case 'html5ppt':            
          case 'HTML5PPT':
            source = {
              openmethod: 'html',
              format: 'html5ppt',
              title: '文件浏览',
              content: item.path.substring(0, item.path.lastIndexOf('.')) + '/index.html'
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
              case 'pdf':              
              case 'PDF':
                break;
              case 'ppt':                
              case 'PPT':
                s_command = "wpp \"" + item.path + "\"";
                supportedKeySent = true;
                var h = item.path.lastIndexOf('/');
                s_windowname = item.path.substring(h < 0 ? 0 : h + 1, item.path.length);
                break;
              case 'pptx':                
              case 'PPTX':
                s_command = "wpp \"" + item.path + "\"";
                supportedKeySent = true;
                var h = item.path.lastIndexOf('/');
                s_windowname = item.path.substring(h < 0 ? 0 : h + 1, item.path.length);
                break;
              case 'doc':                
              case 'DOC':
                s_command = "wps \"" + item.path + "\"";
                break;
              case 'docx':                
              case 'DOCX':
                s_command = "wps \"" + item.path + "\"";
                break;
              case 'xls':                
              case 'XLS':
                s_command = "et \"" + item.path + "\"";
                break;
              case 'xlsx':                
              case 'XLSX':
                s_command = "et \"" + item.path + "\"";
                break;
              default:
                s_command = "xdg-open \"" + item.path + "\"";
                break;
            }
            var child = exec(s_command, function(error, stdout, stderr) {
              if(watchFilesNum>0){
                watchFilesNum--;              
              }
              console.log("watchFilesNum = "+watchFilesNum);
              if(watchFilesNum==0){
                commonHandle.watcherStop(CATEGORY_NAME,function(){
                  console.log(CATEGORY_NAME+" watcher stoped!!");
                });
              }
            });
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
          updateItems.push(updateItem);
          commonDAO.updateItems(updateItems, function(result) {
            if(result!='commit'){
              console.log("DB update error:");
              console.log(result);
              return;
            }           
            //目前如果数据是ppt/pptx/doc/docx/xls/xlsx类型，需要用外部程序打开，此时需要使用monitor监视数据的修改
            if(item.postfix=='ppt' || item.postfix=='PPT' || 
               item.postfix=='pptx'|| item.postfix=='PPTX' ||
               item.postfix=='doc' || item.postfix=='DOC' ||
               item.postfix=='docx'|| item.postfix=='DOCX' ||
               item.postfix=='xls' || item.postfix=='XLS' ||
               item.postfix=='xlsx' || item.postfix=='XLSX'){
              if(watchFilesNum==0)
              {
                console.log(CATEGORY_NAME+" watcher started!!");
                watchFilesNum++;
                console.log("watchFilesNum = "+watchFilesNum);
                openDataByUriCb(source);
                commonHandle.watcherStart(CATEGORY_NAME,function(path,event){
                  console.log(path+" : "+event);
                  if(event=='change'){
                    var conditions = ["path = " + "'" + path + "'"];
                    commonDAO.findItems(null, CATEGORY_NAME, conditions, null, function(err, items) {
                      changeData(path,items[0].URI,function(result){
                        if(result!='commit'){
                          console.log("DB update error:");
                          console.log(result);
                          return;
                        } 
                      });
                    });
                  }
                });
              }
              else{
                watchFilesNum++;
                console.log("watchFilesNum = "+watchFilesNum);
                openDataByUriCb(source);
              }
            }
            else{
              openDataByUriCb(source);
            }
          });
        });
      });
    }
  }
  getByUri(uri, getItemByUriCb);
}
exports.openDataByUri = openDataByUri;

function getRecentAccessData(num, getRecentAccessDataCb) {
  console.log('getRecentAccessData in ' + CATEGORY_NAME + 'was called!');
  commonHandle.getRecentAccessData(CATEGORY_NAME, getRecentAccessDataCb, num);
}
exports.getRecentAccessData = getRecentAccessData;

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
  if(watchFilesNum>0){
    callback({
      'document': "Please close all document datas"
    }, null);
    return;
  }
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
                  callback(null, result);
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
            callback(null, result);
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

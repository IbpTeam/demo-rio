/**
 * @Copyright:
 *
 * @Description: Documents Handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.11.15
 *
 * @version:0.3.2
 **/

var pathModule = require('path');
var fs = require('fs');
var config = require("../config");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var util = require('util');
var utils = require('../utils');
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');
var dataDes = require('../commonHandle/desFilesHandle');
var uniqueID = require("../uniqueID");


//@const
var CATEGORY_NAME = "other";
var DES_NAME = "otherDes";
var REAL_REPO_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME);
var DES_REPO_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME);
var REAL_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME, 'data');


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
  return commonHandle.dataStore(items, extraInfo);
}
exports.createData = createData;

function extraInfo(category, callback) {
  var _extra = {}
  return Q.fcall(function() {
    return _extra;
  })
}

function getOpenInfo(item) {
  if (item == null) {
    config.riolog("read data : " + item);
    return undefined;
  }
  config.riolog("read data : " + item.path);

  var source = {
    openmethod: 'alert',
    content: item.path + ' can not be recognized.'
  };

  var _exec = require('child_process');
  var s_command = "xdg-open \"" + item.path + "\"";
  _exec.exec(s_command, function() {});

  return source;
}
exports.getOpenInfo = getOpenInfo;

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
  getGitLog(function(err, oGitLog) {
    if (err) {
      callback(err, null);
    } else {
      var dataCommitID = oGitLog[commitID].content.relateCommit;
      if (dataCommitID!="null") {
        resourceRepo.repoReset(REAL_REPO_DIR,dataCommitID ,null, function(err, result) {
          if (err) {
            console.log(err);
            callback({
              'document': err
            }, null);
          } 
          else {
            resourceRepo.getLatestCommit(REAL_REPO_DIR, function(relateCommitID) {
              resourceRepo.repoReset(DES_REPO_DIR, commitID,relateCommitID, function(err, result) {
                if (err) {
                  console.log(err);
                  callback({
                    'document': err
                  }, null);
                } 
                else {
                  console.log('reset success!')
                  callback(null, result)
                }
              });
            });
          }
        })
      } 
      else {
        resourceRepo.repoReset(DES_REPO_DIR, commitID,null, function(err, result) {
          if (err) {
            console.log(err);
            callback({
              'document': err
            }, null);
          } 
          else {
            console.log('reset success!')
            callback(null, result)
          }
        });
      }
    }
  });
}
exports.repoReset = repoReset;

function repoResetFile(commitID, file, callback) {
  getGitLog(function(err, oGitLog) {
    if (err) {
      callback(err, null);
    } else {
      var desCommitID = oGitLog[commitID].content.relateCommit;
      if (desCommitID) {
        resourceRepo.repoResetFile(DES_REPO_DIR, file, desCommitID, null, function(err, result) {
          if (err) {
            console.log(err);
            callback({
              'other': err
            }, null);
          } else {
            getLatestCommit(DES_REPO_DIR, function(relateCommitID) {
              resourceRepo.repoResetFile(REAL_REPO_DIR, file, commitID, relateCommitID, function(err, result) {
                if (err) {
                  console.log(err);
                  callback({
                    'other': err
                  }, null);
                } else {
                  console.log('reset success!')
                  callback(null, result)
                }
              })
            })
          }
        })
      } else {
        var _err = 'related des commit id error!';
        console.log(_err);
        callback({
          'other': _err
        }, null);
      }
    }
  })
}
exports.repoResetFile = repoResetFile;


function repoSearch(repoSearchCb, sKey) {
  resourceRepo.repoSearch(CATEGORY_NAME, sKey, repoSearchCb);
}
exports.repoSearch = repoSearch;
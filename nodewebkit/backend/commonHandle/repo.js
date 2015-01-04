var path = require('path');
var git = require("nodegit");
var config = require("../config");
var events = require('events');
var utils = require('../utils');
var transfer = require('../Transfer/msgTransfer');

var repos=[
  {name:"contactDes",status:"empty"},
//  {name:"desktop",status:"empty"},
//  {name:"desktopDes",status:"empty"},
  {name:"document",status:"empty"},
  {name:"documentDes",status:"empty"},
  {name:"music",status:"empty"},
  {name:"musicDes",status:"empty"},
  {name:"other",status:"empty"},
  {name:"otherDes",status:"empty"},
  {name:"picture",status:"empty"},
  {name:"pictureDes",status:"empty"},
  {name:"video",status:"empty"},
  {name:"videoDes",status:"empty"},
];
var desRepos=[
  {name:"contactDes",status:"empty"},
 // {name:"desktopDes",status:"empty"},
  {name:"documentDes",status:"empty"},
  {name:"musicDes",status:"empty"},
  {name:"otherDes",status:"empty"},
  {name:"pictureDes",status:"empty"},
  {name:"videoDes",status:"empty"},
];

var num=desRepos.length;
var index=0;

exports.repoInit = function(repoPath, callback) {
  git.Repo.init(repoPath, false, function(initReporError, repo) {
    if (initReporError)
      throw initReporError;
    console.log("Repo init : " + repo);
    var exec = require('child_process').exec;
    var comstr = 'cd ' + repoPath + ' && git add . && git commit -m "On device ' + config.SERVERNAME + ' #Init resource#"';
    exec(comstr, function(error, stdout, stderr) {
      if (error) {
        callback("Git init error");
      } else {
        callback("success");
      }
    });
  });
}

function repoCommit(repoPath, files, commitID, op, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for (var k in files) {
    if(op=="rm"){
      comstr = comstr + ' && git rm "' + files[k] + '"';
    }
    else if(op=="add" ||op=="ch" ||op=="load"||op=="open" ){
      comstr = comstr + ' && git add "' + files[k] + '"';
    }
  }
  var relateCommit = '"relateCommit": "' + commitID + '",';
  var deviceInfo = '"device":"' + config.uniqueID + '"';
  var opInfo = '"op":"'+op+'"';
  var fileInfo = '"file":["' + files.join('","') + '"]';
  var commitLog = '{' + relateCommit + deviceInfo + ',' + opInfo + ',' + fileInfo + '}';
  comstr = comstr + " && git commit -m '" + commitLog + "'";
  exec(comstr, function(error, stdout, stderr) {
    if (error) {
      console.log("Git add error");
      console.log(error, stderr, stdout);
      callback(error,'error');
    } 
    else {
      console.log("Git add success");
      callback(null,'success');
      transfer.syncOnlineReq(repoPath);
    }
  });
}
exports.repoCommit = repoCommit;

function repoResetCommit (repoPath, file, commitID,oriOp,revertedCommitID, callback) {
  var exec = require('child_process').exec;
  if(oriOp=="rm" ||oriOp=="ch"||oriOp=="open"){
    var comstr = 'cd ' + repoPath + ' && git add '+file[0];
  }
  var relateCommit = '"relateCommit": "' + commitID + '",';
  var deviceInfo = '"device":"' + config.uniqueID + '"';
  var opInfo = '"op":"revert"';
  var cidInfo = '"revertedCommitID":"'+revertedCommitID+'"';
  var fileInfo = '"file":["' + file + '"]';
  var commitLog = '{' + relateCommit + deviceInfo + ',' + opInfo + ',' +cidInfo+','+ fileInfo + '}';
  comstr = comstr + " && git commit -m '" + commitLog + "'";
  console.log(file);
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n" + comstr);
  exec(comstr, function(error, stdout, stderr) {
    if (error) {
      console.log("Git revert error", error, stdout);
    } else {
      console.log("Git revert success");
      callback(null,'success');
      transfer.syncOnlineReq(repoPath);
    }
  });
}
exports.repoResetCommit=repoResetCommit;

/** 
 * @Method: repoCommitBoth
 *    To get git log in a specific git repo
 *
 * @param1: op
 *    string, only 3 choices: 'add', 'rm', 'ch'.
 *
 * @param2: realPath
 *    string, a category repo path,
 *            usually as :'/home/xiquan/.resource/document'
 *
 * @param3: desPath
 *    string, a category repo path,
 *            usually as : '/home/xiquan/.resource/documentDes'
 *
 * @param4: oFiles
 *    array, a array of file path
 *
 * @param5: oDesFiles
 *    array, a array of des file path
 *
 * @param6: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        objcet, retrieve 'success' when success
 *
 **/
exports.repoCommitBoth = function(op, realPath, desPath, oFiles, oDesFiles, callback) {
  repoCommit(realPath, oFiles,null ,op, function() {
    getLatestCommit(realPath, function(commitID) {
      repoCommit(desPath, oDesFiles, commitID,op, function(err) {
        if(err){
          return callback(err,null)
        }
        callback(null,'success');
      });
    })
  })
}

function getLatestCommit(repoPath, callback) {
  console.log("getLatestCommit " + repoPath);
  //open a git repo
  git.Repo.open(path.resolve(repoPath + '/.git'), function(openReporError, repo) {
    if (openReporError)
      throw openReporError;
    console.log("Repo open : " + repo);
    //add the file to the index...
    repo.openIndex(function(openIndexError, index) {
      if (openIndexError)
        throw openIndexError;
      console.log("Repo index : " + index);
      index.read(function(readError) {
        if (readError)
          throw readError;
        console.log("Repo read : success");
        index.writeTree(function(writeTreeError, oid) {
          if (writeTreeError)
            throw writeTreeError;
          console.log("Repo writeTree : success");
          //get HEAD 
          git.Reference.oidForName(repo, 'HEAD', function(oidForName, head) {
            if (oidForName)
              throw oidForName;
            console.log("Repo oidForName : " + oidForName);
            //get latest commit (will be the parent commit)
            callback(head);
          });
        });
      });
    });
  });
}
exports.getLatestCommit = getLatestCommit;

function getLatestCommitForOneFile(repoPath,filePath, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath + ' && git log '+filePath;
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn" + comstr);
  exec(comstr, function(err, stdout, stderr) {
    if (err) {
      console.log(err, stderr);
      return callback({
        'repo': err
      }, null);
    }
    var commitId=null;
    var tmpLog = stdout.split('\n');
    for (var i = 0; i < tmpLog.length; i++) {
      if(tmpLog[i].indexOf("commit ")==0){
        commitId=tmpLog[i].substring(tmpLog[i].indexOf(" ")+1,tmpLog[i].length);
        break;
      }
    }
    console.log(commitId);
    callback(null, commitId);
  })
}
exports.getLatestCommitForOneFile=getLatestCommitForOneFile;

function getBranchList(stdout) {
  var line = stdout.split("\n");
  //for (var index in line) {
    //if (line[index].indexOf('|') == -1) {
      //line.pop(line[index]);
    //}
  //}
  console.log("###################################" + line);
  return line;
}

exports.haveBranch = function(resourcesPath, branch, callback) {
  var sBaseName = path.basename(resourcesPath);
  var sLocalResourcesPath = path.join(process.env["HOME"], ".resources", sBaseName);
  var cp = require('child_process');
  var cmd = 'cd ' + sLocalResourcesPath + '&& git branch';
  console.log(cmd);
  cp.exec(cmd, function(error, stdout, stderr) {
    var branchList = getBranchList(stdout);
    console.log(branchList.length);
    for (var index in branchList) {
      //Reg trim
      var branchName = branchList[index].match(/rio.+rio/g);
      console.log("have branch :=======" + branchName);
      if (branchName != null && branchName.length > 0 && branchName[0] == branch) {
        callback(true);
        return;
      }
    }
    console.log("have no branch : " + branch);
    callback(false);
  });
}

exports.addBranch = function(deviceId, address, account, resourcesPath, callback) {
  console.log("add branch : " + deviceId);
  var sBaseName = path.basename(resourcesPath);
  var sLocalResourcesPath = path.join(process.env["HOME"], ".resources", sBaseName);
  var cp = require('child_process');
  var cmd = 'cd ' + sLocalResourcesPath + '&& git remote add ' + deviceId + ' ' + account + '@' + address + ':' + resourcesPath;
  console.log(cmd);
  cp.exec(cmd, function(error, stdout, stderr) {
    console.log(stdout + stderr);
    var cmd = 'cd ' + sLocalResourcesPath + '&& git fetch ' + deviceId;
    console.log(cmd);
    cp.exec(cmd, function(error, stdout, stderr) {
      console.log(stdout + stderr);
      var cmd = 'cd ' + sLocalResourcesPath + '&& git checkout -b ' + deviceId + ' ' + deviceId + '/master';
      console.log(cmd);
      cp.exec(cmd, function(error, stdout, stderr) {
        console.log(stdout + stderr);
        var cmd = 'cd ' + sLocalResourcesPath + '&& git checkout master';
        console.log(cmd);
        cp.exec(cmd, function(error, stdout, stderr) {
          console.log(stdout + stderr);
          callback(deviceId);
        });
      });
    });
  });
}

function getPullFileList(stdout) {
  var line = stdout.split("\n");
  for (var index in line) {
    if (line[index] == "") {
      line.pop(line[index]);
    }
  }
  return line;
}

exports.pullFromOtherRepo = function(resourcesPath, branch, callback) {
  var sBaseName = path.basename(resourcesPath);
  var sLocalResourcesPath = path.join(process.env["HOME"], ".resources", sBaseName);
  var cp = require('child_process');
  var cmd = 'cd ' + sLocalResourcesPath + '&& git checkout ' + branch;
  console.log(cmd);
  cp.exec(cmd, function(error, stdout, stderr) {
    console.log(stdout + stderr);
    var cmd = 'cd ' + sLocalResourcesPath + '&& git pull';
    console.log(cmd);
    cp.exec(cmd, function(error, stdout, stderr) {
      console.log(stdout + stderr);
      var cmd = 'cd ' + sLocalResourcesPath + '&& git checkout master';
      console.log(cmd);
      cp.exec(cmd, function(error, stdout, stderr) {
        console.log(stdout + stderr);
        var cmd = 'cd ' + sLocalResourcesPath + '&& git diff --name-only ' + branch;
        console.log(cmd);
        cp.exec(cmd, function(error, stdout, stderr) {
          console.log(stdout + stderr);
          var fileList = getPullFileList(stdout);
          console.log("fileList:");
          console.log(fileList);
          var cmd = 'cd ' + sLocalResourcesPath + '&& git merge ' + branch;
          console.log(cmd);
          cp.exec(cmd, function(error, stdout, stderr) {
            console.log(stdout + stderr);
            callback(fileList);
          });
        });
      });
    });
  });
}

/** 
 * @Method: getGitLog
 *    To get git log in a specific git repo
 *
 * @param2: repoPath
 *    string, a category repo path,
 *            usually as : config.RESOURCEPATH + '/' + CATEGORY_NAME
 *
 * @param2: getGitLogCb
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        objcet, result of git log
 *
 **/
function getGitLog(repoPath, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath + ' && git log';
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn" + comstr);
  exec(comstr, function(err, stdout, stderr) {
    if (err) {
      console.log(err, stderr);
      return callback({
        'repo': err
      }, null);
    }
    var commitLog = {};
    var tmpLog = stdout.split('commit ');
    for (var i = 0; i < tmpLog.length; i++) {
      var Item = tmpLog[i];
      if (Item !== "") {
        var reg_Author = /Author/;
        var reg_Data = /Date/;
        var reg_Merge = /Merge/;
        var reg_relate = /relateCommit|\{"device":/;
        var logItem = Item.split('\n');
        var tmplogItem = {};
        tmplogItem.commitID = logItem[0];
        for (var j = 0; j < logItem.length; j++) {
          var item = logItem[j];
          if (reg_Author.test(item)) {
            tmplogItem.Author = item.replace(/Author:/, "");
          } else if (reg_Data.test(item)) {
            tmplogItem.Date = item.replace(/Date:/, "");
          } else if (reg_Merge.test(item)) {
            tmplogItem.Merge = item.replace(/Merge:/, "");
          } else if (reg_relate.test(item)) {
            tmplogItem.content = JSON.parse(item);
          }
        }
        commitLog[logItem[0]] = tmplogItem;
      }
    }
    callback(null, commitLog);
  })
}
exports.getGitLog=getGitLog;

exports.repoReset = function(repoPath, commitID,relateCommit, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath + ' && git revert ' + commitID + ' -n';
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn" + comstr);
  exec(comstr, function(err, stdout, stderr) {
    if (err) {
      console.log(err, stderr);
      callback({
        'repo': err
      }, null);
    } 
    else {
      getGitLog(repoPath,function(result,gitLogs){
        if(result==null){
          var file=gitLogs[commitID].content.file;
          repoResetCommit(repoPath, file, relateCommit,gitLogs[commitID].content.op,commitID, function(err,result){
            if(err==null){
              callback(null, 'success'); 
            }
            else{
              console.log("repoReset error!");
              callback(error,'failed');
            }
          });
          console.log('success', stdout);
        }
        else{
          console.log("Get git log error!");
        }
      });
    }
  });
}

function isEmptyRepo(repoPath,completeCb){
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath + ' && git show ';
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn" + comstr);
  exec(comstr, function(err, stdout, stderr) {
    //console.log(stdout+stderr);
    if(err){
      if(stdout.indexOf("fatal: bad default revision")>=0){
        console.log("empty repo: "+desRepos[index].name);
      }
    }
    else{
      console.log("hot repo: "+desRepos[index].name);
      desRepos[index].status="hot";
    }
    index++;
    if(index==num){
      completeCb();
    }
    else{
      isEmptyRepo(path.join(config.RESOURCEPATH,desRepos[index].name),completeCb);
    }
  });
}

function getReposStatus (callback) {
  index = 0;
  isEmptyRepo(path.join(config.RESOURCEPATH,desRepos[index].name),function(){
    var aRepoArr = new Array();
    for(var arrIndex in desRepos){
      console.log(desRepos[arrIndex]);
      if(desRepos[arrIndex].status != "empty"){
        aRepoArr.push(desRepos[arrIndex].name);
      }
    }
    callback(aRepoArr);
  });
}
exports.getReposStatus=getReposStatus;


exports.repoRenameCommit = function(sOrigin, sNew, repoPath, desRepoPath, callback) {
  var exec = require('child_process').exec;
  var sDesOrigin = sOrigin.replace(/\/data\//, 'Des/data/') + '.md';
  var sDesNew = sNew.replace(/\/data\//, 'Des/data/') + '.md';
  var deComstr = 'cd ' + desRepoPath;
  var desDeviceInfo = '"device":"' + config.uniqueID + '"';
  deComstr = deComstr + ' && git rm "' + sDesOrigin + '"' + ' && git add "' + sDesNew + '"';
  var opInfo = '"op":"rename"';
  var deviceInfo = '"file":["' + sDesOrigin + '","' + sDesNew + '"]';
  var desCommitLog = '{' + desDeviceInfo + ',' + opInfo + ',' + deviceInfo + '}';
  deComstr = deComstr + " && git commit -m '" + desCommitLog + "'";
  exec(deComstr, function(error, stdout, stderr) {
    if (error) {
      console.log("run:",'\n',deComstr);
      console.log(error);
      return;
    }
    getLatestCommit(desRepoPath, function(relateCommitId) {
      var comstr = 'cd ' + repoPath;
      comstr = comstr + ' && git rm "' + sOrigin + '"' + ' && git add "' + sNew + '"';
      var opInfo = '"op":"rename"';
      var fileInfo = '"file":["' + sOrigin + '","' + sNew + '"]';
      var relateCommit = '"relateCommit": "' + relateCommitId + '",';
      var commitLog = '{' + relateCommit + deviceInfo + ',' + opInfo + ',' + fileInfo + '}';
      comstr = comstr + " && git commit -m '" + commitLog + "'";
      exec(comstr, function(error, stdout, stderr) {
        if (error) {
          console.log("run:",'\n',comstr);
          console.log("Git change error", error, stdout);
          return
        }
        callback(null, 'success');
      });
    })
  })
}



exports.repoSearch = function(category, sKey, callback) {
  var sRepoPath = utils.getRepoDir(category);
  getGitLog(sRepoPath, function(err, result) {
    if (err) {
      return callback(err, null);
    }
    var _result = {};
    for (var k in result) {
      var oFiles = result[k].content.file;
      for (var p in oFiles) {
        var reg_key = new RegExp(sKey, 'g');
        if (oFiles.length > 2) {
          break;
        }
        if (reg_key.test(oFiles[p])) {
          _result[k] = result[k];
          break;
        }
      }
    }
    callback(null, _result);
  })
}

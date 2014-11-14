var path = require('path');
var git = require("nodegit");
var config = require("../config");
var filesHandle = require("../filesHandle");
var events = require('events');
var utils = require('../utils');

exports.repoInit = function(repoPath, callback) {
  git.Repo.init(repoPath, false, function(initReporError, repo) {
    if (initReporError)
      throw initReporError;
    console.log("Repo init : " + repo);
    var exec = require('child_process').exec;
    var comstr = 'cd ' + repoPath + ' && git add . && git commit -m "On device ' + config.SERVERNAME + ' #Init resource#"';
    console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn" + comstr);
    exec(comstr, function(error, stdout, stderr) {
      if (error) {
        callback("Git init error");
      } else {
        callback("success");
      }
    });
  });
}

exports.repoAddsCommit = function(repoPath, files, commitID, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for (var k in files) {
    comstr = comstr + ' && git add "' + files[k] + '"';
  }

  var relateCommit = (commitID) ? ('"relateCommit": "' + commitID + '",') : ("");
  var deviceInfo = '"device":"' + config.uniqueID + '"';
  var opInfo = '"op":"add"';
  var fileInfo = '"file":["' + files.join('","') + '"]';
  var commitLog = '{' + relateCommit + deviceInfo + ',' + opInfo + ',' + fileInfo + '}';
  comstr = comstr + " && git commit -m '" + commitLog + "'";
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n" + comstr);
  exec(comstr, function(error, stdout, stderr) {
    if (error) {
      console.log("Git add error");
      console.log(error, stderr)
    } else {
      console.log("Git add success");
      callback('success');
    }
  });
}


exports.repoRmsCommit = function(repoPath, files, commitID, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for (var k in files) {
    comstr = comstr + ' && git rm "' + files[k] + '"';
  }
  var relateCommit = (commitID) ? ('"relateCommit": "' + commitID + '",') : ("");
  var deviceInfo = '"device":"' + config.uniqueID + '"';
  var opInfo = '"op":"rm"';
  var fileInfo = '"file":["' + files.join('","') + '"]';
  var commitLog = '{' + relateCommit + deviceInfo + ',' + opInfo + ',' + fileInfo + '}';
  comstr = comstr + " && git commit -m '" + commitLog + "'";
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n" + comstr);
  exec(comstr, function(error, stdout, stderr) {
    if (error) {
      console.log("Git rm error");
    } else {
      console.log("Git rm success");
      callback();
    }
  });
}

exports.repoChsCommit = function(repoPath, files, commitID, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for (var k in files) {
    comstr = comstr + ' && git add "' + files[k] + '"';
  }
  var relateCommit = (commitID) ? ('"relateCommit": "' + commitID + '",') : ("");
  var deviceInfo = '"device":"' + config.uniqueID + '"';
  var opInfo = '"op":"ch"';
  var fileInfo = '"file":["' + files.join('","') + '"]';
  var commitLog = '{' + relateCommit + deviceInfo + ',' + opInfo + ',' + fileInfo + '}';
  comstr = comstr + " && git commit -m '" + commitLog + "'";
  console.log(files);
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n" + comstr);
  exec(comstr, function(error, stdout, stderr) {
    if (error) {
      console.log("Git change error");
    } else {
      console.log("Git change success");
      callback();
    }
  });
}

exports.getLatestCommit = function(repoPath, callback) {
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

function getBranchList(stdout){
  var line=stdout.split("\n");
  for(var index in line){
    if(line[index].indexOf('|')==-1 ){
      line.pop(line[index]);
    }
  }
  console.log("###################################"+line);
  for(var index in line){
    if(line[index].indexOf('data/')==-1){
      line.pop(line[index]);
    }
  }
  console.log("###################################"+line);
  for(var index in line){
    var endIndex=line[index].indexOf('|');
    line[index]=line[index].substring(0,endIndex).trim();
  }
  console.log("###################################"+line);
  for(var index in line){
    console.log(line[index]);
  }
  console.log("###################################"+line);
  line.shift();
  return line;
} 

exports.haveBranch = function (resourcesPath,branch)
{
  var sBaseName = path.basename(resourcesPath);
  var sLocalResourcesPath=path.join(process.env["HOME"],".resources",sBaseName);
  var cp = require('child_process');
  var cmd = 'cd '+sLocalResourcesPath+'&& git branch';
  console.log(cmd);
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout+stderr);
    var branchList=getBranchList(stdout);
    if(branchList.in_array(branch)){
      return true;
    }
    else{
      return false;
    }
  });
}

exports.addBranch = function (deviceId,address,account,resourcesPath,callback)
{
  var sBaseName = path.basename(resourcesPath);
  var sLocalResourcesPath=path.join(process.env["HOME"],".resources",sBaseName);
  var cp = require('child_process');
  //var cmd = 'cd '+sLocalResourcesPath+'&& git pull '+account+'@'+address+':'+resourcesPath;
  var cmd = 'cd '+sLocalResourcesPath+'&& git remote add '+deviceId+' '+account+'@'+address+':'+resourcesPath;
  console.log(cmd);
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout+stderr);
    var cmd = 'cd '+sLocalResourcesPath+'&& git fetch '+deviceId;
    console.log(cmd);
    cp.exec(cmd,function(error,stdout,stderr){
      console.log(stdout+stderr);
      var cmd = 'cd '+sLocalResourcesPath+'&& git checkout -b '+deviceId+' '+deviceId+'/master';
      console.log(cmd);
      cp.exec(cmd,function(error,stdout,stderr){
        console.log(stdout+stderr);
        var cmd = 'cd '+sLocalResourcesPath+'&& git checkout master';
        console.log(cmd);
        cp.exec(cmd,function(error,stdout,stderr){
          console.log(stdout+stderr);
          callback(deviceId);
        });
      });
    });
  });
}

function getPullFileList(stdout){
  var line=stdout.split("\n");
  for(var index in line){
    if(line[index].indexOf('|')==-1 ){
      line.pop(line[index]);
    }
  }
  console.log("###################################"+line);
  for(var index in line){
    if(line[index].indexOf('data/')==-1){
      line.pop(line[index]);
    }
  }
  console.log("###################################"+line);
  for(var index in line){
    var endIndex=line[index].indexOf('|');
    line[index]=line[index].substring(0,endIndex).trim();
  }
  console.log("###################################"+line);
  for(var index in line){
    console.log(line[index]);
  }
  console.log("###################################"+line);
  line.shift();
  return line;
} 

exports.pullFromOtherRepo = function (resourcesPath,branch,callback)
{
  var sBaseName = path.basename(resourcesPath);
  var sLocalResourcesPath=path.join(process.env["HOME"],".resources",sBaseName);
  var cp = require('child_process');
  var cmd = 'cd '+sLocalResourcesPath+'&& git checkout '+deviceId;
  console.log(cmd);
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout+stderr);
    var cmd = 'cd '+sLocalResourcesPath+'&& git pull';
    console.log(cmd);
    cp.exec(cmd,function(error,stdout,stderr){
      console.log(stdout+stderr);
      var cmd = 'cd '+sLocalResourcesPath+'&& git checkout master';
      console.log(cmd);
      cp.exec(cmd,function(error,stdout,stderr){
        console.log(stdout+stderr);
        var cmd = 'cd '+sLocalResourcesPath+'&& git diff --name-only '+deviceId;
        console.log(cmd);
        cp.exec(cmd,function(error,stdout,stderr){
          console.log(stdout+stderr);
          var fileList=getPullFileList(stdout);
          var cmd = 'cd '+sLocalResourcesPath+'&& git merge '+deviceId;
          console.log(cmd);
          cp.exec(cmd,function(error,stdout,stderr){
            console.log(stdout+stderr);
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
exports.getGitLog = function(repoPath, callback) {
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
        var logItem = Item.split('\n');
        var tmplogItem = {};
        tmplogItem.commitID = logItem[0];
        tmplogItem.Author = logItem[1].replace(/Author:/, "");
        tmplogItem.Date = logItem[2].replace(/Date:/, "");
        if (logItem[3] == "") {
          tmplogItem.content = logItem[4];
        } else if (logItem[4]) {
          tmplogItem.content = logItem[5];
        } else {
          tmplogItem.content = logItem[3];
        }
        tmplogItem.content = JSON.parse(tmplogItem.content);
        commitLog[tmplogItem.commitID] = tmplogItem;
      }
    }
    console.log(commitLog);
    callback(null, commitLog)
  })
}

exports.repoReset = function(repoPath, commitID, callback) {
  var exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath + ' && git reset ' + commitID + ' --hard';
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn" + comstr);
  exec(comstr, function(err, stdout, stderr) {
    if (err) {
      console.log(err, stderr);
      callback({
        'repo': err
      }, null);
    } else {
      console.log('success', stdout);
      callback(null, 'success');
    }
  })
}

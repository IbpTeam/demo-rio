var path = require('path');
var git = require("nodegit");
var config = require("../config");
var filesHandle = require("../filesHandle");
var events = require('events'); 
var utils = require('../utils');

exports.repoInit = function (repoPath,callback)
{
  git.Repo.init(repoPath,false,function(initReporError, repo){
    if (initReporError) 
      throw initReporError;
    console.log("Repo init : "+repo);
    var  exec = require('child_process').exec;
    var comstr = 'cd ' + repoPath + ' && git add . && git commit -m "On device '+config.SERVERNAME+' #Init resource#"';
    console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn"+comstr);
    exec(comstr, function(error,stdout,stderr){
      if(error){
        callback("Git init error");
      }
      else{
        callback("success");
      }
    });
  });  
}

exports.repoAddsCommit = function (repoPath,files,callback)
{
  var  exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for(var k in files) {
    comstr = comstr+' && git add "'+files[k]+'"';
  }
  comstr = comstr+' && git commit -m "On device '+config.SERVERNAME+' #add : multi files.#"'
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n"+comstr);
  exec(comstr, function(error,stdout,stderr){
    if(error){
      console.log("Git add error");
    }
    else{
      console.log("Git add success");
      callback();
    }
  });
}


exports.repoRmsCommit = function (repoPath,files,callback)
{
  var  exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for(var k in files) {
    comstr = comstr+' && git rm "'+files[k]+'"';
  }
  comstr = comstr+' && git commit -m "On device '+config.SERVERNAME+' #Delete : multi files.#"'
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n"+comstr);
  exec(comstr, function(error,stdout,stderr){
    if(error){
      console.log("Git rm error");
    }
    else{
      console.log("Git rm success");
      callback();
    }
  });
}

exports.repoChsCommit = function (repoPath,files,callback)
{
  var  exec = require('child_process').exec;
  var comstr = 'cd ' + repoPath;
  for(var k in files) {
    comstr = comstr+' && git add "'+files[k]+'"';
  }
  comstr = comstr+' && git commit -m "On device '+config.SERVERNAME+' #Change : multi files.#"'
    console.log(files);
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n"+comstr);
  exec(comstr, function(error,stdout,stderr){
    if(error){
      console.log("Git change error");
    }
    else{
      console.log("Git change success");
      callback();
    }
  });
}

exports.pullFromOtherRepo = function (deviceId,address,account,repoName,callback)
{
  var dataDir=config.USERCONFIGPATH+repoName;
  var cp = require('child_process');
  var cmd = 'cd '+dataDir+'&& git pull '+account+'@'+address+':'+dataDir;
  console.log(cmd);
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout+stderr);
    callback(deviceId,account,address);
      filesHandle.watcher1Start(dataDir,filesHandle.monitorFilesCb);
  });
}

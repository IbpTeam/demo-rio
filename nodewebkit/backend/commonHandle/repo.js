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
  var commitLog='{\"device\":\"'+config.uniqueID+'\",\"op\":\"add\",'+'\"file\":['+files.join(",")+']}';
  comstr = comstr+" && git commit -m '"+commitLog+"'";
  console.log("runnnnnnnnnnnnnnnnnnnnnnnnnn:\n"+comstr);
  exec(comstr, function(error,stdout,stderr){
    if(error){
      console.log("Git add error");
      console.log(error)
    }
    else{
      console.log("Git add success");
      callback('success');
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
  var commitLog='{\"device\":\"'+config.uniqueID+'\",\"op\":\"rm\",'+'\"file\":['+files.join(",")+']}';
  comstr = comstr+" && git commit -m '"+commitLog+"'";
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
  var commitLog='{\"device\":\"'+config.uniqueID+'\",\"op\":\"ch\",'+'\"file\":['+files.join(",")+']}';
  comstr = comstr+" && git commit -m '"+commitLog+"'";
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

exports.getLatestCommit = function (repoPath,callback)
{
  console.log("getLatestCommit "+repoPath);
  //open a git repo
  git.Repo.open(path.resolve(repoPath+'/.git'), function(openReporError, repo) {
  if (openReporError) 
    throw openReporError;
  console.log("Repo open : "+repo);  
  //add the file to the index...
  repo.openIndex(function(openIndexError, index) {
    if (openIndexError) 
      throw openIndexError;
    console.log("Repo index : "+index);
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
            console.log("Repo oidForName : "+oidForName);
            //get latest commit (will be the parent commit)
            callback(head);
          });  
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
  for(var index in line){
    if(line[index].indexOf('data/')==-1){
      line.pop(line[index]);
    }
  }
  for(var index in line){
    var endIndex=line[index].indexOf('|');
    line[index]=line[index].substring(0,endIndex).trim();
  }
  for(var index in line){
    console.log(line[index]);
  }
} 

exports.pullFromOtherRepo = function (deviceId,address,account,repoName,callback)
{
  var dataDir=config.USERCONFIGPATH+repoName;
  var cp = require('child_process');
  var cmd = 'cd '+dataDir+'&& git pull '+account+'@'+address+':'+dataDir;
  console.log(cmd);
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout+stderr);
    callback(getPullFileList(stdout));
  });
}
/*
exports.pullFromOtherRepoTest = function (){
var cmd = 'cd ~/test/repo1 &&git pull ~/test/repo2';
  var cp = require('child_process');
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout);
    getPullFileList(stdout);
  });
}
*/
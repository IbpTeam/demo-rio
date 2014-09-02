var path = require('path');
var git = require("nodegit");
var config = require("./config");
var filesHandle = require("./filesHandle");
var events = require('events'); 

exports.repoAddCommit = function (repoPath,filename,event,callback)
{
      console.log("repoAddCommit file :"+ filename);
      //open a git repo
      git.Repo.open(path.resolve(repoPath+'/.git'), function(openReporError, repo) {
      if (openReporError) 
        throw openReporError;
//      console.log("Repo open : "+repo);  
      //add the file to the index...
      repo.openIndex(function(openIndexError, index) {
        if (openIndexError) 
          throw openIndexError;
//        console.log("Repo index : "+index);
        index.read(function(readError) {
          if (readError) 
            throw readError;  
//          console.log("Repo read : success");
          index.addByPath(filename.replace(repoPath+'/',''), function(addByPathError) {
            if (addByPathError) 
              throw addByPathError;
//            console.log("Repo addByPath : success");
            index.write(function(writeError) {
              if (writeError) 
                throw writeError;
//              console.log("Repo write : success"); 
              index.writeTree(function(writeTreeError, oid) {
                if (writeTreeError) 
                  throw writeTreeError;
//                console.log("Repo writeTree : success");
                //get HEAD 
                git.Reference.oidForName(repo, 'HEAD', function(oidForName, head) {
                  if (oidForName) 
                    throw oidForName;
//                  console.log("Repo oidForName : "+oidForName);
                  //get latest commit (will be the parent commit)
                  repo.getCommit(head, function(getCommitError, parent) {
                    if (getCommitError) 
                      throw getCommitError;
                    var currentTime = parseInt((new Date()).getTime()/1000);
                    console.log("time is "+currentTime);
                    var author = git.Signature.create(config.ACCOUNT, config.EMAIL, currentTime, 60);
                    var committer = git.Signature.create(config.ACCOUNT, config.EMAIL,  currentTime, 90);
                    //commit
                    var op;
                    if(event=='add')
                      op='New';
                    else if(event=='change')
                      op='Change';
                    repo.createCommit('HEAD', author, committer, op+' '+filename+' on '+config.SERVERNAME, oid, [parent], function(error, commitId) {
                      if (error) 
                        throw error;
                      console.log("New Commit:", commitId.sha());
                     /*filesHandle.repoCommitStatus = 'idle';
                    var emitter = new events.EventEmitter();
                        emitter.emit('repoCommit_idle'); 
                    console.log("emit commit next commit "+path);*/

                      callback(commitId,op);
                    });
                  });  
                });  
              });
            });
          }); 
        });  
      });
    });
}

exports.repoRmCommit = function (repoPath,filename,callback)
{
      console.log("repoRmCommit file :"+ filename);
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
          index.removeByPath(filename.replace(repoPath+'/',''));//, function(removeByPathError) {
            //if (removeByPath) 
            //  throw removeByPath;
            console.log("Repo removeByPath : success");
            index.write(function(writeError) {
              if (writeError) 
                throw writeError;
              console.log("Repo write : success"); 
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
                  repo.getCommit(head, function(getCommitError, parent) {
                    if (getCommitError) 
                      throw getCommitError;
                    var currentTime = parseInt((new Date()).getTime()/1000);
                    var author = git.Signature.create(config.ACCOUNT, config.EMAIL, currentTime, 60);
                    var committer = git.Signature.create(config.ACCOUNT, config.EMAIL, currentTime, 90);
                    //commit
                    repo.createCommit('HEAD', author, committer, 'Delete file '+filename+' on '+config.SERVERNAME, oid, [parent], function(error, commitId) {
                      if (error) 
                        throw error;
                      console.log("New Commit:", commitId.sha());
                     /*filesHandle.repoCommitStatus = 'idle';
                    var emitter = new events.EventEmitter();
                        emitter.emit('repoCommit_idle'); 
                    console.log("emit commit next commit "+path);*/
                      callback(commitId,'Delete');
                    });
                  });  
                });  
              });
            });
          //}); 
        });  
      });
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

exports.repoMergeForFirstTime = function (name,branch,address,path)
{
  filesHandle.watcherStop();
  var dataDir=require(config.USERCONFIGPATH+"config.js").dataDir;
  var cp = require('child_process');
  var cmd = 'cd '+dataDir+'&& git remote add '+name+' '+address+':'+path;
  console.log(cmd);
  cp.exec(cmd,function(error,stdout,stderr){
    console.log(stdout+stderr);
    var cmd = 'cd '+dataDir+'&& git fetch '+name;
    console.log(cmd);
    cp.exec(cmd,function(error,stdout,stderr){
      console.log(stdout+stderr);
      var cmd = 'cd '+dataDir+'&& git checkout -b '+branch+' '+name+'/master';
      cp.exec(cmd,function(error,stdout,stderr){
        console.log(stdout+stderr);
        var cmd = 'cd '+dataDir+'&& git checkout master && git merge '+branch;
        cp.exec(cmd,function(error,stdout,stderr){
          console.log(stdout+stderr);
          filesHandle.watcherStart(dataDir,filesHandle.monitorFilesCb);
        });
      });
    });
  });
}
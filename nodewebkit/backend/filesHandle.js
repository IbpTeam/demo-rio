/**
 * @Copyright:
 *
 * @Description: API for file handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.9.11
 *
 * @version:0.2.1
 **/

var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("./config");
var dataDes = require("./commonHandle/desFilesHandle");
var desktopConf = require("./data/desktop");
var commonDAO = require("./commonHandle/CommonDAO");
var resourceRepo = require("./commonHandle/repo");
var device = require("./data/device");
var util = require('util');
var events = require('events');
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");
var tagsHandles = require("./commonHandle/tagsHandle");

var writeDbNum = 0;
var dataPath;

function sleep(milliSeconds) {
  var startTime = new Date().getTime();
  while (new Date().getTime() < startTime + milliSeconds);
};
exports.sleep = sleep;

var repoCommitStatus = 'idle';
exports.repoCommitStatus = repoCommitStatus;
var addCommitList = new Array();
var rmCommitList = new Array();
var chCommitList = new Array();
var monitorFiles1Status = false;
exports.monitorFiles1Status = monitorFiles1Status;
var monitorFiles2Status = false;
exports.monitorFiles2Status = monitorFiles2Status;
var chokidar = require('chokidar');
var watcher1;
var watcher2;
var isPulledFile;

function getCategory(path) {
  var pointIndex = path.lastIndexOf('.');
  if (pointIndex == -1) {
    var itemPostfix = "none";
    var nameindex = path.lastIndexOf('/');
    var itemFilename = path.substring(nameindex + 1, path.length);
  } else {
    var itemPostfix = path.substr(pointIndex + 1);
    var nameindex = path.lastIndexOf('/');
    var itemFilename = path.substring(nameindex + 1, pointIndex);
  }
  if (itemPostfix == 'none' ||
    itemPostfix == 'ppt' ||
    itemPostfix == 'pptx' ||
    itemPostfix == 'doc' ||
    itemPostfix == 'docx' ||
    itemPostfix == 'wps' ||
    itemPostfix == 'odt' ||
    itemPostfix == 'et' ||
    itemPostfix == 'txt' ||
    itemPostfix == 'xls' ||
    itemPostfix == 'xlsx' ||
    itemPostfix == 'ods' ||
    itemPostfix == 'zip' ||
    itemPostfix == 'sh' ||
    itemPostfix == 'gz' ||
    itemPostfix == 'html' ||
    itemPostfix == 'et' ||
    itemPostfix == 'odt' ||
    itemPostfix == 'pdf' ||
    itemPostfix == 'html5ppt') {
    return {
      category: "Documents",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'jpg' || itemPostfix == 'png') {
    return {
      category: "Pictures",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'mp3' || itemPostfix == 'ogg') {
    return {
      category: "Music",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'conf' || itemPostfix == 'desktop') {
    return {
      category: "Configuration",
      filename: itemFilename,
      postfix: itemPostfix
    };
  }
}


function rmData(itemPath, itemDesPath, rmDataCb) {
  console.log("rm itemDesPath = " + itemDesPath);
  dataDes.deleteItem(itemPath, itemDesPath, rmDataCb);
}

function chData(itemPath, attrs, itemDesPath, chDataCb) {
  console.log("ch itemDesPath = " + itemDesPath);
  dataDes.updateItem(itemPath, attrs, itemDesPath, chDataCb);
}

function watcher1Start(monitorPath, callback) {
  watcher1 = chokidar.watch(monitorPath, {
    ignored: /[\/\\]\./,
    ignoreInitial: true
  });
  watcher1.on('all', function(event, path) {
    callback(path, event);
  });
}
exports.watcher1Start = watcher1Start;

function watcher1Stop(callback) {
  watcher1.close();
  callback();
}
exports.watcher1Stop = watcher1Stop;

function watcher2Start(monitorPath, callback) {
  watcher2 = chokidar.watch(monitorPath, {
    ignoreInitial: true
  });
  watcher2.on('all', function(event, path) {
    callback(path, event);
  });
}
exports.watcher2Start = watcher2Start;

function watcher2Stop(callback) {
  watcher2.close();
  callback();
}
exports.watcher2Stop = watcher2Stop;

function addFileCb(lastCallback) {
  /******************
   *write DB
   ******************/
  if (lastCallback != null) {
    lastCallback();
    return;
  }
  addCommitList.shift();
  if (addCommitList[0] != null) {
    var path = addCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    var isLoadEnd = true;
    addData(path, itemDesPath, isLoadEnd, function(isLoadEnd, oNewItem) {
      resourceRepo.repoAddCommit(config.RESOURCEPATH, path, desFilePath, addFileCb);
    });
  } else if (chCommitList[0] != null) {
    var path = chCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    fs.stat(path, function(error, stat) {
      var attrs = {
        size: stat.size,
        lastModifyTime: (new Date()).getTime(),
        lastModifyDev: config.uniqueID
      };
      chData(path, attrs, itemDesPath, function() {
        attrs.conditions = ["path='" + path + "'"];
        attrs.category = getCategory(path).category;
        var items = new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH, path, desFilePath, chFileCb);
      });
    });
  } else if (rmCommitList[0] != null) {
    var path = rmCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    rmData(path, itemDesPath, function() {
      var attrs = {
        conditions: ["path='" + path + "'"],
        category: getCategory(path).category,
        is_delete: 1
      };
      var items = new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH, path, desFilePath, rmFileCb);
    });
  } else {
    repoCommitStatus = 'idle';
    util.log("commit complete");
  }
}

function rmFileCb(lastCallback) {
  /******************
   *write DB
   ******************/
  if (lastCallback != null) {
    lastCallback();
    return;
  }
  rmCommitList.shift();
  if (rmCommitList[0] != null) {
    var path = rmCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    rmData(path, itemDesPath, function() {
      var attrs = {
        conditions: ["path='" + path + "'"],
        category: getCategory(path).category,
        is_delete: 1
      };
      var items = new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH, path, desFilePath, rmFileCb);
    });
  } else if (addCommitList[0] != null) {
    var path = addCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    var isLoadEnd = true;
    addData(path, itemDesPath, isLoadEnd, function(isLoadEnd, oNewItem) {
      resourceRepo.repoAddCommit(config.RESOURCEPATH, path, desFilePath, addFileCb);
    });
  } else if (chCommitList[0] != null) {
    var path = chCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    fs.stat(path, function(error, stat) {
      var attrs = {
        size: stat.size,
        lastModifyTime: (new Date()).getTime(),
        lastModifyDev: config.uniqueID
      };
      chData(path, attrs, itemDesPath, function() {
        attrs.conditions = ["path='" + path + "'"];
        attrs.category = getCategory(path).category;
        var items = new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH, path, desFilePath, chFileCb);
      });
    });
  } else {
    repoCommitStatus = 'idle';
    util.log("commit complete");
  }
}

function chFileCb(lastCallback) {
  /******************
   *write DB
   ******************/
  if (lastCallback != null) {
    lastCallback();
    return;
  }
  chCommitList.shift();
  if (chCommitList[0] != null) {
    var path = chCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    fs.stat(path, function(error, stat) {
      var attrs = {
        size: stat.size,
        lastModifyTime: (new Date()).getTime(),
        lastModifyDev: config.uniqueID
      };
      chData(path, attrs, itemDesPath, function() {
        attrs.conditions = ["path='" + path + "'"];
        attrs.category = getCategory(path).category;
        var items = new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH, path, desFilePath, chFileCb);
      });
    });
  } else if (addCommitList[0] != null) {
    var path = addCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    var isLoadEnd = true;
    addData(path, itemDesPath, isLoadEnd, function(isLoadEnd, oNewItem) {
      resourceRepo.repoAddCommit(config.RESOURCEPATH, path, desFilePath, addFileCb);
    });
  } else if (rmCommitList[0] != null) {
    var path = rmCommitList[0];
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    rmData(path, itemDesPath, function() {
      var attrs = {
        conditions: ["path='" + path + "'"],
        category: getCategory(path).category,
        is_delete: 1
      };
      var items = new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH, path, desFilePath, rmFileCb);
    });
  } else {
    repoCommitStatus = 'idle';
    util.log("commit complete");
  }
}

function addFile(path, callback) {
  util.log("new file " + path);
  addCommitList.push(path);
  if (repoCommitStatus == 'idle') {
    util.log("emit commit " + addCommitList[0]);
    repoCommitStatus = 'busy';
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    var isLoadEnd = true;
    console.log("itemDesPath=" + itemDesPath);
    addData(path, itemDesPath, isLoadEnd, function(isLoadEnd, oNewItem) {
      resourceRepo.repoAddCommit(config.RESOURCEPATH, path, desFilePath, addFileCb, callback);
    });
  }
}
exports.addFile = addFile;

function rmFile(path, callback) {
  util.log("remove file " + path);
  rmCommitList.push(path);
  console.log("repoCommitStatus=" + repoCommitStatus);
  if (repoCommitStatus == 'idle') {
    util.log("emit commit " + rmCommitList[0]);
    repoCommitStatus = 'busy';
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = config.RESOURCEPATH + "/.des/" + addPath;
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    rmData(path, itemDesPath, function() {
      var attrs = {
        conditions: ["path='" + path + "'"],
        category: getCategory(path).category,
        is_delete: 1
      };
      var items = new Array();
      items.push(attrs);
      resourceRepo.repoRmCommit(config.RESOURCEPATH, path, desFilePath, rmFileCb, callback);
    });
  }
}
exports.rmFile = rmFile;

function chFile(path, callback) {
  util.log("change file " + path);
  chCommitList.push(path);
  if (repoCommitStatus == 'idle') {
    util.log("emit commit " + chCommitList[0]);
    repoCommitStatus = 'busy';
    var nameindex = path.lastIndexOf('/');
    var addPath = path.substring(config.RESOURCEPATH.length + 1, nameindex);
    var itemDesPath = pathModule.join(config.RESOURCEPATH, ".des", addPath);
    var fileName = path.substring(nameindex + 1, path.length);
    var desFilePath = itemDesPath + "/" + fileName + ".md";
    fs.stat(path, function(error, stat) {
      var attrs = {
        size: stat.size,
        lastModifyTime: stat.mtime,
        lastModifyDev: config.uniqueID
      };
      chData(path, attrs, itemDesPath, function() {
        attrs.conditions = ["path='" + path + "'"];
        attrs.category = getCategory(path).category;
        var items = new Array();
        items.push(attrs);
        console.log(items);
        resourceRepo.repoChCommit(config.RESOURCEPATH, path, desFilePath, chFileCb, callback);
      });
    });
  }
}
exports.chFile = chFile;

/**
 * @method monitorDesFilesCb
 *   监视描述文件功能的回调函数
 *
 * @param1 path
 *   监视的路径
 *
 * @param2 event
 *   监视到的事件
 *    新建add， 删除unlink， 更改change
 */
function monitorDesFilesCb(path, event) {
  util.log(event + '  :  ' + path);
  switch (event) {
    case 'add':
      {
        console.log("add des file @@@@@@@@@@@@@@@@@@@@@");
        dataDes.getAttrFromFile(path, function(item) {
          if (item.category === "Configuration") {
            console.log("desktop configuration added !");
            return;
          }
          var items = [];
          items.push(item);
          if (item.others != "" && item.others != null) {
            var tags = item.others.split(",");
            for (var k in tags) {
              //create new entry in table 'tags'
              var itemTemp = {
                category: "tags",
                file_uri: item.URI,
                tag: tags[k]
              };
              items.push(itemTemp);
            }
          }
          commonDAO.createItems(items, function(result) {
            console.log(result);
          });
        });
      }
      break;
    case 'unlink':
      {
        console.log("unlink des file @@@@@@@@@@@@@@@@@@@@@");
        var desPathIndex = path.lastIndexOf(".des");
        var filePath = path.substring(desPathIndex, path.length);
        var nextIndex = filePath.indexOf("/");
        filePath = filePath.substring(nextIndex + 1, filePath.length);
        console.log("filePath = " + filePath);
        var mdIndex = filePath.lastIndexOf(".md");
        var origPath = config.RESOURCEPATH + "/" + filePath.substring(0, mdIndex);
        console.log("origPath = " + origPath);
        var category = getCategory(origPath).category;
        if (category === "Configuration") {
          console.log("desktop configuration file deleted !");
          console.log("Path: " + path);
          return;
        }
        var categorys = [category];
        var condition = ["path='" + origPath.replace("'", "''") + "'"];
        commonDAO.findItems(null, categorys, condition, null, function(err, resultFind) {
          if (err) {
            console.log(err);
            return;
          }
          if (resultFind.length == 1) {
            var tags = (resultFind[0].others).split(",");
            var uri = resultFind[0].URI;
            var itemToDelete = [];
            for (var k in tags) {
              var con = ["tag='" + tags[k].replace("'", "''") + "'", "file_uri='" + uri.replace("'", "''") + "'"];
              var itemTemp = {
                conditions: con,
                category: "tags"
              };
              itemToDelete.push(itemTemp);
            }
            var attrs = {
              conditions: condition,
              category: category,
            };
            itemToDelete.push(attrs);
            console.log(itemToDelete);
            //delete tag-uri form table 'tags' first
            commonDAO.deleteItems(itemToDelete, function(resultDelete) {
              if (resultDelete == "commit") {
                console.log("delete sucess");
              } else {
                console.log("delete items error!");
                return;
              }
            });
          } else {
            console.log("findItems result size error!");
            return;
          }
        });
      }
      break;
    case 'change':
      {
        console.log("change des file @@@@@@@@@@@@@@@@@@@@@");
        dataDes.getAttrFromFile(path, function(item) {
          var category = item.category;
          var path = "";
          var condition = [];
          if (category === "Configuration") {
            console.log("desktop configuration chenges!")
            return;
          } else if (category === "Contacts") {
            condition.push("name='" + item.name + "'");
          } else {
            path = (item.path).replace("'", "''");
            condition.push("path='" + path + "'");
          }
          commonDAO.findItems(null, category, condition, null, function(err, resultFind) {
            if (err) {
              console.log(err);
              return;
            }
            if (resultFind.length == 1) {
              var tags = (resultFind[0].others).split(",");
              var uri = resultFind[0].URI;
              var itemToDelete = [];
              if (category !== "Documents" &&
                category !== "Pictures" &&
                category !== "Music" &&
                category !== "Vedios") {
                commonDAO.updateItem(item, function(resultUpdate) {
                  console.log(resultUpdate);
                });
              } else {
                for (var k in tags) {
                  var itemTemp = {
                    file_uri: uri,
                    category: "tags",
                    tag: tags[k]
                  };
                  itemToDelete.push(itemTemp);
                }
                //delete tag-uri form table 'tags' first
                commonDAO.deleteItems(itemToDelete, function(resultDelete) {
                  if (resultDelete == "commit") {
                    var items = new Array();
                    item.conditions = condition;
                    items.push(item);
                    commonDAO.updateItems(items, function(resultUpdate) {
                      console.log(resultUpdate);
                    });
                  } else {
                    console.log("delete items error!");
                    return;
                  }
                });
              }
            } else {
              console.log("findItems result size error!");
              return;
            }
          });
        });
      }
      break;
  }
}
exports.monitorDesFilesCb = monitorDesFilesCb;

function monitorFilesCb(path, event) {
  util.log(event + '  :  ' + path);
  var res = path.match(/.git/);
  if (res != null) {
    //util.log(res);
  } else {
    switch (event) {
      case 'add':
        {
          addFile(path);
        }
        break;
      case 'unlink':
        {
          rmFile(path);
        }
        break;
      case 'change':
        {
          chFile(path);
        }
        break;
    }
  }
}
exports.monitorFilesCb = monitorFilesCb;

function monitorDesFiles(monitorPath, callback) {
  if (monitorFiles2Status == true) {
    return;
  }
  monitorFiles2Status = true;
  watcher2Start(monitorPath, callback);
}
exports.monitorDesFiles = monitorDesFiles;

function monitorFiles(monitorPath, callback) {
  if (monitorFiles1Status == true) {
    return;
  }
  monitorFiles1Status = true;
  watcher1Start(monitorPath, callback);
}
exports.monitorFiles = monitorFiles;


function copyFile(callback, oldPath, newPath) {
  var repeat = 0;
  console.log(newPath);
  fs.exists(newPath, function(isExists) {
    if (isExists) {
      console.log('exiiiiiiiiiiiists',newPath);
      var pointIndex = newPath.lastIndexOf('.');
      var nameindex = newPath.lastIndexOf('/');
      if (pointIndex == -1) {
        var itemPostfix = "none";
        var itemFilename = newPath.substring(nameindex + 1, newPath.length);
      } else {
        var itemPostfix = newPath.substr(pointIndex + 1);
        var itemFilename = newPath.substring(nameindex + 1, pointIndex);
      }
      repeat++;
      newPath = newPath.substr(0, nameindex) + itemFilename + '(' + repeat + ')' + itemPostfix;
      copyFile(callback, oldPath, newPath);
    } else {
      fs_extra.copy(oldPath, newPath, function(err) {
        if (err) {
          console.log(err);
          return;
        }
        callback('success');
      })
    }
  })
}


//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因
function updateDataValue(updateDataValueCb, items) {
  //all items should include it's file path
  console.log("Request handler 'updateDataValue' was called.");
  dataDes.updateItems(items, function(result) {
    if (result === "success") {
      var files = [];
      for (var k in items) {
        var desFilePath;
        if (items[k].category === "Contact") {
          desFilePath = config.RESOURCEPATH + '/.des/contacts/' + items[k].name + '.md';
        } else {
          desFilePath = (items[k].path.replace(/\/resources\//, '/resources/.des/')) + '.md';
        }
        files.push(desFilePath);
      }
      resourceRepo.repoChsCommit(config.RESOURCEPATH, files, null, function() {
        updateDataValueCb('success');
      });
    } else {
      console.log("error in update des file!");
      return;
    }
  });
}
exports.updateDataValue = updateDataValue;

//get the catefory from URI
function getCategoryByUri(sUri) {
  var pos = sUri.lastIndexOf("#");
  var cate = sUri.slice(pos + 1, sUri.length);
  return cate;
}

//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataByUri(rmDataByUriCb, uri) {
  console.log("Rm data : " + uri);

  function getItemByUriCb(err, items) {
    if (err) {
      console.log(err);
      rmDataByUriCb("NOEXIST");
      return;
    }
    console.log("Rm data : ");
    console.log(items);
    fs.unlink(items[0].path, function(err) {
      if (err) {
        console.log(err);
        rmDataByUriCb("error");
      } else {
        console.log("Rm data success");
        rmDataByUriCb("success");
      }
    });
  }
  var sTableName = getCategoryByUri(uri);
  commonDAO.findItems(null, sTableName, ["URI = " + "'" + uri + "'"], null, getItemByUriCb);
}
exports.rmDataByUri = rmDataByUri;


function monitorNetlink(path) {
  util.log('neeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeet ' + path);
  /*fs.watch(path, function (event, filename) {
    TODO:would cause problem,needs to be modify.
    config.riolog('event is: ' + event);
    if(filename){
      config.riolog('filename provided: ' + filename);
      sleep(5000);
      config.SERVERIP=config.getAddr();
      config.SERVERNAME=os.hostname()+'('+config.SERVERIP+')';
    } 
    else{
      config.riolog('filename not provided');
    }
  });*/
}
exports.monitorNetlink = monitorNetlink;

function openFileByPath(path, callback) {
  var exec = require('child_process').exec;
  var comstr = "bash ./backend/vnc/open.sh -doc \"" + path + "\"";
  //var comstr = "xdg-open " + path;
  console.log("run vncserver and websockify server ......");
  console.log("path server: ", comstr);
  exec(comstr, function(error, stdout, stderr) {
    sys.print('stdout: ' + stdout);
    callback(stdout);
    sys.print('stderr: ' + error);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
exports.openFileByPath = openFileByPath;

function closeVNCandWebsockifyServer(port, callback) {
  var exec = require('child_process').exec;
  var comstr = "bash ./backend/vnc/close.sh \"" + port + "\"";
  //var comstr = "xdg-open " + path;
  console.log("closr vncserver and websockify server ......");
  exec(comstr, function(error, stdout, stderr) {
    sys.print('stdout: ' + stdout);
    callback(stdout);
    sys.print('stderr: ' + error);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  });
}
exports.closeVNCandWebsockifyServer = closeVNCandWebsockifyServer;

function mkdirSync(dirpath, mode, callback) {
  path.exists(dirpath, function(exists) {
    if (exists) {
      callback(dirpath);
    } else {
      //尝试创建父目录，然后再创建当前目录
      mkdirSync(path.dirname(dirpath), mode, function() {
        fs.mkdir(dirpath, mode, callback);
      });
    }
  });

};
exports.mkdirSync = mkdirSync;

function firstSync() {

  resourceRepo.pullFromOtherRepo("192.168.160.72",
    "/home/v1/resources",
    function() {
      console.log("merge success!");
    });
}
exports.firstSync = firstSync;

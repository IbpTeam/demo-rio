var path = require("path");
var fs = require('fs');
var exec = require('child_process').exec;
var desktopConf = require("./data/desktop");
var contacts = require("./data/contacts");
var documents = require("./data/document");
var pictures = require("./data/picture");
var video = require("./data/video");
var music = require("./data/music");
var music = require("./data/music");
var devices = require("./data/device");
var other = require('./data/other')
var commonDAO = require("./commonHandle/CommonDAO");
//@const
var DATA_DIR = "data";

function parsePath(path) {
  var pathNodes = path.split('/');
  var pathNew = '';
  for (var i = 0; i < pathNodes.length; i++) {
    if (pathNodes[i].indexOf(' ') != -1) {
      pathNew += "'" + pathNodes[i] + "'/";
    } else {
      pathNew += pathNodes[i] + '/';
    }
  }
  pathNew = pathNew.substring(0, pathNew.length - 1);
  return pathNew;
}
exports.parsePath = parsePath;

function getCategoryByPath(path) {
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
      category: "document",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'jpg' || itemPostfix == 'png') {
    return {
      category: "picture",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'mp3') {
    return {
      category: "music",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'ogg') {
    return {
      category: "video",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else if (itemPostfix == 'conf' || itemPostfix == 'desktop') {
    return {
      category: "configuration",
      filename: itemFilename,
      postfix: itemPostfix
    };
  } else {
    return {
      category: "other",
      filename: itemFilename,
      postfix: itemPostfix
    }
  }
}
exports.getCategoryByPath = getCategoryByPath;

//get the category from URI
function getCategoryByUri(sUri) {
  var pos = sUri.lastIndexOf("#");
  var cate = sUri.slice(pos + 1, sUri.length);
  return cate;
}
exports.getCategoryByUri = getCategoryByUri;

//get the category 
exports.getCategoryObject = function(category) {
  switch (category) {
    case "contact":
      {
        return contacts;
      }
      break;
    case "picture":
      {
        return pictures;
      }
      break;
    case "document":
      {
        return documents;
      }
      break;
    case "music":
      {
        return music;
      }
      break;
    case "video":
      {
        return video;
      }
      break;
    case "desktop":
      {
        return desktopConf;
      }
      break;
    default:
      return other;
  }
}

//get the category from URI
exports.getCategoryObjectByUri = function(sUri) {
  var cate = getCategoryByUri(sUri);
  switch (cate) {
    case "contact":
      {
        return contacts;
      }
      break;
    case "picture":
      {
        return pictures;
      }
      break;
    case "document":
      {
        return documents;
      }
      break;
    case "music":
      {
        return music;
      }
      break;
    case "video":
      {
        return video;
      }
      break;
    case "desktop":
      {
        return desktopConf;
      }
      break;
    default:
      return other;
  }
}

//get the category from Des
exports.getCategoryObjectByDes = function(sDesName) {
  switch (sDesName) {
    case "contactDes":
      {
        return contacts;
      }
      break;
    case "pictureDes":
      {
        return pictures;
      }
      break;
    case "documentDes":
      {
        return documents;
      }
      break;
    case "musicDes":
      {
        return music;
      }
      break;
    case "videoDes":
      {
        return video;
      }
      break;
    case "desktopDes":
      {
        return desktopConf;
      }
      break;
    default:
      return other;
  }
}

//example: ~/.resources/documentDes/data/$FILENAME
exports.getDesPath = function(category, fullName) {
  var sDirName = category + "Des";
  var sDesName = fullName + ".md";
  return path.join(process.env["HOME"], ".resources", sDirName, DATA_DIR, sDesName);
}

//example: ~/.resources/document/data/$FILENAME
exports.getRealPath = function(category, fullName) {
  return path.join(process.env["HOME"], ".resources", category, DATA_DIR, fullName);
}

//example: ~/.resources/document/data
exports.getRealDir = function(category) {
  return path.join(process.env["HOME"], ".resources", category, DATA_DIR);
}

//example: ~/.resources/documentDes/data
exports.getDesDir = function(category) {
  var sDirName = category + "Des";
  return path.join(process.env["HOME"], ".resources", sDirName, DATA_DIR);
}

//example: ~/.resources/document
exports.getRepoDir = function(category) {
  var sDirName = category;
  return path.join(process.env["HOME"], ".resources", sDirName);
}

//example: ~/.resources/documentDes
exports.getDesRepoDir = function(category) {
  var sDirName = category + "Des";
  return path.join(process.env["HOME"], ".resources", sDirName);
}

exports.getRealRepoDir = function(category) {
  return path.join(process.env["HOME"], ".resources", category);
}

exports.getHomeDir = function() {
  return process.env["HOME"];
}

exports.getXdgDataDirs = function() {
  return process.env["XDG_DATA_DIRS"].split(':');
}


//get file name with postfix from a path
exports.getFileNameByPath = function(sPath) {
  var nameindex = sPath.lastIndexOf('/');
  return sPath.substring(nameindex + 1, sPath.length);
}

//get file name without postfix from a path
exports.getFileNameByPathShort = function(sPath) {
  var nameindex = sPath.lastIndexOf('/');
  var posindex = sPath.lastIndexOf('.');
  return sPath.substring(nameindex + 1, posindex);
}

//get file postfix from a path
exports.getPostfixByPathShort = function(sPath) {
  var posindex = sPath.lastIndexOf('.');
  return sPath.substring(posindex + 1, sPath.length);
}

exports.renameExists = function(allFiles) {
  var fileNameBase = {};
  var k = 0;
  for (var i = 0; i < allFiles.length; i++) {
    var item = allFiles[i];
    var fileName = item.filename+'.'+item.postfix;
    if (!fileNameBase.hasOwnProperty(fileName)) {
      fileNameBase[fileName] = true;
    } else {
      while (fileNameBase.hasOwnProperty(fileName)) {
        k++;
        fileName = item.filename+ '(' + k + ').'+item.postfix;
      }
      allFiles[i].filename = item.filename+ '(' + k + ')';
      k = 0;
    }
  }
  return allFiles;
}

exports.isNameExists = function(sFilePath, callback) {
  var category = getCategoryByPath(sFilePath).category;
  var sFileName = getCategoryByPath(sFilePath).filename;
  var sPostfix = getCategoryByPath(sFilePath).postfix;
  var columns = ['filename', 'postfix'];
  var tables = [category];
  var conditions = ["postfix = '" + sPostfix + "'", "filename = '" + sFileName + "'"];
  commonDAO.findItems(columns, tables, conditions, null, function(err, result) {
    if (err) {//something wrong
      console.log('find ' + sFilePath + ' error!');
      return callback(err, null);
    } else if (result == [] || result == '' || !result) {//target name not exists
      return callback(null, null);
    }
    var sName = result[0].filename + '.' + result[0].postfix;//target name exists
    callback(null, sName);
  })
}

exports.getRecent = function(items, num) {
  var Data = {};
  var DataSort = [];
  for (var k = 0; k < items.length; k++) {
    var item = items[k];
    var sKey = Date.parse(item.lastAccessTime);
    Data[sKey + k] = item;
    DataSort.push(sKey + k);
  }
  var oNewData = [];
  DataSort.sort();
  for (var k in DataSort) {
    oNewData.push(Data[DataSort[k]]);
  }
  var DataByNum = oNewData.slice(0, num);
  return DataByNum;
}

exports.findFilesFromSystem = function(targe, callback) {
  if (typeof callback !== 'function')
    throw 'Bad type for callback';
  var sCommand = 'locate ' + targe;
  exec(sCommand, function(err, stdout, stderr) {
    if (err) {
      console.log('find ' + targe + ' error!');
      console.log(err, stderr);
      return callback(err, null);
    } else if (stdout == '') {
      var _err = "Not find at all!";
      console.log(_err);
      return callback(_err, null);
    }
    var result = [];
    var reg_isLocal = /\/[a-z]+\/[a-z]+\/.resources\/[a-z]+\/data\//gi;
    list = stdout.split('\n');
    for (var i = 0; i < list.length; i++) {
      if (!reg_isLocal.test(list[i])) {
        result.push(list[i]);
      }
    }
    console.log('result: \n', result);
    callback(null, result);
  });
}

exports.isExist = function(entry, array) {
  for (var i = 0; i < array.length; i++) {
    if (entry === array[i])
      return true;
  }
  return false;
}

// fnArr_: [
//  {
//    fn: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
//    pera: {} (type: Object)
//  },
//  ...
// ],
// callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
//
// example:
//  Serialize.series([
//    {
//      fn: function(pera_, callback_) {
//        // do something
//        callback_(null, ret); // should be the last sentence
//      },
//      pera: {}
//    },
//    {
//      fn: function(pera_, callback_) {
//        // do something
//        callback_(null, ret); // should be the last sentence
//      }
//    },
//    ...
//  ], function(err_, rets_) {
//    //rets_[i] = fnArr_[i]'s ret
//  });
//
function series(fnArr_, callback_) {
  if(!Array.isArray(fnArr_)) {
    console.log('bad type for series, should be an array');
    return ;
  }
  var cb = callback_ || function() {};
  var complete = 0, rets = [];
  var doSeries = function(iterator_) {
    var iterate = function() {
      iterator_(fnArr_[complete], function(err_) {
        if(err_) {
          callback_(err_);
        } else {
          complete += 1;
          if(complete >= fnArr_.length) {
            cb(null, rets);
          } else {
            iterate();
          }
        }
      });
    };
    iterate();
  };
  doSeries(function(fn_, callback_) {
    fn_.fn(fn_.pera, function(err_, ret_) {
      rets[complete] = ret_;
      callback_(err_, ret_);
    });
  });
}
exports.series = series;

// peraArr_: [
//  {
//    arg1: value,
//    arg2: value,
//    ...
//  },
//  ...
// ],
// fn_: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
// callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
//
// example:
//  Serialize.series1([
//    {
//      arg1: value,
//      arg2: value,
//      ...
//    },
//    ...
//  ], function(pera_, callback_) {
//    // do something
//    callback_(null, ret); // should be the last sentence
//  }, function(err_, rets_) {
//    //rets_[i] = fnArr_[i]'s ret
//  });
//
function series1(peraArr_, fn_, callback_) {
  var fnArr = [];
  for(var i = 0; i < peraArr_.length; ++i) {
    fnArr[i] = {
      'fn': fn_,
      'pera': peraArr_[i]
    };
  }
  series(fnArr, callback_);
}
exports.series1 = series1;

function parallel(fnArr_, callback_) {
  if(!Array.isArray(fnArr_)) {
    console.log('bad type for series, should be an array');
    return ;
  }
  var cb_ = callback_ || function() {},
      toComplete = fnArr_.length,
      rets = [];
  var doParallel = function(parallellor_) {
    for(var i = 0; i < fnArr_.length; ++i) {
      parallellor_(fnArr_[i], i, function(err_) {
        if(err_) {
          callback_(err_);
        } else {
          toComplete--;
          if(toComplete == 0) {
            cb_(null, rets);
          }
        }
      });
    }
  };
  doParallel(function(fn_, num_, callback_) {
    fn_.fn(fn_.pera, function(err_, ret_) {
      rets[num_] = ret_;
      callback_(err_, ret_);
    });
  });
}
exports.parallel = parallel;

function parallel1(peraArr_, fn_, callback_) {
  var fnArr = [];
  for(var i = 0; i < peraArr_.length; ++i) {
    fnArr[i] = {
      'fn': fn_,
      'pera': peraArr_[i]
    };
  }
  parallel(fnArr, callback_);
}
exports.parallel1 = parallel1;
  
function readJSONFile(path_, callback_) {
  var cb_ = callback_ || function() {};
  fs.readFile(path_, 'utf8', function(err_, data_) {
    if(err_) return cb_('Fail to load file: ' + err_);
    try {
      json = JSON.parse(data_);
      return cb_(null, json);
    } catch(e) {
      return cb_(e);
    }
  });
}
exports.readJSONFile = readJSONFile;

function writeJSONFile(path_, json_, callback_) {
  var cb_ = callback_ || function() {};
  try {
    fs.writeFile(path_, JSON.stringify(json_, null, 2), function(err_) {
      if(err_) return cb_(err_);
      cb_(null);
    });
  } catch(e) {
    return cb_(e);
  }
}
exports.writeJSONFile = writeJSONFile;

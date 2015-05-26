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
var Q = require('q');

//@const
var CATEGORY_NAME = "video";


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
function createData(items) {
  return commonHandle.dataStore(items, extraInfo);
}
exports.createData = createData;

function extraInfo(item, callback) {
  var deferred = Q.defer();
  readVideoMetadata(item, function(err, metadata) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      var _extra = {
        format_long_name: metadata.format_long_name,
        width: metadata.width,
        height: metadata.height,
        display_aspect_ratio: metadata.display_aspect_ratio,
        pix_fmt: metadata.pix_fmt,
        duration: metadata.duration,
        major_brand: metadata.major_brand,
        minor_version: metadata.minor_version,
        compatible_brands: metadata.compatible_brands,
      }
      deferred.resolve(_extra);
    }
  });
  return deferred.promise;
}


function getOpenInfo(item) {
  if (item == null) {
    config.riolog("read data : " + item);
    return undefined;
  }
  config.riolog("read data : " + item.path);
  var source;
  if (item.postfix == null) {
    source = {
      openmethod: 'alert',
      content: item.path + ' can not be recognized.'
    };
  } else {
    switch (item.postfix) {
      case 'ogg':
      case 'OGG':
        source = {
          openmethod: 'html',
          format: 'video',
          title: '文件浏览',
          content: item.path
        }
        break;
      case 'mp4':
      case 'MP4':
        source = {
          openmethod: 'html',
          format: 'video',
          title: '文件浏览',
          content: item.path
        }
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
          default: s_command = "xdg-open \"" + item.path + "\"";
          break;
        }

        var _exec = require('child_process');
        _exec.exec(s_command, function() {});

        if (supportedKeySent === true) {
          source.windowname = s_windowname;
        }
        break;
    }
  }
  return source;
}
exports.getOpenInfo = getOpenInfo;


/*TODO: rewrite */
function rename(sUri, sNewName, callback) {
  commonHandle.renameDataByUri(CATEGORY_NAME, sUri, sNewName, function(err, result) {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  })
}
exports.rename = rename;

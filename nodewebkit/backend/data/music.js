/**
 * @Copyright:
 *
 * @Description: Music Handle.
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
var utils = require('../utils');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');
var rdfHandle = require('../commonHandle/rdfHandle');
var typeHandle = require('../commonHandle/typeHandle');
var Q = require('q');

//@const
var CATEGORY_NAME = "music";


function getTagsFromString(str) {
  var tags = {
    format: null,
    bit_rate: null,
    frequency: null,
    track: null,
    TDRC: null,
    APIC: null,
    TALB: null,
    TPE1: null,
    TIT2: null,
    TXXX: null,
    COMM: null
  };
  var line1 = str.split("\n");
  for (var index1 in line1) {
    if (line1[index1] == "") {
      line1.pop(line1[index1]);
    } else {
      if (line1[index1].lastIndexOf("- ") >= 0) {
        var line2 = str.split(",");
        for (var index2 in line2) {
          if (line2[index2].lastIndexOf("MPEG") >= 0) {
            tags.format = (line2[index2].substring(line2[index2].lastIndexOf("MPEG"), line2[index2].length)).replace(/(^\s*)|(\s*$)/g, '');
          } else if (line2[index2].lastIndexOf("bps") >= 0) {
            tags.bit_rate = (line2[index2].substring(0, line2[index2].lastIndexOf("bps"))).replace(/(^\s*)|(\s*$)/g, '');
          } else if (line2[index2].lastIndexOf("Hz") >= 0) {
            tags.frequency = (line2[index2].substring(0, line2[index2].lastIndexOf("Hz"))).replace(/(^\s*)|(\s*$)/g, '');
          } else if (line2[index2].lastIndexOf("seconds") >= 0) {
            tags.track = (line2[index2].substring(0, line2[index2].lastIndexOf("seconds"))).replace(/(^\s*)|(\s*$)/g, '');
          }
        }
      } else if (line1[index1].indexOf("TDRC=") >= 0) {
        tags.TDRC = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      } else if (line1[index1].indexOf("APIC=") >= 0) {
        tags.APIC = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      } else if (line1[index1].indexOf("TALB=") >= 0) {
        tags.TALB = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      } else if (line1[index1].indexOf("TPE1=") >= 0) {
        tags.TPE1 = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      } else if (line1[index1].indexOf("TIT2=") >= 0) {
        tags.TIT2 = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      } else if (line1[index1].indexOf("TXXX=") >= 0) {
        tags.TXXX = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      } else if (line1[index1].indexOf("COMM=") >= 0) {
        tags.COMM = (line1[index1].substring(line1[index1].indexOf("=") + 1, line1[index1].length)).replace(/(^\s*)|(\s*$)/g, '');
      }
    }
  }
  return tags;
}

function getPropertyInfo(path, callback) {
  var cp = require('child_process');
  var cmd = 'mutagen-inspect ' + '"' + path + '"';
  cp.exec(cmd, function(error, stdout, stderr) {
    if (error) {
      callback(error);
    } else {
      callback(error, getTagsFromString(stdout));
    }
  });
}
exports.getPropertyInfo = getPropertyInfo;


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
          format: 'audio',
          title: '文件浏览',
          content: item.path
        }
        break;
      case 'mp3':
      case 'MP3':
        source = {
          openmethod: 'html',
          format: 'audio',
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


function getMusicPicData(filePath, callback) {
  var ID3 = require('id3v2-parser');
  var stream = require('fs').createReadStream(filePath);
  var parser = stream.pipe(new ID3());
  var picData = false;

  function backupIcon(callback_) {
    var option = {
      encoding: 'base64'
    }
    var backup_icon = pathModule.join(config.PROJECTPATH, '/app/demo-rio/newdatamgr/icons/music_180_180.png');
    fs.readFile(backup_icon, option, function(err, buffer_base64) {
      if (err) {
        return callback_(err, null);
      }
      return callback_(null, buffer_base64);
    })
  }
  parser.on('error', function() {
    //if error, then read a backup icon in local.
    return backupIcon(callback);
  });
  parser.on('data', function(tag) {
    if (tag.type == 'APIC') {
      picData = (tag.value.data).toString('base64');
    }
  });
  stream.on('close', function() {
    if (picData) {
      return callback(null, picData);
    } else {
      //if no music thumbnail found, then read a backup icon in local.
      return backupIcon(callback);
    }
  });
}
exports.getMusicPicData = getMusicPicData;
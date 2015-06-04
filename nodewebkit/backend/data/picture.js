/**
 * @Copyright:
 *
 * @Description: Pictures Handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.10.28
 *
 * @version:0.3.0
 **/

var http = require("http");
var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var git = require("nodegit");
var fs = require('fs');
var fs_extra = require('fs-extra');
var os = require('os');
var config = require("../config");
var util = require('util');
var utils = require('../utils');
var events = require('events');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');
var Q = require('q');

//@const
var CATEGORY_NAME = "picture";


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

function extraInfo(category) {
  var _extra = {
    location: "Mars"
  }
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
  var source;
  if (item.postfix == null) {
    source = {
      openmethod: 'alert',
      content: item.path + ' can not be recognized.'
    };
  } else {
    switch (item.postfix) {
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

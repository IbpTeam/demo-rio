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
var config = require("systemconfig");


//@const
var CATEGORY_NAME = "document";


function getPropertyInfo(param, callback) {
  return callback(null, {
    project: "shanghai project"
  })
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
      case 'pdf':
      case 'PDF':
        source = {
          openmethod: 'pdf',
          format: 'pdffile',
          title: '文件浏览',
          content: item.path
        }
        break;
      case 'txt':
      case 'TXT':
        source = {
          openmethod: 'html',
          format: 'txtfile',
          title: '文件浏览',
          content: item.path
        }
        break;
      case 'html5ppt':
      case 'HTML5PPT':
        source = {
          openmethod: 'html',
          format: 'html5ppt',
          title: '文件浏览',
          content: item.path.substring(0, item.path.lastIndexOf('.')) + '/index.html'
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
          case 'pdf':
          case 'PDF':
            break;
          case 'ppt':
          case 'PPT':
            s_command = "wpp \"" + item.path + "\"";
            supportedKeySent = true;
            var h = item.path.lastIndexOf('/');
            s_windowname = item.path.substring(h < 0 ? 0 : h + 1, item.path.length);
            break;
          case 'pptx':
          case 'PPTX':
            s_command = "wpp \"" + item.path + "\"";
            supportedKeySent = true;
            var h = item.path.lastIndexOf('/');
            s_windowname = item.path.substring(h < 0 ? 0 : h + 1, item.path.length);
            break;
          case 'doc':
          case 'DOC':
            s_command = "wps \"" + item.path + "\"";
            break;
          case 'docx':
          case 'DOCX':
            s_command = "wps \"" + item.path + "\"";
            break;
          case 'xls':
          case 'XLS':
            s_command = "et \"" + item.path + "\"";
            break;
          case 'xlsx':
          case 'XLSX':
            s_command = "et \"" + item.path + "\"";
            break;
          default:
            s_command = "xdg-open \"" + item.path + "\"";
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




/**
 * @Copyright:
 *
 * @Description: Documents Handle.
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.11.15
 *
 * @version:0.3.2
 **/
var pathModule = require('path');
var fs = require('fs');
var config = require("systemconfig");

//@const
var CATEGORY_NAME = "other";


function getPropertyInfo(param, callback) {
  return callback(null, {})
}
exports.getPropertyInfo = getPropertyInfo;


function getOpenInfo(item) {
  if (item == null) {
    config.riolog("read data : " + item);
    return undefined;
  }
  config.riolog("read data : " + item.path);

  var source = {
    openmethod: 'alert',
    content: item.path + ' can not be recognized.'
  };

  var _exec = require('child_process');
  var s_command = "xdg-open \"" + item.path + "\"";
  _exec.exec(s_command, function() {});

  return source;
}
exports.getOpenInfo = getOpenInfo;

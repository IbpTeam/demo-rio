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
var config = require("../config");
var utils = require('../utils');
var tagsHandle = require('../commonHandle/tagsHandle');
var commonHandle = require('../commonHandle/commonHandle');
var typeHandle = require('../commonHandle/typeHandle');
var uniqueID = require("../uniqueID");

//@const
var CATEGORY_NAME = "other";


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
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain error info as below
 *                error: "createData: commonHandle createData error"
 *                error: "createData: items should be an array"
 *                error: "createData: commonHandle createData all error"
 *                error: "createData: input error"
 *
 *    @param2: result,
 *        string, retrieve 'success' when success
 *
 */
function createData(items) {
  return commonHandle.dataStore(items, extraInfo);
}
exports.createData = createData;


function extraInfo(item) {
  return getExtraInfo(item)
    .then(function(info_) {
      return typeHandle.getProperty(CATEGORY_NAME)
        .then(function(property_list_) {
          for (var _property in property_list_) {
            property_list_[_property] = info_[_property] || "undefined";
          }
          return property_list_;
        });
    });
}


function getExtraInfo(item, callback) {
  var deferred = Q.defer();
  getPropertyInfo(item, function(err, result) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      deferred.resolve(result);
    }
  });
  return deferred.promise;
}


function getPropertyInfo(param, callback) {
  return callback(null, {})
}


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
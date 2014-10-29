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
var config = require("../config");
var commonDAO = require("../commonHandle/CommonDAO");
var resourceRepo = require("../commonHandle/repo");
var utils = require('../utils');
var commonHandle = require('../commonHandle/commonHandle');

//@const
var CATEGORY_NAME = "video";

/**
 * @method removeVideoByUri
 *    Remove Video by uri.
 * @param uri
 *    The Video's URI.
 * @param callback
 *    Callback
 */
function removeVideoByUri(uri, callback) {
  getVideoByUri(uri, function(err, items) {
    if (err)
      console.log(err);
    //Remove real file
    fs.unlink(items[0].path, function(err) {
      if (err) {
        console.log(err);
        callback("error");
      } else {
        //Remove Des file
        //Delete in db
        //Git commit
        commonHandle.removeFile(CATEGORY_NAME, items[0], callback);
      }
    });
  });
}
exports.removeVideoByUri = removeVideoByUri;

/**
 * @method getVideoByUri
 *    Get Video info in db.
 * @param uri
 *    The Video's URI.
 * @param callback
 *    Callback
 */
function getVideoByUri(uri, callback) {
  commonHandle.getItemByUri(CATEGORY_NAME, uri, callback);
}
exports.getVideoByUri = getVideoByUri;
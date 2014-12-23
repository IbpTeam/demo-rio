var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var fs = require('fs');
var config = require("../config");
var dataDes = require("./desFilesHandle");
var commonDAO = require("./CommonDAO");
var repo = require("./repo");
var utils = require("../utils");

/**
 * @method pickTags
 *   pick possible tags from path
 *   this will check the string between each two "/"
 *
 * @param1 oTag
 *    object, to store tags we picked
 *
 * @param2 rePos
 *    the regExp position in the path string
 *
 * @param2 path
 *    string, the target path of data
 *
 */
function pickTags(oTag, rePos, path) {
  if (path.length <= 2) {
    return;
  }
  var sStartPart = path.slice(rePos, path.length);
  var startPos = sStartPart.indexOf('/');
  if (startPos == -1) {
    return;
  }
  var sTag = sStartPart.substring(0, startPos);
  oTag.push(sTag);
  var sNewStart = sStartPart.slice(startPos + 1, sStartPart.length);
  pickTags(oTag, 0, sNewStart);
}


/**
 * @method getTagsByPath
 *   get tags from a path
 *   return an array of tags
 *
 * @param path
 *   string, the target path of data
 *
 */
function getTagsByPath(path) {
  var oTags = [];
  var regPos = path.search(/picture|photo|\u56fe|contact|music|document|video/i);
  if (regPos > -1) {
    pickTags(oTags, regPos, path);
  }
  return oTags;
}
exports.getTagsByPath = getTagsByPath;


/**
 * @method getAllTagsByCategory
 *   get all tags of specific category
 *
 * @param1 category
 *    string, a spcific category we want
 *
 * @param2 callback
 *    all result in array
 *     example:
 *     TagFile =
 *     {
 *      tags:[tag1,tag2,tag3],
 *      tagFiles:{
 *        tag1:[
 *          [uri1,filename1],
 *          [uri2,filenamw2]
 *             ]
 *        tag2:[
 *          [uri3,filename3],
 *          [uri4,filename4]
 *             ]
 *        tag3:[
 *          [uri4,filename5]
 *             ]
 *        }
 *      }
 *
 */
function getAllTagsByCategory(callback, category) {
  var TagFile = {
    tags: [],
    tagFiles: {}
  };

  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return;
    }
    for (var k in items) {
      items[k].others = (items[k].others).split(",");
      var oItem = items[k];
      for (var j in oItem.others) {
        var sTag = oItem.others[j];
        var sUri = oItem.URI;
        var sFilename = oItem.filename;
        var sPostfix = oItem.postfix;
        var sPath = oItem.path;
        if (sTag != null && sTag != "") {
          if (TagFile.tagFiles.hasOwnProperty(sTag)) {
            TagFile.tagFiles[sTag].push([sUri, sFilename, sPostfix, sPath]);
          } else {
            TagFile.tagFiles[sTag] = [
              [sUri, sFilename, sPostfix, sPath]
            ];
            TagFile.tags.push(sTag);
          }
        }
      }
    }
    callback(TagFile);
  }
  var fields = (category === 'contact') ? ['others', 'name', 'uri'] : ['others', 'filename', 'uri', 'postfix', 'path'];
  commonDAO.findItems(fields, category, null, null, findItemsCb);
}
exports.getAllTagsByCategory = getAllTagsByCategory;


/**
 * @method getAllTags
 *   get all tags in db
 *
 * @param callback
 *    all result in array
 *    example:
 *    TagFile = {
 *                tag1:[file_uri1,file_uri3]
 *                tag2:[file_uri2]
 *              }
 *
 */
function getAllTags(callback) {
  var TagFile = {};

  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return;
    }
    for (var k in items) {
      if (TagFile.hasOwnProperty(items[k].tag)) {
        TagFile[items[k].tag].push(items[k].file_URI);
      } else {
        TagFile[items[k].tag] = [items[k].file_URI];
      }
      callback(TagFile);
    }
  }
  commonDAO.findItems(null, ['tags'], null, null, findItemsCb);
}
exports.getAllTags = getAllTags;

/**
 * @method getTagsByUri
 *   get tags with specifc uri
 *
 * @param1 callback
 *    all result in array
 *
 * @param2 sUri
 *    string, uri
 *
 */
function getTagsByUri(callback, sUri) {
  var sTableName = utils.getCategoryByUri(sUri);
  var condition = ["uri = '" + sUri + "'"];
  var column = ["others"];

  function findItemsCb(err, result) {
    if (err) {
      console.log(err);
      return callback(null);
    }else if(result == '' || result == null){
      return callback(null);
    }
    var tags = result[0].others;
    tags = tags.split(",");
    callback(tags);
  }
  commonDAO.findItems(null, sTableName, condition, null, findItemsCb);
}
exports.getTagsByUri = getTagsByUri;

/**
 * @method getTagsByUris
 *   get tags with specifc uris
 *
 * @param1 callback
 *    all result in array
 *
 * @param2 oUris
 *    array, an array of uris, uris should in the same category
 *
 */
function getTagsByUris(callback, oUris) {
  if (oUris.length == 0 || oUris[0] == "") {
    callback("error");
  }
  var sTableName = utils.getCategoryByUri(oUris[0]);
  var condition = 'uri in (';
  for (var i = 0; i < oUris.length - 1; i++) {
    condition += '"' + oUris[i] + '", ';
  }
  condition += '"' + oUris[oUris.length - 1] + '")';
  var column = ["distinct others"];

  var TagFile = {
    tags: [],
    tagFiles: {}
  };

  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return;
    }
    for (var k in items) {
      items[k].others = (items[k].others).split(",");
      var oItem = items[k];
      for (var j in oItem.others) {
        var sTag = oItem.others[j];
        var sUri = oItem.URI;
        var sFilename = oItem.filename || oItem.name;
        var sPostfix = oItem.postfix;
        var sPath = oItem.path || oItem.photopath;
        if (sTag != null && sTag != "") {
          var oContent = (sTableName === 'contact') ? [sUri, sFilename, sPath] : [sUri, sFilename, sPostfix, sPath];
          if (TagFile.tagFiles.hasOwnProperty(sTag)) {
            TagFile.tagFiles[sTag].push(oContent);
          } else {
            TagFile.tagFiles[sTag] = [
              oContent
            ];
            TagFile.tags.push(sTag);
          }
        }
      }
    }
    callback(TagFile);
  }
  var column = (sTableName === 'contact') ? ['others', 'name', 'uri', 'photopath'] : ['others', 'filename', 'uri', 'postfix', 'path'];
  commonDAO.findItems(column, sTableName, [condition], null, findItemsCb);
}
exports.getTagsByUris = getTagsByUris;


/**
 * @method getFilesByTags
 *   get all files with specific tags
 *
 * @param1 callback
 *    all result in array
 *
 * @param2 oTags
 *    array, an array of tags
 *
 */
function getFilesByTags(callback, oTags) {
  var allFiles = [];
  var condition = [];
  for (var k in oTags) {
    condition.push("others like '%" + oTags[k] + "%'");
  }
  var sCondition = [condition.join(' or ')];
  commonDAO.findItems(null, ['document'], sCondition, null, function(err, resultDoc) {
    if (err) {
      console.log(err);
      return callback(err, null);
    }
    allFiles = allFiles.concat(resultDoc);
    commonDAO.findItems(null, ['music'], sCondition, null, function(err, resultMusic) {
      if (err) {
        console.log(err);
        return callback(err, null);
      }
      allFiles = allFiles.concat(resultMusic);
      commonDAO.findItems(null, ['picture'], sCondition, null, function(err, resultPic) {
        if (err) {
          console.log(err);
          return callback(err, null);
        }
        allFiles = allFiles.concat(resultPic);
        commonDAO.findItems(null, ['video'], sCondition, null, function(err, resultVideo) {
          if (err) {
            console.log(err);
            return callback(err, null);
          }
          commonDAO.findItems(null, ['contact'], sCondition, null, function(err, resultContact) {
            if (err) {
              console.log(err);
              return callback(err, null);
            }
            allFiles = allFiles.concat(resultContact);
            callback(null, allFiles);
          })
        })
      })
    })
  });
}
exports.getFilesByTags = getFilesByTags;

/*
TODO: this is a much quiker way to get files by tag, but not precisely enough. 
May improve it in futre.
*/
// function getFilesByTagsInCategory(callback, category, sTag) {
//   var condition = ["others like '%" + sTag + "%'"];
//   commonDAO.findItems(null, category, condition, null, function(err, result) {
//     if (err) {
//       console.log(err);
//       return callback(err, null);
//     } else if (result == undefined) {
//       var _err = 'not found in data base ...';
//       return callback(_err, null);
//     }
//     callback(null, result);
//   })
// }
// exports.getFilesByTagsInCategory = getFilesByTagsInCategory;

function getFilesByTagsInCategory(callback, category, sTag) {
  var condition = ["tag='" + sTag + "'"];
  commonDAO.findItems(null, ['tags'], condition, null, function(err, result) {
    if (err) {
      console.log(err);
      return callback(err, null);
    } else if (result == '' || result == null) {
      var _err = 'not found in data base ...';
      return callback(_err, null);
    }
    var oUris = [];
    for (var tmp in result) {
      if (result[tmp].file_URI != '' && result[tmp].file_URI != null) {
        oUris.push(result[tmp].file_URI);
      }
    }
    var oCondition = [];
    for (var j = 0; j < oUris.length; j++) {
      var pos = oUris[j].lastIndexOf('#');
      var _category = oUris[j].substr(pos+1);
      if (_category === category) {
        var tmpCondition = "uri='" + oUris[j] + "'";
        oCondition.push(tmpCondition);
      }
    }
    console.log(oCondition)
    var sCondition = oCondition.join(' or ');
    commonDAO.findItems(null, category, [sCondition], null, function(err, result) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else if (result == undefined) {
        var _err = 'not found in data base ...';
        return callback(_err, null);
      }
      callback(null, result);
    })
  });
}
exports.getFilesByTagsInCategory = getFilesByTagsInCategory;



/**
 * @method setTagByUri
 *    set tags to a file by uri
 *
 * @param1 callback
 *    @result, (result)
 *    @param: result,
 *        string, retieve 'commit' when success
 *
 * @param2 oTags
 *    array, an array of tags to be set
 *
 * @param3 sUri
 *    string, a specific uri
 *
 */
function setTagByUri(callback, oTags, sUri) {
  var category = utils.getCategoryByUri(sUri);

  function findItemsCb(err, items) {
    if (err) {
      console.log(err);
      return callback(err);
    }
    var UpdateItem = [];
    var item = items[0];
    console.log(item)
    if (oTags == '' || oTags == null) {
      return callback(null);
    }
    if (item.others == '' || item.others == null) { //item has no tags 
      var newTags = oTags.sort().join(",");
      var oldTags = [];
    } else { //item has tag(s)
      var oldTags = item.others.split(',');
      var lens = oldTags.length;
      for (var tag in oTags) {
        if (!utils.isExist(oTags[tag], oldTags)) {
          oldTags.push(oTags[tag]);
        }
      }
      var newTags = oldTags.sort().join(',');
    }
    if (oldTags.length == lens) {
      return callback(null);//no more new tags added return
    }
    UpdateItem = {
      URI: item.URI,
      path: item.path,
      others: newTags,
      category: category
    };
    var re = new RegExp('/' + category + '/', "i");
    if (category == 'contact') {
      var desFilePath = pathModule.join(utils.getDesDir(category), item.name + '.md');
    } else {
      var desFilePath = ((item.path).replace(re, '/' + category + 'Des/')) + '.md';
    }
    dataDes.updateItem(desFilePath, UpdateItem, function(result) {
      if (result !== "success") {
        console.log("error in update des file!");
        return callback("error in update des file!");
      }
      if (category == 'contact') {
        delete UpdateItem.path;
      }
      commonDAO.updateItem(UpdateItem, function(err) {
        if (err) {
          console.log(err);
          return callback(err);
        }
        var chPath = config.RESOURCEPATH + '/' + category + 'Des';
        repo.repoCommit(chPath, [desFilePath], null, "ch", function(err) {
          if(err){
            return callback(err);
          }
          addInTAGS(oTags, sUri, function(err) {
            if (err) {
              return callback(err);
            }
            console.log('set tags des git committed!');
            callback(null);
          })
        });
      });
    });
  }
  var condition = ["URI = " + "'" + sUri + "'"];
  commonDAO.findItems(null, [category], condition, null, findItemsCb);
}
exports.setTagByUri = setTagByUri;

/**
 * @method setTagByUriMulti
 *   set tags to multiple files by uri
 *
 * @param1 callback
 *    @result, (_err,result)
 *
 *    @param: _err,
 *        string, return specific error info
 *
 *    @param: result,
 *        string, retieve 'success' when success
 *
 * @param2 oTags
 *    array, an array of tags to be set
 *
 * @param3 oUri
 *    array, an array of uri
 *
 */
function setTagByUriMulti(callback, oTags, oUri) {
  if (oTags == []) {
    console.log('Tags are not changed!')
    return callback(null, 'success')
  } else if (oUri == []) {
    var _err = 'Error: empty URI input!';
    console.log(_err);
    return callback(_err, null)
  }
  var count = 0;
  var lens = oUri.length;
  for (var i = 0; i < lens; i++) {
    var sUri = oUri[i];
    (function(_sUri, _oTags) {
      function setTagByUriCb(err) {
        if (err) {
          console.log(err, 'set tags error!');
          return callback(err, null);
        }
        var isEnd = (count === lens - 1);
        if (isEnd) {
          callback(null, 'success');
        }
        count++;
      }
      setTagByUri(setTagByUriCb, _oTags, _sUri);
    })(sUri, oTags);
  }
}
exports.setTagByUriMulti = setTagByUriMulti;

/**
 * @method rmTagsByUri
 *   remove a tag from some files with specific uri
 *
 * @param1 callback
 *    return commit if successed
 *
 * @param2 oTags
 *    array, an array of tags to be removed
 *
 *
 */
function rmTagsByUri(callback, oTags, sUri) {
  var allFiles = [];
  var condition = [];
  var deleteTags = [];
  var sCondition = ["uri = '" + sUri + "'"];
  var category = utils.getCategoryByUri(sUri);
  commonDAO.findItems(null, [category], sCondition, null, function(err, result_find) {
    if (err) {
      console.log(err);
      return;
    }
    buildDeleteItems(allFiles, result_find);
    var resultItems = doDeleteTags(allFiles, oTags);
    console.log(resultItems);
    dataDes.updateItems(resultItems, function(result) {
      console.log("my update result: ", result);
      if (result === "success") {
        var files = [];
        if (category === "contact") {
          var desFilePath = config.RESOURCEPATH + '/contactDes/data/' + allFiles[0].name + '.md';
        } else {
          var filePath = allFiles[0].path;
          var re = new RegExp('/' + category + '/', "i");
          var desFilePath = (filePath.replace(re, '/' + category + 'Des/')) + '.md';
        }
        files.push(desFilePath);
        commonDAO.updateItems(resultItems, function(result) {
          if (result === 'rollback') {
            console.log(result);
            return callback(result);
          }
          var desPath = config.RESOURCEPATH + '/' + category + 'Des';
          repo.repoCommit(desPath, files, null, "ch", function() {
            rmInTAGS(oTags, sUri, function(err) {
              if (err) {
                return callback(err);
              }
              console.log("rm tags: ", oTags, " success!");
              callback(result);
            })
          });
        })
      } else {
        console.log("error in update des files");
        return;
      }
    })
  });
}
exports.rmTagsByUri = rmTagsByUri;


/**
 * @method rmTagsAll
 *   remove tags from all data base and des files
 *
 * @param1 callback
 *    return commit if successed
 *
 * @param2 oTags
 *    array, an array of tags to be removed
 *
 *
 */
function rmTagsAll(callback, oTags) {
  var allFiles = [];
  var condition = [];
  var deleteTags = [];
  for (var k in oTags) {
    condition.push("others like '%" + oTags[k] + "%'");
  }
  var sCondition = [condition.join(' or ')];
  commonDAO.findItems(null, ['document'], sCondition, null, function(err, resultDoc) {
    if (err) {
      console.log(err);
      return;
    }
    buildDeleteItems(allFiles, resultDoc)
    commonDAO.findItems(null, ['music'], sCondition, null, function(err, resultMusic) {
      if (err) {
        console.log(err);
        return;
      }
      buildDeleteItems(allFiles, resultMusic)
      commonDAO.findItems(null, ['picture'], sCondition, null, function(err, resultPic) {
        if (err) {
          console.log(err);
          return;
        }
        buildDeleteItems(allFiles, resultPic)
        commonDAO.findItems(null, ['video'], sCondition, null, function(err, resultVideo) {
          if (err) {
            console.log(err);
            return;
          }
          buildDeleteItems(allFiles, resultVideo);
          var resultItems = doDeleteTags(allFiles, oTags);
          dataDes.updateItems(resultItems, function(result) {
            if (result === "success") {
              var files = [];
              for (var k in allFiles) {
                var desFilePath;
                var category = allFiles[k].category;
                if (category === "contact") {
                  desFilePath = config.RESOURCEPATH + '/contactDes/data/' + allFiles[k].name + '.md';
                } else {
                  var filePath = allFiles[k].path;
                  var re = new RegExp('/' + category + '/', "i");
                  desFilePath = (filePath.replace(re, '/' + category + 'Des/')) + '.md';
                }
                files.push(desFilePath);
              }
              var desPath = config.RESOURCEPATH + '/' + category + 'Des';
              repo.repoCommit(desPath, files, null, "ch", function() {
                callback(result);
              });
            } else {
              console.log("error in update des files");
              return;
            }
          })
        })
      })
    })
  });
}
exports.rmTagsAll = rmTagsAll;

//build the object items for update in both DB and desfile 
function buildDeleteItems(allFiles, result) {
  if (result.length > 0) {
    var sUri = result[0].URI;
    var category = utils.getCategoryByUri(sUri);
    for (var k in result) {
      var newItem = {
        category: category,
        URI: result[k].URI,
        others: result[k].others
      };
      if (category == 'contact') {
        newItem.name = result[k].name;
      } else {
        newItem.path = result[k].path;
      }
      allFiles.push(newItem);
    }
  }
}

//remove those tags we want to delete
function doDeleteTags(oAllFiles, oTags) {
  var resultFiles = [];
  for (var j in oAllFiles) {
    var tags = (oAllFiles[j].others).split(',');
    var newTags = [];
    if (tags) {
      for (var i in tags) {
        var isExist = false;
        for (var k in oTags) {
          if (tags[i] == oTags[k]) {
            isExist = true;
          }
        }
        if (!isExist) {
          newTags.push(tags[i]);
        }
      }
    }
    (oAllFiles[j]).others = newTags.join(',');
  }
  return oAllFiles;
}

/**
 * @method setRelativeTag
 *   To set a relative tag for a file in order to keep relative relationship of
 *   files on desktop.
 *
 * @param1 sFilePath
 *    string, a full path of a file.
 *
 * @param2 sTags
 *    string, a modified system tag as that could show a relative dir.
 *            as: '$desktop$my_funcy_dir$funcy_as_well$'
 *
 * @param3 callback
 *    string, the target path of data
 *
 */
function setRelativeTagByPath(sFilePath, sTags, callback) {
  var reg_desktop = /^[\$]{1}desktop[\$]{1}/;
  if (!reg_desktop.test(sTags)) {
    var _err = 'Bad Input Tag! Not a Desktop System Tags!';
    return callback(_err, null);
  }
  var category = utils.getCategoryByPath(sFilePath).category;
  var sCondition = ["path = '" + sFilePath + "'"];
  commonDAO.findItems(null, [category], sCondition, null, function(err, result) {
    if (err) {
      return callback(err, null);
    } else if (result == '' || result == []) {
      var _err = 'Not Found in DB!';
      return callback(_err, null);
    }
    var item = result[0];
    var sOriginTag = item.others;
    if (!reg_desktop.test(sOriginTag) || sOriginTag == '' || sOriginTag == null) {
      var _err = 'Not a File on Desktop!';
      return callback(_err, null);
    }
    var oTags = sOriginTag.split(',');
    for (var i = 0; i < oTags.length; i++) {
      if (reg_desktop.test(oTags[i])) {
        oTags[i] = sTags;
      }
    }
    UpdateItem = {
      URI: item.URI,
      path: item.path,
      others: oTags.join(','),
      category: category
    };
    var re = new RegExp('/' + category + '/', "i");
    var desFilePath = ((item.path).replace(re, '/' + category + 'Des/')) + '.md';
    dataDes.updateItem(desFilePath, UpdateItem, function(result) {
      if (result !== "success") {
        return console.log("error in update des file!");
      }
      commonDAO.updateItem(UpdateItem, function(err) {
        if (err) {
          return callback(err, null);
        }
        var chPath = utils.getDesRepoDir(category);
        repo.repoCommit(chPath, [desFilePath], null, "ch", function(result) {
          if (result !== 'success') {
            var _err = 'git ch commit error!';
            return callback(_err, null);
          }
          console.log('set tags des git committed!');
          callback(null, 'success');
        });
      });
    });
  });
}
exports.setRelativeTagByPath = setRelativeTagByPath;


/**
 * @method rmInTAGS
 *   To remove tags in 'tags' list.
 *
 * @param1 oTags
 *    array, array of tags.
 *
 * @param2 sUri
 *    string, a valid uri.
 *
 * @param3 callback
 *    @result, (_err)
 *
 *    @param: _err,
 *        string, if err, return specific error; otherwise return null.
 *
 */
function rmInTAGS(oTags, sUri, callback) {
  var sCondition = ["file_URI='" + sUri + "'"];
  if (oTags) {
    var tmpCondition = [];
    for (var tag in oTags) {
      var str = "tag='" + oTags[tag] + "'";
      tmpCondition.push(str);
    }
    tmpCondition[0] = "(" + tmpCondition[0];
    tmpCondition[tmpCondition.length - 1] = tmpCondition[tmpCondition.length - 1] + ")";
    sCondition.push(tmpCondition.join('or'));
  }
  var oItem = {
    category: 'tags',
    conditions: sCondition
  }
  commonDAO.deleteItem(oItem, function(result) {
    if (result === "rollback") {
      var _err = 'create item in data base rollback ...';
      return callback(_err);
    }
    callback(null);
  })
}
exports.rmInTAGS = rmInTAGS;

/**
 * @method addInTAGS
 *   To remove tags in 'tags' list.
 *
 * @param1 oTags
 *    array, array of tags.
 *
 * @param2 sUri
 *    string, a valid uri.
 *
 * @param3 callback
 *    @result, (_err)
 *
 *    @param: _err,
 *        string, if err, return specific error; otherwise return null.
 *
 */
function addInTAGS(oTags, sUri, callback) {
  var oItems = [];
  for (var tag in oTags) {
    var oItem = {
      category: 'tags',
      tag: oTags[tag],
      file_URI: sUri
    }
    oItems.push(oItem);
  }
  commonDAO.createItems(oItems, function(result) {
    if (result === "rollback") {
      var _err = 'create item in data base rollback ...';
      return callback(_err);
    }
    callback(null);
  })
}
exports.addInTAGS = addInTAGS;
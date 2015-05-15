var url = require("url");
var sys = require('sys');
var pathModule = require('path');
var fs = require('fs');
var config = require("../config");
var dataDes = require("./desFilesHandle");
var commonDAO = require("./CommonDAO");
var commonHandle = require("./commonHandle");
var rdfHandle = require("./rdfHandle");
var repo = require("./repo");
var utils = require("../utils");
var DEFINED_PROP = require('../data/default/rdfTypeDefine').property;
var DEFINED_TYPE = require('../data/default/rdfTypeDefine').vocabulary;
var DEFINED_VOC = require('../data/default/rdfTypeDefine').definition;
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
  var reg = new RegExp(process.env["HOME"] + '/');
  var tmpTags = path.replace(reg, '');
  tmpTags = tmpTags.split('/');
  tmpTags.pop();
  return tmpTags;
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
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('tag'),
    predicate: DEFINED_VOC.rdf._type,
    object: DEFINED_TYPE["base"]["tags"]
  }, {
    subject: _db.v('tag'),
    predicate: DEFINED_VOC.rdf._domain,
    object: DEFINED_VOC.category[category]
  }]
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    }
    var _tags = [];
    for (var i = 0, l = result.length; i < l; i++) {
      _tags.push(utils.getTitle(result[i].tag));
    }
    return callback(null, _tags);
  });
}
exports.getAllTagsByCategory = getAllTagsByCategory;


/*TODO: no more use, prepare to delete*/
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
    // if (err) {
    //   console.log(err);
    //   return;
    // }
    // for (var k in items) {
    //   if (TagFile.hasOwnProperty(items[k].tag)) {
    //     TagFile[items[k].tag].push(items[k].file_URI);
    //   } else {
    //     TagFile[items[k].tag] = [items[k].file_URI];
    //   }
    //   callback(TagFile);
    // }
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
function getTagsByUri(callback, uri) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["URI"],
    object: uri
  }, {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["tags"],
    object: _db.v('tag')
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    }
    var _tags = [];
    for (var i = 0, l = result.length; i < l; i++) {
      _tags.push(utils.getTitle(result[i].tag));
    }
    return callback(null, _tags);
  });
}
exports.getTagsByUri = getTagsByUri;

/*TODO: no more use, prepare to delete*/
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
  // if (oUris.length == 0 || oUris[0] == "") {
  //   callback("error");
  // }
  // var sTableName = utils.getCategoryByUri(oUris[0]);
  // var condition = 'uri in (';
  // for (var i = 0; i < oUris.length - 1; i++) {
  //   condition += '"' + oUris[i] + '", ';
  // }
  // condition += '"' + oUris[oUris.length - 1] + '")';
  // var column = ["distinct others"];

  // var TagFile = {
  //   tags: [],
  //   tagFiles: {}
  // };

  // function findItemsCb(err, items) {
  //   if (err) {
  //     console.log(err);
  //     return;
  //   }
  //   for (var k in items) {
  //     items[k].others = (items[k].others).split(",");
  //     var oItem = items[k];
  //     for (var j in oItem.others) {
  //       var sTag = oItem.others[j];
  //       var sUri = oItem.URI;
  //       var sFilename = oItem.filename || oItem.name;
  //       var sPostfix = oItem.postfix;
  //       var sPath = oItem.path || oItem.photopath;
  //       if (sTag != null && sTag != "") {
  //         var oContent = (sTableName === 'contact') ? [sUri, sFilename, sPath] : [sUri, sFilename, sPostfix, sPath];
  //         if (TagFile.tagFiles.hasOwnProperty(sTag)) {
  //           TagFile.tagFiles[sTag].push(oContent);
  //         } else {
  //           TagFile.tagFiles[sTag] = [
  //             oContent
  //           ];
  //           TagFile.tags.push(sTag);
  //         }
  //       }
  //     }
  //   }
  //   callback(TagFile);
  // }
  // var column = (sTableName === 'contact') ? ['others', 'name', 'uri', 'photopath'] : ['others', 'filename', 'uri', 'postfix', 'path'];
  // commonDAO.findItems(column, sTableName, [condition], null, findItemsCb);
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
  var _db = rdfHandle.dbOpen();
  var _query = [];

  for (var i = 0, l = oTags.length; i < l; i++) {
    _query.push({
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["tags"],
      object: 'http://example.org/tags#' + oTags[i]
    })
  }

  _query.push({
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  })

  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    }
    rdfHandle.decodeTripeles(result, function(err, result) {
      if (err) {
        return callback(err)
      }
      var _result = [];
      for (var file in result) {
        _result.push(result[file]);
      }
      return callback(null, _result);
    });
  });
}
exports.getFilesByTags = getFilesByTags;


function getFilesByTagsInCategory(callback, category, oTags) {
  var _db = rdfHandle.dbOpen();
  var _query = [];
  _query.push({
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: category
  })

  for (var i = 0, l = oTags.length; i < l; i++) {
    _query.push({
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["tags"],
      object: 'http://example.org/tags#' + oTags[i]
    })
  }

  _query.push({
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  })

  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    }
    rdfHandle.decodeTripeles(result, function(err, result) {
      if (err) {
        return callback(err)
      }
      var _result = [];
      for (var file in result) {
        _result.push(result[file]);
      }
      return callback(null, _result);
    });
  });
}
exports.getFilesByTagsInCategory = getFilesByTagsInCategory;



/**
 * @method setTagByUri
 *    set tags to a file by uri
 *
 * @param1 callback
 *    @result, (err),
 *       err would be object when error occurs
 *
 * @param2 tags
 *    array, an array of tags to be set
 *
 * @param3 sUri
 *    string, a specific uri
 *
 */
function setTagByUri(callback, tags, uri) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["URI"],
    object: uri
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    } else if (result == "") {
      var _err = new Error("NOT FOUND IN DATABASE!");
      return callback(err);
    }
    var _subject = result[0].subject;
    var _query_add = []
    for (var i = 0, l = tags.length; i < l; i++) {
      _query_add.push({
        subject: _subject,
        predicate: DEFINED_PROP["base"]["tags"],
        object: 'http://example.org/tags#' + tags[i]
      });
    }
    rdfHandle.dbPut(_db, _query_add, function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    })
  });
}
exports.setTagByUri = setTagByUri;

/**
 * @method rmTagsByUri
 *   remove a tag from some files with specific uri
 *
 * @param1 callback
 *    return commit if successed
 *
 * @param2 sTags
 *    string, uri string
 *
 *
 */
function rmTagsByUri(callback, tag, uri) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["URI"],
    object: uri
  }];
  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    } else if (result == "") {
      var _err = new Error("NOT FOUND IN DATABASE!");
      return callback(_err)
    }
    var _subject = result[0].subject;
    var _query_delete = [{
      subject: _subject,
      predicate: DEFINED_PROP["base"]["tags"],
      object: "http://example.org/tags#" + tag
    }]
    rdfHandle.dbDelete(_db, _query_delete, function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  });
}
exports.rmTagsByUri = rmTagsByUri;

/*TODO: no more use, prepare to delete*/
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
function rmTagAll(callback, tag, category) {
  var _db = rdfHandle.dbOpen();
  var _object = 'http://example.org/tags#' + tag;
  var _query = [{
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _object
  }];

  rdfHandle.dbSearch(_db, _query, function(err, result) {
    if (err) {
      return callback(err);
    }

    for (var i = 0, l = result.length; i < l; i++) {
      result[i].object = _object;
    }

    //tag triple for catedory search
    result.push({
      subject: _object,
      predicate: DEFINED_VOC.rdf._domain,
      object: DEFINED_VOC.category[category]
    })

    rdfHandle.dbDelete(_db, result, function(err) {
      if (err) {
        return callback(err);
      }
      return callback();
    });
  });
}
exports.rmTagAll = rmTagAll;

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
  if (oTags == '' || oTags == null) {
    return callback(null);
  }
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
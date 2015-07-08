var pathModule = require('path');
var fs = require('fs');
var config = require('systemconfig');
var commonHandle = require("./commonHandle");
var rdfHandle = require("./rdfHandle");
var utils = require("../utils");
var DEFINED_PROP = rdfHandle.DEFINED_PROP;
var DEFINED_TYPE = rdfHandle.DEFINED_TYPE;
var DEFINED_VOC = rdfHandle.DEFINED_VOC;
var Q = require('q');


/**
 * @method getTagsByPath
 *   get tags from a path
 *   return an array of tags
 *
 * @param path
 *   string, the target path of data
 * @return Stack
 *   represent every tag of a file 
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
 * @return Promise
 *    event state，which resolves with an array of Tag Name if sucess;
 *    otherwise, return reject with Error object 
 *
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
function getAllTagsByCategory(category) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('tag'),
    predicate: DEFINED_VOC.rdf._type,
    object: DEFINED_PROP["base"]["tags"]
  }, {
    subject: _db.v('tag'),
    predicate: DEFINED_VOC.rdf._domain,
    object: DEFINED_TYPE[category]
  }]

  var tagMaker = function(results) {
    var _tags = [];
    for (var i = 0, l = results.length; i < l; i++) {
      _tags.push(utils.getTitle(results[i].tag));
    }
    return _tags;
  };

  function getTagFileNumber(tag) {
    var _db = rdfHandle.dbOpen();
    var _query = [{
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["category"],
      object: category
    }, {
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["tags"],
      object: 'http://example.org/tags#' + tag
    }, {
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["URI"],
      object: _db.v('file')
    }];
    return rdfHandle.dbSearch(_db, _query)
      .then(function(uri_list_) {
        return [tag, uri_list_.length]
      });
  }

  return rdfHandle.dbSearch(_db, _query)
    .then(tagMaker)
    .then(function(result) {
      return Q.all(result.map(getTagFileNumber));
    })
    .then(function(result){
      return result;
    })
}
exports.getAllTagsByCategory = getAllTagsByCategory;


/**
 * @method getTagsByUri
 *   get tags with specifc uri
 *
 * @param1 callback
 *    all result in array
 *
 * @param2 sUri
 *    string, uri
* @return Promise
 *    event state，which resolves with an array of Tags' Name if sucess;
 *    otherwise, return reject with Error object 
 *
 */
function getTagsByUri(uri) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["URI"],
    object: uri
  }, {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["tags"],
    object: _db.v('tag')
  },
  {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: _db.v('category')
  }];


  var tagMaker = function(result){
    var _tags = [];
    for (var i = 0, l = result.length; i < l; i++) {
      _tags.push([utils.getTitle(result[i].tag),utils.getTitle(result[i].category)]);
    }
    return _tags;
  } 

  function getTagFileNumber(tag) {
      var _db = rdfHandle.dbOpen();
      var _query = [{
        subject: _db.v('subject'),
        predicate: DEFINED_PROP["base"]["category"],
        object: tag[1]
      }, {
        subject: _db.v('subject'),
        predicate: DEFINED_PROP["base"]["tags"],
        object: 'http://example.org/tags#' + tag[0]
      }, {
        subject: _db.v('subject'),
        predicate: DEFINED_PROP["base"]["URI"],
        object: _db.v('file')
      }];
      return rdfHandle.dbSearch(_db, _query)
      .then(function(uri_list_) {
        return [tag, uri_list_.length]
      });
  }

  return rdfHandle
  .dbSearch(_db, _query)
  .fail(function(err){throw new Error(err);})
  .then(tagMaker)
  .then(function(result) {
      return Q.all(result.map(getTagFileNumber));
   })
   .then(function(_result){
     var _tags=[];
     for (var i = 0, l = _result.length; i < l; i++) {
      _tags.push( [ utils.getTitle(_result[i][0][0]) , _result[i][1]  ]  );
    }
     return _tags;
  });
  
}
exports.getTagsByUri = getTagsByUri;


/**
 * @method getFilesByTags
 *   get all files with specific tags
 *
 * @param1 oTags
 *    array, an array of tags
 *
 * @return Promise 
 *    event state，which resolves with an array of choosen files if sucess;
 *    otherwise, return reject with Error object 
 *
 *
 */
function getFilesByTags(oTags) {
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
  
  var resultMaker = function(result){
      var _result = [];
      for (var file in result) {
        _result.push(result[file]);
      }
      return _result;
    }
  return rdfHandle.dbSearch(_db, _query)
    .then(rdfHandle.decodeTripeles)
    .then(resultMaker);
}
exports.getFilesByTags = getFilesByTags;


function getFilesByTagsInCategory(category, oTags) {
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
    });
  }
  _query.push({
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  });

  var resultMaker = function(result){
    var _result = [];
    for (var file in result) {
      _result.push(result[file]);
    }
    return _result;
  };
  return rdfHandle.dbSearch(_db, _query) 
    .then(rdfHandle.decodeTripeles)
    .then(resultMaker);

}
exports.getFilesByTagsInCategory = getFilesByTagsInCategory;


/**
 * @method setTagByUri
 *    set tags to a file by uri
 *
 *
 * @param1 tags
 *    array, an array of tags to be set
 *
 * @param2 sUri
 *    string, a specific uri
 * @return Promise
 *    event state，which represents onFulfilled state with no value  if sucess;
 *    otherwise, return reject with Error object 
 *
 *
 */
function setTagByUri(tags, uri) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["URI"],
    object: uri
  }, {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: _db.v('category'),
  }];
  var queryTripleMaker = function(result){
    if(result == ""){
      throw Error("NOT FOUND IN DATABASE!");
    }
    var _subject = result[0].subject;
    var _category = result[0].category;
    var _query_add = [];
    for (var i = 0, l = tags.length; i < l; i++) {
      var _tag_url = 'http://example.org/tags#' + tags[i];
      _query_add.push({
        subject: _tag_url,
        predicate: DEFINED_VOC.rdf._type,
        object: DEFINED_PROP["base"]["tags"]
      });
      _query_add.push({
        subject: _tag_url,
        predicate: DEFINED_VOC.rdf._domain,
        object: DEFINED_TYPE[_category]
      });
      _query_add.push({
        subject: _subject,
        predicate: DEFINED_PROP["base"]["tags"],
        object: _tag_url
      });
    }
    return _query_add;
  }
  
  return rdfHandle.dbSearch(_db, _query)
  .then(queryTripleMaker)
  .then(function(result){
      return rdfHandle.dbPut(_db, result);
    });
}
exports.setTagByUri = setTagByUri;

//shoud be base property
function setTagByProperty(tags, property) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"][property],
    object: property
  }, {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: _db.v('category'),
  }];
  var queryTripleMaker = function(result){
    if(result == ""){
      throw Error("NOT FOUND IN DATABASE!");
    }
    var _subject = result[0].subject;
    var _category = result[0].category;
    var _query_add = [];
    for (var i = 0, l = tags.length; i < l; i++) {
      var _tag_url = 'http://example.org/tags#' + tags[i];
      _query_add.push({
        subject: _tag_url,
        predicate: DEFINED_VOC.rdf._type,
        object: DEFINED_PROP["base"]["tags"]
      });
      _query_add.push({
        subject: _tag_url,
        predicate: DEFINED_VOC.rdf._domain,
        object: DEFINED_TYPE[_category]
      });
      _query_add.push({
        subject: _subject,
        predicate: DEFINED_PROP["base"]["tags"],
        object: _tag_url
      });
    }
    return _query_add;
  }
  
  return rdfHandle.dbSearch(_db, _query)
  .then(queryTripleMaker)
  .then(function(result){
      return rdfHandle.dbPut(_db, result);
    });
}
exports.setTagByProperty = setTagByProperty;

/**
 * @method rmTagsByUri
 *   remove a tag from some files with specific uri
 *
 * @param1 sTags
 *    string
 *
 * @param2 uri
 *    uri string
 *
 * @return Promise
 *    event state，which represents onFulfilled state with no value  if sucess;
 *    otherwise, return reject with Error object
 *
 */
function rmTagsByUri(tag, uri) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["URI"],
    object: uri
  }];

  var queryTripleMaker = function(result){
    if(result == ""){
      throw Error("NOT FOUND IN DATABASE!");
    }
    var _subject = result[0].subject;
    var _query_delete = [{
      subject: _subject,
      predicate: DEFINED_PROP["base"]["tags"],
      object: "http://example.org/tags#" + tag
    }]
    return _query_delete;
  }
  
  return rdfHandle.dbSearch(_db, _query)
  .then(queryTripleMaker)
  .then(function(result){
      rdfHandle.dbDelete(_db, result)
    });
}
exports.rmTagsByUri = rmTagsByUri;


/**
 * @method rmTagsAll
 *   remove tags from all data base and des files
 *
 *
 * @param1 oTags
 *    array, an array of tags to be removed
 *
 * @param2 category
 *    string, such as "document"
 *
 * @return Promise
 *    event state，which represents onFulfilled state with no value  if sucess;
 *    otherwise, return reject with Error object
 */
function rmTagAll(tag, category) {
  var _db = rdfHandle.dbOpen();
  var _object = 'http://example.org/tags#' + tag;
  var _query = [{
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _object
  }];
  var tagTriMaker = function(result){
    for (var i = 0, l = result.length; i < l; i++) {
      result[i].object = _object;
    }

    //tag triple for catedory search
    result.push({
      subject: _object,
      predicate: DEFINED_VOC.rdf._domain,
      object: DEFINED_TYPE[category]
    })
    return result;
  }

  return rdfHandle.dbSearch(_db, _query)
  .then(tagTriMaker)
  .then(function(result){
    rdfHandle.dbDelete(_db, result);
  });
}
exports.rmTagAll = rmTagAll;


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
function setRelativeTagByPath(sFilePath, sTags) {
  var reg_desktop = /^[\$]{1}desktop[\$]{1}/;
  var _option = {
    _type: "base",
    _property: "path",
    _value: sFilePath
  }
  return commonHandle.getItemByProperty(_option)
    .then(function(info_) {
        var _uri = info_[0].URI;
        if (_uri === null || _uri === undefined) {
          throw new Error("NOT FOUND IN DATABASE...");
        }
        var _tags = info_[0].tags;
        var _old_tag = null;
        for (var i = 0; i < _tags.length; i++) {
          if (reg_desktop.test(_tags[i])) {
            _old_tag = _tags[i];
        }
      }
      return rmTagsByUri(_old_tag, _uri)
        .then(function() {
          return setTagByUri([sTags], _uri)
        })
    })
}
exports.setRelativeTagByPath = setRelativeTagByPath;

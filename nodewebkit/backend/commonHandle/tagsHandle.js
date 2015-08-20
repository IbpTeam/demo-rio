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
var flowctl = require('../../../../../framework/utils/lib/flowctl');
var USERCONFIGPATH = config.USERCONFIGPATH,
  uniqueID = require(USERCONFIGPATH + '/uniqueID.js'),
  LOCALACCOUNT = uniqueID.Account;


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
  return tagsFilter(tmpTags);
}
exports.getTagsByPath = getTagsByPath;

/**
 * @method generateTags
 *   generate tags:
 *     for now, generate date, filename and username
 *     we will add more meaningful tags in the future.
 *   return an array of tags
 *
 * @param path
 *   string, the target path of data
 * @return Stack
 *   represent every tag of a file
 *
 */
function generateTags(path) {
  console.log("come into generateTags");
  var oTags = [];
  var filename = utils.getFileNameByPathShort(path);
  oTags.push(filename);
  var date = (new Date()).toDateString();
  oTags.push(date);
  var username = LOCALACCOUNT;
  oTags.push(username);
  console.log("here is generateTags():" + oTags);
  return oTags;

}
exports.generateTags = generateTags;


/**
 * @method tagsFilter
 * @param tags
 *   array, tags to be filtered
 * @return tags
 *   array, filtered tags
 *
 */
function tagsFilter(tags) {
  var yuzhi = 0.7;
  return getAllTags().then(function(rdftags) {
    var rdftags_len = rdftags.length;
    tags = tags.concat(rdftags);
    for (var i = 0; i < tags.length - rdftags_len; i++) {
      if (tags[i].length == 0) {
        tags.splice(i, 1);
        i--;
      } else if (tags[i].toLowerCase() == "tmp" || tags[i].toLowerCase() == "temp" || tags[i].toLowerCase() == "workspace") {
        tags.splice(i, 1);
        i--;
      } else if (tags[i].charAt(0) == ".") {
        tags.splice(i, 1);
        i--;
      } else if (tags[i].length == 1) {
        tags.splice(i, 1);
        i--;
      } else if (i < tags.length - 1) {
        var old_i = i;
        for (var j = i + 1; j < tags.length; j++) { //大小写不同的同义词
          if (tags[i].toUpperCase() == tags[j].toUpperCase()) {
            tags.splice(i, 1);
            i--;
            break;
          }
        }
        if (i != old_i)
          continue;
        if (tags[i].indexOf(" ") > 0 || tags[i].indexOf("_") > 0 || tags[i].indexOf("-") > 0 || tags[i].indexOf(".") > 0) { //分隔符不同的同义词
          var ar1 = tags[i].split(/ |_|-|[.]/);
          for (var l = 0; l < ar1.length; l++) {
            if (ar1[l].length == 0) {
              ar1.splice(l, 1);
              l--;
            }
          }
          for (var j = i + 1; j < tags.length; j++) {
            if (tags[j].indexOf(" ") > 0 || tags[j].indexOf("_") > 0 || tags[j].indexOf("-") > 0 || tags[j].indexOf(".") > 0) {
              var ar2 = tags[j].split(/ |_|-|[.]/);
              for (var k = 0; k < ar2.length; k++) {
                if (ar2[k].length == 0) {

                  ar2.splice(k, 1);
                  k--;
                }
              }
              if (ar1.sort().toString().toUpperCase() == ar2.sort().toString().toUpperCase()) {
                tags.splice(i, 1);
                i--;
                break;
              }
            }
          }
        }
        if (i != old_i)
          continue;
        var s = tags[i]; //相似度达到一定阈值的词
        for (var tmp = i + 1; tmp < tags.length; tmp++) {
          var t = tags[tmp];
          var l = s.length > t.length ? s.length : t.length;
          var n = s.length; // length of s
          var m = t.length; // length of t         
          if (m == 0) {
            tags.splice(tmp, 1);
            tmp--;
            continue;
          }
          var d = []; // matrix     
          var s_k; // kth character of s
          var t_j; // jth character of t
          var cost; // cost
          for (var k = 0; k <= n; k++) {
            d[k] = [];
            d[k][0] = k;
          }
          for (var j = 0; j <= m; j++) {
            d[0][j] = j;
          }
          for (var k = 1; k <= n; k++) {
            s_k = s.charAt(k - 1);
            for (var j = 1; j <= m; j++) {
              t_j = t.charAt(j - 1);
              if (s_k == t_j)
                cost = 0;
              else
                cost = 1;
              d[k][j] = d[k - 1][j] + 1 < d[k][j - 1] + 1 ? (d[k - 1][j] + 1 < d[k - 1][j - 1] + cost ? d[k - 1][j] + 1 : d[k - 1][j - 1] + cost) : (d[k][j - 1] + 1 < d[k - 1][j - 1] + cost ? d[k][j - 1] + 1 : d[k - 1][j - 1] + cost);
            }
          }
          var d = d[n][m];
          var simlar = (1 - d / l).toFixed(2);
          if (simlar >= yuzhi) {
            tags.splice(i, 1);
            i--;
            break;
          }
        }

      }
    }
    tags.splice(tags.length - rdftags.length, rdftags.length);
    return tags;
  })
}
exports.tagsFilter = tagsFilter;


/**
 * @method getAllTags
 * @return tags
 *   array, all tags from rdf
 *
 */
function getAllTags() {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('tag'),
    predicate: DEFINED_VOC.rdf._type,
    object: DEFINED_PROP["base"]["tags"]
  }]
  var tagMaker = function(results) {
    var _tags = [];
    for (var i = 0, l = results.length; i < l; i++) {
      _tags.push(utils.getTitle(results[i].tag));
    }
    return _tags;
  };
  return rdfHandle.dbSearch(_db, _query)
    .then(tagMaker)
    .then(function(result) {

      return result;
    })
}
exports.getAllTags = getAllTags;


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
    .then(function(result) {
      return result;
    })
}
exports.getAllTagsByCategory = getAllTagsByCategory;

/**
 * @method getDataIntersectionOfTwoTags
 *   get intersection datas of two tags
 *
 * @param oTwoTags
 *    an array contains two tags
 *
 * @return Promise
 *    event state，which resolves with an array of File Name if sucess;
 *    otherwise, return reject with Error object
 */
function getDataIntersectionOfTwoTags(oTwoTags){
  var _db = rdfHandle.dbOpen();
  var _query = [{
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["tags"],
      object: 'http://example.org/tags#' + oTwoTags[0][0]
    }, {
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["tags"],
      object: 'http://example.org/tags#' + oTwoTags[1][0]
    }, {
      subject: _db.v('subject'),
      predicate: DEFINED_PROP["base"]["URI"],
      object: _db.v('file')
    }];
    return rdfHandle.dbSearch(_db, _query)
      .then(function(uri_list_) {
        return uri_list_.length;
      });
}

/**
 * @method getDataUnionOfTwoTags
 *   get union datas of two tags
 *
 * @param tag1 and tag2
 *    string, the two tag name
 *
 * @return Promise
 *    event state，which resolves with an array of Files if sucess;
 *    otherwise, return reject with Error object
 */
function getDataIntersectionAndUnionOfTwoTags(tag1, tag2){
  var oUnionedFiles = new Array();
  return getFilesByTags([tag1[0]])
    .then(function(tag1_files){
      oUnionedFiles = tag1_files;
      return [tag2[0]];
    })
    .then(getFilesByTags)
    .then(function(tag2_files){
      var isExist = false;
      var cmpLength = oUnionedFiles.length;
      for(var i=0; i<tag2_files.length; i++){
        for(var j=0; j<cmpLength; j++){
          if(oUnionedFiles[j].URI === tag2_files[i].URI){
            isExist = true;
            break;
          }
        }
        if(isExist === false){
          oUnionedFiles.push(tag2_files[i]);
        }
      }
      return [tag1, tag2];
    })
    .then(getDataIntersectionOfTwoTags)
    .then(function(interNum){
      return [tag1, tag2, interNum, oUnionedFiles.length];
    });
}

/**
 * @method generateRandom
 *   generate k non-repeated random number
 *
 * @param1 k
 *    the count of random number
 *
 * @param2&param3 min&max
 *    the ceiling and the floor of the numbers
 *
 * @return an array of k random numbers
 *
 */
function generateRandom(k, min, max){
    var retArray = new Array();
    var originalArray = new Array();
    var count = 30000;
    for(var i=0; i<count; i++){
      originalArray[i] = i;
    }
    originalArray.sort(function(){
      return 0.5 - Math.random();
    });
    function contains(array, element){
      var i = array.length;
      while(i--){
        if(array[i] === element){
          return true;
        }
      }
      return false;
    }
    for(var i=0; i<k; i++){
      var randomNum = parseInt(originalArray[i] / count * (max-min) + min);
      while(contains(retArray, randomNum)){
        randomNum += 1;
      }
      retArray[i] = randomNum;
    }
    return retArray;
  }

/**
 * @method tagsCluster
 *   classify tags using kmeans algorithm
 *
 * @param1 oTags
 *    an array of tags
 *
 * @param2 k
 *    an parameter for kmeans algorithm
 *
 * @return Promise
 *    event state，which resolves with an Json format of classified result;
 *    eg: 
 *    [
 *       ['a', 'b', 'c'],
 *       ['d', 'e', 'f']
 *    ]
 *    otherwise, return reject with Error object
 *
 */
function tagsClusterKmeans(oTags, k){
  if(!oTags || oTags.length < 1 || k<1){
    throw "Parameter error for tagsClusterKmeans";
  }
  if(oTags.length < k){
    k = oTags.length;
  }
  var kSeeds = generateRandom(k, 0, oTags.length - 1);
  var kSeedsTags = [];
  kClusters = {};
  for(var i=0; i<k; i++){
    kSeedsTags.push(oTags[kSeeds[i]]);
    kClusters[oTags[kSeeds[i]][0]] = new Array();
    kClusters[oTags[kSeeds[i]][0]].push(oTags[kSeeds[i]]);
    oTags[kSeeds[i]] = null;
  }
  var indexTagPairs = [];
  for(var i=0; i<oTags.length; i++){
    if(oTags[i] === null){
      continue;
    }
    indexTagPairs.push(computeClusterForATagKmeans(oTags[i], k, kSeedsTags));
  }
  return Q.all(indexTagPairs)
    .then(function(indexTagPair){
      for(var i=0; i<indexTagPair.length; i++){
        kClusters[indexTagPair[i][0]].push(indexTagPair[i][1]);
      }
      return kClusters;
    });
}
exports.tagsClusterKmeans = tagsClusterKmeans;

function computeClusterForATagKmeans(tag, k, kSeedsTags) {
  var resultSet = [];
  for (var j = 0; j < k; j++) {
    resultSet.push(getDataIntersectionAndUnionOfTwoTags(kSeedsTags[j], tag));
  }
  return Q.all(resultSet)
    .then(function(result) { //[clusterIndexTag, tag, intersectionNumber, unionNumber]
      var maxSimilar = 0;
      var clusterIndex = result[0][0][0];
      var tag = result[0][1];
      for (var i = 0; i < result.length; i++) {
        var similar = result[i][2] / result[i][3];
        if (similar > maxSimilar) {
          maxSimilar = similar;
          clusterIndex = result[i][0][0];
        }
        if(maxSimilar === 0){
          var tmpIndex = generateRandom(1, 0, k-1);
          clusterIndex = kSeedsTags[tmpIndex[0]][0];
        }
      }
      return [clusterIndex, tag];
    });
}
function getAllTagsByCategoryClusteringKmeans(category, k){
  return getAllTagsByCategory(category)
    .then(function(oTags){
      return tagsClusterKmeans(oTags, k);
    });
}
exports.getAllTagsByCategoryClusteringKmeans = getAllTagsByCategoryClusteringKmeans;

function tagsClusterIterate(oTags, iter){
  var tagIndexPairs = {}; //{[tag, count]: clusterIndex}
  for(var i=0; i<oTags.length; i++){
    tagIndexPairs[oTags[i]] = i; //i----[0, n)
  }
  //console.log("tagIndexPairs===================", tagIndexPairs);
  var pairTagInterNum = {}; //{[tag1, tag2]: interNum}
  var combination = [];
  for(var i=0; i<oTags.length; i++){
    combination.push(computeInterForATagIterate(oTags, oTags[i], pairTagInterNum, tagIndexPairs));
  }
  return Q.all(combination)
    .then(function(tagIndexTriple){ //[tag, maxTag, clusterIndex]
      console.log("results======================", tagIndexTriple);
      // for(var k=0; k<iter; k++){
      //   for(var i=0; i<tagIndexTriple.length; i++){
      //     if(tagIndexTriple[i][2] !== )
      //   }
      // }
    });
}
exports.tagsClusterIterate = tagsClusterIterate;

function computeInterForATagIterate(oTags, tag, pairTagInterNum, tagIndexPairs){
   var combination = [];
   for(var i=0; i<oTags.length; i++){
     if( pairTagInterNum.hasOwnProperty([tag, oTags[i]]) ){
       combination.push(pairTagInterNum[tag, oTags[i]]);
     }
     else{
       combination.push(getDataIntersectionOfTwoTags([tag, oTags[i]]));
    }
   }
  return Q.all(combination)
    .then(function(interArray){
      for(var i=0; i<interArray.length; i++){
        var index = [tag, oTags[i]];
        pairTagInterNum[index] = interArray[i];
        index = [oTags[i], tag];
        pairTagInterNum[index] = interArray[i];
      }
      var maxInter = 0;
      var clusterIndex = 0;
      var maxTag = null;
      for(var i=0; i<interArray.length; i++){
        if(tag === oTags[i]){
          continue;
        }
        if(interArray[i] > maxInter){
          maxInter = interArray[i];
          maxTag = oTags[i];
          clusterIndex = tagIndexPairs[maxTag];
        }
      }
      //console.log("[tag, maxTag, clusterIndex]===========================", [tag, maxTag, clusterIndex]);
      return [tag, maxTag, clusterIndex];
    });
}

function getAllTagsByCategoryClusteringIter(category, iter){
  return getAllTagsByCategory(category)
    .then(function(oTags){
      return tagsClusterIterate(oTags, iter);
    });
}
exports.getAllTagsByCategoryClusteringIter = getAllTagsByCategoryClusteringIter;

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
  }, {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: _db.v('category')
  }];


  var tagMaker = function(result) {
    var _tags = [];
    for (var i = 0, l = result.length; i < l; i++) {
      _tags.push([utils.getTitle(result[i].tag), utils.getTitle(result[i].category)]);
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
    .fail(function(err) {
      throw new Error(err);
    })
    .then(tagMaker)
    .then(function(result) {
      return Q.all(result.map(getTagFileNumber));
    })
    .then(function(_result) {
      var _tags = [];
      for (var i = 0, l = _result.length; i < l; i++) {
        _tags.push([utils.getTitle(_result[i][0][0]), _result[i][1]]);
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

  var resultMaker = function(result) {
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

  var resultMaker = function(result) {
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
  var queryTripleMaker = function(result) {
    if (result == "") {
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
    .then(function(result) {
      return rdfHandle.dbPut(_db, result);
    });
}
exports.setTagByUri = setTagByUri;


function setTagByProperty(tags, option) {
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate: DEFINED_PROP[option._type][option._property],
    object: option._value
  }, {
    subject: _db.v('subject'),
    predicate: DEFINED_PROP["base"]["category"],
    object: _db.v('category'),
  }];
  var queryTripleMaker = function(result) {
    if (result == "") {
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
    .then(function(result) {
      return rdfHandle.dbPut(_db, result);
    });
}
exports.setTagByProperty = setTagByProperty;


function addPreTag(tag, category) {
  var _db = rdfHandle.dbOpen();
  var _tag_url = 'http://example.org/tags#' + tag;
  var triples_ = [{
    subject: _tag_url,
    predicate: DEFINED_VOC.rdf._type,
    object: DEFINED_PROP["base"]["tags"]
  }, {
    subject: _tag_url,
    predicate: DEFINED_VOC.rdf._domain,
    object: DEFINED_TYPE[category]
  }];
  return rdfHandle.dbPut(_db, triples_);
}
exports.addPreTag = addPreTag;


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

  var queryTripleMaker = function(result) {
    if (result == "") {
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
    .then(function(result) {
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
  var tagTriMaker = function(result) {
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
    .then(function(result) {
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
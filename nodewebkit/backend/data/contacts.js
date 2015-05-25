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

var commonDAO = require("../commonHandle/CommonDAO");
var dataDes = require("../commonHandle/desFilesHandle");
var commonHandle = require("../commonHandle/commonHandle");
var rdfHandle = require("../commonHandle/rdfHandle");
var pathModule = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');
var config = require('../config');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var util = require('util');
var repo = require("../commonHandle/repo");
var utils = require("../utils");
var tagsHandle = require('../commonHandle/tagsHandle');
var Q = require('q');

var DEFINED_PROP =  require('../data/default/rdfTypeDefine').property;
var CATEGORY_NAME = "contact";
var DES_NAME = "contactDes";
var REAL_REPO_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME);
var DES_REPO_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME);
var REAL_DIR = pathModule.join(config.RESOURCEPATH, CATEGORY_NAME, 'data');
var DES_DIR = pathModule.join(config.RESOURCEPATH, DES_NAME, 'data');



function createData(item, callback) {

  console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++createData");

  if (item == [] || item == '') {
    console.log('no contact info ...');
    return callback('no contact info ...', null);
  }
  var condition = ["name = '" + item.name + "'"];
  commonDAO.findItems(null, CATEGORY_NAME, condition, null, function(err, result) {
    if (err) {
      return callback(err, null);
    } else if (result != '' && result != null) {
      var _err = 'contact exists: ' + item.name + ' ...';
      return callback(_err, null)
    }
    uniqueID.getFileUid(function(uri) {
      var currentTime = (new Date());
      var oNewItem = {
        URI: uri + "#" + CATEGORY_NAME,
        category: CATEGORY_NAME,
        name: item.name || '',
        phone: item.phone || '',
        phone2: item.phone2 || '',
        phone3: item.phone3 || '',
        phone4: item.phone4 || '',
        phone5: item.phone5 || '',
        sex: item.sex || '',
        age: item.age || '',
        email: item.email || '',
        email2: item.email2 || '',
        id: "",
        photoPath: item.photoPath || '',
        createTime: currentTime,
        lastModifyTime: currentTime,
        lastAccessTime: currentTime,
        createDev: config.uniqueID,
        lastModifyDev: config.uniqueID,
        lastAccessDev: config.uniqueID,
        others: item.others || ''
      }
      dataDes.createItem(oNewItem, DES_DIR, function() {
        commonDAO.createItem(oNewItem, function(err) {
          if (err) {
            return callback(err, null);
          }
          var sDesFilePath = pathModule.join(DES_DIR, oNewItem.name + '.md');
          repo.repoCommit(DES_REPO_DIR, [sDesFilePath], null, 'add', function(err) {
            if (err) {
              return callback(err, null);
            }
            if (item.others != '' && item.others != null) {
              var oTags = item.others.split(',');
              tagsHandle.addInTAGS(oTags, uri, function(err) {
                if (err) {
                  return callback(err, null);
                }
                callback(null, 'success');
              })
            } else {
              callback(null, 'success');
            }
          })
        })
      });
    })
  })
}
exports.createData = createData;

/**
 * @method getAllContacts
 *   获得所有联系人数组
 *
 * @param1 getAllContactsCb
 *   回调函数
 *   @result
 *     array[cate]: 联系人数组
 *        cate数据如下：
 *        cate{
 *           URI;
 *           version;
 *           name;
 *           photPath;
 *        }
 */
function getAllContacts() {
  console.log("Request handler 'getAllContacts' was called.");
  var _db = rdfHandle.dbOpen();
  var _query = [{
    subject: _db.v('subject'),
    predicate:  DEFINED_PROP["base"]["category"],
    object: 'contact'
  }, {
    subject: _db.v('subject'),
    predicate: _db.v('predicate'),
    object: _db.v('object')
  }];
  return rdfHandle.Q_dbSearch(_db, _query)
    .then(rdfHandle.Q_decodeTripeles)
    .then(function(info_) {
      var _items = [];
      for (var item in info_) {
        _items.push({
          URI: info_[item].URI || "",
          name: info_[item].lastname + info_[item].firstname,
          sex: info_[item].sex || "",
          age: info_[item].age || "",
          photoPath: info_[item].photoPath || "",
          phone: info_[item].phone || "",
          email: info_[item].email || "",
          tags: info_[item].tags || ""
        });
      }
      return _items;
    });
}
exports.getAllContacts = getAllContacts;


/**
 * @method initContacts
 *   init contacts info in to db and des files
 *
 * @param1 loadContactsCb
 *   回调函数, call back when load ends
 *
 * @param2 sItemPath
 *   string, the resource path + csvFilename
 */
function initContacts(sItemPath) {
  console.log("Request handler 'initContacts' was called.");

  //convert csv to json
  return csvtojson.Q_csvTojson(sItemPath)
    .then(function(result_) {
      //get all contact info into object
      return infoMaker(result_)
        .then(function(info_) {
          //reform the info 
          return Q.all(info_.map(dataInfo))
            .then(function(result_) {
              var _info_result = [];
              for (var i = 0, l = result_.length; i < l; i++) {
                _info_result = _info_result.concat(result_[i]);
              }
              //make triples
              return Q.all(_info_result.map(rdfHandle.Q_tripleGenerator))
                .then(function(triples_) {
                  var _triple_result = [];
                  for (var i = 0, l = triples_.length; i < l; i++) {
                    _triple_result = _triple_result.concat(triples_[i]);
                  }
                  var _db = rdfHandle.dbOpen();
                  return rdfHandle.Q_dbPut(_db, _triple_result);
                })
            })
        })
    })
}
exports.initContacts = initContacts;


function infoMaker(json) {
  var deferred = Q.defer();
  try {
    var oJson = JSON.parse(json);
  } catch (err) {
    throw err;
  }

  var oContacts = [];
  var oDesFiles = [];
  var _triples = [];
  var contactsPath = config.RESOURCEPATH + '/' + CATEGORY_NAME + "Des";
  var dataDesPath = contactsPath + "/data";
  fs.readdir(DES_DIR, function(err, result) {
    if (err) {
      deferred.reject(new Error(err));
    } else {
      if (result == '') {
        for (var k in oJson) {
          if (oJson[k].hasOwnProperty("姓")) {
            oContacts.push(oJson[k]);
          }
        }
      } else {
        for (var k in oJson) {
          if (oJson[k].hasOwnProperty("姓")) {
            var sName = oJson[k]["姓"] + oJson[k]["名"] + '.md';
            if (!utils.isExist(sName, result)) {
              oContacts.push(oJson[k]);
            }
          }
        }
      }
      deferred.resolve(oContacts);
    }
  });
  return deferred.promise;
}


function dataInfo(itemInfo) {
  var fullName = itemInfo["姓"] + itemInfo["名"];
  var fullNameUrl = 'http://example.org/category/contact#' + fullName;
  return uniqueID.Q_getFileUid()
    .then(function(uri_) {
      return {
        subject: fullNameUrl,
        base: {
          URI: uri_,
          createTime: new Date(),
          lastModifyTime: new Date(),
          lastAccessTime: new Date(),
          createDev: config.uniqueID,
          lastModifyDev: config.uniqueID,
          lastAccessDev: config.uniqueID,
          createDev: config.uniqueID,
          category: CATEGORY_NAME,
          tags: ""
        },
        extra: {
          lastname: itemInfo["姓"] || "",
          firstname: itemInfo["名"] || "",
          sex: itemInfo["性别"] || "",
          age: itemInfo["年龄"] || "",
          email: itemInfo["电子邮件地址"] || "",
          phone: itemInfo["移动电话"] || "",
          photoPath: ""
        }
      }
    });
}


/** 
 * @Method: getFilesByTag
 *    To get files with specific tag.
 *
 * @param2: sTag
 *    string, a tag name, as 'document'.
 *
 * @param1: callback
 *    @result, (_err,result)
 *
 *    @param1: _err,
 *        string, contain specific error
 *
 *    @param2: result,
 *        string, file info object in array
 *
 **/
function getFilesByTag(sTag, callback) {
  function getFilesCb(err, result) {
    if (err) {
      return callback(err, null);
    }
    callback(null, result);
  }
  tagsHandle.getFilesByTagsInCategory(getFilesCb, CATEGORY_NAME, sTag);
}
exports.getFilesByTag = getFilesByTag;


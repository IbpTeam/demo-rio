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
var commonHandle = require("../commonHandle/commonHandle");
var rdfHandle = require("../commonHandle/rdfHandle");
var pathModule = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');
var config = require('../config');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var tagsHandle = require('../commonHandle/tagsHandle');
var Q = require('q');

var DEFINED_PROP =  rdfHandle.DEFINED_PROP;
var CATEGORY_NAME = "contact";


/*TODO: rewrite */
function createData(item) {
  /*TODO: rewrite*/
  return callback();
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
  return rdfHandle.dbSearch(_db, _query)
    .then(rdfHandle.decodeTripeles)
    .then(function(info_) {
      var _items = [];
      for (var item in info_) {
        _items.push({
          URI: info_[item].URI || "",
          lastname: info_[item].lastname,
          firstname: info_[item].firstname,
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
    .then(ContactInfo);
}
exports.initContacts = initContacts;

function ContactInfo(info) {
  //get all contact info into object
  return infoMaker(info)
    .then(function(info_) {
      //reform the info object as {_base, _extra}
      return Q.all(info_.map(dataInfo))
        .then(function(json) {
          var _info_result = [];
          for (var i = 0, l = json.length; i < l; i++) {
            _info_result = _info_result.concat(json[i]);
          }
          //make valid triples
          return Q.all(_info_result.map(rdfHandle.tripleGenerator))
            .then(function(triples_) {
              var _triple_result = [];
              for (var i = 0, l = triples_.length; i < l; i++) {
                _triple_result = _triple_result.concat(triples_[i]);
              }
              //put them in leveldb
              var _db = rdfHandle.dbOpen();
              return rdfHandle.dbPut(_db, _triple_result);
            });
        });
    });
}
exports.ContactInfo = ContactInfo;


function infoMaker(oJson) {
  var deferred = Q.defer();
  try {
    if(oJson.constructor != Array)
      oJson = [oJson];
    if(typeof oJson === 'string')
      oJson = JSON.parse(oJson); 
    var oContacts = [];
    for (var k in oJson) {
      if (oJson[k].hasOwnProperty("姓") || oJson[k].hasOwnProperty("lastname")) {
        oContacts.push(oJson[k]);
      }
    }
    deferred.resolve(oContacts);
  } catch (err) {
    deferred.reject(new Error(err));
  }
  return deferred.promise;
}


function dataInfo(itemInfo) {
  var fullName;
  if(itemInfo["姓"] != null)
   fullName = itemInfo["姓"] + itemInfo["名"];
  else if(itemInfo["lastname"] != null)
    fullName = itemInfo["lastname"] + itemInfo["firstname"];
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
          lastname: itemInfo["姓"] || itemInfo["lastname"] ||"",
          firstname: itemInfo["名"] ||itemInfo["firstname"] || "",
          // name:itemInfo["姓"]+itemInfo["名"] || itemInfo["lastname"]+itemInfo["firstname"] ||"",
          sex: itemInfo["性别"] || itemInfo["sex"] || "",
          age: itemInfo["年龄"] || itemInfo["age"] || "",
          email: itemInfo["电子邮件地址"] || itemInfo["email"] || "",
          phone: itemInfo["移动电话"] || itemInfo["phone"]  || "",
          photoPath: ""
        }
      }
    });
}
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
var pathModule = require('path');
var fs = require('fs');
var fs_extra = require('fs-extra');
var config = require('../config');
var csvtojson = require('../csvTojson');
var uniqueID = require("../uniqueID");
var util = require('util');
var resourceRepo = require("../commonHandle/repo");

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
function getAllContacts(getAllCb) {
  console.log("Request handler 'getAllContacts' was called.");

  function getAllByCaterotyCb(err, data) {
    if (err) {
      console.log(err);
      return;
    }
    var contacts = [];
    data.forEach(function(each) {
      contacts.push({
        URI: each.URI,
        name: each.name,
        sex: each.sex,
        age: each.age,
        photoPath: each.path,
        phone: each.phone,
        email: each.email
      });
    });
    getAllCb(contacts);
  }
  commonDAO.findItems(null, ['Contacts'], null, null, getAllByCaterotyCb);
}
exports.getAllContacts = getAllContacts;

/*
CONTENT in contacts info:
is_delete, URI, lastAccessTime, id
createTime, createDev lastModifyTime, lastModifyDev lastAccessTime, lastAccessDev,
name, phone, sex, age, email, photoPath
*/
/**
 * @method addContact
 *   add contact info in to db and des files
 *
 * @param1 Item
 *   obdject, the item needs to be added into des file
 *
 * @param2 sItemDesPath
 *   string, the des file path for item
 *
 * @param3 isContactEnd
 *   bool, is true when get all contacts done otherwise false
 *
 * @param4 callback
 *   回调函数, call back when get all data
 *
 *
 */
function addContact(Item, sItemDesPath, isContactEnd, callback) {
  function getFileUidCb(uri) {
    var category = 'Contacts';
    var currentTime = (new Date());
    var oNewItem = {
      id: null,
      URI: uri + "#" + category,
      category: category,
      is_delete: 0,
      name: Item["姓"] + Item["名"],
      phone: Item["移动电话"],
      sex: Item["性别"],
      age: "",
      email: Item["电子邮件地址"],
      id: "",
      photoPath: "",
      createTime: currentTime,
      lastModifyTime: currentTime,
      lastAccessTime: currentTime,
      createDev: config.uniqueID,
      lastModifyDev: config.uniqueID,
      lastAccessDev: config.uniqueID,
      others: ""
    }

    function createItemCb() {
      callback(isContactEnd, oNewItem);
    }
    dataDes.createItem(oNewItem, sItemDesPath, createItemCb);
  }
  uniqueID.getFileUid(getFileUidCb);
}

/**
 * @method initContacts
 *   init contacts info in to db and des files
 *
 * @param1 loadContactsCb
 *   回调函数, call back when load ends
 *
 * @param2 resourcePath
 *   string, the resource path
 *
 */
function initContacts(loadContactsCb, resourcePath) {
  config.riolog("initContacts ..............");
  var dirCSV = fs.readdirSync(resourcePath);
  if (dirCSV.length != 1) {
    console.log("CSV file error!");
    return;
  }
  var csvFilename = dirCSV[0];
  var sItemPath = resourcePath + "/" + csvFilename;

  function csvTojsonCb(json) {
    var oJson = JSON.parse(json);
    var oContacts = [];
    var oDesFiles = [];
    var contactsPath = config.RESOURCEPATH + "/contactsDes";
    var dataDesPath = contactsPath + "/data";
    for (var k in oJson) {
      if (oJson[k].hasOwnProperty("\u59D3")) {
        oContacts.push(oJson[k]);
      }
    }

    function isEndCallback(_oDesFiles) {
      resourceRepo.repoAddsCommit(contactsPath, _oDesFiles, loadContactsCb);
    }
    for (var k = 0; k < oContacts.length; k++) {
      var isContactEnd = (k == (oContacts.length - 1));
      addContact(oContacts[k], dataDesPath, isContactEnd, function(isContactEnd, oContact) {
        var contactName = oContact.name;
        var contactPath = dataDesPath + '/' + contactName + '.md';
        oDesFiles.push(contactPath);
        commonDAO.createItem(oContact, function() {
          if (isContactEnd) {
            isEndCallback(oDesFiles);
            console.log("succcess");
            console.log("initContacts is end!!!");
          }
        })
      })
    }
  }
  csvtojson.csvTojson(sItemPath, csvTojsonCb);
}
exports.initContacts = initContacts;
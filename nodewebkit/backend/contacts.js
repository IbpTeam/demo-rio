var commonDAO = require("./DAO/CommonDAO");
var dataDes = require("./FilesHandle/desFilesHandle");
var pathModule = require('path');
var fs = require('fs');
var config = require('./config');
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");
var util = require('util');
var resourceRepo = require("./FilesHandle/repo");

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
  function getAllByCaterotyCb(err,data)
  {
    if(err){
      console.log(err);
      return;
    }    
    var contacts = new Array();
    data.forEach(function (each){
      contacts.push({
        URI:each.URI,
        name:each.name,
        sex:each.sex,
        age:each.age,
        photoPath:each.path,
        phone:each.phone,
        email:each.email
      });
    });
    getAllCb(contacts);
  }
  commonDAO.findItems(null,['Contacts'],null,null,getAllByCaterotyCb);
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
function addContact(Item,sItemDesPath,isContactEnd,callback){
  function getFileUidCb(uri){
    var category = 'Contacts';
    var currentTime = (new Date());
    Item.desPath = sItemDesPath;
    Item.name = Item["\u59D3"];
    Item.currentTime = currentTime;
    Item.URI = uri + "#" + category;
    var oItem = Item;
    var oNewItem = {
      id:null,
      URI:uri + "#" + category,
      category:category,
      is_delete:0,
      name:oItem["\u59D3"],
      phone:oItem["\u79fb\u52a8\u7535\u8bdd"],
      sex:oItem["\u6027\u522b"] || null,
      age:35,
      email:oItem["\u7535\u5b50\u90ae\u4ef6\u5730\u5740"],
      id:"",
      photoPath:"/home/xiquan/resources/contactsphoto",
      createTime:currentTime,
      lastModifyTime:currentTime,
      lastAccessTime:currentTime,
      createDev:config.uniqueID,
      lastModifyDev:config.uniqueID,
      lastAccessDev:config.uniqueID
    }
    function createItemCb(){
      callback(isContactEnd,oNewItem);
    }
    dataDes.createItem(oNewItem,sItemDesPath,createItemCb);
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
function initContacts(loadContactsCb,resourcePath){
  config.riolog("initContacts ..............");
  var dirCSV = fs.readdirSync(resourcePath);
  if(dirCSV.length != 1){
    console.log("CSV file error!");
    return;
  }
  var csvFilename = dirCSV[0];
  var sItemPath = resourcePath + "/" + csvFilename;
  function csvTojsonCb(json){
    var oJson = JSON.parse(json);
    var oContacts = new Array();
    for(var k in oJson){
      if(oJson[k].hasOwnProperty("\u59D3")){
        oContacts.push(oJson[k]);
      }
    }
    var dataDesPath = config.RESOURCEPATH+"/.des/contacts";
    function mkdirCb(err){
      if(err) {
        console.log("mk contacts desPath error!");
        console.log(err);
        return;
      }else{
        function isEndCallback(){
          resourceRepo.repoContactInit(config.RESOURCEPATH,loadContactsCb);
        }
        var oNewItems = new Array();
        function addContactCb(isContactEnd,oContact){
          oNewItems.push(oContact);
          if(isContactEnd){
            isEndCallback();
            console.log("succcess");
            console.log("initContacts is end!!!");
          }          
        }
        for(var k=0;k<oContacts.length;k++){
          var isContactEnd = (k == (oContacts.length-1));
          addContact(oContacts[k],dataDesPath,isContactEnd,addContactCb)
        }
      }
    }
    fs.mkdir(dataDesPath,mkdirCb);
  }
  csvtojson.csvTojson(sItemPath,csvTojsonCb);
}
exports.initContacts = initContacts;

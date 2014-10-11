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
commit_id, version, is_delete, URI, lastAccessTime, 
photoPath, createTime, lastModifyTime, 
id, name, phone, sex, age, email
*/
function addContact(Item,sItemDesPath,isContactEnd,callback){
  function getFileUidCb(uri){
    var category = 'Contacts';
    var currentTime = (new Date());
    Item.path = "/home/xiquan/resources/contacts";
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
      sex:"Phd",
      age:35,
      email:"my@email.com",
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
    dataDes.createItem(Item,sItemDesPath,createItemCb);
  }
  uniqueID.getFileUid(getFileUidCb);
}

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
            commonDAO.createItems(oNewItems,function(result){
              console.log(result);
              console.log("initContacts is end!!!");
            })
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

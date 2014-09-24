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
function getAll(getAllCb) {
  function getAllByCaterotyCb(data)
  {
    var contacts = new Array();
    data.forEach(function (each){
      contacts.push({
        URI:each.URI,
        version:each.version,
        name:each.name,
        photoPath:each.path
      });
    });
    getAllCb(contacts);
  }
  commonDAO.getAllByCateroty('Contacts',getAllByCaterotyCb);
}
exports.getAll = getAll;

/*
commit_id, version, is_delete, URI, lastAccessTime, 
photoPath, createTime, lastModifyTime, 
id, name, phone, sex, age, email
*/
function addContact(Item,sItemDesPath,isContactEnd,callback){
  uniqueID.getFileUid(function(uri){
    var category = 'Contacts';
    var currentTime = (new Date()).getTime();
    Item.path = "/home/xiquan/resources/contacts";
    Item.name = Item["\u59D3"];
    Item.currentTime = currentTime;
    Item.URI = uri + "#" + category;
    var oItem = Item;
    var oNewItem = {
      id:null,
      URI:uri + "#" + category,
      category:category,
      commit_id: "",
      version:"",
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
    }
    function createItemCb(){
      callback(isContactEnd,oNewItem);
    }
    dataDes.createItem(Item,sItemDesPath,createItemCb);
  })
}

function initContacts(loadResourcesCb,resourcePath){
  config.riolog("initContacts ..............");
  var sItemPath=resourcePath;
  var dataPath = resourcePath;
  var pointIndex=sItemPath.lastIndexOf('.');
  if(pointIndex == -1){
    console.log("ERROR : illeagle csv file!");
    return;
  }else{
    var itemPostfix=sItemPath.substr(pointIndex+1);
    if(itemPostfix != "CSV" && itemPostfix != "csv"){
      console.log("ERROR : illeagle csv file!");
      return;
    }
  }
  csvtojson.csvTojson(sItemPath,function(json){
    var oJson = JSON.parse(json);
    var oContacts = new Array();
    for(var k in oJson){
      if(oJson[k].hasOwnProperty("\u59D3")){
        oContacts.push(oJson[k]);
      }
    }
    var dataDesPath = config.RESOURCEPATH+"/.des/contacts";
    fs.mkdir(dataDesPath,function(err){
      if(err) {
        console.log("mk contacts desPath error!");
        console.log(err);
        return;
      }else{
        function isEndCallback(){
          resourceRepo.repoContactInit(config.RESOURCEPATH,loadResourcesCb);
        }
        var oNewItems = new Array();
        for(var k=0;k<oContacts.length;k++){
          var isContactEnd = (k == (oContacts.length-1));
          addContact(oContacts[k],dataDesPath,isContactEnd,function(isContactEnd,oContact){
            oNewItems.push(oContact);
            if(isContactEnd){
              isEndCallback();
              commonDAO.createItems(oNewItems,function(result){
                console.log(result);
                console.log("initContacts is end!!!");
              })
            }
          })
        }
      }
    })
  })
}
exports.initContacts = initContacts;

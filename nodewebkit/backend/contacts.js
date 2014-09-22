var commonDAO = require("./DAO/CommonDAO");
var dataDes = require("./FilesHandle/desFilesHandle");
var pathModule = require('path');
var fs = require('fs');
var config = require('./config');
var csvtojson = require('./csvTojson');
var uniqueID = require("./uniqueID");
var util = require('util');

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
function addContact(itemPath,itemDesPath,callback){
var pointIndex=itemPath.lastIndexOf('.');
if(pointIndex == -1){
  var itemPostfix= "none";
  var nameindex=itemPath.lastIndexOf('/');
  var itemFilename=itemPath.substring(nameindex+1,itemPath.length);
}else{
  var itemPostfix=itemPath.substr(pointIndex+1);
  var nameindex=itemPath.lastIndexOf('/');
  var itemFilename=itemPath.substring(nameindex+1,pointIndex);
}
if(itemPostfix == 'csv' || itemPostfix == 'CSV'){
  config.riolog("postfix= "+itemPostfix);
  var currentTime = (new Date()).getTime();
  csvtojson.csvTojson(itemPath,function(json){
    console.log(json)
    var oJson = JSON.parse(json);
    var oContacts = new Array();
    var category = 'Contacts';
    for(var k=0;k<oJson.length;k++){
      if(oJson[k].hasOwnProperty("\u59D3")){
        uniqueID.getFileUid(function(uri){
          var oItem = oJson[k];
          oItem.path = itemPath;
          oItem.name = oItem["\u59D3"];
          oItem.currentTime = currentTime;
          oItem.URI = uri + "#" + category;
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
            postfix:itemPostfix,
            id:"",
            photoPath:itemPath,
            location:"Mars",
            createTime:currentTime,
            lastModifyTime:currentTime,
            lastAccessTime:currentTime,
            currentTime:currentTime,
          }
          function createItemCb(){
            console.log("create Contacts!")
          }
          dataDes.createItem(oNewItem,itemDesPath,createItemCb)
          oContacts.push(oItem);
          if(isLoadEnd){
            console.log("my Contacts=======================")
            console.log(oContacts)
            callback(oContacts);
          }
        })
      }
    }
  })
}else{
  console.log("No contacts file!!!")
}
fs.stat(itemPath,getFileStatCb);
}
*/
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
      photoPath:"/home/xiquan/resources/contacts",
      createTime:currentTime,
      lastModifyTime:currentTime,
      lastAccessTime:currentTime,
      currentTime:currentTime,
    }
    function createItemCb(){
      callback(isContactEnd,oNewItem);
      console.log("create Contacts!");
    }
    dataDes.createItem(Item,sItemDesPath,createItemCb);
  })
}

function initContacts(loadResourcesCb,resourcePath){
  config.riolog("initData ..............");
  var sItemPath=resourcePath+"/contacts/contacts.CSV";
  var dataDesPath = resourcePath + "/.contacts";
  var pointIndex=sItemPath.lastIndexOf('.');
  if(pointIndex == -1){
    console.log("ERROR : illeagle csc file!");
    return;
  }else{
    var itemPostfix=sItemPath.substr(pointIndex+1);
    //var nameindex=sItemPath.lastIndexOf('/');
    //var itemFilename=sItemPath.substring(nameindex+1,pointIndex);
    if(itemPostfix != "CSV" && itemPostfix != "csv"){
      console.log("ERROR : illeagle csc file!");
      return;
    }
  }
  csvtojson.csvTojson(sItemPath,function(json){
    console.log(json);
    var oJson = JSON.parse(json);
    var oContacts = new Array();
    for(var k in oJson){
      if(oJson[k] != {}){
        oContacts.push(oJson[k]);
      }
    }

    fs.mkdir(dataDesPath,function(err){
      if(err) {
        console.log("mk contacts desPath error!");
        console.log(err);
        return;
      }else{
        function isEndCallback(){
          //resourceRepo.repoInit(resourcePath,loadResourcesCb);
        }
        var oNewItems = new Array();
        for(var k=0;k<oContacts.length;k++){
          var isContactEnd = (k == (oContacts.length-1));
          addContact(oContacts[k],dataDesPath,isContactEnd,function(isContactEnd,oContact){
            oNewItems.push(oContact);
            if(isContactEnd){
              isEndCallback();
              commonDAO.createItems(oNewItems,function(result){
                console.log("initContacts is end!!!");
                console.log(result);
              })
            }
          })
        }
      }
    })

  })
}
exports.initContacts = initContacts;

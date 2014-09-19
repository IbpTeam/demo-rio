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
function addContact(Item,sItemDesPath,callback){
  uniqueID.getFileUid(function(uri){
    Item.path = sItemPath;
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
      postfix:itemPostfix,
      id:"",
      photoPath:sItemPath,
      location:"Mars",
      createTime:currentTime,
      lastModifyTime:currentTime,
      lastAccessTime:currentTime,
      currentTime:currentTime,
    }
    function createItemCb(){
      callback()
      console.log("create Contacts!")
    }
    dataDes.createItem(oItem,sItemDesPath,createItemCb);
  })
}

function addContactDB(oContacts,isLoadEnd,oItem,callback){
  oContacts.push(oItem);
  if(isLoadEnd){
    console.log("my Contacts=======================")
    console.log(oContacts)
    callback(oContacts);
  }
}


function addContactsCSV(sItemPath,sItemDesPath,callback){
  var pointIndex=sItemPath.lastIndexOf('.');
  if(pointIndex == -1){
    var itemPostfix= "none";
    var nameindex=sItemPath.lastIndexOf('/');
    var itemFilename=sItemPath.substring(nameindex+1,sItemPath.length);
  }else{
    var itemPostfix=sItemPath.substr(pointIndex+1);
    var nameindex=sItemPath.lastIndexOf('/');
    var itemFilename=sItemPath.substring(nameindex+1,pointIndex);
  }
  if(itemPostfix == 'csv' || itemPostfix == 'CSV'){
    config.riolog("postfix= "+itemPostfix);
    var currentTime = (new Date()).getTime();
    csvtojson.csvTojson(sItemPath,function(json){
      var oJson = JSON.parse(json);
      var oContacts = new Array();
      var category = 'Contacts';
      for(var k=0;k<oJson.length;k++){
        if(oJson[k].hasOwnProperty("\u59D3")){
          console.log(oJson[k]["\u59D3"]+"=====path====="+sItemPath);
          addContact((oJson[k],sItemDesPath,function(){
            console.log("good")
          })
        } 
      }
    }else{
      console.log("No contacts file!!!")
    }
  }
}


function initContacts(loadResourcesCb,resourcePath)
{
  config.riolog("initData ..............");
  dataPath=resourcePath;
  fs.mkdir(dataPath+'/.des',function (err){
    if(err) {
      console.log("mk resourcePath error!");
      console.log(err);
      return;
    }
    else{
      var fileList = new Array();
      var fileDesDir = new Array();
      function walk(path,pathDes){  
        var dirList = fs.readdirSync(path);
        dirList.forEach(function(item){
          if(fs.statSync(path + '/' + item).isDirectory()){
            if(item == 'contacts'){
              fs.mkdir(pathDes + '/' + item, function(err){
                if(err){ 
                  console.log("mkdir error!");
                  console.log(err);
                  //return;
                }
              });              
              walk(path + '/' + item,pathDes + '/' + item);
            }
          }
          else{
            var sPosIndex = (item).lastIndexOf(".");
            var sPos = (sPosIndex == -1) ? "" : (item).substring(sPosIndex,(item).length);
            if(sPos == '.csv' || sPos == '.CSV'){
              fileDesDir.push(pathDes);
              fileList.push(path + '/' + item);
            }
          }
        });
      }
      walk(resourcePath,resourcePath+'/.des');
      config.riolog(fileList); 
      writeDbNum=fileList.length;
      config.riolog('writeDbNum= '+writeDbNum);
      function isEndCallback(){
        resourceRepo.repoInit(resourcePath,loadResourcesCb);
      }
      var oNewItems = new Array();
      for(var k=0;k<fileList.length;k++){
        var isLoadEnd = (k == (fileList.length-1));
        addContactsCSV(fileList[k],fileDesDir[k],function(oNewItem){
        });
      }
    }
  });
}
exports.initContacts = initContacts;


/*
function initContacts(loadResourcesCb,resourcePath)
{
  config.riolog("initData ..............");
  dataPath="/home/xiquan/resources";
  contactsPath =dataPath+"contacts";
  fs.mkdir(dataPath+'/.des/contacts',function (err){
    if(err) {
      console.log("mk resourcePath error!");
      console.log(err);
      return;
    }
  })
  function isEndCallback(){
    resourceRepo.repoInit(resourcePath,loadResourcesCb);
  }
  var oNewItems = new Array();
  var contactsDesPath = dataPath+'/.des/contacts';
  addContact(contactsPath,contactsDesPath,function(oNewItem){
    oNewItems.push(oNewItem);
      isEndCallback();
      commonDAO.createItems(oNewItems,function(result){
        console.log("initContacts is end!!!");
        console.log(result);
      });
  });
}
exports.initContacts = initContacts;
*/
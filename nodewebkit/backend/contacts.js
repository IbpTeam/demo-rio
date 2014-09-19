var commonDAO = require("./DAO/CommonDAO");
var fs = require('fs');
var config = require('./config');

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



function addContact(itemPath,itemDesPath,isLoadEnd,callback){
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
      var oJson = JSON.parse(json);
      var oContacts = new Array();
      var category = 'Contacts';
      for(var k=0;k<oJson.length;k++){
        if(oJson[k].hasOwnProperty("\u59D3")){
          var oItem = oJson[k];
          oJson[k].path = itemPath;
          oJson[k].name = oItem["\u59D3"];
          oJson[k].currentTime = currentTime;
          var oNewItem = oItem;
          var oItem = {
            id:null,
            URI:"",//uri + "#" + category,
            category:category,
            commit_id: "",
            version:"",
            is_delete:0,
            name:oNewItem["\u59D3"],
            phone:oNewItem["\u79fb\u52a8\u7535\u8bdd"],
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
          oContacts.push(oItem);

          uniqueIDHelper(category,oNewItem,itemDesPath,function(uri,category,oNewItem,itemDesPath){
            oNewItem.URI = uri;
            dataDes.createItem(category,oNewItem,itemDesPath);
          })
        }
      }
      callback(isLoadEnd,oContacts)
    })
}    
fs.stat(itemPath,getFileStatCb);
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
      var sConfigPath = pathModule.join(config.USERCONFIGPATH,"config.js");
      fs.exists(sConfigPath, function (exists) {
        util.log(sConfigPath+ exists);
        if(exists==false){
          var oldDataDir=null;
        }
        else{
          var oldDataDir=require(sConfigPath).dataDir;
        }
        util.log("oldDataDir = "+oldDataDir);
        if(oldDataDir==null || oldDataDir!=resourcePath){
          var context="var dataDir = '"+resourcePath+"';\nexports.dataDir = dataDir;";
          util.log("write "+config.USERCONFIGPATH+"config.js : " +context);
          fs.writeFile(sConfigPath,context,function(e){
            if(e) throw e;
          });
        }
      });
      function walk(path,pathDes){  
        var dirList = fs.readdirSync(path);
        dirList.forEach(function(item){
          if(fs.statSync(path + '/' + item).isDirectory()){
            if(item != '.git' && item != '.des'){
              fs.mkdir(pathDes + '/' + item, function(err){
                if(err){ 
                  console.log("mkdir error!");
                  console.log(err);
                  return;
                }
              });              
              walk(path + '/' + item,pathDes + '/' + item);
            }
          }
          else{
            var sPosIndex = (item).lastIndexOf(".");
            var sPos = (sPosIndex == -1) ? "" : (item).substring(sPosIndex,(item).length);
            if(sPos != '.csv' && sPos != '.CSV'){
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
        addData(fileList[k],fileDesDir[k],isLoadEnd,function(isLoadEnd,oNewItem){
          oNewItems.push(oNewItem);
          if(isLoadEnd){
            isEndCallback();
            commonDAO.createItems(oNewItems,function(result){
              console.log("initContacts is end!!!");
              console.log(result);
           });
          }
        });
      }
    }
  });
}
exports.initContacts = initContacts;
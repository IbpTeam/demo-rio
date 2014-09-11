//var config = require("./config");
var categoryDAO = require("./CategoryDAO");
var contactsDAO = require("./ContactsDAO");
var picturesDAO = require("./PicturesDAO");
var videosDAO = require("./VideosDAO");
var documentsDAO = require("./DocumentsDAO");
var musicDAO = require("./MusicDAO");
var recentDAO = require("./RecentDAO");
var actionHistoryDAO = require("./ActionHistoryDAO");
var config = require("../config");
var uniqueID = require("../uniqueID");

//连接数据库
function openDB(){
  return new sqlite3.Database('./backend/db/rio');
}

//关闭数据库
function closeDB(database){
  database.close();
}

exports.countTotalByCategory = function(category, callback) {

  var countDao = null;

  switch(category){
    case 'Contacts' : {
      countDao = contactsDAO;
    }
    break;
  
    case 'Pictures' : {
      countDao = picturesDAO;
    }
    break;
    
    case 'Videos' : {
      countDao = videosDAO;
    }
    break;
    
    case 'Documents' : {
      countDao = documentsDAO;
    }
    break;
    
    case 'Music' : {
      countDao = musicDAO;
    }
    break;
  }

  countDao.countTotal(function(err, countNum){
    if(err){
      config.dblog(err);
      callback(null);
    }
    callback(countNum);
  });
}

exports.getMaxIdByCategory = function(category, callback) {
  switch(category){ 
    case 'Pictures' : {
      picturesDAO.getMaxId(function(err, picturesMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(picturesMaxid);
      });
    }
    break;
    
    case 'Videos' : {
      videosDAO.getMaxId(function(err, videosMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(videosMaxid);
      });
    }
    break;
    
    case 'Documents' : {
      documentsDAO.getMaxId(function(err, documentsMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(documentsMaxid);
      });
    }
    break;
    
    case 'Music' : {
      musicDAO.getMaxId(function(err, musicMaxid){
        if(err){
          config.dblog(err);
          callback(null);
        }
        callback(musicMaxid);
      });
    }
    break;
  }
}

exports.getAllByCateroty = function(caterogy, callback) {

  var dao = null;
  var prefix = null;

  switch(caterogy){
    case 'Contacts' : {
      dao = contactsDAO;
      //prefix = "1#";
    }
    break;
  
    case 'Pictures' : {
      dao = picturesDAO;
      //prefix = "2#";
    }
    break;
    
    case 'Videos' : {
      dao = videosDAO;
      //prefix = "3#";
    }
    break;
    
    case 'Documents' : {
      dao = documentsDAO;
      //prefix = "4#";
    }
    break;
    
    case 'Music' : {
      dao = musicDAO;
      //prefix = "5#";
    }
    break;
  }

  dao.findAll(function(err, items){
    if(err){
      config.dblog(err);
      callback(null);
    }
    //items.forEach(function(item){
    //  item.id = prefix + item.id;
    //});
    callback(items);
  });
}

exports.getCategories = function(callback){
  categoryDAO.findAll(function(err, categories){
    if(err){
      config.dblog(err);
      callback(null);
    }
    categories.forEach(function(categorie){
      categorie.id = "0#" + categorie.id;
    });
    callback(categories)
  });
}

exports.getItemByUri = function(uri, callback){
  config.dblog("Get item by uri: " + uri);
  
  var aUri = uri.split('#');
  if (aUri.length != 3) {
    config.dblog("Error: uri is wrong in getItemByUri!");
    callback(null);
    return;
  }
  var sTableName = aUri[2];
  config.dblog("GetItemByUri: TableName is:" + sTableName);

  var oDao = null;

  switch(sTableName){
    case 'contacts' : {
      oDao = contactsDAO;
    }
    break;
    case 'pictures' : {
      oDao = picturesDAO;
    }
    break;
    case 'videos' : {
      oDao = videosDAO;
    }
    break;
    case 'documents' : {
      oDao = documentsDAO;
    }
    break;
    case 'music' : {
      oDao = musicDAO;
    }
    break;
    default:{
      config.dblog("GetItemByUri: this is default in switch!");
    }
  }

  //Find item by uri in specific table
  oDao.findByUri(uri,function(err,item){
    if(err){
      callback(null);
    }
    else{
      item.path=item.path.replace(/\s/g, "%20");
      callback(item);
    }
  });
}

exports.getItemByPath = function(path, callback){
  var createDAO = null;
  var pointIndex=path.lastIndexOf('.');
  var itemPostfix=path.substr(pointIndex+1);
  var nameindex=path.lastIndexOf('/');
  var itemFilename=path.substring(nameindex+1,pointIndex);
  if(itemPostfix == 'contacts'){
    createDAO = contactsDAO;
  }
  else if(itemPostfix == 'ppt' || itemPostfix == 'pptx'|| itemPostfix == 'doc'|| itemPostfix == 'docx'|| itemPostfix == 'wps'|| itemPostfix == 'odt'|| itemPostfix == 'et'|| itemPostfix == 'txt'|| itemPostfix == 'xls'|| itemPostfix == 'xlsx' || itemPostfix == 'ods' || itemPostfix == 'zip' || itemPostfix == 'sh' || itemPostfix == 'gz' || itemPostfix == 'html' || itemPostfix == 'et' || itemPostfix == 'odt' || itemPostfix == 'pdf'){
    createDAO = documentsDAO;
  }
  else if(itemPostfix == 'jpg' || itemPostfix == 'png'){
    createDAO = picturesDAO;
  }
  else if(itemPostfix == 'mp3' || itemPostfix == 'ogg' ){
    createDAO = musicDAO;
  } 
  else {
    callback(null);
    return;
  } 
  if(createDAO==contactsDAO){
    function findByNameCb(err,item){
      if(err){
        createDAO.findByName(path,findByNameCb);
      }
      else{
        callback(item);
      }
    }
    createDAO.findByName(path,findByNameCb);
  }
  else{
    function findByPathCb(err,item){
      if(err){
        createDAO.findByPath(path,findByPathCb);
      }
      else{
        callback(item);       
      }
    }
    createDAO.findByPath(path,findByPathCb);
  }
}

/**
 * @method createItems
 *   
 * @param items
 *
 * @param callback
 */
exports.createItems = function(items,callback){
  var aSqlArray = new Array();
  items.forEach(function(item){
    var sSqlStr = "insert into " + item.category;
    var sKeyStr = " (id";
    var sValueStr = ") values (null";
    for(var key in item){
      sKeyStr = sKeyStr + "," + key;
      sValueStr = sValueStr + "," + item[key];
    }
    sSqlStr = sSqlStr + sKeyStr + sValueStr + ")";
    console.log(sSqlStr);     
  });
  console.log("num====================="+items.length);
  //var oDB = openDB();
  //db.all(SQLSTR.FINDALLCATEGORIES, findAllCallBack);
  //closeDB(oDB);
}

exports.createItem = function(category, item, callback , createDesFileCb , loadResourcesCb){
  var createDAO = null;
  var sTableName = null;
  //Get uniform resource identifier
  var uri = "specificURI";

  switch(category){
    case 'Contacts' : {
      createDAO = contactsDAO;
      sTableName = '#contacts';
    }
    break;
    case 'Pictures' : {
      config.dblog('insert picture');
      createDAO = picturesDAO;
      sTableName = '#pictures';
    }
    break;
    case 'Videos' : {
      config.dblog('insert video');
      createDAO = videosDAO;
      sTableName = '#videos';
    }
    break;
    case 'Documents' : {
      config.dblog('insert document');
      createDAO = documentsDAO;
      sTableName = '#documents';
    }
    break;
    case 'Music' : {
      config.dblog('insert music');
      createDAO = musicDAO;
      sTableName = '#music';
    }
    break;
/*    case 'recent' : {
      config.dblog('insert recent');
      recentDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
      return;
    }
    break;    
*/   
  }
  //Get uniform resource identifier
  uniqueID.getFileUid(function(uri){
    item.URI = uri + sTableName;
    uniqueID.getRandomBytes(12,function(version){
      if (version != null) {
        item.version = version;
        createDAO.createItem(item, function(err){
          if(err){
            callback(category,item,err,loadResourcesCb);
          }
          else{
            var oNewItem = {
              fileUri:item.URI,
              lastAccessTime:item.lastAccessTime
            };
            function createRecentItemCb(err){
              if(err){
                recentDAO.createItem(oNewItem,createRecentItemCb);
              }
              else{
                function createInsertItemCB(err){
                  if (err) {
                    actionHistoryDAO.createInsertItem(item.URI,item.version,createInsertItemCB);
                  }
                  else{
                    callback(category,item,'successfull',loadResourcesCb);
                  }
                }
                actionHistoryDAO.createInsertItem(item.URI,item.version,createInsertItemCB);
              }
            }
            recentDAO.createItem(oNewItem,createRecentItemCb);
          }
        });
      }
      else{
        console.log("Action History DAO Exception: randomId is null.");
      }
    });
  });
  //console.log(item);
  createDesFileCb(item);
}

exports.deleteItemByUri = function(uri, callback ,rmDataByUriCb){
  config.dblog("delete uri:" + uri);
  
  var aUri = uri.split('#');
  if (aUri.length != 3) {
    config.dblog("Error: uri is wrong in getItemByUri!");
    callback(uri,"Error: uri is wrong in getItemByUri!",rmDataByUriCb);
    return;
  }
  var sTableName = aUri[2];
  config.dblog("GetItemByUri: TableName is:" + sTableName);

  var oDeleteDao = null;

  switch(sTableName){
    case 'contacts' : {
      oDeleteDao = contactsDAO;
    }
    break;
    case 'pictures' : {
      oDeleteDao = picturesDAO;
    }
    break;
    case 'videos' : {
      oDeleteDao = videosDAO;
    }
    break;
    case 'documents' : {
      oDeleteDao = documentsDAO;
    }
    break;
    case 'music' : {
      oDeleteDao = musicDAO;
    }
    break;
    default:{
      config.dblog("GetItemByUri: this is default in switch!");
    }
  }

  oDeleteDao.deleteItemByUri(uri, function(err){
    if(err){
      callback(uri,err,rmDataByUriCb);
    }else{
      callback(uri,"successfull",rmDataByUriCb);
    }
  })
}

exports.updateItemValue = function(uri, version, item, callback){
  var updateDAO=null;
  function update(){  
      
      uniqueID.getRandomBytes(12,function(newVersion){
      if (newVersion != null) {  
        //console.log(updateDAO+uri+" "+key+" "+value); 
        updateDAO.updateItemValueByUri(uri,newVersion,item,function(err){
          if(err){
            console.log("updateItemValueByUri error");
            callback(uri,version,item,err);
          }
          else{
            console.log("############update is_delete complete");
            actionHistoryDAO.createUpdateHistoryItem(uri, version, newVersion, item, function(err){
              if(err){
                callback(uri,version,item,err);
              }
              else{
                config.dblog("update " + uri + " successfull");
                callback(uri,version,item,'successfull');
              }
            });
          }
        });
      }
      else{
        console.log("Action History DAO Exception: randomId is null.");
      }
    });
  }
  contactsDAO.findByUri(uri,function(err,item){
    if(item==null){
      picturesDAO.findByUri(uri,function(err,item){
        if(item==null){
          videosDAO.findByUri(uri,function(err,item){
            if(item==null){
              documentsDAO.findByUri(uri,function(err,item){
                if(item==null){
                  musicDAO.findByUri(uri,function(err,item){
                    if(item==null){
                      callback(err);
                      return;
                    }
                    else{
                      updateDAO=musicDAO;
                      console.log("updateDAO = musicDAO");   
                      update();
                    }
                  });
                }
                else{
                  updateDAO=documentsDAO;
                  console.log("updateDAO = documentsDAO");  
                  update();
                }
              });
            }
            else{
              updateDAO=videosDAO;
              console.log("updateDAO = videosDAO");  
              update();
            }
          });
        }
        else{
          updateDAO=picturesDAO;
          console.log("updateDAO = picturesDAO");  
          update();
        }
      });
    }
    else{
      var json=JSON.stringify(item);
      updateDAO=contactsDAO;
      console.log("updateDAO = contactsDAO");  
      console.log("item = "+json);
      update();
    }
  });
}

exports.modifyOrInsertUpdateItems = function(modifyHistoryItems, createHistoryItems, createOperationItems){
  if(modifyHistoryItems != ""){
    modifyHistoryItems.forEach(function(modifyItem){    
      var sqlstr="UPDATE UpdateHistory SET parents='"+modifyItem.parents+"',children='"+modifyItem.children+"' WHERE version_id='"+modifyItem.version_id+"'";
      function modifyUpdateCb(err,sql){
        if (err) {
          console.log("Error: modify update history error ! " + err);
          actionHistoryDAO.modifyUpdateHistoryItem(sql,modifyUpdateCb);
        }
      }
      actionHistoryDAO.modifyUpdateHistoryItem(sqlstr,modifyUpdateCb);
    });
  }
  if(createHistoryItems != ""){
    createHistoryItems.forEach(function(newHistoryItem){
      function insertUpdateHistoryCb(err,historyItem){
        if (err) {
          console.log("Error: insert update history error ! " + err);
          actionHistoryDAO.insertUpdateHistoryItem(historyItem,insertUpdateHistoryCb);
        }
      }
      actionHistoryDAO.insertUpdateHistoryItem(newHistoryItem,insertUpdateHistoryCb);
    });
  }
  if(createOperationItems != ""){
    createOperationItems.forEach(function(newOperationItem){
      function insertUpdateOperationCb(err,operationItem){
        if (err) {
          console.log("Error: insert update operation error ! " + err);
          actionHistoryDAO.insertUpdateOperationItem(operationItem,insertUpdateOperationCb);
        }
      }
      actionHistoryDAO.insertUpdateOperationItem(newOperationItem,insertUpdateOperationCb);
    });
  }
}

exports.updateRecentTable = function(uri,time,callback){
  recentDAO.updateTime(uri,time, function(err){
    if(err){
      callback(uri,time,err);
    }
    else{
      config.dblog("update recent successfull");
      callback(uri,time,'successfull');
    }
  });  
}

exports.getRecentByOrder = function(callback){
  recentDAO.findAllByOrder(function(err, recent){
    if(err){
      config.dblog(err);
      callback(null);
    }
    callback(recent);
  });
}

exports.queryItemInAllByStr = function(str, callback){
  var itemArray = {};
  contactsDAO.findAllByStr(str, function(contacts){
    itemArray.push(items);
    callback(itemArray);
});
}

exports.findEachActionHistory = function(action, callback){
  actionHistoryDAO.findAll(action, function(err, actions){
    if(err){
      config.dblog(err);
      callback(null);
    }
    callback(actions);
  });
}

exports.findAllActionHistory = function(callback){
  var insertActions = null;
  var deleteActions = null;
  var updateActions = null;

  actionHistoryDAO.findAll("insert", function(err, insActions){
    if(err){
      config.dblog(err);
      callback(null);
    }else{
      insertActions = insActions;
      actionHistoryDAO.findAll("delete", function(err, delActions){
        if(err){
          config.dblog(err);
          callback(null);
        }else{
          deleteActions = delActions;
          actionHistoryDAO.findAll("update", function(err, updActions){
            if(err){
              config.dblog(err);
              callback(null);
            }else{
              updActions.forEach(function(updAction){
                updAction.parents = JSON.parse(updAction.parents);
                if(updAction.children != "")
                  updAction.children = JSON.parse(updAction.children);
                //console.log("============================================zfbfd:");
                //console.log(updAction.parents);
                //console.log(updAction.children);
              });
              updateActions = updActions;
              callback(insertActions, deleteActions, updateActions);
            }
          });
        }
      });
    }
  });
}

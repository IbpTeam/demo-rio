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
      prefix = "1#";
    }
    break;
  
    case 'Pictures' : {
      dao = picturesDAO;
      prefix = "2#";
    }
    break;
    
    case 'Videos' : {
      dao = videosDAO;
      prefix = "3#";
    }
    break;
    
    case 'Documents' : {
      dao = documentsDAO;
      prefix = "4#";
    }
    break;
    
    case 'Music' : {
      dao = musicDAO;
      prefix = "5#";
    }
    break;
  }

  dao.findAll(function(err, items){
    if(err){
      config.dblog(err);
      callback(null);
    }
    items.forEach(function(item){
      item.id = prefix + item.id;
    });
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

exports.getItemById = function(id, callback){
  config.dblog("get id:" + id);
  
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);

  config.dblog("tableId id:" + tableId);
  config.dblog("dataId id:" + dataId);

  switch(tableId){
    case '1' : {
      contactsDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
          item.id="1#"+item.id;
          item.photoPath=item.photoPath.replace(/\s/g, "%20");
          callback(item);
        }
      });
    }
    break;
    case '2' : {
      picturesDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
          item.id="2#"+item.id;
          item.path=item.path.replace(/\s/g, "%20");    
          callback(item);
        }
      });
    }
    break;
    case '3' : {
      videosDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
          item.id="3#"+item.id;
          item.path=item.path.replace(/\s/g, "%20");        
          callback(item);
        }
      });
    }
    break;
    case '4' : {
      documentsDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
          item.id="4#"+item.id;
          item.path=item.path.replace(/\s/g, "%20");        
          callback(item);
        }
      });
    }
    break;
    case '5' : {
      musicDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
          item.id="5#"+item.id;
          item.path=item.path.replace(/\s/g, "%20");        
          callback(item);
        }
      });
    }
    break;
    
  }
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

exports.createItem = function(category, item, callback , loadResourcesCb){
  var createDAO = null;
  var tableName = null;
  //Get uniform resource identifier
  var uri = "specificURI";
  switch(category){
    case 'Contacts' : {
      createDAO = contactsDAO;
      tableName = 'contacts';
    }
    break;
    case 'Pictures' : {
      config.dblog('insert picture');
      createDAO = picturesDAO;
      tableName = 'pictures';
    }
    break;
    case 'Videos' : {
      config.dblog('insert video');
      createDAO = videosDAO;
      tableName = 'videos';
    }
    break;
    case 'Documents' : {
      config.dblog('insert document');
      createDAO = documentsDAO;
      tableName = 'documents';
    }
    break;
    case 'Music' : {
      config.dblog('insert music');
      createDAO = musicDAO;
      tableName = 'music';
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
    item.URI = uri;
    uniqueID.getRandomBytes(12,function(version){
      if (version != null) {
        item.version = version;
        createDAO.createItem(item, function(err){
          if(err){
            callback(category,item,err,loadResourcesCb);
          }
          else{
            if(category=='Contacts'){
              function findByNameCb(err,insertItem){
                if(err){
                  console.log("DB "+tableName+" : "+item.name+" error!!");
                  createDAO.findByName(item.name,findByNameCb);
                }
                else{
                  var newItem={
                    id:null,
                    tableName:tableName,
                    specificId:insertItem.id,
                    lastAccessTime:insertItem.lastAccessTime
                  };
                  function createRecentItemCb(err){
                    if(err){
                      recentDAO.createItem(newItem,createRecentItemCb);
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
                  recentDAO.createItem(newItem,createRecentItemCb);
                }
              }
              createDAO.findByName(item.name,findByNameCb);
            }
            else{
              function findByPathCb(err,insertItem){
                if(err){
                  console.log("DB "+tableName+" : "+item.path+" error!!");
                  createDAO.findByPath(item.path,findByPathCb);
                }
                else{
                  var newItem={
                    id:null,
                    tableName:tableName,
                    specificId:insertItem.id,
                    lastAccessTime:insertItem.lastAccessTime
                  };
                  function createRecentItemCb(err){
                    if(err){
                      recentDAO.createItem(newItem,createRecentItemCb);
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
                  recentDAO.createItem(newItem,createRecentItemCb);
                }
              }
              createDAO.findByPath(item.path,findByPathCb);
            }
          }
        });
      }
      else{
        console.log("Action History DAO Exception: randomId is null.");
      }
    });
  });
}

exports.deleteItemById = function(id, uri, callback ,rmDataByIdCb){
  config.dblog("delete id:" + id);
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);
    config.dblog("tableId id:" + tableId);
        config.dblog("dataId id:" + dataId);
  var deleteDAO = null;
  switch(tableId){
    case '1' : {
      deleteDAO = contactsDAO;
    }
    break;
    case '2' : {
      deleteDAO = picturesDAO;
    }
    break;
    case '3' : {
      deleteDAO = videosDAO;
    }
    break;
    case '4' : {
      deleteDAO = documentsDAO;
    }
    case '5' : {
      deleteDAO = musicDAO;
    }
    break;    
    
  }

  deleteDAO.deleteItemByUri(dataId, uri, function(err){
    if(err){
      callback(id,err,rmDataByIdCb);
    }
    else{
      actionHistoryDAO.removeInsertItem(uri, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          actionHistoryDAO.removeUpdateItem(uri, function(err){
            if(err){
              callback(id,err,rmDataByIdCb);
            }
            else{
              actionHistoryDAO.createDeleteItem(uri,function(err){
                if(err){
                  callback(uri,err,rmDataByIdCb);
                }
                else{
                  callback(id,'successfull',rmDataByIdCb);
                }
              });
            }
          });
        }
      });
    }
  })
}

function getItemByUri(uri,getItemByUriCb){
  contactsDAO.findByUri(uri,function(err,item){
    if(err){
      picturesDAO.findByUri(uri,function(err,item){
        if(err){
          videosDAO.findByUri(uri,function(err,item){
            if(err){
              documentsDAO.findByUri(uri,function(err,item){
                if(err){
                  musicDAO.findByUri(uri,function(err,item){
                    if(err){
                      getItemByUriCb(err);
                    }
                    else{
                      getItemByUriCb(item);
                    }
                  });
                }
                else{
                  getItemByUriCb(item);
                }
              });
            }
            else{
              getItemByUriCb(item);
            }
          });
        }
        else{
          getItemByUriCb(item);
        }
      });
    }
    else{
      getItemByUriCb(item);
    }
  });
}
exports.getItemByUri = getItemByUri;

exports.updateItemValue = function(id, uri, key, value, version, callback){
  var updateDAO=null;
  function update(){  
      
      uniqueID.getRandomBytes(12,function(newVersion){
      if (newVersion != null) {  
        console.log(updateDAO+uri+" "+key+" "+value);   
        updateDAO.updateItemValueByUri(uri,key,value,newVersion, function(err){
          if(err){
            console.log("updateItemValueByUri error");
            callback(id,uri,key,value,version,err);
          }
          else{
            console.log("############update is_delete complete");
            actionHistoryDAO.createUpdateHistoryItem(uri, key, value, version, newVersion, function(err){
              if(err){
                callback(id,uri,key,value,version,err);
              }
              else{
                config.dblog("update " + uri + " successfull");
                callback(id,uri,key,value,version,'successfull');
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

exports.updateRecentTable = function(tableName,dataId,time,callback){
  recentDAO.updateTime(tableName,dataId,time, function(err){
    if(err){
      callback(tableName,dataId,time,err);
    }
    else{
      config.dblog("update recent successfull");
      callback(tableName,dataId,time,'successfull');
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

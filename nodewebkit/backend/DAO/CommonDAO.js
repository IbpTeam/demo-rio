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

exports.getAllByCateroty = function(caterogy, callback) {
  switch(caterogy){
    case 'Contacts' : {
      contactsDAO.findAll(function(err, contacts){
        if(err){
          config.dblog(err);
          callback(null)
        }
        contacts.forEach(function(contact){
          contact.id = "1#" + contact.id;
        });
        callback(contacts)
      });
    }
    break;
  
    case 'Pictures' : {
      picturesDAO.findAll(function(err, pictures){
        if(err){
          config.dblog(err);
          callback(null)
        }
        pictures.forEach(function(picture){
          picture.id = "2#" + picture.id;
        });
        callback(pictures)
      });
    }
    break;
    
    case 'Videos' : {
      videosDAO.findAll(function(err, videos){
        if(err){
          config.dblog(err);
          callback(null)
        }
        videos.forEach(function(video){
          video.id = "3#" + video.id;
        });
        callback(videos)
      });
    }
    break;
    
    case 'Documents' : {
      documentsDAO.findAll(function(err, documents){
        if(err){
          config.dblog(err);
          callback(null)
        }
        documents.forEach(function(document){
          document.id = "4#" + document.id;
        });
        callback(documents)
      });
    }
    break;
    
    case 'Music' : {
      musicDAO.findAll(function(err, music){
        if(err){
          config.dblog(err);
          callback(null)
        }
        music.forEach(function(each){
          each.id = "5#" + each.id;
        });
        callback(music)
      });
    }
    break;
  }
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

exports.createItem = function(category, item, callback , loadResourcesCb){
  var createDAO = null;
  //Get uniform resource identifier
  var uri = "specificURI";
  switch(category){
    case 'Contacts' : {
      createDAO = contactsDAO;
    }
    break;
    case 'Pictures' : {
      config.dblog('insert picture');
      createDAO = picturesDAO;
    }
    break;
    case 'Videos' : {
      config.dblog('insert video');
      createDAO = videosDAO;
    }
    break;
    case 'Documents' : {
      config.dblog('insert document');
      createDAO = documentsDAO;
    }
    break;
    case 'Music' : {
      config.dblog('insert music');
      createDAO = musicDAO;
    }
    break;
    case 'recent' : {
      config.dblog('insert recent');
      recentDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
    }
    break;    
    
  }

  //Get uniform resource identifier
  uniqueID.getFileUid(function(uri){
    item.URI = uri;
    createDAO.createItem(item, function(err){
      if(err){
        callback(category,item,err,loadResourcesCb);
      }
      else{
        actionHistoryDAO.createInsertItem(item.URI,function(err){
          if(err){
            callback(category,item,err,loadResourcesCb);
          }
          else{
            callback(category,item,'successfull',loadResourcesCb);
          }
        });
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

exports.updateItemValue = function(id, uri, key, value, callback){
  config.dblog("update id:" + id);
  config.dblog("update key:" + key+'='+value);
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);
    config.dblog("tableId id:" + tableId);
        config.dblog("dataId id:" + dataId);
  var updateDAO = null;
  var category = "";
  switch(tableId){
    case '1' : {
      updateDAO = contactsDAO;
      category = "Contacts";
    }
    break;
    case '2' : {
      updateDAO = picturesDAO;
      category = "Pictures"
    }
    break;
    case '3' : {
      updateDAO = videosDAO;
      category = "Videos";
    }
    break;
    case '4' : {
      updateDAO = documentsDAO;
      category = "Documents";
    }
    break;
    case '5' : {
      updateDAO = musicDAO;
      category = "Music";
    } 
    break;   
    
  }

  updateDAO.updateItemValueByUri(uri,key,value, function(err){
    if(err){
      callback(id,uri,key,value,err);
    }
    else{
      actionHistoryDAO.createUpdateItem(uri, key, value, function(err){
        if(err){
          callback(id,uri,key,value,err);
        }
        else{
          config.dblog("update" + category + "successfull");
          callback(id,uri,key,value,'successfull');
        }
      });
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

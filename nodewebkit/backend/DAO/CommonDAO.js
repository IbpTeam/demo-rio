//var config = require("./config");
var categoryDAO = require("./CategoryDAO");
var contactsDAO = require("./ContactsDAO");
var picturesDAO = require("./PicturesDAO");
var videosDAO = require("./VideosDAO");
var documentsDAO = require("./DocumentsDAO");
var musicDAO = require("./MusicDAO");
var recentDAO = require("./RecentDAO");
var config = require("../config");

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
          callback(item);
        }
      });
    }
    break;
    
  }
}

exports.createItem = function(category, item, callback , loadResourcesCb){
  switch(category){
    case 'Contacts' : {
      contactsDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
    }
    break;
    case 'Pictures' : {
      config.dblog('insert picture');
      picturesDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
    }
    break;
    case 'Videos' : {
      config.dblog('insert video');
      videosDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
    }
    break;
    case 'Documents' : {
      config.dblog('insert document');
      documentsDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
    }
    break;
    case 'Music' : {
      config.dblog('insert music');
      musicDAO.createItem(item, function(err){
        if(err){
          callback(category,item,err,loadResourcesCb);
        }
        else{
          callback(category,item,'successfull',loadResourcesCb);
        }
      });
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
}

exports.deleteItemById = function(id, callback ,rmDataByIdCb){
  config.dblog("delete id:" + id);
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);
    config.dblog("tableId id:" + tableId);
        config.dblog("dataId id:" + dataId);
  switch(tableId){
    case '1' : {
      contactsDAO.deleteItemById(dataId, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          callback(id,'successfull',rmDataByIdCb);
        }
      });
    }
    break;
    case '2' : {
      picturesDAO.deleteItemById(dataId, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          callback(id,'successfull',rmDataByIdCb);
        }
      });
    }
    break;
    case '3' : {
      videosDAO.deleteItemById(dataId, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          callback(id,'successfull',rmDataByIdCb);
        }
      });
    }
    break;
    case '4' : {
      documentsDAO.deleteItemById(dataId, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          callback(id,'successfull',rmDataByIdCb);
        }
      });
    }
    case '5' : {
      musicDAO.deleteItemById(dataId, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          callback(id,'successfull',rmDataByIdCb);
        }
      });
    }
    break;    
    
  }
}

exports.updateItemValue = function(id, key, value, callback ){
  config.dblog("update id:" + id);
  config.dblog("update key:" + key+'='+value);
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);
    config.dblog("tableId id:" + tableId);
        config.dblog("dataId id:" + dataId);
  switch(tableId){
    case '1' : {
      contactsDAO.updateItemValue(dataId,key,value, function(err){
        if(err){
          callback(id,key,value,err);
        }
        else{
          config.dblog("update contacts successfull");
          callback(id,key,value,'successfull');
        }
      });
    }
    break;
    case '2' : {
      picturesDAO.updateItemValue(dataId,key,value, function(err){
        if(err){
          callback(id,key,value,err);
        }
        else{
          config.dblog("update picutres successfull");
          callback(id,key,value,'successfull');
        }
      });
    }
    break;
    case '3' : {
      videosDAO.updateItemValue(dataId,key,value, function(err){
        if(err){
          callback(id,key,value,err);
        }
        else{
          config.dblog("update videos successfull");
          callback(id,key,value,'successfull');
        }
      });
    }
    break;
    case '4' : {
      documentsDAO.updateItemValue(dataId,key,value, function(err){
        if(err){
          callback(id,key,value,err);
        }
        else{
          config.dblog("update documents successfull");
          callback(id,key,value,'successfull');
        }
      });
    }
    break;
    case '5' : {
      musicDAO.updateItemValue(dataId,key,value, function(err){
        if(err){
          callback(id,key,value,err);
        }
        else{
          config.dblog("update musics successfull");
          callback(id,key,value,'successfull');
        }
      });
    } 
    break;   
    
  }
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

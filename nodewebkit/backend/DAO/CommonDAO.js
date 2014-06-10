//var config = require("./config");
var categoryDAO = require("./CategoryDAO");
var contactsDAO = require("./ContactsDAO");
var picturesDAO = require("./PicturesDAO");
var videosDAO = require("./VideosDAO");
var documentsDAO = require("./DocumentsDAO");
var musicsDAO = require("./MusicsDAO");

exports.getAllByCateroty = function(caterogy, callback) {
  switch(caterogy){
    case 'Contacts' : {
      contactsDAO.findAll(function(err, contacts){
        if(err){
          console.log(err);
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
          console.log(err);
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
          console.log(err);
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
          console.log(err);
          callback(null)
        }
        documents.forEach(function(document){
          document.id = "4#" + document.id;
        });
        callback(documents)
      });
    }
    break;
    
    case 'Musics' : {
      musicsDAO.findAll(function(err, musics){
        if(err){
          console.log(err);
          callback(null)
        }
        musics.forEach(function(music){
          music.id = "5#" + music.id;
        });
        callback(musics)
      });
    }
    break;
  }
}

exports.getCategories = function(callback){
  categoryDAO.findAll(function(err, categories){
    if(err){
      console.log(err);
      callback(null);
    }
    categories.forEach(function(categorie){
      categorie.id = "0#" + categorie.id;
    });
    callback(categories)
  });
}

exports.getItemById = function(id, callback){
  console.log("get id:" + id);
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);
    console.log("tableId id:" + tableId);
        console.log("dataId id:" + dataId);
  switch(tableId){
    case '1' : {
      contactsDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
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
          callback(item);
        }
      });
    }
    case '5' : {
      musicsDAO.findById(dataId,function(err,item){
        if(err){
          callback('');
        }
        else{
          callback(item);
        }
      });
    }
    
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
      console.log('insert picture');
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
      console.log('insert video');
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
      console.log('insert document');
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
    case 'Musics' : {
      console.log('insert music');
      musicsDAO.createItem(item, function(err){
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
  console.log("delete id:" + id);
  var index=id.indexOf('#');
  var tableId=id.substring(0,index);
  var dataId=id.substr(index+1);
    console.log("tableId id:" + tableId);
        console.log("dataId id:" + dataId);
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
      musicsDAO.deleteItemById(dataId, function(err){
        if(err){
          callback(id,err,rmDataByIdCb);
        }
        else{
          callback(id,'successfull',rmDataByIdCb);
        }
      });
    }    
    
  }
}

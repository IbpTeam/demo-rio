//var config = require("./config");
var categoryDAO = require("./CategoryDAO");
var contactsDAO = require("./ContactsDAO");
var picturesDAO = require("./PicturesDAO");
var videosDAO = require("./VideosDAO");

exports.getAllByCateroty = function(caterogy, callback) {
  switch(caterogy){
    case 'Contacts' : {
      contactsDAO.findAll(function(err, contacts){
        if(err){
          console.log(err);
          callback(null)
        }
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
        callback(videos)
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
    callback(categories)
  });
}

exports.createItems = function(category, items, callback){
  switch(category){
    case 'Contacts' : {
      
    }
    break;
  }
}

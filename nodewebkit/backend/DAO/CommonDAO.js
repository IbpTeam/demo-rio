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

exports.createItem = function(category, item, callback){
  switch(category){
    case 'Contacts' : {
      contactsDAO.createItem(item, function(err){
        if(err){
          console.log(err);
          callback(null);
        }
        else{
          callback('successfull');
        }
      });
    }
    break;
    case 'Pictures' : {
      picturesDAO.createItem(item, function(err){
        if(err){
          console.log(err);
          callback(null);
        }
        else{
          callback('successfull');
        }
      });
    }
    break;
    case 'Videos' : {
      videosDAO.createItem(item, function(err){
        if(err){
          console.log(err);
          callback(null);
        }
        else{
          callback('successfull');
        }
      });
    }
    break;
  }
}

exports.createItems = function(category, items){
  switch(category){
    case 'Contacts' : {
      contactsDAO.createItems(items);
    }
    break;
  }
}

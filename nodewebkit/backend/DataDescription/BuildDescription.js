//BuildDescription.js
/**
 * @Copyright:
 * 
 * @Description: support API 
 *
 * @author: Wangfeng Xiquan Yuanzhe
 *
 * @Data:2014.9.9
 *
 * @version:0.2.1
 **/

var config = require("../config");
var uniqueID = require("../uniqueID");

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

function createDesFileCb(newItem){
  //console.log(newItem)
  //if (error) throw error;  
  var sItem = JSON.stringify(newItem,null,4);
  var sFileName = newItem.filename || newItem.name;
  var spath = config.RESOURCEPATH+'/.des/'+sFileName+'.txt'
  console.log(config.RESOURCEPATH);
  fs.writeFile(spath, sItem,{flag:'w+'},function (err) {
    if (err) {
      console.log("writeFile error!")
      throw err;
    }
    console.log("descriptioin file done!")
    return "success";
  });
}

exports.createItem = function(category, item , createDesFileCb){
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
        createDesFileCb(item);
      }
      else{
        console.log("Exception: randomId is null.");
      }
    });
  });
  //console.log(item);
  //createDesFileCb(item);

exports.testMethod = function(arg1,arg2){
	//TODO

}
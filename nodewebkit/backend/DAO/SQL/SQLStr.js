//SQL used in CategoryDAO
exports.COUNTTOTALCATEGORIES = "select count(*) as total from Category";
exports.FINDALLCATEGORIES = "select * from Category";
exports.FINDCATEGORYBYID = "select * from Category where id = ?";
//exports.CREATECATEGORY = "insert into category (id,filename,postfix,size,path,location,createTime,lastModifyTime,others) values (null,?,?,?,?,?,?,?,?)";

//SQL used in ContactsDAO
exports.COUNTTOTALCONTACTS = "select count(*) as total from contacts";
exports.FINDALLCONTACTS = "select * from Contacts";
exports.FINDCONTACTBYID = "select * from contacts where id = ?";
exports.CREATECONTACT = "insert into contacts (id,name,phone,sex,age,email,photoPath,createTime,lastModifyTime,lastAccessTime,URI) values (?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETECONTACT = "delete from contacts where URI = ?";
exports.UPDATECONTACT = "update contacts set ? = ? where id = ?";

//SQL used in PicturesDAO
exports.COUNTTOTALPICTURES = "select count(*) as total from pictures";
exports.FINDALLPICTURES = "select * from pictures";
exports.FINDPICTUREBYID = "select * from pictures where id = ?";
exports.CREATEPICTURE = "insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,lastAccessTime,others,URI) values (?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEPICTURE = "delete from pictures where URI = ?";
exports.UPDATEPICTURE = "update pictures set ? = ? where id = ?";

//SQL used in VideosDAO
exports.COUNTTOTALVIDEOS = "select count(*) as total from videos";
exports.FINDALLVIDEOS = "select * from videos";
exports.FINDVIDEOBYID = "select * from videos where id = ?";
exports.CREATEVIDEO = "insert into videos (id,filename,postfix,size,path,location,createTime,lastModifyTime,lastAccessTime,others,URI) values (?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEVIDEO = "delete from videos where URI = ?";
exports.UPDATEVIDEO = "update videos set ? = ? where id = ?";

//SQL used in DocumentsDAO
exports.COUNTTOTALDOCUMENTS = "select count(*) as total from documents";
exports.FINDALLDOCUMENTS = "select * from documents";
exports.FINDDOCUMENTBYID = "select * from documents where id = ?";
exports.CREATEDOCUMENT = "insert into documents (id,filename,postfix,size,path,project,createTime,lastModifyTime,lastAccessTime,others,URI) values (?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEDOCUMENT = "delete from documents where URI = ?";
exports.UPDATEDOCUMENT = "update documents set ? = ? where id = ?";

//SQL used in MusicDAO
exports.COUNTTOTALMUSIC = "select count(*) as total from music";
exports.FINDALLMUSIC = "select * from music";
exports.FINDMUSICBYID = "select * from music where id = ?";
exports.CREATEMUSIC = "insert into music (id,filename,postfix,size,path,album,composerName,actorName,createTime,lastModifyTime,lastAccessTime,others,URI) values (?,?,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEMUSIC = "delete from music where URI = ?";
exports.UPDATEMUSIC = "update music set ? = ? where id = ?";

//SQL used in RecentDAO
exports.COUNTTOTALRECENT = "select count(*) as total from recent";
exports.FINDALLRECENT = "select * from recent";
exports.FINDALLRECENTBYORDER = "select * from recent order by lastAccessTime desc";
exports.FINDRECENTBYID = "select * from recent where id = ?";
exports.CREATERECENT = "insert into recent (id,tableName,specificId,lastAccessTime) values (null,?,?,?)";
exports.DELETERECENT = "delete from recent where id = ?";
exports.UPDATERECENT = "update recent set ? = ? where id = ?";


//SQL used in ActionHistoryDAO
exports.CREATEINSERTITEM = "insert into InsertHistory (id,dataURI) values (null,?)";
exports.CREATEDELETEITEM = "insert into DeleteHistory (id,dataURI) values (null,?)";
exports.CREATEUPDATEITEM = "insert into UpdateHistory (id,dataURI,key,value) values (null,?,?,?)";
exports.REMOVEUPDATEITEM = "delete from UpdateHistory where dataURI = ?";
exports.REMOVEINSERTITEM = "delete from InsertHistory where dataURI = ?";
exports.FINDALLUPDATES = "selcet * from UpdateHistory";
exports.FINDALLDELETES = "selcet * from DeleteHistory";
exports.FINDALLINSERTS = "selcet * from InsertHistory";
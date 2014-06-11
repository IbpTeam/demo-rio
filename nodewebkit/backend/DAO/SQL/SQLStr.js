//SQL used in CategoryDAO
exports.COUNTTOTALCATEGORIES = "select count(*) as total from Category";
exports.FINDALLCATEGORIES = "select * from Category";
exports.FINDCATEGORYBYID = "select * from Category where id = ?";
//exports.CREATECATEGORY = "insert into category (id,filename,postfix,size,path,location,createTime,lastModifyTime,others) values (null,?,?,?,?,?,?,?,?)";

//SQL used in ContactsDAO
exports.COUNTTOTALCONTACTS = "select count(*) as total from contacts";
exports.FINDALLCONTACTS = "select * from Contacts";
exports.FINDCONTACTBYID = "select * from contacts where id = ?";
exports.CREATECONTACT = "insert into contacts (id,name,phone,sex,age,email,photoPath,createTime,lastModifyTime,lastAccessTime) values (null,?,?,?,?,?,?,?,?,?)";
exports.DELETECONTACT = "delete from contacts where id = ?";

//SQL used in PicturesDAO
exports.COUNTTOTALPICTURES = "select count(*) as total from pictures";
exports.FINDALLPICTURES = "select * from pictures";
exports.FINDPICTUREBYID = "select * from pictures where id = ?";
exports.CREATEPICTURE = "insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,lastAccessTime,others) values (null,?,?,?,?,?,?,?,?,?)";
exports.DELETEPICTURE = "delete from pictures where id = ?";

//SQL used in VideosDAO
exports.COUNTTOTALVIDEOS = "select count(*) as total from videos";
exports.FINDALLVIDEOS = "select * from videos";
exports.FINDVIDEOBYID = "select * from videos where id = ?";
exports.CREATEVIDEO = "insert into videos (id,filename,postfix,size,path,location,createTime,lastModifyTime,lastAccessTime,others) values (null,?,?,?,?,?,?,?,?,?)";
exports.DELETEVIDEO = "delete from videos where id = ?";

//SQL used in DocumentsDAO
exports.COUNTTOTALDOCUMENTS = "select count(*) as total from documents";
exports.FINDALLDOCUMENTS = "select * from documents";
exports.FINDDOCUMENTBYID = "select * from documents where id = ?";
exports.CREATEDOCUMENT = "insert into documents (id,filename,postfix,size,path,project,createTime,lastModifyTime,lastAccessTime,others) values (null,?,?,?,?,?,?,?,?,?)";
exports.DELETEDOCUMENT = "delete from documents where id = ?";

//SQL used in MusicDAO
exports.COUNTTOTALMUSIC = "select count(*) as total from music";
exports.FINDALLMUSIC = "select * from music";
exports.FINDMUSICBYID = "select * from music where id = ?";
exports.CREATEMUSIC = "insert into music (id,filename,postfix,size,path,album,composerName,actorName,createTime,lastModifyTime,lastAccessTime,others) values (null,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEMUSIC = "delete from music where id = ?";

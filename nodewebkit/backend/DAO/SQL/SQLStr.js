/**
 * @Copyright:
 * 
 * @Description: const sql used in dao
 *
 * @author: Yuanzhe
 *
 * @Data:2014.9.11
 *
 * @version:0.2.1
 **/

//SQL for init database
exports.INITDB = "BEGIN TRANSACTION;\
CREATE TABLE category (logoPath TEXT, id INTEGER PRIMARY KEY, type TEXT, desc TEXT);\
CREATE TABLE contacts (commit_id TEXT, version TEXT, is_delete INTEGER, URI TEXT, lastAccessTime TEXT, photoPath TEXT, createTime TEXT, lastModifyTime TEXT, id INTEGER PRIMARY KEY, name TEXT, phone NUMERIC, sex TEXT, age NUMERIC, email TEXT);\
CREATE TABLE devices (lastSyncTime TEXT, branchName TEXT, resourcePath TEXT, ip TEXT, name TEXT, id INTEGER PRIMARY KEY, device_id TEXT, account TEXT);\
CREATE TABLE documents (commit_id TEXT, version TEXT, is_delete INTEGER, URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, project TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT);\
CREATE TABLE music (commit_id TEXT, version TEXT, is_delete INTEGER, URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, album TEXT, composerName TEXT, actorName TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT);\
CREATE TABLE pictures (commit_id TEXT, version TEXT, is_delete INTEGER, URI TEXT, lastAccessTime TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, location TEXT, lastModifyTime TEXT, createTime TEXT, others TEXT);\
CREATE TABLE recent (lastAccessTime TEXT, id INTEGER PRIMARY KEY, file_uri TEXT);\
CREATE TABLE tags (id INTEGER PRIMARY KEY, file_URI TEXT, tag TEXT);\
CREATE TABLE videos (commit_id TEXT, version TEXT, is_delete INTEGER, URI TEXT, lastAccessTime TEXT, postfix TEXT, name TEXT, others TEXT, path TEXT, id INTEGER PRIMARY KEY, size TEXT, type TEXT, createTime TEXT, lastModifyTime TEXT);\
INSERT INTO category VALUES('./frontend-dev/images/contacts.jpg',101,'Contacts','联系人');\
INSERT INTO category VALUES('./frontend-dev/images/pictures.png',102,'Pictures','图片');\
INSERT INTO category VALUES('./frontend-dev/images/videos.png',103,'Videos','视频');\
INSERT INTO category VALUES('./frontend-dev/images/documents.jpg',104,'Documents','文档');\
INSERT INTO category VALUES('./frontend-dev/images/music.png',105,'Music','音乐');\
INSERT INTO category VALUES('./frontend-dev/images/devices.jpg',106,'Devices','设备');";

//SQL used in CategoryDAO
exports.COUNTTOTALCATEGORIES = "select count(*) as total from Category";
exports.FINDALLCATEGORIES = "select * from Category";
exports.FINDCATEGORYBYID = "select * from Category where id = ?";
//exports.CREATECATEGORY = "insert into category (id,filename,postfix,size,path,location,createTime,lastModifyTime,others) values (null,?,?,?,?,?,?,?,?)";

//SQL used in ContactsDAO
exports.COUNTTOTALCONTACTS = "select count(*) as total from contacts";
exports.FINDALLCONTACTS = "select * from Contacts where is_delete = 0";
exports.FINDCONTACTBYID = "select * from contacts where id = ?";
exports.FINDCONTACTBYNAME = "select * from contacts where is_delete = 0 and name = ?";
exports.FINDCONTACTBYURI = "select id,name,age,sex,email,phone,photoPath as path,createTime,lastAccessTime,lastModifyTime,version,commit_id,is_delete,URI from contacts where uri = ?";
exports.CREATECONTACT = "insert into contacts (id,name,phone,sex,age,email,photoPath,createTime,lastModifyTime,lastAccessTime,URI,version,commit_id,is_delete) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETECONTACT = "delete from contacts where URI = ?";
exports.UPDATECONTACT = "update contacts set ? = ? where id = ?";

//SQL used in PicturesDAO
exports.COUNTTOTALPICTURES = "select count(*) as total from pictures";
exports.FINDALLPICTURES = "select * from pictures where is_delete = 0";
exports.FINDPICTUREBYID = "select * from pictures where id = ?";
exports.FINDPICTUREBYPATH = "select * from pictures where is_delete = 0 and path = ?";
exports.FINDPICTUREBYURI = "select * from pictures where uri = ?";
exports.CREATEPICTURE = "insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,lastAccessTime,others,URI,version,commit_id,is_delete) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEPICTURE = "delete from pictures where URI = ?";
exports.UPDATEPICTURE = "update pictures set ? = ? where id = ?";
exports.GETMAXIDPICTURES = "select max(id) as maxid from pictures";

//SQL used in VideosDAO
exports.COUNTTOTALVIDEOS = "select count(*) as total from videos";
exports.FINDALLVIDEOS = "select * from videos where is_delete = 0";
exports.FINDVIDEOBYID = "select * from videos where id = ?";
exports.FINDVIDEOBYPATH = "select * from videos where is_delete = 0 and path = ?";
exports.FINDVIDEOBYURI = "select * from videos where uri = ?";
exports.CREATEVIDEO = "insert into videos (id,filename,postfix,size,path,location,createTime,lastModifyTime,lastAccessTime,others,URI,version,commit_id,is_delete) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEVIDEO = "delete from videos where URI = ?";
exports.UPDATEVIDEO = "update videos set ? = ? where id = ?";
exports.GETMAXIDVIDEOS = "select max(id) as maxid from videos";

//SQL used in DocumentsDAO
exports.COUNTTOTALDOCUMENTS = "select count(*) as total from documents";
exports.FINDALLDOCUMENTS = "select * from documents where is_delete = 0";
exports.FINDDOCUMENTBYID = "select * from documents where id = ?";
exports.FINDDOCUMENTBYPATH = "select * from documents where is_delete = 0 and path = ?";
exports.FINDDOCUMENTBYURI = "select * from documents where uri = ?";
exports.CREATEDOCUMENT = "insert into documents (id,filename,postfix,size,path,project,createTime,lastModifyTime,lastAccessTime,others,URI,version,commit_id,is_delete) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEDOCUMENT = "delete from documents where URI = ?";
exports.UPDATEDOCUMENT = "update documents set ? = ? where id = ?";
exports.GETMAXIDDOCUMENTS = "select max(id) as maxid from documents";

//SQL used in MusicDAO
exports.COUNTTOTALMUSIC = "select count(*) as total from music";
exports.FINDALLMUSIC = "select * from music where is_delete = 0";
exports.FINDMUSICBYID = "select * from music where id = ?";
exports.FINDMUSICBYPATH = "select * from music where is_delete = 0 and path = ?";
exports.FINDMUSICBYURI = "select * from music where uri = ?";
exports.CREATEMUSIC = "insert into music (id,filename,postfix,size,path,album,composerName,actorName,createTime,lastModifyTime,lastAccessTime,others,URI,version,commit_id,is_delete) values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
exports.DELETEMUSIC = "delete from music where URI = ?";
exports.UPDATEMUSIC = "update music set ? = ? where id = ?";
exports.GETMAXIDMUSIC = "select max(id) as maxid from music";

//SQL used in RecentDAO
exports.COUNTTOTALRECENT = "select count(*) as total from recent";
exports.FINDALLRECENT = "select * from recent";
exports.FINDALLRECENTBYORDER = "select * from recent order by lastAccessTime desc";
exports.FINDRECENTBYID = "select * from recent where id = ?";
exports.CREATERECENT = "insert into recent (id,file_uri,lastAccessTime) values (null,?,?)";
exports.DELETERECENT = "delete from recent where id = ?";
exports.UPDATERECENT = "update recent set ? = ? where id = ?";
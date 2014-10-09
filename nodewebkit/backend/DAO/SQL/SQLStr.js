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
CREATE TABLE contacts (is_delete INTEGER, URI TEXT, photoPath TEXT, id INTEGER PRIMARY KEY, name TEXT, phone NUMERIC, sex TEXT, age NUMERIC, email TEXT,createTime TEXT,createDev TEXT, lastAccessTime TEXT,lastAccessDev TEXT,lastModifyTime TEXT,lastModifyDev TEXT,others TEXT);\
CREATE TABLE devices (lastSyncTime TEXT, resourcePath TEXT, ip TEXT, name TEXT, id INTEGER PRIMARY KEY, device_id TEXT, account TEXT);\
CREATE TABLE documents (is_delete INTEGER, URI TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, project TEXT, createTime TEXT,createDev TEXT, lastAccessTime TEXT,lastAccessDev TEXT,lastModifyTime TEXT,lastModifyDev TEXT,others TEXT);\
CREATE TABLE music (is_delete INTEGER, URI TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, album TEXT, composerName TEXT, actorName TEXT, createTime TEXT,createDev TEXT, lastAccessTime TEXT,lastAccessDev TEXT,lastModifyTime TEXT,lastModifyDev TEXT,others TEXT);\
CREATE TABLE pictures (is_delete INTEGER, URI TEXT, postfix TEXT, filename TEXT, id INTEGER PRIMARY KEY, size TEXT, path TEXT, location TEXT, createTime TEXT,createDev TEXT, lastAccessTime TEXT,lastAccessDev TEXT,lastModifyTime TEXT,lastModifyDev TEXT,others TEXT);\
CREATE TABLE tags (id INTEGER PRIMARY KEY, file_URI TEXT, tag TEXT);\
CREATE TABLE videos (is_delete INTEGER, URI TEXT, postfix TEXT, name TEXT, path TEXT, id INTEGER PRIMARY KEY, size TEXT, type TEXT, createTime TEXT,createDev TEXT, lastAccessTime TEXT,lastAccessDev TEXT,lastModifyTime TEXT,lastModifyDev TEXT,others TEXT);\
INSERT INTO category VALUES('./frontend-dev/images/contacts.jpg',101,'Contacts','联系人');\
INSERT INTO category VALUES('./frontend-dev/images/pictures.png',102,'Pictures','图片');\
INSERT INTO category VALUES('./frontend-dev/images/videos.png',103,'Videos','视频');\
INSERT INTO category VALUES('./frontend-dev/images/documents.jpg',104,'Documents','文档');\
INSERT INTO category VALUES('./frontend-dev/images/music.png',105,'Music','音乐');\
INSERT INTO category VALUES('./frontend-dev/images/devices.jpg',106,'Devices','设备');";
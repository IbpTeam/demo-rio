//SQL used in CategoryDAO
exports.COUNTTOTALCATEGORIES = "select count(*) as total from pictures";
exports.FINDALLCATEGORIES = "select * from pictures";
exports.FINDCATEGORYBYID = "select * from pictures where id = ?";
exports.CREATECATEGORY = "insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,others) values (null,?,?,?,?,?,?,?,?)";

//SQL used in ContactsDAO
exports.COUNTTOTALCONTACTS = "select count(*) as total from contacts";
exports.FINDALLCONTACTS = "select * from Contacts";
exports.FINDCONTACTBYID = "select * from contacts where id = ?";
exports.CREATECONTACT = "insert into contacts (id,name,phone,sex,age,email,photoPath,createTime,lastModifyTime) values (null,?,?,?,?,?,?,?,?)";

//SQL used in PicturesDAO
exports.COUNTTOTALPICTURES = "select count(*) as total from pictures";
exports.FINDALLPICTURES = "select * from pictures";
exports.FINDPICTUREBYID = "select * from pictures where id = ?";
exports.CREATEPICTURE = "insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,others) values (null,?,?,?,?,?,?,?,?)";

//SQL used in VideoDAO
exports.COUNTTOTALVIDEOS = "select count(*) as total from pictures";
exports.FINDALLVIDEOS = "select * from pictures";
exports.FINDVIDEOBYID = "select * from pictures where id = ?";
exports.CREATEVIDEO = "insert into pictures (id,filename,postfix,size,path,location,createTime,lastModifyTime,others) values (null,?,?,?,?,?,?,?,?)";

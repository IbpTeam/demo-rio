var ProtoBuf = require("protobufjs");
var fs = require("fs");

var builder = ProtoBuf.loadProtoFile("./user.proto"),
	IBP = builder.build("IBP"),
	User = IBP.User.UserModel;

var userModel = new User();
/* Use Getter and Setter functions to set the value 

var info = new User.Info();
info.set('phone', '13302323323');
info.set('Email','user@mail.com');
info.set('Address','Beijing Haidian');

userModel.set('cyUserno', '111111');
userModel.set('cyPassWord', '123456');
userModel.set('cyStatus', 1);
userModel.set('sex','FEMALE');
userModel.set('inf',info);

*/
/*
Use Object initiation to set the value
*/
var userModel = new User({
	"cyUserno": "2222222",
	"cyPassWord": "321545",
	"cyStatus": 23,
	"sex": 'FEMALE',
	"inf":{
		"phone": "13455256678",
		"Email": "daw@sfda.net",
		"Address": "Beijing Dongcheng"
	}
});
var buffer1 = userModel.encode().toBuffer();
console.log(buffer1);

var userModel2 = new User({
	"cyUserno": "3333333",
	"cyPassWord": "321545",
	"cyStatus": 23,
	"sex": 'FEMALE',
	"inf":{
		"phone": "13455256678",
		"Email": "daw@sfda.net",
		"Address": "Beijing Dongcheng"
	}
});
var buffer2 = userModel2.encode().toBuffer();
console.log(buffer2);

var userModel3 = new User({
	"cyUserno": "4444444",
	"cyPassWord": "321545",
	"cyStatus": 23,
	"sex": 'FEMALE',
	"inf":{
		"phone": "13455256678",
		"Email": "daw@sfda.net",
		"Address": "Beijing Dongcheng"
	}
});
var buffer3 = userModel3.encode().toBuffer();
console.log(buffer3);

fs.writeFile('encodeFile',Buffer.concat([buffer1, buffer2, buffer3]),function(err){
	if (err) {
		throw err;
	};
	console.log("File Saved!");
});

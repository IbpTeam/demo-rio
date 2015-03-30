var ProtoBuf = require("protobufjs");
var fs = require("fs");

var builder = ProtoBuf.loadProtoFile("./user.proto"),
	IBP = builder.build("IBP"),
	User = IBP.User.UserModel;

fs.readFile('./encodeFile',function(err,data){
	if (err) {
		throw err;
	};
	var userModel = new User();
	var info = new User.Info();
	var decrypt = User.decode(data);

	console.log(decrypt.get('cyUserno'));
	console.log(decrypt.get('cyPassWord'));
	console.log(decrypt.get('cyStatus'));
	console.log(decrypt.get('inf').get('phone'));
	console.log(decrypt.get('inf').get('Email'));
	console.log(decrypt.get('inf').get('Address'));
	console.log(decrypt.get('sex'));
});





/**
 * @Title: DataSync.js
 * @Description: Function for data sync
 * @author: yuanzhe
 * @version: 0.0.1
 **/

var msgTransfer = require("./msgtransfer");
var commonDAO = require("./DAO/CommonDAO");

//Init method
function init(initCallback){
  console.log("init update history!");
  commonDAO.findAllActionHistory("update", initCallback);
}

function start(ip){
  console.log("get ip from internet discovery : " + ip);
  msgTransfer.sendMsg(""+ip,"syncUpdate");
//  init();
}

function prepUpdate(){
	var jsonStr = null;
	init(function(updateActions){
//		jsonStr = 
		console.log(updateActions)
	});
}

//Export method
exports.start = start;
exports.prepUpdate = prepUpdate;
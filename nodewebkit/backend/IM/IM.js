var config = require("../config");
var FuncObj = require("./FuncObj.js");
var IMNoRsa = require("./IMChatNoRSA.js");
var net = require("net");

function startIMService(StartCb, Flag) {
    try {
        if (Flag === "true") {

        } else {
            IMNoRsa.initIMServerNoRSA(config.IMPORT, function(AppType, msgobj) {
                FuncObj.takeMsg(AppType, msgobj);
            });
        }
        StartCb(true);
    } catch (err) {
        console.log(err);
        StartCb(false);
    }
}
exports.startIMService = startIMService;
var config = require("../config");
var FuncObj = require("./FuncObj.js");
var IMNoRsa = require("./IMChatNoRSA.js");
var net = require("net");
var fileTransferClient= require("./file-trans/fileTransferClient");

function startIMService(startCb, flag) {
    try {
        if (flag) {

        } else {
            IMNoRsa.initIMServerNoRSA(config.IMPORT, function(AppType, msgobj) {
                FuncObj.takeMsg(AppType, msgobj);
            });
        }
        fileTransferClient.clearTmpDir();
        startCb(true);
    } catch (err) {
        console.log(err);
        startCb(false);
    }
}
exports.startIMService = startIMService;

function closeIMService(closeCb, flag) {
    try {
        if (flag) {

        } else {
            IMNoRsa.closeIMServerNoRSA(function(done) {
                closeCb(done);
            });
        }
    } catch (err) {
        console.log(err);
        closeCb(false);
    }
}
exports.closeIMService = closeIMService;
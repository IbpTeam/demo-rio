var mdns = require('./device.js'),
    config = require('systemconfig'),
//     router = require('../../backend/router.js'),
    path = require('path');

var CURUSER = process.env['USER'],
    USERCONFIGPATH = config.USERCONFIGPATH,
    uniqueID = require(USERCONFIGPATH + '/uniqueID.js'),
    LOCALACCOUNT = uniqueID.Account,
    LOCALUUID = uniqueID.uniqueID;

function broadCastOnline(StateCb){
  try{
    mdns.broadCastOnline(function() {
      var name = LOCALUUID;
      var port = '8885';
      var txtarray = ['demo-rio', LOCALACCOUNT, LOCALUUID];
      mdns.entryGroupCommit(name, port, txtarray);
      StateCb(true);
    });
  }catch (err){
    console.log(err);
    StateCb(false);
  }
}
exports.broadCastOnline=broadCastOnline;

/**
 * @method deviceDown
 *  发布本机设备下线信息
 *  @param StateCb
 *   @param1 state
 *    bool 当成功发布设备下线消息时，值为true，否则为false
 *
 */
function deviceDown(StateCb) {
  try {
    setTimeout(function() {
      mdns.entryGroupReset()
    }, 0);
    StateCb(true);
  } catch (err) {
    console.log(err);
    StateCb(false);
  }
}
exports.deviceDown = deviceDown;


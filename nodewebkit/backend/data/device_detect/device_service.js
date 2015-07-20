  config = require('systemconfig'),
  //     router = require('../../backend/router.js'),
  path = require('path');

var DBus;
try {
  DBus = require('dbus');
} catch (e) {
  DBus = require('dbus-nw');
}

// var dbus = new DBus();
var dbus = DBus.instance();

var bus = dbus.getBus('system');

var serviceBrowserPath, entryGroupPath;
var server, serviceBrowser, entryGroup;
var deviceListeners = new Array();
var globalIDforListener = 0;
var deviceListenersObj = new Object();
var deviceList = new Object();
var showDeviceListCb;
var CURUSER = process.env['USER'],
  USERCONFIGPATH = config.USERCONFIGPATH,
  uniqueID = require(USERCONFIGPATH + '/uniqueID.js'),
  LOCALACCOUNT = uniqueID.Account,
  LOCALUUID = uniqueID.uniqueID;


/**
 * @method entryGroupCommit
 *  添加服务信息，并在局域网发布设备上线信息
 *
 * @param1 name
 *   设备名称
 *
 * @param2 address
 *   设备ip地址
 *
 * @param3 port
 *   设备端口
 *
 * @param4 strarray
 *   设备附加信息
 *
 */
function entryGroupCommit(name , port, strArray){
  var byteArray = new Array();
  for(var i=0; i<strArray.length; i++){
    if(strArray[i] == undefined)
      continue;
    byteArray.push(stringToByteArray(strArray[i]));
  }
  entryGroup.AddService(-1, -1, 0, name, '_http._tcp', '', '', port,  byteArray);
  entryGroup.Commit();
}
exports.entryGroupCommit = entryGroupCommit;

/**
 * @method entryGroupReset
 *  在局域网发布设备下线信息
 *
 */
function entryGroupReset(){
  entryGroup.Reset();
}
exports.entryGroupReset = entryGroupReset;


function CastOnline(devicePublishCb) {
  bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
    if ((err != null) || (undefined === iface)) {
      return console.log(err);
    }
    iface.EntryGroupNew['error'] = function(err) {
      console.log("EntryGroupNew: " + err);
    }
    iface.EntryGroupNew['timeout'] = 2000;
    iface.EntryGroupNew['finish'] = function(path) {
      startEntryGroup(path, devicePublishCb);
      entryGroupPath = path;
    };
    iface.EntryGroupNew();

  });
}
exports.broadCastOnline=broadCastOnline;

function startEntryGroup(path, devicePublishCb){
 // console.log('A new EntryGroup started, path:' + path);    
  bus.getInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.EntryGroup', function(err, iface) {
    if ((err != null) || (undefined === iface)){
      console.log(err);
      return;
    }
    entryGroup = iface;
    iface.AddService['timeout'] = 2000;
    iface.AddService['error'] = function(err) {
      console.log(err);
    }
    iface.AddService['finish'] = function(arg) {
 //     console.log('finish add service.');
    }

    devicePublishCb();
  });  
}


function stringToByteArray(str) {
  var utf8 = [];
  for (var i=0; i < str.length; i++) {
    var charcode = str.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 
            0x80 | (charcode & 0x3f));
    }
    else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 
            0x80 | ((charcode>>6) & 0x3f), 
            0x80 | (charcode & 0x3f));
    }
    // surrogate pair
    else {
      i++;
      // UTF-16 encodes 0x10000-0x10FFFF by
      // subtracting 0x10000 and splitting the
      // 20 bits of 0x0-0xFFFFF into two halves
      charcode = 0x10000 + (((charcode & 0x3ff)<<10)
            | (str.charCodeAt(i) & 0x3ff))
      utf8.push(0xf0 | (charcode >>18), 
            0x80 | ((charcode>>12) & 0x3f), 
            0x80 | ((charcode>>6) & 0x3f), 
            0x80 | (charcode & 0x3f));
    }
  }
  return utf8;
}

function arrayToString(array) {
  var result = "";
  for (var i = 0; i < array.length; i++) {
    result += String.fromCharCode(parseInt(array[i]));
  }
  return result;
}



function broadCastOnline(StateCb) {
  try {
    CastOnline(function() {
      var name = LOCALUUID;
      var port = '8885';
      var txtarray = ['demo-rio', LOCALACCOUNT, LOCALUUID];
      entryGroupCommit(name, port, txtarray);
      StateCb(true);
    });
  } catch (err) {
    console.log(err);
    StateCb(false);
  }
}
exports.broadCastOnline = broadCastOnline;

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
      entryGroupReset()
    }, 0);
    StateCb(true);
  } catch (err) {
    console.log(err);
    StateCb(false);
  }
}
exports.deviceDown = deviceDown;
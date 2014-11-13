var mdns = require('./device.js');
var config = require('../../backend/config.js');
var path = require('path');
var HOME_DIR = "/home";
var DEMO_RIO = ".demo-rio";
var CURUSER = process.env['USER'];
var USERCONFIGPATH = path.join(HOME_DIR, CURUSER, DEMO_RIO);
var uniqueID = require(USERCONFIGPATH + '/uniqueID.js')
var LOCALACCOUNT = uniqueID.Account;
var LOCALUUID = uniqueID.uniqueID;


function deviceStateCb(signal, obj) {
  interface = obj.interface;
  protocol = obj.protocol;
  name = obj.name;
  stype = obj.stype;
  domain = obj.domain;
  host = obj.host;
  aprotocol = obj.aprotocol;
  address = obj.address;
  port = obj.port;
  txt = obj.txt;
  flags = obj.flags;
  if (obj == null || obj.txt == null) {
    return;
  }
  if (obj.txt[0] == "demo-rio") {
    var device = {
      device_id: obj.txt[1],
      name: obj.txt[2],
      resourcePath: obj.txt[3],
      ip: obj.txt[4],
      account: obj.txt[5]
    };
    switch (signal) {
      case 'ItemNew':
        {
          console.log(device.device_id, device.name);
        }
        break;
      case 'ItemRemove':
        {
          console.log(device.device_id);
        }
        break;
    }
  }
}

function deviceStateCbbyAccount(signal, obj) {
  interface = obj.interface;
  protocol = obj.protocol;
  name = obj.name;
  stype = obj.stype;
  domain = obj.domain;
  host = obj.host;
  aprotocol = obj.aprotocol;
  address = obj.address;
  port = obj.port;
  txt = obj.txt;
  flags = obj.flags;
  //console.log(obj);
  if (obj == null || obj.txt == null) {
    return;
  }
  if (obj.txt[0] == "demo-rio") {
    var device = {
      device_id: obj.txt[1],
      name: obj.txt[2],
      resourcePath: obj.txt[3],
      ip: obj.txt[4],
      account: obj.txt[5]
    };
    switch (signal) {
      case 'ItemNew':
        {
          console.log('ItemNew');
        }
        break;
      case 'ItemRemove':
        {
          console.log('ItemRemove');
        }
        break;
    }
  }
  switch (signal) {
    case 'ItemNew':
      console.log('A new device is add, obj: ', obj);
      break;
    case 'ItemRemove':
      console.log('A device is removed, obj: ', obj);
      break;
  }
}


function devicePublishCb() {
  var name = 'demo-rio';
  var port = '8885';
  var txtarray = ['demo-rio', LOCALACCOUNT, LOCALUUID];
  mdns.entryGroupCommit(name, port, txtarray);
}

/**
 * @method getUserList
 *  获取当前局域网内的用户列表
 *
 * @param1 UserListCb
 *   回调函数
 *  @list
 *   Array, 该数组代表当前局域网内的用户列表
 *
 */
function getUserList(UserListCb) {
  mdns.showDeviceList(function(args) {
    deviceList = args;
    var obj;
    var tmp = [];
    for (address in deviceList) {
      obj = deviceList[address];
      if (tmp.indexOf(obj.txt[1]) === -1) {
        tmp.push(obj.txt[1]);
      };
    }
    UserListCb(tmp);
  });
}
exports.getUserList = getUserList;

/**
 * @method getDeviceByAccount
 *  获取当前局域网内某一账户下的所有设备列表
 *
 * @param1 Account
 *  string，表示待获取设备列表的账户
 * @param2 DeviceListCb
 *   回调函数
 *  @list
 *   Array, 该数组代表当前局域网内的某一用户下设备列表
 *
 */
function getDeviceByAccount(Account, DeviceListCb) {
  mdns.showDeviceList(function(args) {
    deviceList = args;
    var obj;
    var tmp = [];
    for (address in deviceList) {
      obj = deviceList[address];
      if (obj.txt[1] == Account) {
        tmp.push(obj);
      };
    }
    DeviceListCb(tmp);
  });
}
exports.getDeviceByAccount = getDeviceByAccount;

function showDeviceListCb(args) {
  deviceList = args;
  console.log("\n=====device list as below=====");
  var cnt = 1;
  var obj;
  for (address in deviceList) {
    obj = deviceList[address]
    var txtarray = obj.txt
    var txt = ''
    for (var i = 0; i < txtarray.length; i++) {
      txt += (txtarray[i] + '; ');
    }
    console.log(obj.address + ':' + obj.port + ' - ' + '"' + obj.name + '" (' + txt + ')');
  }
}


/**
 * @method addListenerByAccount
 *  为设备添加监听函数，当某一用户下的设备上下线时，触发相应的回调函数
 *
 * @param1 Account
 *  string，表示待监听的用户账户
 * @param2 UpBack
 *   回调函数
 *  @obj
 *   object, 指定帐户内的设备信息，包括设备ip，设备名称，附加字段
 * @param3 DownBack
 *   回调函数
 *  @obj
 *   object, 指定帐户内的设备信息，包括设备ip，设备名称，附加字段
 *
 */
function addListenerByAccount(Account, UpBack, DownBack) {
  mdns.addDeviceListener(function(signal, obj) {
    interface = obj.interface;
    protocol = obj.protocol;
    name = obj.name;
    stype = obj.stype;
    domain = obj.domain;
    host = obj.host;
    aprotocol = obj.aprotocol;
    address = obj.address;
    port = obj.port;
    txt = obj.txt;
    flags = obj.flags;
    //console.log(obj);
    if (obj == null || obj.txt == null) {
      return;
    }
    if (obj.txt[0] == "demo-rio") {
      var device = {
        name: obj.txt[1],
        device_id: obj.txt[2],
        resourcePath: obj.txt[3],
        ip: obj.txt[4],
        account: obj.txt[5]
      };
      if (device.name === Account) {
        switch (signal) {
          case 'ItemNew':
            {
              console.log("this is in addListenerByAccount function, account: ", Account);
              console.log(device.device_id, device.name);
              UpBack(obj);
            }
            break;
          case 'ItemRemove':
            {
              console.log("this is in addListenerByAccount function, account: ", Account);
              console.log(device.device_id);
              DownBack(obj);
            }
            break;
        }
      }
    }
  });
}
exports.addListenerByAccount = addListenerByAccount;

/**
 * @method addListenerByAccount
 *  为设备添加监听函数，当设备上下线时，触发相应的回调函数
 *
 * @param1 UpBack
 *   回调函数
 *  @obj
 *   object, 上线的设备信息，包括设备ip，设备名称，附加字段
 * @param2 DownBack
 *   回调函数
 *  @obj
 *   object, 下线的设备信息，包括设备ip，设备名称，附加字段
 *
 */
function addListener(UpBack, DownBack) {
  mdns.addDeviceListener(function(signal, obj) {
    // interface = obj.interface;
    protocol = obj.protocol;
    name = obj.name;
    stype = obj.stype;
    domain = obj.domain;
    host = obj.host;
    aprotocol = obj.aprotocol;
    address = obj.address;
    port = obj.port;
    txt = obj.txt;
    flags = obj.flags;
    //console.log(obj);
    if (obj == null || obj.txt == null) {
      return;
    }
    if (obj.txt[0] == "demo-rio") {
      var device = {
        device_id: obj.txt[1],
        name: obj.txt[2],
        resourcePath: obj.txt[3],
        ip: obj.txt[4],
        account: obj.txt[5]
      };
      switch (signal) {
        case 'ItemNew':
          {
            console.log("this is in addListener function");
            console.log(device.device_id, device.name);
            UpBack(obj);
          }
          break;
        case 'ItemRemove':
          {
            console.log("this is in addListener function");
            console.log(device.device_id);
            DownBack(obj);
          }
          break;
      }
    }
  });
}
exports.addListener = addListener;

/**
 * @method startMdnsService
 *  开启设备发现服务，同时广播本机的信息
 *
 */
function startMdnsService() {
  mdns.createServer(devicePublishCb);
}
exports.startMdnsService = startMdnsService;

/**
 * @method startMdnsListener
 *  在调用addListener或者addListenerByAccount，添加监听回调函数之后，调用本函数开启设备发现服务
 *
 */
function startMdnsListener() {
  mdns.createServer(function() {});
}
exports.startMdnsListener = startMdnsListener;

/**
 * @method deviceDown
 *  发布本机设备下线信息
 *
 */
function deviceDown() {
  setTimeout(function() {
    mdns.entryGroupReset()
  }, 0);
}
exports.deviceDown = deviceDown;

function showDeviceList() {
  setTimeout(function() {
    mdns.showDeviceList(showDeviceListCb)
  }, 0);
}
exports.showDeviceList = showDeviceList;
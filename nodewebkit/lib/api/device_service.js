var config = require("../../backend/config");
var mdns = require('./device.js');
var config = require('../../backend/config.js');
var router = require('../../backend/router.js');
var path = require('path');
var CURUSER = process.env['USER'];
var USERCONFIGPATH = config.USERCONFIGPATH;
var uniqueID = require(USERCONFIGPATH + '/uniqueID.js')
var LOCALACCOUNT = uniqueID.Account;
var LOCALUUID = uniqueID.uniqueID;


/**
 * @method getUserList
 *  获取当前局域网内的用户列表
 *
 * @param UserListCb
 *   回调函数
 *  @param1 arr
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

/*
 * @method getDeviceByAccount
 *  获取当前局域网内某一账户下的所有设备列表
 *
 * @param DeviceListCb
 *   回调函数
 *  @param1
 *   Array, 该数组代表当前局域网内的某一用户下设备列表
 * @param Account
 *  string，表示待获取设备列表的账户
 *
 */
function getDeviceByAccount(DeviceListCb, Account) {
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



/**
 * @method addListenerByAccount
 *  为设备添加监听函数，当某一用户下的设备上下线时，触发相应的回调函数
 *
 * @param ListenerCb
 *   回调函数
 *  @param1 obj
 *   object
 *   其中，obj中的flag字段，表示用来区分设备的上线或下线，其值为"up"或"down"
 *   obj中的info字段，指定帐户内的设备信息，包括设备ip，设备名称，附加字段。
 *   example:
 *   { flag: 'up',
 *  info:
 *  { interface: 2,
 *  protocol: 0,
 *  name: 'demo-rio',
 *  stype: '_http._tcp',
 *  domain: 'local',
 *  host: 'rtty-Junyi-M580.local',
 *  aprotocol: 0,
 *  address: '192.168.1.100',
 *  port: 8885,
 *  txt: [ 'demo-rio', 'USER1', '0ace23c24390ca960a7edfe26b7aaa47' ],
 *  flags: 29 } }
 * @param Account
 *  string，表示待监听的用户账户
 * @return ID
 * 返回标识刚添加的回调函数的ID
 *
 */
function addListenerByAccount(ListenerCb, Account) {
  var tmpnum = mdns.addDeviceListenerToObj(function(signal, obj) {
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
              var UpCbPara = {
                flag: "up",
                info: obj
              };
              console.log("this is in addListenerByAccount function, account: ", Account);
              ListenerCb(UpCbPara);
            }
            break;
          case 'ItemRemove':
            {
              var DownCbPara = {
                flag: "down",
                info: obj
              };
              console.log("this is in addListenerByAccount function, account: ", Account);
              ListenerCb(DownCbPara);
            }
            break;
        }
      }
    }
  });
  return tmpnum;
}
exports.addListenerByAccount = addListenerByAccount;



/**
 * @method addListener
 *  为设备添加监听函数，当设备上下线时，触发相应的回调函数
 *
 * @param ListenerCb
 *   回调函数
 *  @param1 obj
 *   object
 *   其中，obj中的flag字段，表示用来区分设备的上线或下线，其值为"up"或"down"
 *   obj中的info字段，指定帐户内的设备信息，包括设备ip，设备名称，附加字段。
 *   example:
 *   { flag: 'up',
 *  info:
 *  { interface: 2,
 *  protocol: 0,
 *  name: 'demo-rio',
 *  stype: '_http._tcp',
 *  domain: 'local',
 *  host: 'rtty-Junyi-M580.local',
 *  aprotocol: 0,
 *  address: '192.168.1.100',
 *  port: 8885,
 *  txt: [ 'demo-rio', 'USER1', '0ace23c24390ca960a7edfe26b7aaa47' ],
 *  flags: 29 } }
 * 
 * @return ID
 * 返回刚添加的回调函数的ID
 *
 */
function addListener(ListenerCb) {
  var tmpnum = mdns.addDeviceListenerToObj(function(signal, obj) {
    if (obj == null || obj.txt == null) {
      return;
    }
    if (obj.txt[0] == "demo-rio") {
      switch (signal) {
        case 'ItemNew':
          {
            var UpCbPara = {
              flag: "up",
              info: obj
            };
            console.log("this is in addListener function");
            ListenerCb(UpCbPara);
            router.wsNotify({
              'Action': 'notify',
              'Event': 'device',
              'Data': UpCbPara
            });
          }
          break;
        case 'ItemRemove':
          {
            var DownCbPara = {
              flag: "down",
              info: obj
            };
            console.log("this is in addListener function");
            ListenerCb(DownCbPara);
            router.wsNotify({
              'Action': 'notify',
              'Event': 'device',
              'Data': DownCbPara
            });
          }
          break;
      }
    }
  });
  return tmpnum;
}
exports.addListener = addListener;

/**
 * @method removeListener
 *  删除注册的设备上下线监听回调函数
 *
 * @param CbId
 *   待删除的设备ID
 *
 */
function removeListener(CbId){
  mdns.removeDeviceListenerFromObj(CbId);
}
exports.removeListener = removeListener;

/**
 * @method startMdnsService
 *  开启设备发现服务，同时广播本机的信息
 *   @param StateCb
 *   回调函数
 *    @param1 state
 *     bool 当成功开启设备发现服务时，值为true，否则为false
 *
 */
function startMdnsService(StateCb) {
  try {
    mdns.createServer(function() {
      var name = LOCALUUID;
      var port = '8885';
      var txtarray = ['demo-rio', LOCALACCOUNT, LOCALUUID];
      mdns.entryGroupCommit(name, port, txtarray);
      StateCb(true);
    });
  } catch (err) {
    console.log(err);
    StateCb(false);
  }
}
exports.startMdnsService = startMdnsService;


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


/**
 * @method showDeviceList
 *  获取当前局域网内的设备列表
 *
 * @param ListCb
 *   回调函数
 *  @param1 arr
 *   Array, 该数组代表当前局域网内的用户列表，详细使用说明见test_dev.js
 *
 */
function showDeviceList(ListCb) {
  setTimeout(function() {
    mdns.showDeviceList(function(args) {
      deviceList = args;
      ListCb(deviceList);
    })
  }, 0);
}
exports.showDeviceList = showDeviceList;

var DBus;
try {
  DBus = require('dbus');
} catch(e) {
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

/**
 * @method addDeviceListener
 *  为signal ItemNew和ItemRemove添加回调方法
 *
 * @param1 cb
 *   回调函数
 *  @signal
 *   string, 代表信号类型，设备上线为ItemNew，设备下线为ItemRemove。
 *  @obj
 *   object, 设备发送的相关信息。{interface,protocol,name,stype,domain,host,aprotocol,address,port,txt,flags}
 *
 */
function addDeviceListener(cb){
  deviceListeners.push(cb);
}
exports.addDeviceListener = addDeviceListener;
/**
 * @method addDeviceListenerToObj
 *  为signal ItemNew和ItemRemove添加回调方法
 *
 * @param1 cb
 *   回调函数
 *  @signal
 *   string, 代表信号类型，设备上线为ItemNew，设备下线为ItemRemove。
 *  @obj
 *   object, 设备发送的相关信息。{interface,protocol,name,stype,domain,host,aprotocol,address,port,txt,flags}@
 *
 *  @returns 该回调方法的ID
 *
 */
function addDeviceListenerToObj(cb){
  globalIDforListener++;
  deviceListenersObj[globalIDforListener]=cb;
  return globalIDforListener;
}
exports.addDeviceListenerToObj = addDeviceListenerToObj;
/**
 * @method removeDeviceListener
 *  删除列表中的某一个回调方法
 *
 * @param1 cb
 *   回调函数，方法名。
 *
 */
function removeDeviceListener(cb){
  for(index in deviceListeners){
  if(deviceListeners[index] == cb)
    deviceListeners.splice(index, 1);
  }
}
exports.removeDeviceListener = removeDeviceListener;
/**
 * @method removeDeviceListenerFromObj
 *  删除列表中的某一个回调方法
 *
 * @param1 id
 *   方法对应的全局ID。
 *
 */
function removeDeviceListenerFromObj(id){
  delete deviceListenersObj[id];
}
exports.removeDeviceListenerFromObj = removeDeviceListenerFromObj;

function callDeviceListener(type, obj){
  //This is the second filter, the first filter in function startServiceBrowser
  if(null === obj){
    return;
  }
  if(obj.aprotocol === 0){//aprotocol filter.
    switch(type){
      case "ItemNew":      
        deviceList[obj.name] = obj;
        break;
      case "ItemRemove":
        break;
    }
    for(index in deviceListeners){
      deviceListeners[index](type, obj);
    }
  }
}
function callDeviceListenerObj(type, obj){
  //This is the second filter, the first filter in function startServiceBrowser
  if(null === obj){
    return;
  }
  if(obj.aprotocol === 0){//aprotocol filter.
    switch(type){
      case "ItemNew":      
        deviceList[obj.name] = obj;
        break;
      case "ItemRemove":
        break;
    }
    for(index in deviceListenersObj){
      deviceListenersObj[index](type, obj);
    }
  }
}

function deleteDeviceByName(name){
  var obj;
  for(address in deviceList){
    obj = deviceList[address]
    if(obj.name == name){
      newobj = new Object();
      for(var attr in obj){  
        newobj[attr] = obj[attr]; 
       }
      delete deviceList[address];
      return newobj;
    }
  }
  return null;
}

/**
 * @method showDeviceList
 *  显示当前设备列表 
 *
 * @param1 showDeviceListCb
 *   回调函数
 *  @object{address: object{interface,protocol,name,stype,domain,host,aprotocol,address,port,txt,flags}}
 *
 */
function showDeviceList(showDeviceListCb){
  showDeviceListCb(deviceList);
}
exports.showDeviceList = showDeviceList;


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

/**
 * @method createServer
 *  启动服务，包括ServiceBrowser和EntryGroup
 *
 * @param1 publishCb
 *   发布设备的回调方法，在entrygroup服务启动后被回调。
 *
 */
function createServer(){
  bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
    if ((err != null) || (undefined === iface)){
      console.log(err);
      return;
    }
    server = iface;

    iface.ServiceBrowserNew['error'] = function(err) {
      console.log("ServiceBrowserNew error: " + err);
    }
    iface.ServiceBrowserNew['timeout'] = 2000;
    iface.ServiceBrowserNew['finish'] = function(path) {
      console.log('ServiceBrowserNew finish:', path);
      startServiceBrowser(path);
      serviceBrowserPath = path;
    };
    iface.ServiceBrowserNew(-1, -1, '_http._tcp', 'local', 0);

    iface.ResolveService['error'] = function(err) {
      //console.log("ResolveService: " + err);
    }
    iface.ResolveService['timeout'] = 2000;
    iface.ResolveService['finish'] = function(result) {
      //all elements of resolved service.
      obj = new Object();
      obj.interface = result[0];
      obj.protocol = result[1];
      obj.name = result[2];
      obj.stype = result[3];
      obj.domain = result[4];
      obj.host = result[5];
      obj.aprotocol = result[6];
      obj.address = result[7];
      obj.port = result[8];
      txtorig = result[9];
      txt = new Array();
      for(var i=0; i<txtorig.length; i++){
        txt.push(arrayToString(txtorig[txtorig.length-i-1]));
      }
      obj.txt = txt;
      obj.flags  = result[10];
      callDeviceListenerObj('ItemNew', obj);
    };
  });
}
exports.createServer = createServer;

function broadCastOnline(devicePublishCb) {
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

function startServiceBrowser(path){
 // console.log('A new ServiceBrowser started, path:' + path);
  bus.getLocalInterface('org.freedesktop.Avahi', path, 'org.freedesktop.Avahi.ServiceBrowser', __dirname + '/org.freedesktop.Avahi.ServiceBrowser.xml', function(err, iface) {
    if ((err != null) || (undefined === iface)){
      console.log(err);
      return;
    }
    serviceBrowser = iface;
    iface.on('ItemNew', function(arg) {
      console.log('ServiceBrowser ItemNew:', arg);
      if(arguments[1] == 0){//protocol filter
        server.ResolveService(arguments[0], arguments[1], arguments[2], arguments[3], arguments[4], -1, 0);
        //server.ResolveService(2, 1, 'TestService', '_http._tcp', 'local', -1, 0);
      }
    });
    iface.on('ItemRemove', function(arg) {
      console.log('ServiceBrowser ItemRemove:', arg);
      var interface = arguments[0];
      var protocol = arguments[1];
      var name = arguments[2];
      var type = arguments[3];
      var domain = arguments[4];
      var flags = arguments[5];
      if(arguments[1] == 0){//protocol filter
        callDeviceListenerObj('ItemRemove', deleteDeviceByName(name));
      }
    });
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

function createServiceBrowser(){
  bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
    console.log("server in createServiceBrowser", server);
    if ((err != null) || (undefined === iface)){
      console.log(err);
      return;
    }

    iface.ServiceBrowserNew['error'] = function(err) {
      console.log("ServiceBrowserNew: " + err);
    }
    iface.ServiceBrowserNew['timeout'] = 2000;
    iface.ServiceBrowserNew['finish'] = function(path) {
      startServiceBrowser(path);
      serviceBrowserPath = path;
    };  
    iface.ServiceBrowserNew(-1, -1, '_http._tcp', 'local', 0);
  });
}

function createEntryGroup(){
  bus.getInterface('org.freedesktop.Avahi', '/', 'org.freedesktop.Avahi.Server', function(err, iface) {
    iface.EntryGroupNew['error'] = function(err) {
      console.log("EntryGroupNew: " + err);
    }
    iface.EntryGroupNew['timeout'] = 2000;
    iface.EntryGroupNew['finish'] = function(path) {
      startEntryGroup(path);
      entryGroupPath = path;
    };
    iface.EntryGroupNew();
  });
}

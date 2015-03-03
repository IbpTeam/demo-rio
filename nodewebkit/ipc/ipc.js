var util = require('util'),
    events = require('events');
// need singleton?
var ipc = {
  dbus: null
};

// initObj: {
//  service: Boolean -> this is for service or client
//  serviceObj: Object -> if service is true, we'll need this
//  address: String -> service's name | address
//  path: String -> object's path
//  name: String -> interface's name
//  interface: Object -> user defined interface for initializing service
// }
//
function IPC(type, initObj) {
  var self = this;

  events.EventEmitter.call(self);
  
  switch(type) {
    case 'dbus':
      self._ipc = require('./ipc-dbus.js').getObj(initObj);
      break;
    default:
      throw 'Unknown type of IPC';
  }
  self._ipc.on('msg', function(msg) {
    self.onMsg(msg);
  }).on('connect', function() {
    self.onConnect();
  }).on('close', function() {
    self.onClose();
  }).on('error', function(err) {
    self.onError(err);
  });
}
util.inherits(IPC, events.EventEmitter);

IPC.prototype.onMsg = function(msg) {
  console.log('Recive message:', msg);
  // TODO: make sure the communication protocol
}

IPC.prototype.onConnect = function() {
  console.log('Connect successfully');
}

IPC.prototype.onClose = function() {
  console.log('Connection has been closed');
}

IPC.prototype.onError = function(err) {
  console.log('Error occured:', err);
}

// peramObj: {
//  name: String -> fn's name
//  in: Array -> peramters
//  callback: Function -> the result will be this fn's perameter
// }
//
IPC.prototype.invoke = function(peramObj) {
  // call the implement method of ipc
  this._ipc.invoke.apply(this._ipc, arguments);
}

// TODO: change the paramter msg to (event, arguments)
IPC.prototype.notify = function(msg) {
  // TODO: transmit (event, arguments) into a msg
  //  and then transmit to _ipc to notify
  this._ipc.notify.apply(this._ipc, arguments);
}

IPC.prototype._dispatch = function(msg) {
  // TODO: parse messages recived and dispatch to corresponding handler
}

exports.getIPC = function(type, initObj) {
  if(ipc[type] == null) ipc[type] = new IPC(type, initObj);
  return ipc[type];
}


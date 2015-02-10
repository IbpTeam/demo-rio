var util = require('util'),
    events = require('events');
// need singleton?
var ipc = {
  dbus: null
};

// initObj: {
//  service: boolean -> this is for service or client
//  serviceObj: object -> if service is true, we'll need this
//  address: string -> service's name | address
//  path: string -> object's path
//  name: string -> interface's name
//  interface: string -> user defined interface for initializing service
// }
function IPC(type, initObj) {
  var self = this;

  events.EventEmitter.call(self);

  switch(type) {
    case 'dbus':
      self._ipc = require('./ipc-dbus.js').getObj(initObj);
    default:
      throw 'Unknown type of IPC';
  }
  self._ipc.on('msg', self.onMsg)
    .on('connect', self.onConnect)
    .on('close', self.onClose)
    .on('error', self.onError);
}
util.inherits(IPC, events.EventEmitter);

IPC.prototype.onMsg = function(msg) {
  console.log('Recive message:', msg);
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
IPC.prototype.invoke = function(peramObj) {
  // TODO: call the implement method of ipc
  this._ipc.invoke.apply(this._ipc, arguments);
}

IPC.prototype.notify = function(msg) {
  // TODO: transmit to _ipc to notify
  this._ipc.notify.apply(this._ipc, arguments);
}

IPC.prototype._dispatch = function() {
  // TODO: dispatch messages
}

exports.getIPC = function(type, initObj) {
  if(ipc[type] == null) ipc[type] = new IPC(type, initObj);
  return ipc[type];
}


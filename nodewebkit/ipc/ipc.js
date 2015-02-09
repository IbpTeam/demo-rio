var util = require('util'),
    events = require('events');

var ipc = {
  dbus: null
};

// events provided:
// message: after remote message recived
// connect: after connect successfully
// error: after error occured
// close: after connection closed
function IPC(type) {
  var self = this;

  switch(type) {
    case 'dbus':
      self._ipc = require('./ipc-dbus.js');
    default:
      throw 'Unknown type of IPC';
  }
  events.EventEmitter.call(self);
}

util.inherits(IPC, events.EventEmitter);

IPC.prototype.invoke = function() {
  // TODO: call the implement method of ipc
  this._ipc.invoke.apply(this._ipc, arguments);
}

IPC.prototype._dispatch = function() {
  // TODO: dispatch messages
}

exports.getIPC = function(type) {
  if(ipc[type] == null) ipc[type] = new IPC(type);
  return ipc[type];
}


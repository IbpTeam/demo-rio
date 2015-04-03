var util = require('util'),
    events = require('events');
// need singleton?
var ipc = {};

// initObj: {
//  service: Boolean -> this is for service or client
//  serviceObj: Object -> if service is true, we'll need this
//  address: String -> service's name | address
//  path: String -> object's path
//  name: String -> interface's name
//  interface: Object -> user defined interface for initializing service
// }
//
function IPC(initObj) {
  var self = this;

  events.EventEmitter.call(self);
  
  switch(initObj.type) {
    case 'dbus':
      self._ipc = require('./ipc-dbus.js').getObj(initObj);
      break;
    default:
      throw 'Unknown type of IPC, [type = ' + initObj.type + ']';
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
  this._dispatch(msg);
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

IPC.prototype.notify = function(event) {
  // transmit (event, arguments) into a msg
  //  and then transmit to _ipc to notify
  try {
    var args = Array.prototype.slice.call(arguments, 0, arguments.length),
        msg = JSON.stringify(args);
    this._ipc.notify.call(this._ipc, msg);
  } catch(e) {
    this.onError(e);
  }
}

IPC.prototype._dispatch = function(msg) {
  // parse messages recived and dispatch to corresponding handler
  try {
    var args = JSON.parse(msg);
    this.emit.apply(this, args);
  } catch(e) {
    this.onError(e);
  }
}

exports.getIPC = function(initObj) {
  if(typeof ipc[initObj.name] === 'undefined')
    ipc[initObj.name] = new IPC(initObj);
  return ipc[initObj.name];
}


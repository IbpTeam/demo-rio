var util = require('util'),
    events = require('events'),
    DBus = require('dbus'),
    dbus = new DBus();

// events provided:
// message: after remote message recived
// connect: after connect successfully
// error: after error occured
// close: after connection closed
function DBusIPC(initObj) {
  var self = this;
  self._property = initObj;
  self._typeConvert = {
    'Auto': DBus.Define('Auto'),
    'String': DBus.Define(String),
    'Number': DBus.Define(Number),
    'Boolean': DBus.Define(Boolean),
    'Array': DBus.Define(Array),
    'Object': DBus.Define(Object)
  };

  events.EventEmitter.call(self);
  if(initObj.service) {
    self._addService();
  } else {
    self._getInterface();
    self._callStack = {};
  }
}
util.inherits(DBusIPC, events.EventEmitter);

DBusIPC.prototype._getServiceInterface = function() {
  var self = this;
  try {
    var service = dbus.registerService('session', this._property.address),
        obj = service.createObject(this._property.path);
    self._iface = obj.createInterface(this._property.name);
  } catch(e) {
    console.log('getServiceInterface:', e);
  }
  return self._iface;
}

DBusIPC.prototype._addService = function() {
  // register service to D-Bus based on init perameters
  var iface = this._getServiceInterface(),
      interfaces = this._property.interface,
      self = this;
  // console.log('iface:', iface);
  // console.log('interfaces:', interfaces);
  for(var i = 0; i < interfaces.length; ++i) {
    var inArray = undefined,
        outType = undefined,
        serviceName = interfaces[i].name;
    if(typeof interfaces[i].in !== 'undefined') {
      inArray = [];
      for(var j = 0; j < interfaces[i]['in'].length; ++j) {
        inArray[j] = self._typeConvert[interfaces[i]['in'][j]];
      }
    }
    if(typeof interfaces[i].out !== 'undefined') {
      outType = self._typeConvert[interfaces[i]['out']];
    }
    iface.addMethod(serviceName, {
      in: inArray,
      out: outType
    }, self._property.serviceObj[serviceName]);
  }
  iface.addSignal('notify', {
    types: [
      self._typeConvert['String']
    ]
  });
  // console.log('iface:', iface);
  iface.update();
}

DBusIPC.prototype.notify = function(msg) {
  if(typeof msg !== 'string')
    return this.emit('error', 'Bad type of content to notify');
  this._getServiceInterface().emit('notify', msg);
}

DBusIPC.prototype._getInterface = function(ret, callback) {
  // get service interface from D-Bus based on init perameters
  var bus = dbus.getBus('session'),
      prop = this._property,
      self = this,
      _ret = ret || function() {},
      cb = callback || function() {};
  bus.getInterface(prop.address, prop.path, prop.name, function(err, iface) {
    if(err) {
      _ret({err: err});
      return self.emit('error', err);
    }
    self._initSingal(iface);
    cb(iface);
  });
}

DBusIPC.prototype._initSingal = function(iface) {
  var self = this;
  // console.log('initSingal:', self._property); 
  iface.removeAllListeners('notify').on('notify', function(msg) {
    // console.log('notify:', msg, '\n', self);
    try {
      self.emit('msg', msg);
    } catch(e) {
      console.log('notify:', e);
    }
  });
}

DBusIPC.prototype.invoke = function(peramObj) {
  var self = this,
      cb = peramObj.callback || function() {};
  self._getInterface(cb, function(iface) {
    if(typeof iface[peramObj.name] === 'undefined') {
      var err = 'No such interface: ' + peramObj.name;
      cb({err: err});
      return self.emit('error', err);
    }
    self._callStack[peramObj.token] = cb;
    iface[peramObj.name]['timeout'] = 1000;
    iface[peramObj.name]['finish'] = function(result) {
      if(typeof result.err === 'undefined') result.err = null;
      self._callStack[peramObj.token](result);
      self._callStack[peramObj.token] = null;
      delete self._callStack[peramObj.token];
    };
    iface[peramObj.name]['error'] = function(err) {
      self.emit('error', err);
      self._callStack[peramObj.token]({err: err});
      self._callStack[peramObj.token] = null;
      delete self._callStack[peramObj.token];
    }
    iface[peramObj.name].apply(iface, peramObj.in);
  });
}

var server = null;
exports.getObj = function(initObj) {
  // if(!initObj.service || server == null)
    return new DBusIPC(initObj);
  // return server;
}


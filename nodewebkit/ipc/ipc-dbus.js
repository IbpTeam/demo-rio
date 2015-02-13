var util = require('util'),
    events = require('events'),
    DBus = require('node-dbus'),
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
    self._initSingal();
  }
}
util.inherits(DBusIPC, events.EventEmitter);

DBusIPC.prototype._getServiceInterface = function() {
  var service = dbus.registerService('session', this._property.address),
      obj = service.createObject(this._property.path);
  return obj.createInterface(this._property.name);
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
    }, function() {
      self._property.serviceObj[serviceName].apply(self._property.serviceObj, arguments);
    });
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
  if(typeof msg !== 'String')
    return this.emit('error', 'Bad type of content to notify');
  this._getServiceInterface().emit('notify', msg);
}

DBusIPC.prototype._getInterface = function(callback) {
  // get service interface from D-Bus based on init perameters
  var bus = dbus.getBus('session'),
      prop = this._property,
      self = this,
      cb = callback || function() {};
  bus.getInterface(prop.address, prop.path, prop.name, function(err, iface) {
    if(err) return self.emit('error', err);
    cb(iface);
  });
}

DBusIPC.prototype._initSingal = function() {
  this._getInterface(function(iface) {
    iface.on('notify', function(msg) {
      self.emit('msg', msg);
    });
  });
}

DBusIPC.prototype.invoke = function(peramObj) {
  var self = this,
      cb = peramObj.callback || function() {};
  this._getInterface(function(iface) {
    if(typeof iface[peramObj.name] === 'undefined')
      return self.emit('error', 'No such interface: ' + peramObj.name);
    iface[peramObj.name]['timeout'] = 1000;
    iface[peramObj.name]['finish'] = cb;
    iface[peramObj.name]['error'] = function(err) {
      self.emit('error', err);
    }
    iface[peramObj.name].apply(iface, peramObj.in);
  });
}

exports.getObj = function(initObj) {
  return new DBusIPC(initObj);
}


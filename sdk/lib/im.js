var proxy = require('./requireProxy');
var serie = require('../utils/flowctl');

function remoteObj(servName, IP) {
  this.im = null;
  this.serv = servName;
  var self = this;
  this.init = function(cb) {
    proxy.requireProxy(['im'], IP, function(improxy) {
      self.im = improxy;
      cb(null);
    });
  }
}

remoteObj.prototype.sendmsg = function(content) {
  var self = this;
  if (this.im === null) {
    serie.series([{
      fn: function(pera_, cb_) {
        console.log("init proxy");
        self.init(cb_);
      },
      pera: {}
    }, {
      fn: function(pera_, cb_) {
        self.insend(pera_.con, cb_);
      },
      pera: {
        con: content
      }
    }], function(err_, rets_) {

    });
  } else {
    this.insend(content, function() {});
  }
}

remoteObj.prototype.insend = function(content, cb) {
  var msg = {};
  msg.typ = this.serv;
  msg.txt = content;
  this.im.send(JSON.stringify(msg), function(res) {

  });
  cb(null);
}

//this function is used to get remote service object , developers can use this object to send message to remote service
//para: servName: remote Service name.
//para: IP : remote IP address
//e.g. :getRemoteObj('E1',"192.168.1.2");
exports.getRemoteObj = function(servName, IP) {
  var rObj = new remoteObj(servName, IP);
  return rObj;
}

function LocalServ(servName, cb) {
  this.im = null;
  this.serv = servName;
  this.callback = cb;
  var self = this;
  this.runserv = function() {
    proxy.requireProxy(['im'], function(improxy) {
      self.im = improxy;
      improxy.on(self.serv, self.callback);
    });
  }
  this.stopserv = function() {
    self.im.off(self.serv, self.callback);
  }
}

LocalServ.prototype.run = function() {
  this.runserv();
}

LocalServ.prototype.stop = function() {
  this.stopserv();
}

var localObj = null;

//this function is used to get local service object, if you want to start a service called by a remote client, you
//should call this first
//para: servName: local service name
//para: cb : callback when recieve remote call
//e.g. :getLocalServ('E1',function(str){
//   console.log("received msg : ",str,"from E1 service");
//});
exports.getLocalServ = function(servName, cb) {
  if (localObj === null) {
    localObj = new LocalServ(servName, cb);
  }
  return localObj;
}
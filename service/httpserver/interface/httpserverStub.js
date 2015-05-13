// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket
var flowctl = require('../../../sdk/utils/flowctl');

var initObj = {
  "address": "nodejs.webde.httpserver",
  "path": "/nodejs/webde/httpserver",
  "name": "nodejs.webde.httpserver",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "start",
      "in": [],
      "show": "l"
    },
    {
      "name": "stop",
      "in": [],
      "show": "l"
    },
    {
      "name": "restart",
      "in": [],
      "show": "l"
    }
  ],
  "serviceObj": {
    start: function(callback) {
      httpServer.start(function(err) {
        if(err) callback({err: err});
        callback({});
      });
    },
    stop: function(callback) {
      httpServer.stop(function(err) {
        if(err) callback({err: err});
        callback({});
      });
    },
    restart: function(callback) {
      flowctl.series([
        {
          fn: function(pera, cb) {
            httpServer.stop(function(err) {
              if(err) return cb(err);
              return cb(null);
            });
          }
        },
        {
          fn: function(pera, cb) {
            httpServer.start(function(err) {
              if(err) return cb(err);
              return cb(null);
            });
          }
        }
      ], function(err, rets) {
        if(err) return callback({err: err});
        callback({});
      });
    }
  }
}

function Stub() {
  // TODO: please replace $IPC with the real path of webde-rpc module in your project
  this._ipc = require('webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null,
    httpServer = null;
exports.getStub = function(httpServer_) {
  if(stub == null) {
    stub = new Stub();
    httpServer = httpServer_;
  }
  return stub;
}

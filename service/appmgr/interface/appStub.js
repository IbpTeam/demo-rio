// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.app",
  "path": "/nodejs/webde/app",
  "name": "nodejs.webde.app",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "startApp",
      "in": [
        "Object",
        "String"
      ],
      "show": "l"
    },
    {
      "name": "sendKeyToApp",
      "in": [
        "String",
        "String"
      ],
      "show": "l"
    },
    {
      "name": "registerApp",
      "in": [
        "Object",
        "Object"
      ],
      "show": "l"
    },
    {
      "name": "unregisterApp",
      "in": [
        "String"
      ],
      "show": "l"
    },
    {
      "name": "getRegisteredApp",
      "in": [],
      "show": "l"
    },
    {
      "name": "getRegisteredAppInfo",
      "in": [
        "String"
      ],
      "show": "l"
    },
    {
      "name": "getBasePath",
      "in": [],
      "show": "l"
    },
    {
      "name": "generateAppByURL",
      "in": [
        "String",
        "Object"
      ],
      "show": "l"
    }
  ],
  "serviceObj": {
    startApp: function(appInfo, params, callback) {
      app.startApp(appInfo, params, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    sendKeyToApp: function(windowName, key, callback) {
      app.sendKeyToApp(windowName, key, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    registerApp: function(appInfo, option, callback) {
      app.registerApp(appInfo, option, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    unregisterApp: function(appID, callback) {
      app.unregisterApp(appID, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    getRegisteredApp: function(callback) {
      app.getRegisteredApp(function(err, appList) {
        if(err) {
          return callback({err: err});
        }
        callback({ret: appList});
      });
    },
    getRegisteredAppInfo: function(appID, callback) {
      app.getRegisteredAppInfo(appID, function(err, appInfo) {
        if(err) {
          return callback({err: err});
        }
        callback({ret: appInfo});
      });
    },
    getBasePath: function(callback) {
      app.getBasePath(function(err, basePath) {
        if(err) {
          return callback({err: err});
        }
        callback({ret: basePath});
      });
    },
    generateAppByURL: function(url, option, callback) {
      app.generateAppByURL(url, option, function(err, appID) {
        if(err) {
          return callback({err: err});
        }
        callback({ret: appID});
      })
    }
  }
}

function Stub() {
  this._ipc = require('webde-rpc').getIPC(initObj);
}

Stub.prototype.notify = function(event) {
  this._ipc.notify.apply(this._ipc, arguments);
};

var stub = null,
    app = null;
exports.getStub = function(app_) {
  if(stub == null) {
    stub = new Stub();
    app = app_;
  }
  return stub;
}


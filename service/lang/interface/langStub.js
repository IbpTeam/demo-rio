// This file is auto generated based on user-defined interface.
// Please make sure that you have checked all TODOs in this file.
// TODO: please replace types with peramters' name you wanted of any functions
// TODO: please replace $ipcType with one of dbus, binder, websocket and socket

var initObj = {
  "address": "nodejs.webde.lang",
  "path": "/nodejs/webde/lang",
  "name": "nodejs.webde.lang",
  "type": "dbus",
  "service": true,
  "interface": [
    {
      "name": "getInitInfo",
      "in": [
        "String"
      ],
      "show": "l"
    },
    {
      "name": "getLang",
      "in": [
        "String"
      ],
      "show": "l"
    },
    {
      "name": "getLangByName",
      "in": [
        "String"
      ],
      "show": "l"
    },
    {
      "name": "setLocale",
      "in": [
        "String"
      ],
      "show": "l"
    },
    {
      "name": "getLocale",
      "in": [],
      "show": "l"
    },
    {
      "name": "getLangList",
      "in": [],
      "show": "l"
    },
    {
      "name": "addLang",
      "in": [
        "Object"
      ],
      "show": "l"
    },
    {
      "name": "removeLang",
      "in": [
        "Object"
      ],
      "show": "l"
    }
  ],
  "serviceObj": {
    getInitInfo: function(String, callback) {
       utils.parallel([
    {
      fn: function(String, callback) {
        lang.getCurLocale(function(err, locale){
          if(err) {
            return callback({err: err});
           }
          callback({ret: locale});
        });
       }
    },
    {
      fn: function(String, callback) {
        lang.getLangList(function(err, list){
         if(err) {
          return callback({err: err});
          }
        callback({ret: list});
        });
      }
    },
    {
      fn: function(String, callback) {
        lang.getLangByName(name, function(err) {
          if(err) {
            return callback({err: err});
          }
          callback({});
        });
      }
    }
  ],function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    getLang: function(String, callback) {
      lang.getLang(path, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    getLangByName: function(String, callback) {
      lang.getLangByName(name, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    setLocale: function(String, callback) {
      lang.setLocale(locale, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    getLocale: function(callback) {
      lang.getCurLocale(function(err, locale){
        if(err) {
          return callback({err: err});
        }
        callback({ret: locale});
      });
    },
    getLangList: function(callback) {
      lang.getLangList(function(err, list){
        if(err) {
          return callback({err: err});
        }
        callback({ret: list});
      });
    },
    addLang: function(Object, callback) {
      lang.addLang(lang, function(err) {
        if(err) {
          return callback({err: err});
        }
        callback({});
      });
    },
    removeLang: function(Object, callback) {
      lang.removeLang(lang, function(err) {
        if(err) {
          return callback({err: err});
        }
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
         lang = null;
exports.getStub = function(lang_) {
  if(stub ==null) {
    stub = new Stub();
    lang = lang_;
  }
  return stub;
}

var config = require('../../../nodewebkit/backend/config'),
    flowctl = require('../../../sdk/utils/flowctl'),
    json4line = require('../../../sdk/utils/json4line'),
    util = require('util'),
    event = require('events'),
    localPath = config.LANG[0] + '/locale.conf',
    globalPath = config.LANG[1] + '/locale.conf',
    initPera = {};

function Language(ret_) {
    var ret = ret_ || {
      success: function() {},
      fail: function() {}
    };
    this._gConf = {
       langList: []
     };
    this._lConf = {
       langList: []
     };
    this.__init = false;
    event.EventEmitter.call(this);

  this._loadlangList(function(err) {
    if(err) {
      return ret.fail(err);
    }
    ret.success();
  });
}

util.inherits(Language, event.EventEmitter);

// load langList from system
  Language.prototype._loadlangList = function(callback_) {
     var cb_ = callback_ || function() {};
    var _this = this;
     // initialize this list from local to global
     flowctl.series([
      {
        fn: function(pera_, callback_) {
          json4line.readJSONFile(localPath, function(err_, json_) {
            if(err_) {
              return callback_(null);
            }
            else{
              _this._lConf = json_;
              callback_(null);
            } 
          });
        }
      },
     {
        fn: function(pera_, callback_) {
          json4line.readJSONFile(globalPath, function(err_, json_) {
            if(err_) {
               return callback_(err_);
            }else{
               _this._gConf = json_;
               callback_(null);
            }
          });
        }
      }
    ], function(err_, rets_) {
      if(err_) return cb_('Fail to load lang list: ' + err_);
      _this.__init = true;
      _this.__emit('init');
      cb_(null);
    });
  }

Language.prototype.__emit = function(event) {
  var listeners = this.listeners(event);
  for(var i = 0; i < listeners.length; ++i) {
    if(listeners[i] == this.getLang) {
      this.getLang.apply(this, initPera['getLang']);
    } else if(listeners[i] == this.getLangByName) {
      this.getLangByName.apply(this, initPera['getLangByName']);
    } else if(listeners[i] == this.setLocale) {
      this.setLocale.apply(this, initPera['setLocale']);
    } else if(listeners[i] == this.getCurLocale) {
      this.getCurLocale.apply(this, initPera['getCurLocale']);
    } else if(listeners[i] == this.getLangList) {
      this.getLangList.apply(this, initPera['getLangList']);
    } else if(listeners[i] == this.addLang) {
      this.addLang.apply(this, initPera['addLang']);
    } else if(listeners[i] == this.removeLang) {
      this.removeLang.apply(this, initPera['removeLang']);
    } else {
    }
  }
  this.removeAllListeners('init');
}

// for outside app, they can their own language file by this interface
Language.prototype.getLang = function(path_, callback_) {
  json4line.readJSONFile(path_, callback_);
}

// this interface is for inside app
Language.prototype.getLangByName = function(name_, callback_) {
  if(!this.__init) {
    initPera['getLangByName'] = arguments;
    return this.on('init', this.getLangByName);
  }
  var cb_ = callback_ || function() {},
      locale = this._lConf.locale || this._gConf.locale;
  // local -> global -> default
  flowctl.series([
    {
      fn: function(pera_, callback_) {
        json4line.readJSONFile(config.LANG[0] + '/' + locale + '/' + name_
          , function(err_, json_) {
            if(err_) return callback_(null);
            cb_(null, json_);
          });
      }
    },
    {
      fn: function(pera_, callback_) {
        json4line.readJSONFile(config.LANG[1] + '/' + locale + '/' + name_
          , function(err_, json_) {
            if(err_) return callback_(null);
            cb_(null, json_);
          });
      }
    },
    {
      fn: function(pera_, callback_) {
        json4line.readJSONFile(config.LANG[1] + '/default/' + name_
          , function(err_, json_) {
            if(err_) return callback_(err_);
            cb_(null, json_);
          });
      }
    }
  ], function(err_, rets_) {
    if(err_) return cb_('Fail to get lang file');
  });
}

Language.prototype.notify = function(event_, locale_) {
  this.emit('locale', {
    Data: {
      event: event_,
      locale: locale_
    }
  });
  router.wsNotify({
    'Action': 'notify',
    'Event': 'locale',
    'Data': {
      'event': event_, 
      'locale': locale_
    }
  });
}

Language.prototype.setLocale = function(locale_, callback_) {
  if(!this.__init) return this.on('init', this.setLocale);
  var cb_ = callback_ || function() {};
  if(this._lConf.locale == locale_) return cb_('Locale is not changed')
  this._lConf.locale = locale_;
  var _this = this;
  json4line.writeJSONFile(configPath, this._lConf, function(err_) {
    _this.notify('change', locale_);
    cb_(null);
  });
}

Language.prototype.getCurLocale = function(callback_) {
  if(!this.__init) {
    initPera['getCurLocale'] = arguments;
    return this.on('init', this.getCurLocale);
  }
  var cb_ = callback_ || function() {},
      ret = this._lConf.locale || this._gConf.locale;
  cb_(null, ret);
}

Language.prototype.getLangList = function(callback_) {
  if(!this.__init) {
    initPera['getLangList'] = arguments;
    return this.on('init', this.getLangList);
  }
  var cb_ = callback_ || function() {},
      tmp = {},
      ret = this._lConf.langList;
  for(var i = 0; i < this._lConf.langList.length; ++i) {
    tmp[this._lConf.langList[i]] = 1;
  }
  for(var i = 0; i < this._gConf.langList.length; ++i) {
    if(typeof tmp[this._gConf.langList[i]] === 'undefined') {
      tmp[this._gConf.langList[i]] = 1;
      ret.push(this._gConf.langList[i]);
    }
  }
  cb_(null, ret);
}

function languageValidate(lang_) {
}

Language.prototype.addLang = function(lang_, callback_) {
  if(!this.__init) return this.on('init', this.addLang);
  var cb_ = callback_ || function() {},
      _this = this;
  // validate the new language
  if(!languageValidate(lang_)) return cb_('Illage language');
  // TODO: move lang files from lang_.path to config.LANG[0]
  _this._lConf.langList.push(lang_.name);
  json4line.writeJSONFile(configPath, _this._lConf, function(err_) {
    if(err_) {
      for(var i = 0; i < _this._lConf.langList.length; ++i) {
        if(_this._lConf.langList[i] == lang_.name) {
          _this._lConf.langList[i].splice(i, 1);
          break;
        }
      }
      return cb_(err_);
    }
    _this.notify('add', lang_.name);
    cb_(null);
  });
}

Language.prototype.removeLang = function(lang_, callback_) {
  if(!this.__init) return this.on('init', this.removeLang);
  var cb_ = callback_ || function() {},
      _this = this;
  for(var i = 0; i < _this._lConf.langList.length; ++i) {
    if(_this._lConf.langList[i] == lang_.name) {
      // TODO: remove langage files first
      _this._lConf.langList.splice(i, 1);
      return json4line.writeJSONFile(configPath, _this._lConf, function(err_) {
        if(err_) {
          _this._lConf.langList.push(lang_.name);
          return cb_(err_);
        }
        _this.notify('remove', lang_.name);
        cb_(null);
      });
    }
  }
  cb_('Language not found');
}

var stub = null;
(function main() {
  var langMgr = new Language({
    success: function() {
      stub = require('../interface/langStub').getStub(langMgr);
      console.log('language manager start OK');
    },
    fail: function(reason) {
      langMgr = null;
      console.log('language manager start failed:', reason);
    }
  });
})();


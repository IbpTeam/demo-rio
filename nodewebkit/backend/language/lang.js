var config = require('../config'),
    utils = require('../utils'),
    router = require('../router'),
    util = require('util'),
    event = require('events');

function Language() {
  event.EventEmitter.call(this);
  this._conf = {};
  this._langList = [];
  this._lang = {};
  // TODO: init lang list
  var _this = this;
  utils.readJSONFile(config.LANG + '/locale.conf', function(err_, json_) {
    if(err_) return console.log(err_);
    _this._conf = json_;
  })
}
util.inherits(Language, event.EventEmitter);

// for outside app, they can their own language file by this interface
Language.prototype.getLang = function(path_, callback_) {
  utils.readJSONFile(path_, callback_);
}

// this interface is for inside app
Language.prototype.getLangByName = function(name_, callback_) {
  var cb_ = callback_ || function() {};
  utils.readJSONFile(config.LANG + '/' + this._conf._locale + '/' + name_, function(err_, json_) {
    if(err_) 
      return utils.readJSONFile(config.LANG + '/default/' + name_, function(err_, json_) {
        if(err_) return cb_(err_);
        cb_(null, json_);
      });
    cb_(null, json_);
  });
}

Language.prototype.setLocale = function(locale_, callback_) {
  var cb_ = callback_ || function() {};
  this._conf._locale = locale_;
  var _this = this;
  utils.writeJSONFile(config.LANG + '/locale.conf', this._conf, function(err_) {
    _this.emit('locale', {Data: {locale: locale_}});
    router.wsNotify({
      'Action': 'notify',
      'Event': 'locale',
      'Data': {
        'locale': locale_
      }
    });
    cb_(null);
  });
}

Language.prototype.getCurLocale = function() {
  return this._conf._locale;
}

Language.prototype.addLang = function(lang_) {
  // TODO: validate the new language
}

Language.prototype.removeLang = function() {
}

exports.language = new Language();


var lang = require('../../backend/language/lang').language,
    utils = require('../../backend/utils');

/**
 * For initialize the locale of an app
 * getInitInfoCB: function(err, localeInfo)
 *    err: error discription or null
 *    localeInfo: [
 *      current locale(string),
 *      the list of available languages(array),
 *      language object(object)
 *    ]
 * name: the name of language object to get
 */
exports.getInitInfo = function(getInitInfoCB, name) {
  utils.parallel([
    {
      fn: function(pera_, callback_) {
        lang.getCurLocale(callback_);
      }
    },
    {
      fn: function(pera_, callback_) {
        lang.getLangList(callback_);
      }
    },
    {
      fn: function(pera_, callback_) {
        lang.getLangByName(name, callback_);
      }
    }
  ], getInitInfoCB);
}

/**
 * For outside app, they can get their own language file by this interface
 * getLangCB: function(err, langObj)
 *    err: error discription or null
 *    langObj: the json object of file content
 */
exports.getLang = function(getLangCB, path) {
  lang.getLang(path, getLangCB);
}

/**
 * This interface is for inside app to get language file
 * getLangByNameCB: function(err, langObj)
 *    err: error discription or null
 *    langObj: the json object of file content
 * name: file name saved at config.LANG
 */
exports.getLangByName = function(getLangByNameCB, name) {
  lang.getLangByName(name, getLangByNameCB);
}

/**
 * Set the locale of DE
 * setLocaleCB: function(err)
 *    err: error discription or null
 */
exports.setLocale = function(setLocaleCB, locale) {
  lang.setLocale(locale, setLocaleCB);
}

/**
 * Get current locale of DE
 * getLocaleCB: function(err, locale)
 *    err: error discription or null
 *    locale: current locale
 */
exports.getLocale = function(getLocaleCB) {
  lang.getCurLocale(getLocaleCB);
}

/**
 * Add listener for locale change 
 * addListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: the more detail event(change|add|remove)
 *      locale: current locale|new locale|removed locale
 *    }
 */
exports.addListener = function(addListenerCB, listener) {
  lang.on('locale', listener);
  addListenerCB(null);
}

/**
 * Remove listener from certain event
 * removeListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: the more detail event(change|add|remove)
 *      locale: current locale|new locale|removed locale
 *    }
 */
exports.removeListener = function(removeListenerCB, listener) {
  lang.off('locale', listener);
  removeListenerCB(null);
}

/**
 * Get the list of available languages
 * getLangListCB: function(err, list)
 *    err: error discription or null
 *    list: the list of language
 */
exports.getLangList = function(getLangListCB) {
  lang.getLangList(getLangListCB);
}

/**
 * Add a new kind of language
 * addLangCB: function(err)
 *    err: error discription or null
 * lang: {
 *    name: the name of language
 *    path: path of the folder contained language files
 * }
 */
exports.addLang = function(addLangCB, lang) {
  lang.addLang(lang, addLangCB);
}

/**
 * Remove one kind of language
 * removeListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: the more detail event(change|add|remove)
 *      locale: current locale|new locale|removed locale
 *    }
 */
exports.removeLang = function(removeLangCB, lang) {
  lang.removeLang(lang, removeLangCB);
}


var lang = require('../../backend/Language/lang').language;

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
  getLocaleCB(null, lang.getLocale());
}


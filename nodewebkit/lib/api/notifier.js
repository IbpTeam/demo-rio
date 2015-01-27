var notifier = require('../../backend/notifier/notifier.js');

/**
 * @method notify
 *    Show a system level notification
 *
 * @param notifyCB: function(err, response)
 *    @param err: error discription or null
 *    @param response: not known temporary
 *
 * @param title: the title of notification
 *
 * @param msg: the content of notification
 */
exports.notify = function(notifyCB, title, msg) {
  notifier.notify(title, msg, notifyCB);
}

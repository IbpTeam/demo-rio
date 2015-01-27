var notifier = require('../../backend/notifier/notifier.js');

/**
 * Show a system level notification
 * getInitInfoCB: function(err, response)
 *    err: error discription or null
 *    response: 
 * title: the title of notification
 * msg: the content of notification
 */
exports.notify = function(notifyCB, title, msg) {
  notifier.notify(title, msg, notifyCB);
}

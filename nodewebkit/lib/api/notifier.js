var notifier = require('../../backend/notifier/notifier.js');

exports.notify = function(notifyCB, title, msg) {
  notifier.notify(title, msg, notifyCB);
}

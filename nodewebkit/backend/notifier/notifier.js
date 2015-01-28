var notifier = require('node-notifier');

function notify(title_, msg_, callback_) {
  var cb_ = callback_ || function() {};
  notifier.notify({
    title: title_,
    message: msg_,
    sound: true,
    wait: true
  }, cb_);
}
exports.notify = notify;

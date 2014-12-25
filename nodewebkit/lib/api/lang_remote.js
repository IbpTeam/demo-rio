/**
 * @remote
 * Add listener for locale change 
 * addListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: the more detail event(change|add|remove)
 *      locale: current locale|new locale|removed locale
 *    }
 */
exports.addListener = function(addListenerCB, listener, ws) {
  var msg = {
    'Action': 'on',
    'Event': 'locale'
  };
  ws.send(JSON.stringify(msg));
  addListenerCB(null);
}

/**
 * @remote
 * Remove listener from certain event
 * removeListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: the more detail event(change|add|remove)
 *      locale: current locale|new locale|removed locale
 *    }
 */
exports.removeListener = function(removeListenerCB, listener, ws) {
  var msg = {
    'Action': 'off',
    'Event': 'locale'
  };
  ws.send(JSON.stringify(msg));
  removeListenerCB(null);
}


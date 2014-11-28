var server = require('../../backend/server.js'),
    wsServer = server.getWSServer(),
    ws = _global._ws;

function addListener() {
  var msg = {
    'Action': 'on',
    'Event': 'device'
  };
  ws.send(msg.stringify(msg));
}
exports.addListener = addListener;

function removeListener() {
  var msg = {
    'Action': 'off',
    'Event': 'device'
  };
  ws.send(msg.stringify(msg));
}
exports.removeListener = removeListener;

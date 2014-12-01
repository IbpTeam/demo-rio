/**
 * This is the remote version of addListener of device service
 * param:
 * ListenerCb: just for ensuring the consistency of the parameter of this API
 * ws: the web socket client object which has connected with server
 * 
 */
function addListener(ListenerCb, ws) {
  var msg = {
    'Action': 'on',
    'Event': 'device'
  };
  ws.send(JSON.stringify(msg));
}
exports.addListener = addListener;

/**
 * This is the remote version of removeListener of device service
 * param:
 * CbId: just for ensuring the consistency of the parameter of this API
 * ws: the web socket client object which has connected with server
 */
function removeListener(CbId, ws) {
  var msg = {
    'Action': 'off',
    'Event': 'device'
  };
  ws.send(JSON.stringify(msg));
}
exports.removeListener = removeListener;

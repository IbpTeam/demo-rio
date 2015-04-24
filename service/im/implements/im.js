exports.encapsuleMsg = function(type, content) {
  var msg = {};
  msg.typ = type;
  msg.txt = content;
  var ret = JSON.stringify(msg);
  return ret;
}
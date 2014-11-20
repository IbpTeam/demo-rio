function msgFuncObj() {}

msgFuncObj.funclist = {};
msgFuncObj.addFunc = function(MsgCb, AppName) {
  msgFuncObj.funclist[AppName] = MsgCb;
}

msgFuncObj.showFunc = function() {
  console.log(msgFuncObj.funclist);
  for (b in msgFuncObj.funclist) {
    msgFuncObj.funclist[b]();
  }
}

msgFuncObj.switchType = function(Type, Info) {
  for (tmp in msgFuncObj.funclist) {
    if (tmp === Type) {
      msgFuncObj.funclist[tmp](Info);
    }
  }
}

function takeMsg(Type, Info) {
  msgFuncObj.switchType(Type, Info);
}
exports.takeMsg = takeMsg;

function registerFunc(MsgCb, AppName) {
  msgFuncObj.addFunc(MsgCb, AppName);
}
exports.registerFunc = registerFunc;

function showAllFunc() {
  msgFuncObj.showFunc();
}
exports.showAllFunc = showAllFunc;
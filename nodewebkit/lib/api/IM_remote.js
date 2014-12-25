
/**
 * @method registerApp
 *  在本机消息接收端口上添加新应用监听回调函数，本方法意在将多个
 * 应用的消息收发统一化，避免开多个通信端口。当新消息到达时，根
 * 据AppName来区分消息是分发给哪个应用的
 *
 * @param AppCallBack
 *   回调函数，为新应用添加的接收消息回调函数
 *  @param1
 *   JSON, 表示注册的状态，其中
 *   IP字段表示发送方的IP地址
 *  MsgObj字段表示收到消息的详细信息，其中
 *  MsgObj.message为收到的具体信息
 *  MsgObj.time表示发送时间，具体使用方法见测试
 *  MsgObj.from表示发送方的账户信息
 *  MsgObj.uuid表示发送方的设备UUID
 *  
 * @param AppName
 *  string，新注册的应用名称，该名称用来区分消息的归属应用
 *
 */
 
function registerIMApp(AppCallBack,ws) {
    var msg = {
    'Action': 'on',
    'Event': 'imChat'
  };
  ws.send(JSON.stringify(msg));
}
exports.registerIMApp = registerIMApp;
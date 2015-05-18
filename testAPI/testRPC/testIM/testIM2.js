var remoteProxy = require('../../../sdk/lib/im');

var obj = remoteProxy.getRemoteObj('E1', "192.168.162.198");

obj.sendmsg("中文测试",function(res){
  console.log(res);
  if (res.err) {
    console.log(res.err);
  }
});

obj.sendmsg("http://tieba.baidu.com/p/3273951273",function(res){
  if (res.err) {
    console.log(res.err);
  }
});
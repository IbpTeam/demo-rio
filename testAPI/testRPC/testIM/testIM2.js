var remoteProxy = require('../../../sdk/lib/im');

var obj = remoteProxy.getRemoteObj('E1', "127.0.0.1");

obj.sendmsg("Hi this is the first msg from test",function(res){
  console.log(res);
  if (res.err) {
    console.log(res.err);
  }
});

obj.sendmsg("rrrrrrrrrrr",function(res){
  if (res.err) {
    console.log(res.err);
  }
});
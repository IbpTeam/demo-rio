var proxy = require('./testProxyRemote').getProxy('127.0.0.1');

proxy.getVal(function(result) {
  console.log(result);
});

proxy.setVal('hello', function(result) {
  console.log(result);
});

proxy.getVal(function(result) {
  console.log(result);
});

var cb = function(str) {
  console.log('Event: sth,', 'Arg:', str);
};

proxy.on('sth', cb);

setTimeout(function() {
  proxy.off('sth', cb);
}, 30000);

var proxy = require('./testProxy').getProxy();

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

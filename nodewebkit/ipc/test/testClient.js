var proxy = require('./testProxy');

proxy.setVal('hello', function(result) {
  console.log(result);
});

proxy.getVal(function(result) {
  console.log(result);
});

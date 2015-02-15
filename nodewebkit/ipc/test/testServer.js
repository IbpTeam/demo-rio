var stub = require('./testStub');

setInterval(function() {
  stub.notify('hey, this is a test');
}, 5000);

var stub = require('./testStub').getStub();

setInterval(function() {
  stub.notify('sth', 'hey, this is a test');
}, 5000);

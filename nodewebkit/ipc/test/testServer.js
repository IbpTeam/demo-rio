var stub = require('./testStub').getStub(__dirname + '/testProxy');

setInterval(function() {
  stub.notify('sth', 'hey, this is a test');
}, 5000);

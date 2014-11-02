var server = require('./server');

server.startServer(8891, function(myServer) {
    console.log('ok:' + myServer.address().port);
});
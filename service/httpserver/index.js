var httpServer = require('./implements/server'),
    stub = require('./interface/httpserverStub').getStub(httpServer);
httpServer.setStub(stub);
httpServer.start();

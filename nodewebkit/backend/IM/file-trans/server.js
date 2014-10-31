var net = require('net');
var fs = require('fs');
var serverRequestHandler = require('./serverRequestHandler');

function startServer(port, callback) {
  var server = net.createServer(function(c) {
    console.log('server connnected');
    c.on('end', function() {
      console.log('server disconntected');
    });

    c.on('data', function(data) {
      var msgObj = JSON.parse(data);

      switch (msgObj.type) {
        case 'file':
          {
            console.log('file---' + data);
            serverRequestHandler.processFileRequest(msgObj, function(msg) {
              console.log('msgmsgsgsgs-->' + JSON.stringify(msg));
              c.write(JSON.stringify(msg));
            });
          }
          break;
        case 'error':
          {
            console.log('msg error:' + msgObj);
          }
          break;
        case 'Reply':
          {}
          break;
        default:
          {
            console.log("this is in default switch on data");
          }
      }
    });
    c.on('error', function(e) {
      console.log('something goes wrong! ' + e.message);
    });
  });
  server.listen(port, function() {
    var address = server.address();
    console.log('server bound on %j ', address);
  });
  callback(server);
}
exports.startServer = startServer;
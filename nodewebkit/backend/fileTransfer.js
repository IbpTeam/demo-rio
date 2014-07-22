//file tranfer
var net = require("net");
var fs = require('fs');
var stream = require('stream');
var config = require('./config.js');
var i=0;//flag

// fileSender.js
function sendfile(FILEPATH,_host){
	var client = net.connect({port:config.SERVERPORT},{host:_host}, function(){
  var readStream = fs.createReadStream(FILEPATH);
  readStream.on('open',function() {
    readStream.pipe(client);
    console.log('Client connected !');
  });
  readStream.on('close',function() {
    client.end();
    console.log('File tranfer done !');
  });
});
client.on('end', function() {
  console.log('Client disconnected !');
});
};
exports.sendfile = sendfile;

// fileReceiver.js
function receivefile(FILEPATH){
var server = net.createServer(function(socket) { //'connection' listener
  console.log('Socket connected !');
  var fileWriteStream = fs.createWriteStream(FILEPATH);
  socket.on('data', function(data){
    i++;//
    fileWriteStream.write(data);
    console.log('Get data chunk '+i );
    //console.log(data);
  });
  socket.on('end', function() {
    fileWriteStream.end();
    server.close();
    console.log('Socket disconnected !');
  });
});
server.listen(config.SERVERPORT, function() { //'listening' listener
  console.log('Ready to receive !');
});
};
exports.receivefile = receivefile;


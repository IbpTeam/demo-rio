
// server.js
var net = require('net');
var fs = require('fs');
var buffer = require('buffer');
var receivedData = "";
var FILEPATH = '/home/xiquan/received/test.jpg';
var i=0;//flag

var server = net.createServer(function(socket) { //'connection' listener
  console.log('server connected');
  var fileWriteStream = fs.createWriteStream(FILEPATH);
  socket.on('data', function(data){
  	i++;//
    fileWriteStream.write(data);
  	//fs.writeFileSync(FILEPATH,data);
  	console.log('get data'+i );
  	console.log(data);
  });

  socket.on('end', function(receivedData) {
  	//fileWriteStream.end();
  
  //fileWriteStream.write(receivedData);
  //fs.writeFile(FILEPATH,receivedData);
  fileWriteStream.end();
  console.log('server disconnected');
  console.log(receivedData);
  });

});
server.listen(8124, function() { //'listening' listener
  console.log('server bound');
});



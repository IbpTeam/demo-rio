
//fileTranfer.js
var net = require("net");
var fs = require('fs');
var stream = require('stream');
var config = require('./config.js');
var port = config.FTPORT;
var DIR = '/home/xiquan/testFile/';

//get file name from path
function getFilename(FILEPATH){
  var pos = FILEPATH.length;
  while(FILEPATH.charAt(pos) != '/')
    pos--;
  return FILEPATH.substr(pos+1);
};
exports.getFilename = getFilename;

//create server listening
//start sending
function initServer(){
  var server = net.createServer(function(socket){
    console.log('Client connected !');
    socket.on('end', function(){s
      console.log('Client disconnected !');
    });
    socket.on('data',function(data){
      var FILENAME = '';
      var check = '';
      var someString = data.toString();
      check = someString.substr(0,5);
      console.log(check.toString());////
      if(check == 'START'){
      FILENAME =someString.substr(5);//get file name
      //FILEPATH = someString.substr(5);//get file path
      console.log('Received at '+DIR.toString()+FILENAME);////
      sendfile(socket,DIR+FILENAME);
    }else{ 
      console.log('Something wrong!');
      //socket.end();
    };
    socket.on('error',function(){
      console.log('Something wrong! ');
      console.log(error);
      socket.close();
    });
  });
  });
  server.listen(port, function() { 
    console.log('Ready to send !');
  });
};
exports.initServer = initServer;

//fileSender
function sendfile(socket,FILEPATH){
  var readStream = fs.createReadStream(FILEPATH);
  readStream.on('open',function(){
    console.log('sending started!');
    readStream.pipe(socket);
  });
  /*
  readStream.on('data',function(data){
    console.log(data);
  });
*/
readStream.on('close',function() {
  console.log('File send done !');
  socket.end();
});
};
exports.sendfile = sendfile;

//connect socket to server 
//start receiving when socket connected
function startReceiving(FILEPATH,host){
  var socket = new net.Socket();
  var fileWriteStream = fs.createWriteStream(FILEPATH);
  socket.connect(port,host,function(){
    console.log('Socket connected!');
    var FILENAME = getFilename(FILEPATH);
    console.log('Now receiving '+FILENAME.toString());////
    socket.write('START'+FILENAME);//specifc file name
    //socket.write('START'+FILEPATH);//specific file path
    console.log('Client connected !');
    socket.on('data',function(data){
      fileWriteStream.write(data);
    });
    socket.on('end', function(){
      fileWriteStream.end();
      console.log('Socket disconnected !');
    });
    socket.on('error', function (e) {
      if (e.code == 'EADDRINUSE') {
        console.log('Address in use, retrying...');
      }
    });
  });
}
exports.startReceiving = startReceiving;


//fileTranfer.js
var net = require("net");
var fs = require('fs');
var stream = require('stream');
var config = require('./config.js');
var i=0;//flag

//get file name from path
function getFilename(FILEPATH){
  var pos = FILEPATH.length;
  while(FILEPATH.charAt(pos) != '/')
    pos--;
  return FILEPATH.substr(pos+1);
};
exports.getFilename = getFilename;

//connect socket to server 
//start sending
function startSending(host){
  var socket = net.connect({port:8080},{host:host});
  var FILEPATH = '';
  var FILENAME = '';
  var check = '';
  var DIR ='/home/xiquan/testFile/'
  socket.on('connect',function() {
    console.log('Client connected !');
    //socket.write('FILEPATH'+FILEPATH);
  });
  socket.on('end', function(){
    console.log('Client disconnected !');
  });
  socket.on('data',function(data){
    var someString = data.toString();
    check = someString.substr(0,5);
    console.log(check.toString());////
    if(check == 'START'){
      FILENAME =someString.substr(5);//get file name
      //FILEPATH = someString.substr(5);//get file path
      console.log(FILEPATH.toString());////
      sendfile(socket,DIR+FILENAME);
    }else{ 
      console.log('Something wrong!');
      socket.end();
    }
  });
};
exports.startSending = startSending;

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

//create server listening
//start receiving when socket connected
function startReceiving(FILEPATH){
  var server = net.createServer(function(socket){
    var fileWriteStream = fs.createWriteStream(FILEPATH);
    socket.on('data',function(data){
      fileWriteStream.write(data);
    });
    socket.on('end', function(){
      fileWriteStream.end();
      server.close();
      console.log('Socket disconnected !');
    });
  });
  server.on('connection',function(socket){
    console.log('Socket connected!');
    var FILENAME = getFilename(FILEPATH);
    console.log('Now receiving '+FILENAME.toString());////
    socket.write('START'+FILENAME);//specifc file name
    //socket.write('START'+FILEPATH);//specific file path
  });
  server.on('error', function (e) {
    if (e.code == 'EADDRINUSE') {
      console.log('Address in use, retrying...');
    }
  });
  server.listen(8080, function() { 
    console.log('Ready to receive !');
  });
}
exports.startReceiving = startReceiving;


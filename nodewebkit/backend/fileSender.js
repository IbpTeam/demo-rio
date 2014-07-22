
// client.js
var net = require("net");
var fs = require('fs');
var buffer = require('buffer');
var stream = require('stream');
var util = require('util');


//var FILEPATH = '/home/xiquan/testFile/GitHub.wps'
//var FILEPATH = '/home/xiquan/testFile/test.txt'
var FILEPATH = '/home/xiquan/testFile/linux.zip';

var client = net.connect({port: 8124}, function(){

	var readStream = fs.createReadStream(FILEPATH);
    

	//readStream.on('error', function(err){
	//	console.log(err);
	//});

	//var readable = getReadableStreamSomehow();

	readStream.on('open',function() {
		//var readable = getReadableStreamSomehow();
		readStream.pipe(client);
		console.log('client connected');
    });

	//readStream.on('data',function(chunk) {
	//	//console.log(chunk);
	//	console.log(chunk.length);
	//	client.write(chunk,'binary');
    //});

    
});

//client.on('data', function(data) {
//  console.log(data.toString());
//  client.end();
//});

client.on('end', function() {
  console.log('client disconnected');
});



var imchat = require('./IMChat.js');

function recvcallback(msg){
	console.log("this is in recvcallback "+msg);
}
imchat.initIMServer(recvcallback);


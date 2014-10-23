var imchat = require('../backend/IM/IMChat.js');

function recvcallback(msg){
	console.log("this is in recvcallback "+msg);
}
imchat.initIMServer(recvcallback);


var imchat = require('../backend/IM//IMChatNoRSA.js');

function recvcallback(msg){
	console.log("this is in recvcallback "+msg);
}
imchat.initIMServerNoRSA(recvcallback);


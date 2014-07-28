var addon = require('./build/Release/netlink');
    console.log("startttttttttttttttt");
function netlinkFallback(msg){
  if(msg=="down"){
    console.log("downnnnn");
    addon(netlinkFallback);
  }
  else if(msg=="up"){
    console.log("upppppp");
    addon(netlinkFallback);    
  }
}

addon(netlinkFallback);
    console.log("enddddddddddddddddddddddddd");

var netlink = require('../node_modules/netlink/build/Release/netlink.node');
function netlinkFallback(msg){
  if(msg=="down"){
    console.log("downnnnn");
    process.send({ status: "down" });
    netlink(netlinkFallback);
  }
  else if(msg=="up"){
    console.log("upppppp");
    process.send({ status: "up" });
    netlink(netlinkFallback);    
  }
}

netlink(netlinkFallback);

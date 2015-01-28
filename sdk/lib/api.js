// API lib.
console.log("head of api.js.");
var WDC={};

try {
  WDC=require('demo-rio');
  WDC.startServer();
}catch (e){
  console.log("Error happened when require demo-rio:" + e.stack);
  console.log("Error: Can not load nodewebkit modules, so we can not use the WDC api.");
}

$(document).ready(function(){
  if (typeof onStart === "function"){
    try{
      var search = window.location.search.substr(1),
          tmps = search.split('&');
      WDC.AppID = tmps[0].split('=')[1];
      var sParam = (typeof tmps[1] === 'undefined') ? 
            null : tmps[1].replace(/%20/g, ' ').replace(/%22/g, '"').replace(/%27/g, "'");
      onStart(sParam);
    } catch(e) {
      console.log("Warning: onStart should be supported :" + e.stack);
    }
  }
});

WDC.isDebug = true;
WDC.isRemote = false;
console.log("end of api.js.");

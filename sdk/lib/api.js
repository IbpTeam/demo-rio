// API lib.
console.log("head of api.js.");
var WDC;
try {
  WDC=require('demo-rio');
}catch (e){
  console.log("Error: Can not load nodewebkit modules, so we can not use the WDC api.");
}

console.log("end of api.js.");

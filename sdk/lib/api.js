// API lib.
console.log("head of api.js.");
var WDC = {},
    util = require('util'),
    api = require('api');

try {
  WDC.requireAPI = function(apilist, callback) {
    util.log("requireAPI:" + apilist);
    var apiArr = new Array(apilist.length);
    for(var i = 0; i < apilist.length; i += 1) {
      apiArr[i] = api[apilist[i]]();
    }
    setTimeout(function(){callback.apply(null, apiArr)}, 0);
  }
} catch (e) {
  console.log("Error happened when require demo-rio:" + e.stack);
  console.log("Error: Can not load nodewebkit modules, so we can not use the WDC api.");
}

WDC.isDebug = true;
WDC.isRemote = false;
$(document).ready(function() {
  WDC.ws = RemoteObserver.create(!WDC.isRemote, function(err) {
    if(err) throw err;
    if(typeof onStart === "function"){
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
});

console.log("end of api.js.");


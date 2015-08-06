// API lib for remote, this file should be automated from api.js, so don't
// change this file manually;
console.log("head of api_remote.js.");

var WDC= {};

/* This function is for require api
 * Param apilist: a string array
 * Param callback: a function for callback, whose param numbers is same 
 * with the length of array.
 **/
WDC.requireAPI = function(apilist, callback){
  var i;
  for (i = 0; i < apilist.length; i += 1){
    apilist[i] = '/lib/api/' + apilist[i] + '.js';
  }
  requirejs(apilist, callback);
}

WDC.isDebug = true;
WDC.isRemote = true;
$(document).ready(function() {
  WDC.ws = RemoteObserver.create(!WDC.isRemote, function(err) {
    if(err) throw err;
    if(typeof onStart === "function") {
      try {
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

console.log("end of api_remote.js.");


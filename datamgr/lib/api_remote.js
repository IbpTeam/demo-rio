// API lib for remote, this file should be automated from api.js, so don't
// change this file manually;
console.log("head of api_remote.js.");
var WDC= {};
WDC.isDebug = true;

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

console.log("end of api_remote.js.");

//Config
console.log("head of api.js.");
var WDC= {};
WDC.isDebug = true;

/* This function is for require api
 * Param apilist: a string array
 * Param callback: a function for callback, whose param numbers is same 
 * with the length of array.
 **/
WDC.requireAPI = function(apilist, callback){
  requirejs(apilist, callback);
}

console.log("end of api.js.");

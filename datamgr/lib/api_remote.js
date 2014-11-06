// API lib for remote, this file should be automated from api.js, so don't
// change this file manually;
console.log("head of api_remote.js.");
var WDC= {};
WDC.isDebug = true;
WDC.isRemote = true;

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

$(document).ready(function(){
  if (typeof onStart === "function"){
    try{
      var nIndex=window.location.href.lastIndexOf("?");
      var sParam= nIndex<0?null:window.location.href.substring(nIndex + 1, window.location.href.length);
      onStart(sParam);
    }catch(e){
      console.log("Warning: onStart should be supported :" + e.message);
    }
  }
});

console.log("end of api_remote.js.");

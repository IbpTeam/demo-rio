var util = require('util');
// RPC API lib.
console.log("head of requireProxy.js.");
var WDC={};

exports.requireAPI=function(apilist, callback){
  util.log("requireAPI:" + apilist);
  var i;
  var apiArr = new Array(apilist.length);
  for(i = 0; i < apilist.length; i += 1){
    apiArr[i] = require('../../service/' + apilist[i] + '/interface/' + apilist[i] + 'Proxy').getProxy();
  }
  setTimeout(function(){callback.apply(null, apiArr)}, 0);
}
var util = require('util');
var net = require('net');
var fs = require('fs');
// RPC API lib.
console.log("head of requireProxy.js.");

var debug = true;

var LOCALPATH = "/usr/local/share/webde/proxy/";
var USERPATH = process.env.HOME + "/.local/share/webde/proxy/";

/* requireProxy takes 2 or 3 parameters, if you want to call a local service ,
    take 2 parameters as follows:
 requireProxy(['mix',function(mix){
    mix.getHello(function(res){
    Do something here.
    });
 }]);
 if you want to call a remote service, take 3 parameters as follows:
requireProxy(['mix'],"127.0.0.1",function(mix){
    mix.getHello(function(result){
        Do something here.
    });
});
*/
exports.requireProxy = function() {
  if (typeof(arguments[arguments.length - 1]) !== "function") {
    console.log("the last argument should be function");
    return false;
  };
  if (arguments.length === 2) {
    util.log("requireLocalProxy:" + arguments[0]);
    var i;
    var callback = arguments[arguments.length - 1];
    var apiArr = new Array(arguments[0].length);
    if (debug === true) {
      for (i = 0; i < arguments[0].length; i += 1) {
        apiArr[i] = require('../../service/' + arguments[0][i] + '/interface/' + arguments[0][i] + 'Proxy').getProxy();
      }
    } else {
      for (i = 0; i < arguments[0].length; i += 1) {
        if (fs.existsSync(USERPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'proxy.js')) {
          apiArr[i] = require(USERPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'proxy').getProxy();
        } else if (fs.existsSync(LOCALPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'proxy.js')) {
          apiArr[i] = require(LOCALPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'proxy').getProxy();
        } else {
          console.log("Error : service proxy not found");
        }
      }
    }
    setTimeout(function() {
      callback.apply(null, apiArr)
    }, 0);
  };
  if (arguments.length === 3) {
    util.log("requireRemoteProxy:" + arguments[0]);
    if (!net.isIP(arguments[1])) {
      console.log("the second argument should be IP format");
      return false;
    };
    var i;
    var callback = arguments[arguments.length - 1];
    var apiArr = new Array(arguments[0].length);
    if (debug === true) {
      for (i = 0; i < arguments[0].length; i += 1) {
        apiArr[i] = require('../../service/' + arguments[0][i] + '/interface/' + arguments[0][i] + 'ProxyRemote').getProxy(arguments[1]);
      }
    } else {
      for (i = 0; i < arguments[0].length; i += 1) {
        if (fs.existsSync(USERPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'ProxyRemote.js')) {
          apiArr[i] = require(USERPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'ProxyRemote').getProxy(arguments[1]);
        } else if (fs.existsSync(LOCALPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'ProxyRemote.js')) {
          apiArr[i] = require(LOCALPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'ProxyRemote').getProxy(arguments[1]);
        } else {
          console.log("Error : service proxy not found");
        }
      }
    }
    setTimeout(function() {
      callback.apply(null, apiArr)
    }, 0);
  };
}
var util = require('util');
var net = require('net');
var fs = require('fs');
var config = require('../../config');
// RPC API lib.
console.log("head of requireProxy.js.");

var debug = false;

var LOCALPATH = config.proxyLocalPath;
var USERPATH = config.proxyUerPath;

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
        var usrPath = USERPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'Proxy.js',
            localPath = LOCALPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'Proxy.js';
        if (fs.existsSync(usrPath)) {
          apiArr[i] = require(usrPath).getProxy();
        } else if (fs.existsSync(localPath)) {
          apiArr[i] = require(localPath).getProxy();
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
        var userPath = USERPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'ProxyRemote.js',
            localPath = LOCALPATH + '/' + arguments[0][i] + '/' + arguments[0][i] + 'ProxyRemote.js';
        if (fs.existsSync(userPath)) {
          apiArr[i] = require(userPath).getProxy(arguments[1]);
        } else if (fs.existsSync(localPath)) {
          apiArr[i] = require(localPath).getProxy(arguments[1]);
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

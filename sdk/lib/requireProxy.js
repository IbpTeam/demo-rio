var util = require('util');
var net = require('net');
// RPC API lib.
console.log("head of requireProxy.js.");
/*
exports.requireProxy = function(proxyName, remote, callback) {
    util.log("requireProxy:" + proxyName);
    var i;
    var apiArr = new Array(proxyName.length);
    if (remote === false) {
        for (i = 0; i < proxyName.length; i += 1) {
            apiArr[i] = require('../../service/' + proxyName[i] + '/interface/' + proxyName[i] + 'Proxy').getProxy();
        }
        setTimeout(function() {
            callback.apply(null, apiArr)
        }, 0);
    }else{
        //ToDo: to require remote calls
    }
}
*/
exports.requireProxy = function() {
    if (typeof (arguments[arguments.length-1]) !== "function" ) {
        console.log("the last argument should be function");
        return false;
    };
    if (arguments.length === 2) {
        util.log("requireLocalProxy:" + arguments[0]);
        var i;
        var callback = arguments[arguments.length-1];
        var apiArr = new Array(arguments[0].length);
        for (i = 0; i < arguments[0].length; i += 1) {
            apiArr[i] = require('../../service/' + arguments[0][i] + '/interface/' + arguments[0][i] + 'Proxy').getProxy();
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
        var callback = arguments[arguments.length-1];
        var apiArr = new Array(arguments[0].length);
        for (i = 0; i < arguments[0].length; i += 1) {
            apiArr[i] = require('../../service/' + arguments[0][i] + '/interface/' + arguments[0][i] + 'ProxyRemote').getProxy(arguments[1]);
        }
        setTimeout(function() {
            callback.apply(null, apiArr)
        }, 0);
    };

}
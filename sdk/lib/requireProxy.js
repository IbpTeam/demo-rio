var util = require('util');
// RPC API lib.
console.log("head of requireProxy.js.");

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
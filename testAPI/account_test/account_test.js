var accountAPI = require('../../nodewebkit/lib/api/account');

var accinfo = {
    account: "USER1",
    passwd: "123456"
};
/*
accountAPI.accountRegister(function(msg) {
    console.log("=================",msg.msg);
}, accinfo);
*/
accountAPI.accountLogin(function(msg) {
    console.log("=================",msg.msg);
}, accinfo);
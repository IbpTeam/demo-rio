var proxy = require('./mixProxy').getProxy();

proxy.getHello(function(result){
    console.log("this is in Client call "+ result);
});

proxy.getHello2(function(res){
    console.log(res[1]);
    console.log(res[2]);
    console.log(res[3]);
});
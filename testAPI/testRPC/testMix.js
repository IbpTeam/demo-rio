var proxy = require('../../sdk/lib/requireProxy');
proxy.requireAPI(['mix'],function(mix){
    mix.getHello(function(result){
        console.log("this is in Client call"+result);
    });
    mix.getHello2(function(res){
        console.log(res[1]);
        console.log(res[2]);
        console.log(res[3]);
    });
});


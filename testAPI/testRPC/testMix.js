var proxy = require('../../sdk/lib/requireProxy');
proxy.requireProxy(['mix'],false,function(mix){
    mix.getHello(function(result){
        console.log("this is in Client call"+result);
    });
    mix.getHello2(function(res){
        console.log(res[1]);
        console.log(res[2]);
        console.log(res[3]);
    });
    mix.getHello3(function(res){
        console.log("calling getHello3 para1 :"+res.para1.str1);
        console.log("calling getHello3 para1 :"+res.para1.str2);
        console.log("calling getHello3 para2 :"+res.para2[0]);
        console.log("calling getHello3 para2 :"+res.para2[1]);
        console.log("calling getHello3 para2 :"+res.para2[2]);
    });
    mix.isLocal(function(res){
        console.log("calling isLocal : "+res);
    });
});


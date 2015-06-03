var proxy = require('../../sdk/lib/requireProxy');
proxy.requireProxy(['mix'], '127.0.0.1', function(mix){
    mix.getHello(function(result){
        console.log("this is in Client call "+result.ret);
    });
    mix.getHello2(function(res){
        console.log(res.ret[0]);
        console.log(res.ret[1]);
        console.log(res.ret[2]);
    });
    
    mix.getHello3(function(res){
        console.log("calling getHello3 para1 :"+res.ret.para1.str1);
        console.log("calling getHello3 para1 :"+res.ret.para1.str2);
        console.log("calling getHello3 para2 :"+res.ret.para2[0]);
        console.log("calling getHello3 para2 :"+res.ret.para2[1]);
        console.log("calling getHello3 para2 :"+res.ret.para2[2]);
    });

    mix.isLocal(function(res){
        console.log("calling isLocal : "+res.ret);
    });

    var cb = function(str){
        console.log('Event: E1','Arg: ',str);
    }

    mix.on('E1',cb);
});


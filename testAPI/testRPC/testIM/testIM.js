var im = require('../../../sdk/lib/im');

var cb = function(str){
        console.log('Event: E1','Arg: ',str);
}

var local = im.getLocalServ('E1',cb);

local.run();
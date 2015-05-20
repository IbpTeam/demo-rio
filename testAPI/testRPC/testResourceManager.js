var resourceMgr = require('../../APIs/resourceMgr');
var args = {};
var type = [];
type.push('hardResource');
type.push('input');
type.push('mouse');
args['type'] = type;
var resMgr = null;
resourceMgr.getResMgr(function(err, mgr) {
    if(err){
        console.log('get resMgr error ' +err);
        return;
    }
    resMgr = mgr;
    resMgr.getResourceList(args, function(err, ret_) {
        console.log("-------------->>>>>>>> " + JSON.stringify(ret_));
        resMgr.setVideoChat(function(err, ret_) {
            console.log("====================> " + err + "   " + JSON.stringify(ret_));
        });
    });
});
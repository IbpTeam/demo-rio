var resourceMgr = require('../../APIs/resourceMgr');
var args = {};
var type = [];
type.push('all');
//type.push('input');
//type.push('mouse');
args['type'] = type;
var resMgr = null;
resMgr = resourceMgr.getResMgr();
resMgr.on('hardResource', function(rst_) {
  console.log('chag====>' + JSON.stringify(rst_));
});
resMgr.getResourceList(function(err, ret_) {
  resMgr.applyVideoChat(function(err, ret_) {
    console.log("====================> " + err + "   " + JSON.stringify(ret_));
  });
  console.log("-------------->>>>>>>> " + JSON.stringify(ret_));
  var agrsObj = {};
  agrsObj['type'] = 'hardResource';
  var detail = [];
  var typeItem = {};
  var type = [];
  type.push('input');
  type.push('camera');
  typeItem['type'] = type;
  typeItem['option'] = 0;
  detail.push(typeItem);
  typeItem = {};
  type = [];
  type.push('output');
  type.push('audio');
  typeItem['type'] = type;
  typeItem['option'] = 0;
  detail.push(typeItem);
  typeItem = {};
  type = [];
  type.push('output');
  type.push('video');
  typeItem['type'] = type;
  typeItem['option'] = 0;
  detail.push(typeItem);
  agrsObj['detail'] = detail;
  resMgr.applyResource(function(err, ret_) {
    console.log("====================> " + err + "   " + JSON.stringify(ret_));
    resMgr.getResourceList(function(err, ret_) {
      console.log("-------------->>>>>>>> " + JSON.stringify(ret_));
      resMgr.releaseResource(function(err, ret_) {
        console.log("====================> " + err + "   " + JSON.stringify(ret_));
        resMgr.getResourceList(function(err, ret_) {
          console.log("-------------->>>>>>>> " + JSON.stringify(ret_));
        }, args);
      }, agrsObj);
    }, args);
  }, agrsObj);
}, args);
var path = require("path"),
  util = require('util'),
  events = require('events'),
  flowctl = require('../sdk/utils/flowctl'),
  json4line = require('../sdk/utils/json4line');
requireProxy = require('../sdk/lib/requireProxy').requireProxySync;
var configPath =__dirname + '/config.json';

function ResourceMgr(ret_){
  var self = this;
  var ret = ret_ || {
    success: function() {},
    fail: function() {}
  };
  events.EventEmitter.call(self);
  this.resourceMgr = undefined;
  this.initResource(function(err_){
    if (err_) return ret.fail(err_);
    return ret.success();
  });
}
util.inherits(ResourceMgr, events.EventEmitter);

ResourceMgr.prototype.initResource=function(callback_){
  var self=this;
  json4line.readJSONFile(configPath, function(err_, data_) {
    if (err_) callback_(err_);
    else {
      self.resourceMgr={};
      for (var key in data_) {
        self.resourceMgr[data_[key].type] = requireProxy(key);
        self.resourceMgr[data_[key].type].on('stateChange',function(obj_){
          self.emit('stateChange',obj_);
        });
      }
      callback_(null);
    }
  });
}

/**
 * @method getResourceList
 *   根据参数获取资源列表
 *
 * @param1 callback function(err, rst)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      rst: resource info
 * @param2 params string
 *   传入的参数，可以json格式封装
 *  {
 *    'type':['all'];//['all']:获取所有资源数据;['hardResouce']:获取硬件资源的所有数据;['hardResouce','input']:获取硬件资源的所有输入设备数据
 *  } 
 */
ResourceMgr.prototype.getResourceList = function(callback_,agrsObj_) {
  console.log();
  var self = this;
  var category = agrsObj_.type[0];
  var rst = {};
  switch (category) {
    case 'all':
      {
        var keys=[];
        for (var key in self.resourceMgr) {
          keys.push(key);
        }
        var func = function(keyStr, funcCb) {
          self.resourceMgr[keyStr].getResourceList(agrsObj_, function(ret_) {
            if (ret_.err) console.log('get all resource list error '+keyStr);
            else {
              rst[keyStr] = ret_.ret;
            }
            funcCb();
          });
        }
        flowctl.parallel1(keys, func, function(err_, rets_) {
          callback_(err_, rst);
        });
      }
      break;
    default:
      {
        if (agrsObj_['type'].length === 1) agrsObj_['type'][0] = 'all';
        self.resourceMgr[category].getResourceList(agrsObj_, function(ret_) {
          if (ret_.err) console.log('get  resource list error ' + ret_.err);
          else {
            rst = ret_.ret;
          }
          callback_(ret_.err, rst);
        });
      }
  }
}

/**
 * @method applyResource
 *   获取资源
 *
 * @param1 callback function(err, rst)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      rst: resource info 成功获取的资源信息
 *      {"type":"hardResource","detail":[{"type":["output","audio"]}],"option":0}//option:0-获取失败也不强制其他操作回滚;1-获取失败其他操作回滚（默认abort）;2-强制占用资源-未实现
 * @param2 agrsObj_
 *   传入的参数，可以json格式封装
 *  {
 *    'type':'hardResource',//hardResouce:硬件资源
 *    'detail':[{'type':['input','camera'],"option":0},{['output','video']},{['output','audio'],"option":0}]
 *  } 
 */
ResourceMgr.prototype.applyResource = function( callback_,agrsObj_) {
  var self = this;
  var category = agrsObj_.type;
  var detail = agrsObj_['detail'];
  var resMgr = self.resourceMgr[category];
  if (resMgr === undefined || detail === undefined ) return callback_('arguments is not correct', undefined);
  resMgr.applyResource(agrsObj_, function(ret_) {
    if (ret_.err) console.log('apply resource state error');
    callback_(ret_.err, ret_.ret);
  });
}

/**
 * @method releaseResource
 *   获取资源
 *
 * @param1 callback function(err, rst)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      rst: resource info 成功释放的资源信息
 *      {"type":"hardResource","detail":[{"type":["output","audio"]},{"type":["output","video"]}]}
 * @param2 agrsObj_
 *   传入的参数，可以json格式封装
 *  {
 *    'type':'hardResource',//hardResouce:硬件资源
 *    'detail':[{'type':['input','camera']},{'type':['output','video']},{'type':['output','audio']}]
 *  } 
 */
ResourceMgr.prototype.releaseResource = function( callback_,agrsObj_) {
  var self = this;
  var category = agrsObj_.type;
  var detail = agrsObj_['detail'];
  var resMgr = self.resourceMgr[category];
  if (resMgr === undefined || detail === undefined ) return callback_('arguments is not correct', undefined);
  resMgr.releaseResource(agrsObj_, function(ret_) {
    if (ret_.err) console.log('release resource  error');
    callback_(ret_.err, ret_.ret);
  });
}

/**
 * @method applyVideoChat
 *   设置视频聊天对应资源为已被占用
 *
 * @param1 callback function(err, rst)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      rst: resource info 成功设置的资源的设置信息
 *      {'type':'hardResource','detail':[{'type':['input','camera']},{['output','video']},{['output','audio']}]}
 */
ResourceMgr.prototype.applyVideoChat = function(callback_) {
  var self = this;
  var agrsObj = {};
  agrsObj['type']='hardResource';
  var detail=[];
  var typeItem={};
  var type=[];
  type.push('input');
  type.push('camera');
  typeItem['type']=type;
  detail.push(typeItem);
  typeItem={};
  type=[];
  type.push('output');
  type.push('audio');
  typeItem['type']=type;
  detail.push(typeItem);
  typeItem={};
  type=[];
  type.push('output');
  type.push('video');
  typeItem['type']=type;
  detail.push(typeItem);
  agrsObj['detail']=detail;
  self.resourceMgr['hardResource'].applyResource(agrsObj, function(ret_){
      callback_(ret_.err,ret_.ret);
  });
}

var resMgr=null;
/**
 * @method getResMgr
 *   接口对象
 *
 * @param1 callback function(err, rst)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      rst: ResourceMgr
 */
function getResMgr(callback_){
  if(resMgr==null){
      resMgr=new ResourceMgr({
      success: function() {
        console.log('resource manager init OK');
        callback_(null,resMgr);
      },
      fail: function(error) {
        resMgr = null;
        console.log('hard resource manager init failed:', error);
        callback_(error,undefined);
      }
    });
  }else callback_(null,resMgr);
}
exports.getResMgr=getResMgr;
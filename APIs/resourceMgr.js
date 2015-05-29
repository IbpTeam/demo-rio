var path = require("path"),
  util = require('util'),
  events = require('events'),
  flowctl = require('../sdk/utils/flowctl'),
  json4line = require('../sdk/utils/json4line');
requireProxy = require('../sdk/lib/requireProxy').requireProxySync;
var configPath =__dirname + '/config.json';

function ResourceMgr() {
  var self = this;
  events.EventEmitter.call(self);
  this._config = undefined;
  this.resourceMgr = {};
}
util.inherits(ResourceMgr, events.EventEmitter);

ResourceMgr.prototype._initResourceCfg = function(callback_) {
  var self = this;
  try {
    json4line.readJSONFile(configPath, function(err_, data_) {
      if (err_) callback_(err_);
      else {
        self._config = data_;
        callback_(null);
      }
    });
  } catch (e) {
    callback_(e);
  }
}

ResourceMgr.prototype._getProxy = function(callback_, mgrType_) {
  var self = this;
  if (self.resourceMgr[mgrType_] === undefined) {
    self._initProxy(function(err_, rst_) {
      callback_(err_, rst_);
    },mgrType_);
  } else callback_(null, self.resourceMgr[mgrType_]);
}

ResourceMgr.prototype._initProxy = function(callback_, mgrType_) {
  var self = this;
  if (self._config === undefined) {
    self._initResourceCfg(function(err_) {
      if (err_) callback_(err_);
      else {
        self._initProxyItem(callback_, mgrType_);
      }
    });
  } else self._initProxyItem(callback_, mgrType_);
}

ResourceMgr.prototype._initProxyItem = function(callback_, mgrType_) {
  var self = this;
  try {
    if (self._config[mgrType_] !== undefined) {
      self.resourceMgr[mgrType_] = requireProxy(self._config[mgrType_]['name']);
      self.resourceMgr[mgrType_].on('stateChange', function(obj_) {
        self.emit(obj_.type, obj_);
      });
      callback_(null, self.resourceMgr[mgrType_]);
    } else callback_('no such a resource mgr');
  } catch (e) {
    callback_(e);
  }
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
ResourceMgr.prototype.getResourceList = function(callback_, agrsObj_) {
  var self = this;
  var category = agrsObj_.type[0];
  var rst = {};
  switch (category) {
    case 'all':
      {
        var keys = [];
        var getKeys = function(getKeysCb_) {
          if (self._config === undefined) {
            self._initResourceCfg(function(err_) {
              if (err_) getKeysCb_('init resouce config error');
              else {
                for (var key in self._config) {
                  keys.push(key);
                }
                getKeysCb_();
              }
            });
          } else {
            for (var key in self._config) {
              keys.push(key);
            }
            getKeysCb_();
          }
        }

        var func = function(keyStr, funcCb) {
          self._getProxy(function(err_, proxy_) {
            if (err_) funcCb(err_);
            else {
              proxy_.getResourceList(agrsObj_, function(ret_) {
                if (ret_.err) console.log('get all resource list error ' + keyStr);
                else {
                  rst[keyStr] = ret_.ret;
                }
                funcCb();
              });
            }
          }, keyStr);
        }
        flowctl.series([{
          fn: function(pera_, cb_) {
            getKeys(cb_);
          },
          pera: {}
        }, {
          fn: function(pera_, cb_) {
            flowctl.parallel1(keys, func, function(err_, rets_) {
              cb_(err_, rst);
            });
          },
          pera: {}
        }], function(err_, rets_) {
          callback_(err_, rst);
        });
      }
      break;
    default:
      {
        var agrsTmp_={};
        if (agrsObj_['type'].length === 1) {
          agrsTmp_['type'] = ['all'];
        }else{
          agrsTmp_=agrsObj_;
        }
        self._getProxy(function(err_, proxy_) {
          if (err_) callback_(err_);
          else {
            proxy_.getResourceList(agrsTmp_, function(ret_) {
              if (ret_.err) console.log('get  resource list error ' + ret_.err);
              else {
                rst = ret_.ret;
              }
              callback_(ret_.err, rst);
            });
          }
        }, category);
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
ResourceMgr.prototype.applyResource = function(callback_, agrsObj_) {
  var self = this;
  var category = agrsObj_.type;
  var detail = agrsObj_['detail'];
  if (detail === undefined) return callback_('arguments is not correct', undefined);
  self._getProxy(function(err_, proxy_) {
    if (err_) return callback_(err_);
    proxy_.applyResource(agrsObj_, function(ret_) {
      if (ret_.err) console.log('apply resource state error');
      callback_(ret_.err, ret_.ret);
    });
  }, category);
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
ResourceMgr.prototype.releaseResource = function(callback_, agrsObj_) {
  var self = this;
  var category = agrsObj_.type;
  var detail = agrsObj_['detail'];
  if (detail === undefined) return callback_('arguments is not correct', undefined);
  self._getProxy(function(err_, proxy_) {
    if (err_) return callback_(err_);
    proxy_.releaseResource(agrsObj_, function(ret_) {
      if (ret_.err) console.log('release resource  error');
      callback_(ret_.err, ret_.ret);
    });
  }, category);
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
  if (self.resourceMgr === undefined) {
    self.initResource(function(err_) {
      if (err_) callback_('can not init the resource mgr ' + err);
      else self._applyVideoChat(callback_);
    });
  } else self._applyVideoChat(callback_);
}

ResourceMgr.prototype._applyVideoChat = function(callback_) {
  var self = this;
  self._getProxy(function(err_, proxy_) {
    if (err_) return callback_(err_);
    var agrsObj = {};
    agrsObj['type'] = 'hardResource';
    var detail = [];
    var typeItem = {};
    var type = [];
    type.push('input');
    type.push('camera');
    typeItem['type'] = type;
    detail.push(typeItem);
    typeItem = {};
    type = [];
    type.push('output');
    type.push('audio');
    typeItem['type'] = type;
    detail.push(typeItem);
    typeItem = {};
    type = [];
    type.push('output');
    type.push('video');
    typeItem['type'] = type;
    detail.push(typeItem);
    agrsObj['detail'] = detail;
    proxy_.applyResource(agrsObj, function(ret_) {
      callback_(ret_.err, ret_.ret);
    });
  }, 'hardResource');
}

var resMgr = null;
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
function getResMgr() {
  if (resMgr == null) {
    resMgr = new ResourceMgr();
  } 
  return resMgr;
}
exports.getResMgr = getResMgr;
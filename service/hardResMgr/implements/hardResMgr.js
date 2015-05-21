var fs = require('fs'),
  path = require("path"),
  http = require('http'),
  cp = require('child_process'),
  config = require('../../../config'),
  flowctl = require('../../../sdk/utils/flowctl'),
  json4line = require('../../../sdk/utils/json4line');
var configPath = __dirname + '/config.json';

function ResourceManager(ret_) {
  var self = this;
  var ret = ret_ || {
    success: function() {},
    fail: function() {}
  };
  this._resource = {};
  this._cpiCmd=null ;
  this._inputDeviceCmd=null;
  this._diskCmd=null;
  this._cmdExtended =null;
  this._initResource(function(err) {
    if (err) return ret.fail(err);
    return ret.success();
  });
}

ResourceManager.prototype._initResource = function(callback_) {
  var self = this;
  try {
    json4line.readJSONFile(configPath, function(err_, data_) {
      if (err_) return callback_(err_);
      self._resource = data_;
      self._cpiCmd = 'lspci';
      self._inputDeviceCmd = 'cat /proc/bus/input/devices';
      self._diskCmd = 'df -lh'
      self._cmdExtended = ' | grep ';
      self._initHardResourceList(function(err_) {
        if (err_) return callback_(err_);
        callback_(null);
      });
    });
  } catch (e) {
    console.log('init resource error ' + e);
  }
}
ResourceManager.prototype.refreshResource = function(callback_) {
  var self = this;
  self._initResource(function(err_){
    callback_(err_,self._resource);
  });
}

ResourceManager.prototype.getResourceList = function(argObj_, callback_) {
  var self = this;
  try {
    var args = argObj_.type;
    switch (args[0]) {
      case 'all':
        {
          callback_(null, self._resource);
        }
        break;
      default:
        {
          var argsNxt = Array.prototype.slice.call(args, 1, args.length);
          self._getResouceListByCate(argsNxt, callback_);
        }
    }
  } catch (e) {
    callback_('get resource list fail '+e);
  }
}

ResourceManager.prototype.applyResource = function(argObj_, callback_) {
  var self = this;
  var rst = undefined;
  var rstObj = undefined;
  var tmpDetail = undefined;
  var abort = false;
  try {
    var funcAllowOrNot = function(args, funcCb) {
      if (abort) {
        funcCb();
      } else {
        self._getResouceForApply(args, function(err_, rst_) {
          if (err_) {
            if (args['option'] === undefined || args.option !== 0) abort = true;
            console.log('applyResource error when get resource ' + err_);
          } else {
            if (rst === undefined) {
              rst = [];
              tmpDetail = {};
              rstObj = {};
              rstObj['type'] = argObj_.type;
              rstObj['detail'] = rst;
            }
            tmpDetail[rst_] = args;
            rst.push(rst_);
          }
          funcCb();
        });
      }
    }
    var detailRst = undefined;
    var funcApply = function(args, funcCb) {
      self._setResourceState(args, 1, function(err_, rst_) {
        if (err_) {
          console.log('apply  Resource error when set state ' + err_);
        } else {
          if (detailRst === undefined) {
            detailRst = [];
          }
          detailRst.push(tmpDetail[args]);
        }
        funcCb();
      });
    }
    var argObj = argObj_.detail;
    flowctl.parallel1(argObj, funcAllowOrNot, function(err_, rets_) {
      if (abort || rstObj === undefined) {
        callback_('apply abort');
      } else {
        flowctl.parallel1(rstObj['detail'], funcApply, function(err_, rets_) {
          if (detailRst === undefined) {
            callback_('apply  failed');
          } else {
            rstObj['detail'] = detailRst;
            callback_(null, rstObj);
          }
        });
      }
    });
  } catch (e) {
    callback_('apply resource fail '+e);
  }
}

ResourceManager.prototype.releaseResource = function(argObj_, callback_) {
  var self = this;
  var rst = undefined;
  var rstObj = undefined;
  try {
    var funcRst = function(argsTmp_, cb_) {
      if (rst === undefined) {
        rst = [];
        rstObj = {};
        rstObj['type'] = argObj_.type;
        rstObj['detail'] = rst;
      }
      rst.push(argsTmp_);
      cb_();
    }
    var releaseFunc = function(args, funcCb) {
      self._getResouceListByCate(args.type, function(err_, rst_) {
        if (err_) {
          console.log('releaseResource error when get resource ' + err_);
          funcCb();
        } else {
          //if (rst_.state === 0) {
          //   funcRst(args, function() {
          //     funcCb();
          //  });
          //  } else {
          if (rst_.state === 1) {
            self._setResourceState(rst_, 0, function(err_, rst_) {
              if (err_) {
                console.log('releaseResource error when set state ' + err_);
                funcCb();
              } else {
                funcRst(args, function() {
                  funcCb();
                });
              }
            });
          }
        }
      });
    }
    var argObj = argObj_.detail;
    flowctl.parallel1(argObj, releaseFunc, function(err_, rets_) {
      if (rstObj === undefined) return callback_(err_ || 'release no one');
      callback_(null, rstObj);
    });
  } catch (e) {
    callback_('release resource fail ' + e);
  }
}

ResourceManager.prototype._getResouceForApply = function(argObj_, callback_) {
  var self = this;
  self._getResouceListByCate(argObj_.type, function(err_, rst_) {
    if (err_) return callback_(err_);
    if (rst_.state === 1) return callback_('unAvailable');
    callback_(null, rst_);
  });
}

ResourceManager.prototype._setResourceState = function(item_,state_ ,callback_) {
  var self = this;
  try{
    item_.state=state_;
    callback_(null,item_);
  }catch(e){
    callback_(e,item_);
  }
}
ResourceManager.prototype._initHardResourceList=function(callback_) {
  var self=this;
  try {
    flowctl.parallel([{
      fn: function(pera_, fnCb_) {
        self._getOutputInfo(fnCb_);
      },
      pera: {}
    }, {
      fn: function(pera_, fnCb_) {
        self._getInputInfo(fnCb_);
      },
      pera: {}
    }, {
      fn: function(pera_, fnCb_) {
        self._getDiskInfo(fnCb_);
      },
      pera: {}
    }], function(err_, rets_) {
      callback_(err_);
    });
  } catch (e) {
    callback_(e);
  }
}
ResourceManager.prototype._getResouceListByCate = function(args_, callback_) {
  var self=this;
  var item = undefined;
  switch (args_.length) {
    case 1:
      {
        item = self._resource.detail[args_[0]];
      }
      break;
    case 2:
      {
        item = self._resource.detail[args_[0]].detail[args_[1]];
      }
      break;
    default:
      {}
  }
  if(item===undefined) callback_('no such resource ',item);
  else callback_(false,item);
}
//output
ResourceManager.prototype._getOutputInfo=function(callback_) {
  var self=this;
  cp.exec(self._cpiCmd, function(err, stdout, stderr) {
    if (err) {
      console.log('output err---' + err);
      callback_(err);
    } else {
      self._getInfo(stdout,self._resource.detail.output.detail,function(){
        callback_(null);
      });
    }
  });
}

ResourceManager.prototype._isItemEnable=function(cmd_,key_,callback_) { //SHOW 
  cp.exec(cmd_ + self._cmdExtended + key_, function(err, stdout, stderr) {
    if (err) {
      console.log('cmd err---' +key+'  '+ err);
      callback_(true, err);
    } else {
      callback_(false, stdout);
    }
  });
}

//input
ResourceManager.prototype._getInputInfo=function(callback_) {
  var self=this;
  cp.exec(self._inputDeviceCmd, function(err, stdout, stderr) {
    if (err) {
      console.log('input err---' + err);
      callback_(err);
    } else {
      self._getInfo(stdout,self._resource.detail.input.detail,function(){
        callback_(null);
      });
    }
  });
}

//disk
ResourceManager.prototype._getDiskInfo=function(callback_) {
  var self=this;
  cp.exec(self._diskCmd, function(err, stdout, stderr) {
    if (err) {
      console.log('disk err---' + err);
      callback_(err);
    } else {
      self._resource.detail['disk'].detail=stdout;
      callback_(null);
    }
  });
}

ResourceManager.prototype._getInfo=function(str_, infoObj_, callback_) {
  str_=str_.toLowerCase();
  for (var detailKey in infoObj_) {
    var key =infoObj_[detailKey].type.toLowerCase();
    if (str_.indexOf(key) < 0) {
      delete infoObj_[detailKey];
    }
  }
  callback_();
}

var stub = null;
(function main() {
  var hardResMgr = new ResourceManager({
    success: function() {
      stub = require('../interface/hardResMgrStub').getStub(hardResMgr);
      console.log('hard resource manager start OK');
    },
    fail: function(error) {
      hardResMgr = null;
      console.log('hard resource manager start failed:', error);
    }
  });
})();
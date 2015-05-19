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
  json4line.readJSONFile(configPath, function(err_, data_) {
    if (err_) return callback_(err_);
    self._resource = data_;
    self._cpiCmd = 'lspci';
    self._inputDeviceCmd = 'cat /proc/bus/input/devices';
    self._diskCmd = 'df -lh'
    self._cmdExtended = ' | grep ';
    self._initHardResourceList(function(err_){
      if (err_) return callback_(err_);
      callback_(null);
    });
  });
}
ResourceManager.prototype.refreshResource = function(callback_) {
  var self = this;
  self._initResource(function(err_){
    callback_(err_,self._resource);
  });
}

ResourceManager.prototype.getResourceList = function(argObj_, callback_) {
  var self = this; 
  var args = argObj_.type;
  switch (args[0]) {
    case 'all':
      {
        callback_(null,self._resource);
      }
      break;
    default:
      {
        var argsNxt = Array.prototype.slice.call(args, 1, args.length);
        self._getResouceListByCate(argsNxt, callback_);
      }
  }
}

ResourceManager.prototype.setResourceState = function(argObj_, callback_) {
  var self = this;
  var err = false;
  var rst = undefined;
  var rstObj = undefined;
  var func = function(args, funcCb) {
    self._setResourceState(args, function(err_, rst_) {
      if (err_) {
        err=true;
        console.log('setResourceState error on ' + rst_);
      }else {
        if (rst === undefined) {
          rst = [];
          rstObj={};
          rstObj['type']=argObj_.type;
          rstObj['detail']=rst;
        }
        rst.push(args);
      }
      funcCb();
    });
  }
  var argObj=argObj_.detail;
  flowctl.parallel1(argObj, func, function(err_, rets_) {
    callback_(err, rstObj);
  });  
}
ResourceManager.prototype._setResourceState = function(argObj_, callback_) {
  var self = this;
  var item = undefined;
  var args = argObj_.type;
  var depth = args.length;
  switch (depth) {
    case 1:
      {
        item = self._resource.detail[args[0]];
      }
      break;
    case 2:
      {
        item = self._resource.detail[args[0]].detail[args[1]];
      }
      break;
    default:
      {}
  }
  if (item === undefined || item['state'] == undefined) {
    callback_(true, 'can not find the resource');
  } else {
    item['state'] = argObj_.state;
    callback_(false, 'set resource state success');
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
  var category = args_[0];
  var rst=undefined;
  if(args_.length>1)rst=self._resource.detail[category].detail[args_[1]];
  else rst =self._resource.detail[category];
  if(rst===undefined) callback_('no such resource ',rst);
  else callback_(false,rst);
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
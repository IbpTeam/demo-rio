// fnArr_: [
//  {
//    fn: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
//    pera: {} (type: Object)
//  },
//  ...
// ],
// callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
//
// example:
//  Serialize.series([
//    {
//      fn: function(pera_, callback_) {
//        // do something
//        callback_(null, ret); // should be the last sentence
//      },
//      pera: {}
//    },
//    {
//      fn: function(pera_, callback_) {
//        // do something
//        callback_(null, ret); // should be the last sentence
//      }
//    },
//    ...
//  ], function(err_, rets_) {
//    //rets_[i] = fnArr_[i]'s ret
//  });
//
function series(fnArr_, callback_) {
  if(!Array.isArray(fnArr_)) {
    console.log('bad type for series, should be an array');
    return ;
  }
  var cb = callback_ || function() {};
  var complete = 0, rets = [];
  var doSeries = function(iterator_) {
    var iterate = function() {
      iterator_(fnArr_[complete], function(err_) {
        if(err_) {
          callback_(err_);
        } else {
          complete += 1;
          if(complete >= fnArr_.length) {
            cb(null, rets);
          } else {
            iterate();
          }
        }
      });
    };
    iterate();
  };
  doSeries(function(fn_, callback_) {
    fn_.fn(fn_.pera, function(err_, ret_) {
      rets[complete] = ret_;
      callback_(err_, ret_);
    });
  });
}
exports.series = series;

// peraArr_: [
//  {
//    arg1: value,
//    arg2: value,
//    ...
//  },
//  ...
// ],
// fn_: function(pera_, callback_) (type: Funciton, callback_ -> function(err_, ret_))
// callback_: function(err_, rets_) (rets_ -> [ret1, ret2, ...])
//
// example:
//  Serialize.series1([
//    {
//      arg1: value,
//      arg2: value,
//      ...
//    },
//    ...
//  ], function(pera_, callback_) {
//    // do something
//    callback_(null, ret); // should be the last sentence
//  }, function(err_, rets_) {
//    //rets_[i] = fnArr_[i]'s ret
//  });
//
function series1(peraArr_, fn_, callback_) {
  var fnArr = [];
  for(var i = 0; i < peraArr_.length; ++i) {
    fnArr[i] = {
      'fn': fn_,
      'pera': peraArr_[i]
    };
  }
  series(fnArr, callback_);
}
exports.series1 = series1;

function parallel(fnArr_, callback_) {
  if(!Array.isArray(fnArr_)) {
    console.log('bad type for series, should be an array');
    return ;
  }
  var cb_ = callback_ || function() {},
      toComplete = fnArr_.length,
      erred = false,
      rets = [];
  var doParallel = function(parallellor_) {
    for(var i = 0; i < fnArr_.length; ++i) {
      parallellor_(fnArr_[i], i, function(err_) {
        if(err_) {
          erred = true;
          callback_(err_);
        } else {
          toComplete--;
          if(toComplete == 0 && !erred) {
            cb_(null, rets);
          }
        }
      });
    }
  };
  doParallel(function(fn_, num_, callback_) {
    fn_.fn(fn_.pera, function(err_, ret_) {
      rets[num_] = ret_;
      callback_(err_, ret_);
    });
  });
}
exports.parallel = parallel;

function parallel1(peraArr_, fn_, callback_) {
  var fnArr = [];
  for(var i = 0; i < peraArr_.length; ++i) {
    fnArr[i] = {
      'fn': fn_,
      'pera': peraArr_[i]
    };
  }
  parallel(fnArr, callback_);
}
exports.parallel1 = parallel1;


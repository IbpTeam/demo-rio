// TODO: install an appointed service
//
if(process.argv.length < 3)
  return console.log('Usage: node installer.js ${Paths_of_Your_Service_Package}');

var fs = require('fs'),
    path = require('path'),
    exec = require('child_process').exec,
    json4line = require('../../sdk/utils/json4line'),
    flowctl = require('../../sdk/utils/flowctl'),
    config = require('../../config'),
    svrPath = path.resolve('../../testAPI/testRPC/SvrList');

function doInstall(pkg) {
  fs.exists(pkg, function(exist) {
    if(!exist) {
      return console.log(pkg, 'is not Found!!');
    }
    var pkgName = '';
    flowctl.series([
      {
        fn: function(pera_, callback_) {
          // get info from package.json
          json4line.readJSONFile(pkg + '/package.json', function(err, data) {
            if(err) {
              return callback_(err);
            }
            pkgName = data.name,
            callback_(null, data);
          });
        }
      },
      {
        fn: function(pera_, callback_) {
          // remove old links
          fs.rmdir(config.proxyUerPath + pkgName, function(err) {
            callback_(null);
          });
        }
      },
      {
        fn: function(pera_, callback_) {
          // build links
          var srcPath = pkg + '/interface',
              dstPath = config.proxyUerPath + pkgName;
          fs.mkdir(dstPath, function(err) {
            var pPath = srcPath + '/' + pkgName + 'Proxy.js',
                rpPath = srcPath + '/' + pkgName + 'ProxyRemote.js';
            flowctl.parallel([
              {
                fn: function(pera_, cb_) {
                  // link proxy
                  fs.exists(pPath, function(exist) {
                    if(!exist) return cb_(pkgName + ': Proxy not found!');
                    fs.symlink(pPath, dstPath + '/' + pkgName + 'Proxy.js', function(err) {
                      cb_(err);
                    });
                  });
                }
              },
              {
                fn: function(pera_, cb_) {
                  // link remote proxy
                  fs.exists(rpPath, function(exist) {
                    if(!exist) return cb_(null);
                    fs.symlink(rpPath, dstPath + '/' + pkgName + 'ProxyRemote.js', function(err) {
                      cb_(err);
                    });
                  });
                }
              }
            ], function(err_, rets_) {
              if(err_) return callback_(err_);
              callback_(null);
            });
          });
        }
      }
    ], function(err_, rets_) {
      if(err_)
        return console.log(err_);
      var pkgEntrance = path.resolve(pkg),
          content = pkgName + ' ' + pkgEntrance + '\n';
      fs.appendFile(svrPath, content, function(err) {
        if(err)
          return console.log(err);
        console.log(pkgName, 'installed OK');
      });
    });
  });
}

(function main(pkgs) {
  fs.mkdir(config.proxyUerPath, function(err) {
    for(var i = 0; i < pkgs.length; ++i) {
      doInstall(path.resolve(pkgs[i]));
    }
  });
})(process.argv.slice(2));


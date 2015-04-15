// TODO: install an appointed service
//

if(process.argv.length < 3)
  return console.log('Usage: node installer.js ${Paths_of_Your_Service_Package}');

var fs = require('fs'),
    path = require('path'),
    svrPath = path.resolve('../../testAPI/testRPC/SvrList');

function doInstall(pkg) {
  fs.exists(pkg, function(exist) {
    if(!exist) {
      return console.log(pkg, 'is not Found!!');
    }
    var pkgName = path.basename(pkg),
        pkgEntrance = path.resolve(pkg, 'start.js'),
        content = pkgName + ' ' + pkgEntrance + '\n';
    // console.log(content);
    fs.appendFile(svrPath, content, function(err) {
      if(err)
        return console.log(err);
      console.log(pkgName, 'installed OK');
    });
  });
}

(function main(pkgs) {
  for(var i = 0; i < pkgs.length; ++i) {
    doInstall(pkgs[i]);
  }
})(process.argv.slice(2));


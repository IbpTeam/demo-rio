// extract interfaces from JS objects
//
if(process.argv.length < 3)
  return console.log('Usage: node extract.js ${List_of_Your_JS_Module_File}');

var path = require('path'),
    fs = require('fs'),
    json4line = require('../../sdk/utils/json4line');

function doExtract(mPath) {
  var obj = require(mPath),
      svrName = path.basename(mPath, '.js')
      output = {
        'package': undefined,
        'service': svrName,
        'path': undefined,
        'remote': 'false',
        'interfaces': []
      };
  console.log('Extracting', mPath, '...');
  for(var key in obj) {
    output.interfaces.push({
      'name': key,
      'in': [],
      'show': undefined
    });
  }
  json4line.writeJSONFile(svrName + 'Iface', output, function(err) {
    if(err) console.log(err);
  });
}

(function main(modules) {
  for(var i = 0; i < modules.length; ++i) {
    doExtract(path.resolve(modules[i]));
  }
})(process.argv.slice(2));

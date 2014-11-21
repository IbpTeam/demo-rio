var mdns = require('../../nodewebkit/lib/api/device.js');

function devicePublishCb(){
  var name = 'xifei';
  var port = '80';
  var txtarray = ['In test_device.js', 'hello, all.'];
  mdns.entryGroupCommit(name,  port, txtarray)
}

mdns.createServer(devicePublishCb);

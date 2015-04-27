var requireProxy = require('../../../sdk/lib/requireProxy').requireProxy;
requireProxy(['appmgr'], function(appmgr) {
  appmgr.getRegisteredApp(function(ret) {
    if(ret.err) return console.log('Registered app error:', ret.err);
    console.log('Registered app:', ret.ret);
  });

  appmgr.getBasePath(function(ret) {
    if(ret.err) return console.log('App base path error:', ret.err);
    console.log('App base path:', ret.ret);
  });

  appmgr.on('register', function(ret) {
    console.log('register Event:', ret);
  }).on('unregister', function(ret) {
    console.log('unregister Event:', ret);
  });

  // appmgr.registerApp({
    // id: 'abdbd',
    // path: '../../appExample'
  // }, {}, function(ret) {
    // if(ret.err) return console.log('register:', ret.err);
    // console.log('register: OK');
  // });

  appmgr.unregisterApp('abdbd', function(ret) {
    if(ret.err) return console.log('unregister:', ret.err);
    console.log('unregister: OK');
  });

  appmgr.getRegisteredAppInfo('datamgr-app', function(ret) {
    if(ret.err) return console.log('getRegisteredAppInfo error:', ret.err);
    console.log('getRegisteredAppInfo:', ret.ret);
    appmgr.startApp(ret.ret, {}, function(ret) {
      if(ret.err) return console.log('startApp error:', ret.err);
      console.log('startApp OK');
    });
  });

  appmgr.generateAppByURL('http://www.baidu.com/', {}, function(ret) {
    if(ret.err) return console.log('generateAppByURL error:', ret.err);
    console.log('generateAppByURL:', ret.ret);
  });

  appmgr.sendKeyToApp('IPC.ppt', 'F5', function(ret) {
    if(ret.err) return console.log('sendKeyToApp error:', ret.err);
    console.log('sendKeyToApp OK');
  })
});


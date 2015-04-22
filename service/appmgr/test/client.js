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
})

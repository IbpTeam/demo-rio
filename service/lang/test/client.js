var requireProxy = require('../../../sdk/lib/requireProxy').requireProxy;
requireProxy(['lang'], function(lang) {
  lang.setLocale("zh_CN",function(ret) {
    if(ret.err) return console.log('set Locale error:', ret.err);
    console.log('set locale: OK');
  });
  lang.getLocale(function(ret) {
    if(ret.err) return console.log('get  Locale error:', ret.err);
    console.log(' Locale:', ret.ret);
  });
})

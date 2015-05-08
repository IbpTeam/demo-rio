var requireProxy = require('../../../sdk/lib/requireProxy').requireProxy;
requireProxy(['lang'], function(lang) {
  /*lang.getInitInfo("en",function(ret) {
    if(ret.err) return console.log('get Init Info error:', ret.err);
    console.log('localeInfo:', ret.ret);
  });*/

  lang.getLang('',function(ret) {
    if(ret.err) return console.log('get Lang error:', ret.err);
    console.log('Lang:', ret.ret);
  });

  /*lang.getLangByName("desktop",function(ret) {
    if(ret.err) return console.log('get Lang By Name error:', ret.err);
    console.log('ret:', ret.ret);
  });*/

   /*lang.getLangList(function(ret) {
    if(ret.err) return console.log('get Lang List error:', ret.err);
    console.log('LangList:', ret.ret);
  });*/

  /*lang.setLocale("en",function(ret) {
    if(ret.err) return console.log('set Locale error:', ret.err);
    console.log('set locale: OK');
  });*/

  /*lang.getLocale(function(ret) {
    if(ret.err) return console.log('get  Locale error:', ret.err);
    console.log('Locale:', ret.ret);
  });*/

 /*var langString = {"name":"en","path":"/home/qiushi/work/app/demo-rio/service/lang/implements/langs/en"};
  lang.addLang(langString,function(ret) {
    if(ret.err) return console.log('add Lang error:', ret.err);
    console.log('add Lang: OK');
  });*/

  /*var langString = {"name":"en","path":"/home/qiushi/.local/share/webde/langs/en"};
  lang.removeLang(langString ,function(ret) {
    if(ret.err) return console.log('remove Lang error:', ret.err);
    console.log('remove Lang: OK');
  });*/
})

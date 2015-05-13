var proxy = require('../../sdk/lib/requireProxy');

proxy.requireProxy(['data'], function(dataAPI) {
  dataAPI.getAllContacts(function(cate) {
    var i;
    for (i = 0; i < cate.ret.length; i += 1) {
      console.log(cate.ret[i].URI);
      console.log(cate.ret[i].version);
      console.log(cate.ret[i].name);
      console.log(cate.ret[i].photPath);
    }
  });
});
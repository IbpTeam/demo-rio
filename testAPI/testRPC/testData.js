var proxy = require('../../sdk/lib/requireProxy');

proxy.requireProxy(['data'], function(dataAPI) {
  /*
  dataAPI.getAllContacts(function(cate) {
    var i;
    for (i = 0; i < cate.ret.length; i += 1) {
      console.log(cate.ret[i].URI);
      console.log(cate.ret[i].version);
      console.log(cate.ret[i].name);
      console.log(cate.ret[i].photPath);
    }
  });

  dataAPI.loadResources("/home/rtty/WORKDIR/resources",function(retObj){
    if (retObj.retErr) {
      console.log(retObj.retErr);
    };
    console.log(retObj.ret);
  });


  dataAPI.loadContacts("/home/rtty/WORKDIR/resources/contacts/contacts.CSV",function(retObj){
    console.log(retObj);
  });

  dataAPI.getAllCate(function(retObj){
    console.log(retObj.ret);
  });

  dataAPI.getAllDataByCate("Contact",function(retObj){
    console.log(retObj.ret);
  });


  dataAPI.rmDataByUri("undefined#ce31c951d2fdfdeee7aa#contact", function(retObj) {
    console.log(retObj.ret);
  });
  */

  dataAPI.getDataByUri("undefined#b6ef889b5b05cfae72e6#picture", function(retObj){
    console.log(retObj.ret);
  });
});
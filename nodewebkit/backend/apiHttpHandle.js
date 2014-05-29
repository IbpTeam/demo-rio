//var getAllCate = '{"func":"getAllCate","arg":"null"}';
//var getAllDataByCate = '{"func":"getAllDataByCate","arg":"cate"}';

function getAllCateFromHttp(getAllCateCb) {
//  var studentData = CollectionData();
  $.ajax({
    url: "/getAllCate",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllCate","arg":"null"}',
    success: function(result) {
      var cates = new Array();
      result.forEach(function (each){
        cates.push({
          id:each.id,
          type:each.type,
          path:each.path
        });
      });
      getAllCateCb(cates);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}

function getAllDataByCateFromHttp(getAllDataByCateCb,cate) {
//  var studentData = CollectionData();
  $.ajax({
    url: "/getAllDataByCate",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllDataByCate","arg":"'+cate+'"}',
    success: function(result) {
      var cates = new Array();
      result.forEach(function (each){
        cates.push({
          id:each.id,
          filename:each.filename,
          postfix:each.postfix,
          path:each.path
        });
      });
      getAllDataByCateCb(cates);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}

function getAllContactsFromHttp(getAllContactsCb) {
//  var studentData = CollectionData();
  $.ajax({
    url: "/getAllContacts",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllContacts","arg":"null"}',
    success: function(result) {
      var contacts = new Array();
      result.forEach(function (each){
        contacts.push({
          id:each.id,
          name:each.name,
          photoPath:each.photoPath
        });
      });
      getAllContactsCb(contacts);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}



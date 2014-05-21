var getallreq = '{"func":"getAllCate","arg":"null"}';

function getAllCateFromHttp(getAllCateCb) {
//  var studentData = CollectionData();
  $.ajax({
    url: "/getAllCate",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllCate","arg":"null"}',
    success: function(result) {
      var json=JSON.stringify(result); 
      getAllCateCb(json);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}



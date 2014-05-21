var getallreq = '{"func":"getall","arg":"null"}';

function LoadDataFromHttp() {
//  var studentData = CollectionData();
  $.ajax({
    url: "/getall",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getall","arg":"null"}',
    success: function(result) {
      var json=JSON.stringify(result); 
      getallfilecb(json);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}



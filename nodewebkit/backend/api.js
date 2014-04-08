function LoadData() {
//  var studentData = CollectionData();
  $.ajax({
    url: "/upload",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getall","arg":"null1"}',
    success: function(result) {
      alert(result.d);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });

}

exports.LoadData = LoadData;

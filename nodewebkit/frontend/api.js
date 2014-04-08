function LoadData() {
//  var studentData = CollectionData();
  $.ajax({
    url: "/upload",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: "{'students':[{'name':'KoBe ','sex':'boy','age':'20'},{'name':'Mary','sex':'girl','age':'19'}]}",
    success: function(result) {
      alert(result.d);
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}

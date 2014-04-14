var categoryDAO = require("/home/v1/demo-rio/nodewebkit/DAO/CategoryDAO");

var getallreq = '{"func":"getall","arg":"null"}';

function getallfilecb(text){
    document.write(text);
}

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

function LoadDataFromLocal() {
  categoryDAO.findAll();
  categoryDAO.getEmitter().once('findAll', function(data){
    var json = JSON.stringify(data);
    getallfilecb(json);
  });
}


function browser(){
  var ua = window.navigator.userAgent,
      ret = "";
  if(/Firefox/g.test(ua)){
    ua = ua.split(" ");
    ret="Firefox|"+ua[ua.length-1].split("/")[1];
  }
  else if(/Fuck/g.test(ua)){
    ua = ua.split(" ");
    ret = "Fuck|"+ua[ua.length-1].split("/")[1];
  }
  else if(/MSIE/g.test(ua)){
    ua = ua.split(";");
    ret = "IE|"+ua[1].split(" ")[2];
  }
  else if(/Opera/g.test(ua)){
    ua = ua.split(" ");
    ret = "Opera|"+ua[ua.length-1].split("/")[1];
  }
  else if(/Chrome/g.test(ua)){
    ua = ua.split(" ");
    ret = "Chrome|"+ua[ua.length-2].split("/")[1];
  }
  else if(/^apple\s+/i.test(navigator.vendor)){
    ua = ua.split(" ");
    ret = "Safair|"+ua[ua.length-2].split("/")[1];
  }
  else{
    ret = "未知浏览器";
  }
  return ret.split("|");
}

function getallfile() {
  console.log("Request handler 'getall' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    LoadDataFromLocal();
  }else{
    LoadDataFromHttp();
  }
}


//exports.getallfile = getallfile;

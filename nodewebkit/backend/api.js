//var apifront = require("./apifront");
var getallreq='{"func":"getall","arg":"null"}';

function display(text){
    document.write(text);
}

function LoadDataFromHttp() {
//  var studentData = CollectionData();
  $.ajax({
    url: "/upload",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: getallreq,
    success: function(result) {
      var text=JSON.stringify(result); 
      display(text);
      return text;
    },
    error: function(e) {
      alert(e.responseText);
    }
  });
}

function LoadDataFromLocal() {
  var str='{"postfix":"jpg", "filename":"girl1","id":"2", "path":"./demo-rion", "time":2014}';
  var json=JSON.parse(str);
  var text=JSON.stringify(json);
  display(text);
}


function browser (){
        var ua=window.navigator.userAgent,
            ret="";
        if(/Firefox/g.test(ua)){
          ua=ua.split(" ");
          ret="Firefox|"+ua[ua.length-1].split("/")[1];
        }
        else if(/Fuck/g.test(ua)){
          ua=ua.split(" ");
          ret="Fuck|"+ua[ua.length-1].split("/")[1];
        }
        else if(/MSIE/g.test(ua)){
          ua=ua.split(";");
          ret="IE|"+ua[1].split(" ")[2];
        }
        else if(/Opera/g.test(ua)){
          ua=ua.split(" ");
          ret="Opera|"+ua[ua.length-1].split("/")[1];
        }
        else if(/Chrome/g.test(ua)){
          ua=ua.split(" ");
          ret="Chrome|"+ua[ua.length-2].split("/")[1];
        }
        else if(/^apple\s+/i.test(navigator.vendor)){
          ua=ua.split(" ");
          ret="Safair|"+ua[ua.length-2].split("/")[1];
        }
        else{
          ret="未知浏览器";
        }
        return ret.split("|");
}

function getall() {
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  if(r[0]=="Fuck")  {
    LoadDataFromLocal();
  }
  //console.log('You are using ' + browserArr[getBrowser()]);
  else{
    LoadDataFromHttp();
  }
}


//exports.getall = getall;

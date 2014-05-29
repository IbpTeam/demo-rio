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

//API getAllCate:查询所有基本分类
function getAllCate(getAllCateCb) {
  console.log("Request handler 'getAllCate' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.getAllCateFromLocal(getAllCateCb);
  }else{
    getAllCateFromHttp(getAllCateCb);
  }
}

//API getAllDataByCate:查询某基本分类下的所有数据
function getAllDataByCate(getAllDataByCateCb,cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.getAllDataByCateFromLocal(getAllDataByCateCb,cate);
  }else{
    getAllDataByCateFromHttp(getAllDataByCateCb,cate);
  }
}

//API rmDataById:通过id删除数据
function rmDataById(rmDataByIdCb,id) {
  console.log("Request handler 'getAllDataByCate' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.rmDataByIdFromLocal(rmDataByIdCb,id);
  }else{
    getAllDataByCateFromHttp(getAllDataByCateCb,cate);
  }
}


//exports.getallfile = getallfile;

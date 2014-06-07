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

//API loadResources:读取某个资源文件夹到数据库
//返回字符串：
//成功返回success;
//失败返回失败原因
function loadResources(loadResourcesCb,path) {
  console.log("Request handler 'loadResources' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.loadResourcesFromLocal(loadResourcesCb,path);
  }else{
    loadResourcesFromHttp(loadResourcesCb,path);
  }
}

//API getAllCate:查询所有基本分类
//返回cate型array：
//cate{
//  id;
//  type;
//  path;
//}
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

//API getAllDataByCate:查询某基本分类下的所有数据,此方法不能用来查看联系人分类
//图片视频等返回data型array：
//data{
//  id;
//  filename;
//  postfix:;
//  path;
//}
//联系人返回contacts类型array：
//contacts{
//  id;
//  name;
//  photoPath;
//}

function getAllDataByCate(getAllDataByCateCb,cate) {
  console.log("Request handler 'getAllDataByCate' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  if(cate!='Contacts' && cate!='Videos' && cate!='Pictures')
  {
      console.log("cate "+cate+" is an error cate");
      return ;
  }
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    if(cate=='Contacts'){
      apiLocalHandle.getAllContactsFromLocal(getAllDataByCateCb);
    }
    else{
      apiLocalHandle.getAllDataByCateFromLocal(getAllDataByCateCb,cate);
    }
    
  }else{
    if(cate=='Contacts'){
      getAllContactsFromHttp(getAllDataByCateCb);
    }
    else{
      getAllDataByCateFromHttp(getAllDataByCateCb,cate);
    }
  }
}


//API rmDataById:通过id删除数据
//返回字符串：
//成功返回success;
//失败返回失败原因
function rmDataById(rmDataByIdCb,id) {
  console.log("Request handler 'getAllDataByCate' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.rmDataByIdFromLocal(rmDataByIdCb,id);
  }else{
    rmDataByIdFromHttp(rmDataByIdCb,id);
  }
}

//API getDataById:通过id查看数据所有信息
//返回具体数据类型对象
function getDataById(rmDataByIdCb,id){
    console.log("Request handler 'getDataById' was called.");
  //调用函数，返回一个数组,r[0]是浏览器名称，r[1]是版本号
  var r=browser();
  console.log('You are using ' + r[0]);
  
  if(r[0]=="Fuck")  {
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.getDataByIdFromLocal(getDataByIdCb,id);
  }else{
    getDataByIdFromHttp(getDataByIdCb,id);
  }
}




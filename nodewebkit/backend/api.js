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

function isLocal(){
  var localflag=0;
  if(typeof(require)=="function"){
    var apiLocalHandle = require("./backend/apiLocalHandle");
    localflag= apiLocalHandle.localflag;
  }
  if(localflag==1){
    return true;
  }
  else{
    return false;
  }
}

//API loadResources:读取某个资源文件夹到数据库
//返回字符串：
//成功返回success;
//失败返回失败原因
function loadResources(loadResourcesCb,path) {
  console.log("Request handler 'loadResources' was called.");
  if(isLocal())  {
    console.log('You are in local ');
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.loadResourcesFromLocal(loadResourcesCb,path);
  }else{
    console.log('You are in remote ');
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
  if(isLocal())  {
    console.log('You are in local ');
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.getAllCateFromLocal(getAllCateCb);
  }else{
    console.log('You are in remote ');
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
  if(cate!='Contacts' && cate!='Videos' && cate!='Pictures' &&cate!='Documents'&&cate!='Music')
  {
      console.log("cate "+cate+" is an error cate");
      return ;
  }
  if(isLocal())  {
    console.log('You are in local ');
    var apiLocalHandle = require("./backend/apiLocalHandle");
    if(cate=='Contacts'){
      apiLocalHandle.getAllContactsFromLocal(getAllDataByCateCb);
    }
    else{
      apiLocalHandle.getAllDataByCateFromLocal(getAllDataByCateCb,cate);
    }
    
  }else{
    console.log('You are in remote ');
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
  if(isLocal())  {
    console.log('You are in local '); 
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.rmDataByIdFromLocal(rmDataByIdCb,id);
  }
  else{
    console.log('You are in remote ');
    rmDataByIdFromHttp(rmDataByIdCb,id);
  }
}

//API getDataById:通过id查看数据所有信息
//返回具体数据类型对象
function getDataById(getDataByIdCb,id){
  console.log("Request handler 'getDataById' was called.");
  if(isLocal())  {
    console.log('You are in local '); 
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.getDataByIdFromLocal(getDataByIdCb,id);
  }else{
    console.log('You are in remote '); 
    getDataByIdFromHttp(getDataByIdCb,id);
  }
}

//API getDataSourceById:通过获取数据资源地址
//返回类型：
//result{
//  openmethod;//三个值：'direct'表示直接通过http访问;'remote'表示通过VNC远程访问;'local'表示直接在本地打开
//  content;//如果openmethod是'direct'或者'local'，则表示路径; 如果openmethod是'remote'，则表示端口号
//}

function getDataSourceById(getDataSourceByIdCb,id){
  console.log("Request handler 'getDataSourceById' was called.");
  if(isLocal()){     
    console.log('You are in local '); 
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.getDataSourceByIdFromLocal(getDataSourceByIdCb,id);
  }
  else{
    console.log('You are in remote '); 
    getDataSourceByIdFromHttp(getDataSourceByIdCb,id);
  }
}

//API updateItemValue:修改数据某一个属性
//返回类型：
//成功返回success;
//失败返回失败原因

function updateDataValue(updateDataValueCb,id,key,value){
  console.log("Request handler 'updateItemValue' was called.");
  if(isLocal()){     
    console.log('You are in local '); 
    var apiLocalHandle = require("./backend/apiLocalHandle");
    apiLocalHandle.updateDataValueFromLocal(updateDataValueCb,id,key,value);
  }
  else{
    console.log('You are in remote '); 
    updateDataValueFromHttp(updateDataValueCb,id,key,value);
  }
}




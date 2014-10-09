//var getAllCate = '{"func":"getAllCate","arg":"null"}';
//var getAllDataByCate = '{"func":"getAllDataByCate","arg":"cate"}';

function loadResourcesFromHttp(loadResourcesCb,path){
  $.ajax({
    url: "/loadResources",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"loadResources","arg":"'+path+'"}',
    success: function(result) {
      loadResourcesCb(result);
    },
    error: function(e) {
      loadResourcesCb(e);
    }
  });
}


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
          path:each.path,
          desc:each.desc
        });
      });
      getAllCateCb(cates);
    },
    error: function(e) {
      getAllCateCb(e);
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
      getAllDataByCateCb(e);
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
      getAllContactsCb(e);
    }
  });
}

function rmDataByIdFromHttp(rmDataByIdCb,id){
    $.ajax({
    url: "/rmDataById",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"rmDataById","arg":"'+id+'"}',
    success: function(result) {
      rmDataByIdCb(result);
    },
    error: function(e) {
      rmDataByIdCb(e);
    }
  });
}

function getDataByIdFromHttp(getDataByIdCb,id){
    $.ajax({
    url: "/getDataById",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getDataById","arg":"'+id+'"}',
    success: function(result) {
      getDataByIdCb(result);
    },
    error: function(e) {
      getDataByIdCb(e);
    }
  });
}

function getDataSourceByIdFromHttp(getDataSourceByIdCb,id){
    $.ajax({
    url: "/getDataSourceById",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getDataSourceById","arg":"'+id+'"}',
    success: function(result) {
      var source={
        openmethod:result.openmethod,
        content:result.content
      };
      
      getDataSourceByIdCb(source);
    },
    error: function(e) {
      getDataSourceByIdCb(e);
    }
  });
}

function updateDataValueFromHttp(updateDataValueCb,id,uri,key,value){
    $.ajax({
    url: "/updateDataValue",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"updateDataValue","arg1":"'+id+'","arg2":"'+uri+'","arg3":"'+key+'","arg4":"'+value+'"}',
    success: function(result) {
      updateDataValueCb(result);
    },
    error: function(e) {
      updateDataValueCb(e);
    }
  });
}

function getRecentAccessDataFromHttp(getRecentAccessDataCb,num){
    $.ajax({
    url: "/getRecentAccessData",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getRecentAccessData","arg":"'+num+'"}',
    success: function(result) {
      getRecentAccessDataCb(result);
    },
    error: function(e) {
      getRecentAccessDataCb(e);
    }
  });
}

function getServerAddressFromHttp(getServerAddressCb){
    $.ajax({
    url: "/getServerAddress",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getServerAddress","arg":"null"}',
    success: function(result) {
      getServerAddressCb(result);
    },
    error: function(e) {
      getServerAddressCb(e);
    }
  });
}

//add function for file transfer 
//2014.7.18 by xiquan
function sendFileFromHttp(host){
      $.ajax({
    url: "/sendFile",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"sendFile","arg":"'+host+'"}',
    success: function(result) {
      console.log("success");
    },
    error: function(e) {
      console.log(e);
    }
  });
}

//add function for file transfer 
//2014.7.21 by xiquan
function receiveFileFromHttp(path){
      $.ajax({
    url: "/receiveFile",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"receiveFile","arg":"'+path+'"}',
    success: function(result) {
      console.log("success");
    },
    error: function(e) {
      console.log(e);
    }
  });
}
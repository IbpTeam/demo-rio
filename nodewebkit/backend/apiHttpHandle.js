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
          URI:each.id,
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
          URI:each.URI,
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
          URI:each.URI,
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

function getDataByUriFromHttp(getDataByUriCb,uri){
    $.ajax({
    url: "/getDataByUri",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getDataByUri","arg":"'+uri+'"}',
    success: function(result) {
      getDataByUriCb(result);
    },
    error: function(e) {
      getDataByUriCb(e);
    }
  });
}

function getDataSourceByUriFromHttp(getDataSourceByUriCb,uri){
    $.ajax({
    url: "/getDataSourceByUri",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getDataSourceByUri","arg":"'+uri+'"}',
    success: function(result) {
      var source={
        openmethod:result.openmethod,
        content:result.content
      };
      
      getDataSourceByUriCb(source);
    },
    error: function(e) {
      getDataSourceByUriCb(e);
    }
  });
}

function updateDataValueFromHttp(updateDataValueCb,uri,version,item){
    $.ajax({
    url: "/updateDataValue",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"updateDataValue","arg1":"'+uri+'","arg2":"'+version+'","arg3":"'+JSON.stringify(item)+'"}',
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

//wangyu: add function for getting data directory.
function getDataDirFromHttp(getDataDirCb){
    $.ajax({
    url: "/getDataDir",
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getDataDir","arg":"null"}',
    success: function(result) {
      getDataDirCb(result);
    },
    error: function(e) {
      getDataDirCb(e);
    }
  });
}

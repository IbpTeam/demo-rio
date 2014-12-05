//@remote startAppByname
function startAppByName(startAppByNameCb, sAppName, sParams){
  console.log("Request handler 'startAppByName' was called. sAppName:" +sAppName + " oParamBag:" + sParams);
  try{
    var twin=window.Window.create(sAppName, sAppName, {
      left:200,
      top:200,
      height: 500,
      width: 660,
      fadeSpeed: 500,
      animate: true,
      contentDiv: false,
      iframe: true
    });
    twin.appendHtml("/callapp/" + sAppName + "/index.html" + (sParams===null?"":("?"+sParams)));
    setTimeout(startAppByNameCb({
      name: sAppName,
      window: twin
    }), 0);
  }catch(e){
    console.log("Error happened:" + e.message);
    setTimeout(startAppByNameCb(null), 0);
    return;
  }
}
exports.startAppByName=startAppByName;

//@remote startAppByID
function startAppByID(startAppByIDCb, sAppID, sParams) {
  var info = sParams.info;
  if(info) {
    var data = sParams.data || null;
    try{
      var twin=window.Window.create(sAppID + '-window', info.name, {
        left:200,
        top:200,
        height: 500,
        width: 660,
        fadeSpeed: 500,
        animate: true,
        contentDiv: false,
        iframe: true
      });
      twin.appendHtml("/callapp/" + info.name + "/index.html" + (data===null?"":("?"+data)));
      setTimeout(startAppByIDCb({
        name: info.name,
        window: twin
      }), 0);
    }catch(e){
      console.log("Error happened:" + e.message);
      setTimeout(startAppByIDCb(null), 0);
      return;
    }
  } else {
    console.log('This app hasn\'t register yet');
    startAppByIDCb(null);
  }
}
exports.startAppByID = startAppByID;

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
    setTimeout(startAppByNameCb(twin), 0);
  }catch(e){
    console.log("Error happened:" + e.message);
    setTimeout(startAppByNameCb(null), 0);
    return;
  }
}
exports.startAppByName=startAppByName;

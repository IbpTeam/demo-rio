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

/**
 * @remote version
 * @method startApp
 *   根据应用ID打开应用
 *
 * @param1 callback function(err, window)
 *   回调函数
 *   @cbparam1
 *      err: error object, string or just null
 *   @cbparam2
 *      window: APP Window object
 * @param2 appInfo object
 *   启动程序Info对象，可以通过getRegisteredAppInfo获得
 * @param3 params string
 *   启动程序参数，可以json格式封装
 */
exports.startApp = function(startAppCB, appInfo, params) {
  var max = function(a, b) {
    if(typeof a === 'undefined') return b;
    if(typeof b === 'undefined') return a;
    return ((a > b) ? a : b);
  };
  var min = function(a, b) {
    if(typeof a === 'undefined') return b;
    if(typeof b === 'undefined') return a;
    return ((a > b) ? b : a);
  };
  var createWindow = function(appInfo_) {
    // create a window whose attributes based on app info
    var title = appInfo_.window.title || appInfo_.name,
        height = appInfo_.window.height || 500,
        width = appInfo_.window.width || 660,
        left = 200,
        top = 200,
        pos = appInfo_.window.position || 'center';
    height = max(height, appInfo_.window.min_height);
    height = min(height, appInfo_.window.max_height);
    width = max(width, appInfo_.window.min_width);
    width = min(width, appInfo_.window.max_width);
    if(pos == 'center') {
      var w = $(document).width(),
          h = $(document).height();
      left = max((w - width) * 0.5, 0);
      top = max((h - height) * 0.5, 0);
    }
    return window.Window.create(appInfo_.id + '-window', title, {
      left: left,
      top: top,
      height: height,
      width: width,
      fadeSpeed: 300,
      animate: true,
      contentDiv: false,
      iframe: true
    });
  }

  var cb_ = startAppCB || function() {},
      p_ = params || null;
  try {
    var win = createWindow(appInfo);
    // if this app is genarate from a URL, do something
    if(appInfo.url) {
      win.appendHtml(appInfo.main);
    } else {
      win.appendHtml("/callapp/" + appInfo.id + '/' + appInfo.main
        + '?id=' + appInfo.id + (p_ === null ? "" : ("&" + p_)));
    }
    cb_(null, win);
  } catch(e) {
    return cb_(e);
  }
}

/**
 * @remote
 * add listener for app register or unregister
 * addListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: (register|unregister)
 *      appID: id of app
 *    }
 * ws: the web socket client object which has connected with server
 */
exports.addListener = function(addListenerCB, listener, ws) {
  var msg = {
    'Action': 'on',
    'Event': 'app'
  };
  ws.send(JSON.stringify(msg));
  addListenerCB(null);
}

/**
 * @remote
 * remove listener for app register or unregister
 * removeListenerCB: function(err)
 *    err: error discription or null
 * listener: function(data)
 *    data: {
 *      event: (register|unregister)
 *      appID: id of app
 *    }
 * ws: the web socket client object which has connected with server
 */
exports.removeListener = function(removeListenerCB, listener, ws) {
  var msg = {
    'Action': 'off',
    'Event': 'app'
  };
  ws.send(JSON.stringify(msg))
  removeListenerCB(null);
}


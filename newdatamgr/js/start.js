var main = function(params_) {
  //basic = Basic.create();
  WDC.requireAPI(['clipboard', 'data', 'app'], function(clipboard, data, app) {
    console.log("data:" + data + " app:" + app + " clipboard:" + clipboard);
    DataAPI = data;
    AppAPI = app;
    ClipboardAPI = clipboard;
    _params = undefined;
    if (params_) {
      _params = eval('(' + params_ + ')');
    };
    //基础公共函数类，提供公共调用的函数
    Basic.create();
    //右键菜单
    contextMenu = ContextMenu.create();
    //主页显示
    homePage = HomePage.create();
    //搜索框
    search = Search.create();
    //联系人
    contact = Contact.create();
    //标签列表，最近打开列表
    infoList = InfoList.create();
    //版本恢复
    //gitLog = GitLog.create();
    infoList.attach($('#sidebar'));
    infoList.setTitle();
    infoList.hide();
    var container = $('#container'),
      content = $('#contentDiv');
    search.attach($('#searchDiv'));
    homePage.attach(content);
    //gitLog.attach(container);
    //gitLog.hide();
    contact.attach($('#contentDiv'));
    contact.setContactsList();
    contact.hide();
    //用户信息与数据导入页面
    usrInfo = UsrInfoView.create();
    usrInfo.attach(container);
    usrInfo.hide();
    usrInfo.setUsrInfo();
    usrInfo.setUsrExtra('load');

    // infoList switcher
    var clickHandler = function(k) {
      return function() {
        $(this).addClass('active').siblings().removeClass('active');
        //gitLog.hide();
        $('#searchDiv').show();
        content.show();
        content.children('div').hide();
        search.clearTags();
        infoList.hide();
        infoList.setIndex(k);
        if (k == 1) {
          infoList.removeTags();
          infoList.removeRecent();
          container.removeClass('move-right');
          homePage.show();
          search.bindSuggestion([]);
        } else {
          container.addClass('move-right');
          infoList.setContent();
          infoList.setTitle();
          infoList.show();
          homePage.hide();
        }
      }
    };
    for (var i = 1; i <= 7; i++) {
      $('#js-label' + i).on('click', clickHandler(i));
      $('#js-label' + i)[0].ondragenter = clickHandler(i);
    }

    //bind gitLog button
    $('#tags__bottom').on('click', function() {
      //infoList.hide();
      //container.removeClass('move-right');
      //$('#tags__ul').children('li').removeClass('active');
      //container.children('div').hide();
      //gitLog.getLogShow();
    });


    //bind drag event
    $('#tags__bottom')[0].ondragover = function(ev) {
      ev.preventDefault();
    }
    $('#tags__bottom')[0].ondrop = function(ev) {
      ev.preventDefault();
      ev.stopPropagation();
      var _tag = ev.dataTransfer.getData('tag');
      var _uri = ev.dataTransfer.getData('uri');
      var _category = ev.dataTransfer.getData('category');
      basic.removeTagsOrFile(_tag, _uri, _category);
    }
    //analyse and performance params
    if (_params) {
      if (_params['category']) {
        switch (_params['category']) {
          case 'home':
            $('#js-label1')[0].click();
            break;
          case 'contact':
            $('#js-label2')[0].click();
            break;
          case 'picture':
            $('#js-label3')[0].click();
            break;
          case 'video':
            $('#js-label4')[0].click();
            break;
          case 'document':
            $('#js-label5')[0].click();
            break;
          case 'music':
            $('#js-label6')[0].click();
            break;
          case 'other':
            $('#js-label7')[0].click();
            break;
        }
      }
    }

    //add click func to usr info
    $('#avatar').on('click', function() {
      usrInfo.showUsrInfo();
    });

    var refreshWindow = function(uri) {
      var _window = undefined;
      if (window == top) {
        var hrefLocal = window.location.href;
        hrefLocal = hrefLocal.substr(0, hrefLocal.indexOf("html") + 4);
        if(uri === null){
          hrefLocal = hrefLocal + "?id=" + WDC.AppID + "&{category:'" + infoList.getCategoryName(infoList._index) + "'}";
        }
        else{
          hrefLocal = hrefLocal + "?id=" + WDC.AppID + "&{category:'" + infoList.getCategoryName(infoList._index) + "'}&{uri:" + uri + "}";
        }
        location.replace(hrefLocal);
      } else {
        try {
          _window = parent._global._openingWindows.getCOMById('datamgr-app-window');
          var _dataMgrIfm = _window._windowContent[0];
          if(uri === null){
            _dataMgrIfm.src = _dataMgrIfm.src.substr(0, _dataMgrIfm.src.indexOf("main") + 4) + "?id=" + WDC.AppID + "&{category:'" + infoList.getCategoryName(infoList._index) + "'}";
          }
          else{
            _dataMgrIfm.src = _dataMgrIfm.src.substr(0, _dataMgrIfm.src.indexOf("main") + 4) + "?id=" + WDC.AppID + "&{category:'" + infoList.getCategoryName(infoList._index) + "'}&{uri:" + uri + "}";
          }
        } catch (e) {
          console.log(e);
        }
      }
      return;
    }

    $(document).ready(function() {
      var uri = null;
      if (window === top) {
        var hrefLocal = window.location.href;
        if (hrefLocal.indexOf("uri:") !== -1) {
          uri = hrefLocal.substr(hrefLocal.indexOf("uri:") + 4, 31);
        }
      } else {
        var _window = undefined;
        try {
          _window = parent._global._openingWindows.getCOMById('datamgr-app-window');
          var _dataMgrIfm = _window._windowContent[0];
          if (_dataMgrIfm.src.indexOf("uri:") !== -1) {
            uri = _dataMgrIfm.src.substr(_dataMgrIfm.src.indexOf("uri:") + 4, 31);
          }
        }
        catch(e){
          console.log(e);
        }
      }
      if (uri !== null) {
        basic.addTagView(function() {
          refreshWindow(null);
        }, null, uri, 'no-contact');
      }
    });
    var ctrlDown = false;
    var ctrlKey = 17,
      vKey = 86;
    var onPasted = function(filePath) {
      data.loadFile(function(err, result) {
        var uri;
        if(result && result[0]['URI']){
          uri = result[0]['URI'];
        }
        if(err){
          console.log("Error: ", err);
        }
        data.deleteTmpFile(function(err){
          if(err){
            console.log("Fail to delete : ", filePath);
          }
        }, filePath);
        if(result && result[0]['path'] != null && typeof(result[0]['path']) === 'string'){
          data.deleteTmpFile(function(err){
            if(err){
              console.log("Fail to delete : ", result[0]['path']);
            }
          } ,result[0]['path']);
        }
        refreshWindow(uri);
      }, filePath);
    };

    document.onkeydown = function(ev) {
      if (ev.keyCode == ctrlKey) {
        ctrlDown = true;
      } else if (ev.keyCode == vKey && ctrlDown == true) {
        console.log("@@@@@@@@@Ctrl+" + ev.keyCode + "@@@@@@@@@@@@");
        data.getTmpPath(function(err, res) {
          res = res + '/';
          console.log("res=" + res);
          clipboard.getFile(function(err, sessionId, filePath) {
            var winW = 450,
              winH = 150,
              tipWin = Window.create('fileTrans', '粘贴文件', {
                min: true,
                max: false,
                hide: false,
                height: winH,
                width: winW,
                left: ($(window).width() - winW) / 2,
                top: ($(window).height() - winH) / 2
              });
            tipWin.show();
            if (err) {
              if (typeof err === 'object') {
                err = err.code + ', ' + err.path;
              }
              return tipWin.append('<div style="padding-left: 10px; padding-right: 10px"><p>错误: ' + err + '</p></div>');
            }
            var progBar = Gauge.create({
              width: winW - 20,
              height: 30,
              name: 'fileTransProg',
              limit: true,
              gradient: true,
              scale: 10,
              colors: ['#00ff00', '#0000ff'],
              values: [0, 100],
              noscale: true
            });
            tipWin.append('<div style="padding-left: 10px; padding-right: 10px"><p>文件传输：<span id="progInfo"></span></p></div>' + '<div id="progBar" style="width: 100%; padding: 10px"></div>');
            progBar.add($('#progBar'));
            var $progInfo = $('#progInfo');
            var addr = '';
            var ws = '';
            if (location.protocol != 'file:') {
              ws = WDC.ws;

            }
            try {
              clipboard.monitorDataTransfer(function(err, percentage, msg) {
                clipboard.dataTransProgress(function(err, percentage, msg) {
                  if (err) {
                    return tipWin.append('<div style="padding-left: 10px; padding-right: 10px"><p>错误: ' + err + '</p></div>');
                  } else {
                    if (percentage === 100 && msg === 'finished') {
                      $progInfo.html('完成！正在导入数据管理器，请稍后...');
                      progBar.modify($('#fileTransProg')[0], {
                        values: [parseInt(percentage), 100]
                      });
                      onPasted(filePath);
                    } else {
                      $progInfo.html(percentage + '%');
                      progBar.modify($('#fileTransProg')[0], {
                        values: [parseInt(percentage), 100]
                      });
                    }
                  }
                }, err, percentage, msg, ws);
              }, sessionId);
            } catch (e) {
              console.log(e);
            }
          }, res);
        });
      } else if (ev.keyCode == vKey && ctrlDown == false) {
        console.log("@@@@@@@@@" + ev.keyCode + "@@@@@@@@@@@@");
      }
    }
    document.onkeyup = function(ev) {
      if (ev.keyCode == ctrlKey) {
        ctrlDown = false;
      }
    }
  });
}

var main = function(params_){
    //basic = Basic.create();
  WDC.requireAPI(['clipboard', 'data', 'app'], function(clipboard, data, app){
    console.log("data:" +  data + " app:" + app + " clipboard:" + clipboard);
    DataAPI=data;
    AppAPI=app;
    ClipboardAPI=clipboard;
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
    var container  = $('#container'),
    content    = $('#contentDiv');
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
        if(k == 1){
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
    $('#tags__bottom').on('click',function(){
      //infoList.hide();
      //container.removeClass('move-right');
      //$('#tags__ul').children('li').removeClass('active');
      //container.children('div').hide();
      //gitLog.getLogShow();
    });


    //bind drag event
    $('#tags__bottom')[0].ondragover = function(ev){
      ev.preventDefault();
    }
    $('#tags__bottom')[0].ondrop = function(ev){
      ev.preventDefault();
      ev.stopPropagation();
      var _tag = ev.dataTransfer.getData('tag');
      var _uri = ev.dataTransfer.getData('uri');
      var _category = ev.dataTransfer.getData('category');
      basic.removeTagsOrFile(_tag,_uri,_category);
    }
    //analyse and performance params
    if (_params) {
      if (_params['category']) {
        switch(_params['category']){
          case 'home': $('#js-label1')[0].click(); break;
          case 'contact': $('#js-label2')[0].click(); break;
          case 'picture': $('#js-label3')[0].click(); break;
          case 'video': $('#js-label4')[0].click(); break;
          case 'document': $('#js-label5')[0].click(); break;
          case 'music': $('#js-label6')[0].click(); break;
          case 'other': $('#js-label7')[0].click(); break;
        }
      }
    }

    //add click func to usr info
    $('#avatar').on('click',function(){
      usrInfo.showUsrInfo();
    });

    var ctrlDown = false;
    var ctrlKey = 17, vKey = 86;
    var onPasted = function(filePath) {
      data.loadFile(function(err){
        console.log("load file "+filePath+" : "+err);
        var _window = undefined;
        if (window == top) {
          var hrefLocal = window.location.href;
          hrefLocal = hrefLocal.substr(0, hrefLocal.indexOf("html") + 4);
          hrefLocal = hrefLocal + "?id=" + WDC.AppID
              + "&{category:'" + infoList.getCategoryName(infoList._index) + "'}";
          location.replace(hrefLocal);
        } else {
          try{
            _window = parent._global._openingWindows.getCOMById('datamgr-app-window');
            var _dataMgrIfm = _window._windowContent[0];
            _dataMgrIfm.src = _dataMgrIfm.src.substr(0,hrefLocal.indexOf("html") + 4)
                + "?id=" + WDC.AppID
                + "&{category:'"+ infoList.getCategoryName(infoList._index) + "'}";
          } catch(e){
            console.log(e);
          }
        }
      }, filePath);
    };

    document.onkeydown = function(ev) {
      if (ev.keyCode == ctrlKey) {
        ctrlDown = true;
      } else if(ev.keyCode == vKey && ctrlDown == true) {
        console.log("@@@@@@@@@Ctrl+" + ev.keyCode + "@@@@@@@@@@@@");
        data.getTmpPath(function(err, res) {
          res = res + '/';
          console.log("res=" + res);
          clipboard.getFile(res, function(session, filePath) {
            var id = session.id;
            session.session.on('progress#' + id, function(percentage, msg) {
              console.log('Progress:', percentage + '%', msg);
            }).on('error#' + id, function(err) {
              console.log('Error:', err);
            }).on('end#' + id, function(err) {
              if(err) return console.log(err);
              console.log('Transmission OK!');
              // console.log(filePath);
              onPasted(filePath);
            });
          });
        });
      } else if(ev.keyCode == vKey && ctrlDown == false) {
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

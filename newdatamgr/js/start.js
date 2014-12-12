
var main = function(params_){
  WDC.requireAPI(['data', 'app'], function(data, app){
    console.log("data:" +  data + " app:" + app);
    DataAPI=data;
    AppAPI=app;
    var _params = undefined;
    if (params_) {
      _params = eval('(' + params_ + ')');   
    };
    homePage = HomePage.create();
    search = Search.create();
    infoList = InfoList.create();
    infoList.attach($('#sidebar'));
    infoList.setTitle();
    infoList._infoList.hide();
    var container  = $('#container'),
    content    = $('#contentDiv');
    search.attach($('#searchDiv'));
    homePage.attach(content);

    usrInfo = UsrInfoView.create();
    usrInfo.attach(container);
    usrInfo.hide();
    usrInfo.setUsrInfo();
    usrInfo.setUsrExtra('load');

    // infoList switcher
    var clickHandler = function(k) {
      return function() {
        $(this).addClass('active').siblings().removeClass('active');
        content.children('div').hide();
        if(k == 1){
          infoList._infoList.hide();
          infoList.removeTags();
          infoList.removeRecent();
          container.removeClass('move-right');
          homePage.show();
        } else {
          infoList.setIndex(k);
          infoList.setContent();
          infoList.setTitle();
          infoList._infoList.show();
          infoList.loadData();
          homePage.hide();
          container.addClass('move-right');
        }
      }
    };
    for (var i = 1; i <= 7; i++) {
      $('#js-label' + i).on('click', clickHandler(i));
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
    };
  });
}

  for (var i = 1; i <= 6; i++) {
    $('#js-label' + i).on('click', clickHandler(i));
  }

  //add click func to usr info
  $('#avatar').on('click',function(){
    usrInfo.showUsrInfo();
  });
});

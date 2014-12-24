
var main = function(params_){
  WDC.requireAPI(['data', 'app'], function(data, app){
    console.log("data:" +  data + " app:" + app);
    DataAPI=data;
    AppAPI=app;
    var _params = undefined;
    if (params_) {
      _params = eval('(' + params_ + ')');   
    };
    //用于记录被拖拽的标签的对象，被tagview.js设置
    tagDragged = undefined;
    //右键菜单
    contextMenu = ContextMenu.create();
    homePage = HomePage.create();
    search = Search.create();
    contact = Contact.create();
    infoList = InfoList.create();
    gitLog = GitLog.create();
    infoList.attach($('#sidebar'));
    infoList.setTitle();
    infoList._infoList.hide();
    var container  = $('#container'),
    content    = $('#contentDiv');
    search.attach($('#searchDiv'));
    homePage.attach(content);
    gitLog.attach(container);
    gitLog.hide();
    contact.attach($('#contentDiv'));
    contact.setContactsList();
    contact.hide();

    usrInfo = UsrInfoView.create();
    usrInfo.attach(container);
    usrInfo.hide();
    usrInfo.setUsrInfo();
    usrInfo.setUsrExtra('load');

    // infoList switcher
    var clickHandler = function(k) {
      return function() {
        $(this).addClass('active').siblings().removeClass('active');
        gitLog.hide();
        $('#searchDiv').show();
        content.show();
        content.children('div').hide();
        search.clearTags();
        if(k == 1){
          infoList._infoList.hide();
          infoList.removeTags();
          infoList.removeRecent();
          container.removeClass('move-right');
          homePage.show();
          search.bindSuggestion([]);
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
      $('#js-label' + i)[0].ondragenter = clickHandler(i);
    }

    //bind gitLog button
    $('#tags__bottom').on('click',function(){
      infoList._infoList.hide();
      container.removeClass('move-right');
      $('#tags__ul').children('li').removeClass('active');
      container.children('div').hide();
      gitLog.show();
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
      //drag tag operation
      if(_tag && _uri){
        DataAPI.rmTagsByUri(function(result){
          if (result === 'commit') {
            if(tagDragged){
              tagDragged.removeTagByText(_tag);
              tagDragged = undefined;
            }
            if (infoList.isShow()) {
              infoList.fixTagNum(_tag,-1);
            };
            if (_category === 'contact') {
              var _tags = contact._contacts[contact._selectId]['others'].split(',');
              var _others = '';
              for (var i = 0; i < _tags.length; i++) {
                  if (_tags[i] == _tag) continue;
                  if(_others === '') {
                    _others = _tags[i];
                  }else{
                    _others += ','+_tags[i];
                  }
              };
              contact._contacts[contact._selectId]['others'] = _others;
            };
          }else{
            console.log('Delect tags failed!');
          }
        },[_tag],_uri);
      }else if(_uri && !_tag){  //drag file to remove
        DataAPI.rmDataByUri(function(err_){
          if(err_ !== null){
            console.log('Delect file failed:' + err_);
            return 0;
          }
          switch(_category){
            case 'mainDoc':
              if(!homePage._doc.removeFile(_uri)){
                alert('remove doc div error');
              }
          }
        },_uri);
      }
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
});
}

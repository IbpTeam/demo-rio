//左侧联系人，图片等边框
//调用类
var InfoList = Class.extend({
  init:function(){
    this._title = 'all';
    this._btmTitle = 'Recent Contact';
    this._info = {};
    this._btmInfo = {};
    this._infoList = $('<div>',{
      'id':'info-list'
    });
    this._titleForm = $('<form>',{
      'id':'title-form'
    });
    this._titleText = $('<p>',{
      'id':'title-text'
    });
    this._infoList.append(this._titleForm);
    this._titleForm.append(this._titleText);
    this._infoContent = $('<nav>',{
      'id':'il__container'
    });
    this._infoList.append(this._infoContent);
    this._add = $('<a>',{
      'class':'il__a',
      'text': '+'
    })
    this._infoContent.append(this._add);
    this._infoBottom = $('<nav>',{
      'id':'il__bottom'
    });
    this._infoList.append(this._infoBottom);
    this._infoBtmTitle = $('<p>',{
      'class':'title-form'
    });
    this._infoBottom.append(this._infoBtmTitle);
    this._edit = $('<a>',{
      'class': 'il__edit icon-edit'
    });
    this._infoBottom.append(this._edit);
  },

  setTitle:function(){
    var _p = this._titleForm.children('p');
    if (_p.length > 0) {
      _p.remove();
    };
    _p = $('<p>',{
      'id':'title-text',
      'text': this._title
    });
    this._titleForm.append(_p);
    var $span = this._infoBtmTitle.children('span');
    if ($span.length > 0) {
      $span.remove();
    };
    var _icon = $('<span>',{
      'class': 'icon-time title-icon'
    });
    var _title = $('<span>', {
      'class': 'bil_title',
      'text': this._btmTitle
    })
    this._infoBtmTitle.append(_icon);
    this._infoBtmTitle.append(_title);
  },

  setInfo:function(info_){
    if(info_){
      this._info = info_;
    }else {
      console.log('infoList get null info!');
    }
  },

  setBtmInfo:function(info_){
    if(info_){
      this._btmInfo = info_;
    }else {
      console.log('btmInfoList get null info!');
    }
  },

  setContent:function(){
    if(this._info){
      for(var key in this._info){
        var _a = $('<a>',{
          'class':'il__a',
          'href':'#'
        });
        var _text = $('<span>',{
          'class':'il__title',
          'text': key
        });
        var _num = $('<span>',{
          'class':'il__num',
          'text': this._info[key]
        });
        _a.append(_text);
        _a.append(_num);
        this._add.before(_a);
      }
    }

    if (this._btmInfo) {
      for(var key in this._btmInfo){
        var _a = $('<a>',{
          'class':'bil__a'
        });
        this._edit.before(_a);
      }
    };
  },

  attach:function($parent_){
    $parent_.append(this._infoList);
  },

  loadData:function(){

  }
})

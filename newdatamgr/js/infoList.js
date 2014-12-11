//左侧联系人，图片等边框
//调用类
var InfoList = Class.extend({
  init:function(){
    this._title = ['Contacts','Images','Videos','Documents','Musics'];
    this._bkgColor = ['rgba(202, 231, 239, 1)','rgba(195, 229, 224, 1)','rgba(208, 226, 208, 1)','rgba(237, 229, 195, 1)','rgba(255, 225, 225, 1)'];
    this._btmTitle = ['Recent Contacts', 'Recent Visit', 'Recent Watch','Recent Visit','Recent Plays'];
    this._index = -1;
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
      'class':'il__add icon-plus'
    })
    this._infoContent.append(this._add);
    this._infoBtmTitle = $('<div>',{
      'id':'title-form-bottom'
    });
    this._infoList.append(this._infoBtmTitle);
    this._infoBottom = $('<nav>',{
      'id':'il__bottom'
    });
    this._infoList.append(this._infoBottom);
    this._isFirstRequset = true;
  },

  setIndex:function(index_){
    if(typeof index_ === 'number' && index_ > 0 && index_ < 7){
      this._index = index_-2;
    }
  },

  setTitle:function(){
    if (this._index < 0  || this._index > 4) return 0;
    this._infoList.css('background-color', this._bkgColor[this._index]);
    var _p = this._titleForm.children('p');
    if (_p.length > 0) {
      _p.remove();
    };
    _p = $('<p>',{
      'id':'title-text',
      'text': this._title[this._index]
    });
    this._titleForm.append(_p);
    var $span = this._infoBtmTitle.children('span');
    if ($span.length > 0) {
      $span.remove();
    };
    var _title = $('<span>', {
      'class': 'bil_title',
      'text': this._btmTitle[this._index]
    })
    //this._infoBtmTitle.append(_icon);
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

  getCategoryName:function(index_){
    switch(index_){
      case 0:
        return 'contact';
      case 1:
        return 'picture';
      case 2:
        return 'video';
      case 3:
        return 'document';
      case 4:
        return 'music';
    }
  },

  setContent:function(){
	var _this = this;
      _this.removeTags();
    DataAPI.getAllTagsByCategory(function(result){
      _this._info = result;
      if(_this._info['tags'].length > 0){
        for(var key = 0; key < _this._info['tags'].length; key ++){
          var _a = $('<a>',{
            'class':'il__a',
            'href':'#'
          });
          var _text = $('<span>',{
            'class':'il__title',
            'text': _this._info['tags'][key]
          });
          var _num = $('<span>',{
            'class':'il__num',
            'text': _this._info['tagFiles'][_this._info['tags'][key]].length
          });
          _a.append(_text);
          _a.append(_num);
          _this._add.before(_a);
        }
      }
    }, _this.getCategoryName(_this._index));
    DataAPI.getRecentAccessData(function(err_, result_){
      if(result_ != null){
        _this.removeRecent();
        _this._btmInfo = result_;
        if (_this._btmInfo) {
          for(var i = 0; i < _this._btmInfo.length; i ++){
            var _a = $('<a>',{
              'class':'bil__a',
              'text': _this._index == 0 ? _this._btmInfo[i]['name'] : _this._btmInfo[i]['filename']
            });
            //_this._edit.before(_a);
            _this._infoBottom.append(_a);
          }
        }
      }
    }, _this.getCategoryName(_this._index), 10);
  },

  removeTags:function(){
    var _list = this._infoContent.children('.il__a');
    if (_list.length !== 0) {
      _list.remove();
    };
  },  

  removeRecent:function(){
    var _blist = this._infoBottom.children('.bil__a');
    if (_blist.length !== 0) {
      _blist.remove();
    };
  },

  attach:function($parent_){
    $parent_.append(this._infoList);
  },

  loadData:function(){
    if(this._index >0 && this._index <5){
      if(this._isFirstRequset){
        showfiles = ShowFiles.create();  
        showfiles.setIndex(this._index);
        this._isFirstRequset = false;
      }
      else {
        showfiles.setIndex(this._index);
      }
    }
    if(this._index == 0){
      contact = Contact.create();
      contact.attach($('#contentDiv'));
      contact.setContactsList();
      contact._ContactContainer.show();
    }
  }
})

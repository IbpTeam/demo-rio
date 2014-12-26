//左侧联系人，图片等边框
//调用类
var InfoList = Class.extend({
  init:function(){
    this._title = ['Contacts','Images','Videos','Documents','Music','Others'];
    this._bkgColor = ['rgba(202, 231, 239, 1)','rgba(195, 229, 224, 1)','rgba(208, 226, 208, 1)','rgba(237, 229, 195, 1)','rgba(255, 225, 225, 1)','rgba(224,214,229,1)'];

    this._btmTitle = ['Recent Contacts', 'Recent Visit', 'Recent Watch','Recent Visit','Recent Plays','Recent Visit'];

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
    this._inputer = Inputer.create('infoList-inputer');
    this.bindEvent();
    this._firstShowFilterData = true;
  },
  /**
   * [bindEvent bind event include click add button]
   * @return {[type]} [description]
   */
  bindEvent:function(){
    var _this = this;
    this._add.click(function(){
      var _options = {
        'left': $(this).offset().left,
        'top' : $(this).offset().top,
        'width': 22,
        'height': 22,
        'oldtext': '',                 //用于初始显示时，显示在输入框的文字。
        'callback': function(newtext_){   //newtext输入框输入的文字，返回的文字。
          if(newtext_){
            var _tags = _this._infoContent.children('.il__a');
            for (var i = 0; i < _tags.length; i++) {
              var _tagText = $(_tags[i]).children('.il__title')[0].textContent;
              if(_tagText === newtext_) {
                return 0;
              }
            };
            _this.addTag(newtext_,0);
          }
        }
      }
      _this._inputer.show(_options);
      _this._inputer.$input.animate({
        width:'100px',
        opacity:'1'
      },800);
    });
  },

  setIndex:function(index_){
    if(typeof index_ === 'number' && index_ > 0 && index_ < 8){
      this._index = index_-2;
    }
  },

  setTitle:function(){
    if (this._index < 0  || this._index > 5) return 0;
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
      case 5:
        return 'other';
    }
  },

  addTag:function(tag_, num_){
    var _a = $('<a>',{
      'class':'il__a',
      'draggable':'true',
      'id': tag_
    });
    var _text = $('<span>',{
      'class':'il__title',
      'text': tag_
    });
    var _num = $('<span>',{
      'class':'il__num',
      'text': num_
    });
    _a.append(_text);
    _a.append(_num);
    this._add.before(_a);
    var _this = this;
    _a.click(function(e){
      _this.showTagFilterData(this.id);
      search._textTag.textext()[0]._plugins['tags'].addTags([tag_]);
    });
    this.bindDrag(_a[0]);
  },

  fixTagNum:function(tag_, num_){
    var _tags = this._infoContent.children('.il__a');
    for (var i = 0; i < _tags.length; i++) {
      if($(_tags[i]).children('.il__title')[0].textContent === tag_){
        var _num = $(_tags[i]).children('.il__num')[0].textContent;
        _num = parseInt(_num) + num_;
        $(_tags[i]).children('.il__num').remove();
        var _numText = $('<span>',{
          'class':'il__num',
          'text': _num
        });
        $(_tags[i]).append(_numText);
        return _num;
      }
    };
    if(num_>0){
      this.addTag(tag_,num_);
    }
    return -1;
  },

  showTags:function(tags_){
    this.removeTags();
    this._info = tags_;
    var _tagTextList = [];
    if(this._info['tags'].length > 0){
      for(var key = 0; key < this._info['tags'].length; key ++){
        _tagTextList.push(this._info['tags'][key]);
        this.addTag(this._info['tags'][key],this._info['tagFiles'][this._info['tags'][key]].length);
      }
      search.bindSuggestion(_tagTextList);
    }
  },

  setContent:function(){
	  var _this = this;
    DataAPI.getAllTagsByCategory(function(result_){
      _this.showTags(result_);
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
            _this._infoBottom.append(_a);
          }
        }
      }
    }, _this.getCategoryName(_this._index), 10);
  },

  loadFilterData:function(_dataJsons){
    var _dataUris = [];
    for(var i = 0; i < _dataJsons.length; i ++){
      _dataUris.push(_dataJsons[i]['URI']);
    }
    if(this._index == 0){
      contact.loadContactsList(0, _dataJsons);
      contact._first = true;
    } else if(this._index > 0 && this._index < 6){
      showfiles.showFileByTag(_dataUris);
    }
    var _this = this;
    DataAPI.getTagsByUris(function(tags_){
      _this.showTags(tags_);
    }, _dataUris);
  },

  showTagFilterData:function(_tag){
    var _this = this;
    if(_this._firstShowFilterData == true){
      _this._firstShowFilterData = false;
      DataAPI.getFilesByTagsInCategory(function(err_, result_){
        _this.loadFilterData(result_);
      }, _this.getCategoryName(_this._index), _tag);
    } else {
      var _dataJsons = [];
      var _dataUris = [];
      for(var i = 0; i < _this._info['tagFiles'][_tag].length; i ++){
        if(_this._info['tagFiles'][_tag][i][0] != '' && _this._info['tagFiles'][_tag][i][0].indexOf('#') != -1){
          if(_this._index == 0){
            for(var j = 0; j < contact._contacts.length; j ++){
              if(contact._contacts[j]['URI'] == _this._info['tagFiles'][_tag][i][0]){
                _dataJsons.push(contact._contacts[j]);
              }
            }
          } else{
            _dataUris.push(_this._info['tagFiles'][_tag][i][0]);
          }
        }
      }
      if(_this._index == 0){
        _this.loadFilterData(_dataJsons);
      } else {
        showfiles.showFileByTag(_dataUris);
      }
    }
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

  show:function(){
    this._infoList.show();    
  },
  
  hide:function(){
    this._infoList.hide();
  },

  isShow:function(){
    return this._infoList.is(":visible");
  },

  loadData:function(){
    if(this._index >0 && this._index <6){
      if(this._isFirstRequset){
        showfiles.setIndex(this._index);
        this._isFirstRequset = false;
      }
      else {
        showfiles.setIndex(this._index);
      }
    }
    if(this._index == 0){
      if(contact._first == true){
        contact.setContactsList();
        contact._ContactContainer.show();
      } else {
        contact._ContactContainer.show();
      }
    }
  },

  bindDrag:function(tag_){
    tag_.ondragstart = this.drag;
    tag_.ondragend = this.dragEnd;
  },
  drag:function(ev){
    $(ev.currentTarget).addClass('ondrag');
    var _tagText = $(ev.currentTarget).children('.il__title')[0].textContent;
    console.log(_tagText);
    ev.dataTransfer.setData("tag", _tagText);
  },
  dragEnd:function(ev){
    $(ev.currentTarget).removeClass('ondrag');
  }

})

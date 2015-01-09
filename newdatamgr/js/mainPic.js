var MainPicView = Class.extend({
  init:function(){
    this._picContainer = $('<div>',{
      'id': 'pic-container'
    });
    var _this = this;
    _this._tagView = TagView.create({
      position: 'listview',
      category: 'picture',
      background_color: 'rgb(110,204,188)'
    });
    DataAPI.getRecentAccessData(function(err_, picture_json_){
      if(picture_json_.length === 0){
        homePage._noneData++;
        if (homePage._noneData === homePage._dataClasses) {
          $('#avatar')[0].click();
        };
      }
      for(var i = 0; i < picture_json_.length; i++){
        var _date = new Date(picture_json_[i]['createTime']);
        _this._picData={
          'path': picture_json_[i]['path'],
          'text': picture_json_[i]['filename'],
          'URI': picture_json_[i]['URI'],
          'postfix':picture_json_[i]['postfix'],
          'date': _date.toDateString(),
          'tags': picture_json_[i]['others'].split(',')
        }
        _this.setPicture(_this._picData);
      }
    }, 'picture', 1);
  },

  attach:function($parent_){
    $parent_.append(this._picContainer);
  },

  setPicture:function(pic_){
    var _this = this;
    if (pic_) {
      var _picContent = $('<div>',{
        'id': pic_.URI.replace(/#/g,'-')+'divmain',
        'class':'pic-content'
      });
      this._picContainer.append(_picContent);
      var _picContentBack_1 = $('<div>',{
        'class':'pic-content-bj-01'
      })
      this._picContainer.append(_picContentBack_1);
      var _picContentBack_2 = $('<div>',{
        'class':'pic-content-bj-02'
      })
      this._picContainer.append(_picContentBack_2);    
      var _picSize = $('<div>',{
        'class':'pic-size'
      })
      _picSize.css('background-image','url('+pic_.path+')');
      _picContent.append(_picSize);

      _picBtmContent = $('<div>',{
        'class': 'pic-btm-content'
      });
      _picContent.append(_picBtmContent);
      _picText = $('<span>',{
        'class': 'pic-text',
        'text': pic_.text
      });
      _picBtmContent.append(_picText);
      _picDate = $('<span>',{
        'class': 'pic-date',
        'text': pic_.date
      });
      _picBtmContent.append(_picDate);
    };
    this._tagView.setParent(_picContent,pic_.URI);
    this._tagView.addTags(pic_.tags);
    this._tagView.bindDrop(_picContent[0]);
    _picContent.dblclick(function(ev){
      basic.openFile(pic_);
    });
  },

  removePicture:function(index_){
    if (index_) {
      $(this._picContainer.children('div')[index_]).remove();
    }else{
      this._picContainer.children('div').remove();
    }
  },
  hide:function(){
    this._picContainer.hide();
  },
  show:function(){
    this._picContainer.show();
  },
  bindDrag:function(target_){
    target_.ondrop = this.drop;
    target_.ondragover = this.dragOver;
  },
  drop:function(ev){
    var _tag = ev.dataTransfer.getData('tag');
    var _uri = ev.dataTransfer.getData('uri');
    if (typeof _tag === 'string' && _tag.length > 0) {
      DataAPI.setTagByUri(function(err){
        if (err === null) {
          homePage._pic._tagView.addPreTag(_tag);
        };
      },[_tag],homePage._pic._picData.uri);
    };
    ev.preventDefault();
    ev.stopPropagation();
  },
  dragOver:function(ev){
    ev.preventDefault();
  }
});

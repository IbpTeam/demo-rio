var TagView = Class.extend({
  init:function(options_){
    this._options = {
      direction: 'down',
      position: 'random',  //listView
      category: undefined,
      background_color: 'rgb(255,125,125)',
      color: 'rgb(255,255,255)',
      opacity:0.9,
      opacity_step:0.2,
      max: 6,
      animate: true,
      random_positions: [{left:15,top:20},{left:70,top:60},{left:10,top:50},{left:70,top:30},{left:18,top:110},{left:65,top:90}],
      positions: {top:10,step:30}
    }
    if (options_) {
      for(var key in options_){
        this._options[key] = options_[key];
      }
    };
    var _this = this;
    this._uri = undefined;
    this._tagList = [];
    this._tagTextList = [];
    this._parent = undefined;
    if (this._options.position === 'random') {
      this._positionIndex = Math.ceil(Math.random()*_this._options.max);
    };
    this._index = 0;
  },
  /**
   * [newTag new create a div of tag]
   * @param  {[type]} tag_ [tag text]
   * @return {[type]}      [div of tag]
   */
  newTag:function(tag_){
    var _tagContainer = $('<div>',{
      'class':'tag-container',
      'draggable':true
    })
    var _tagBackground = $('<div>',{
      'class':'tag-background'
    });
    var _tagSpan = $('<div>',{
      'class': 'tag-text',
      'opacity': 1,
      'text': tag_
    })
    var _tagTriangle = $('<div>',{
      'class':'tag-triangle'
    })
    _tagContainer.append(_tagBackground);
    _tagContainer.append(_tagSpan);
    _tagContainer.append(_tagTriangle);

    //forbid context menu
    $(document).on('contextmenu','.tag-container', function(ev){
      ev.stopPropagation();
      ev.preventDefault();
    });
    return _tagContainer;
  },
  /**
   * [setColorOpacity set color and opacity]
   * @param {[type]} $target_ [a jquery target object]
   * @param {[type]} index_   [index of tags]
   */
  setColorOpacity:function($target_, index_){
    var _reg = new RegExp("\\b"+this._options.category+"-*?\\b");
    var _tagBg = $target_.children('.tag-background');
    var _tagTri = $target_.children('.tag-triangle');
    if(this._options.category){
      _tagBg[0].className = _tagBg[0].className.replace(_reg, '');
      _tagTri[0].className = _tagTri[0].className.replace(_reg, '');
      _tagBg.addClass(this._options.category+'-'+index_);
      _tagTri.addClass(this._options.category+'-'+index_);
    }else{
      $target_.children('.tag-background').css({
        'background-color': this._options.background_color,
        'opacity': this._options.opacity - index_*this._options.opacity_step
      });
      $target_.children('.tag-triangle').css({
        'color': this._options.background_color,
        'opacity': this._options.opacity - index_*this._options.opacity_step
      });
    }
    $target_.children('.tag-text').css({
      'color': this._options.color,
    });
  },
  /**
   * [addTag description]
   * @param {[type]} tag_ [description]
   * return -1:tag_ null  0:tag_ exist 2: tag num is greater than max show
   */
  addTag:function(tag_){
    if(!tag_){
      return -1;
    }
    for (var i = 0; i < this._tagTextList.length; i++) {
      if(this._tagTextList[i] === tag_){
        return 0;
      }
    };
    this._tagTextList.push(tag_);
    if(this._index === this._options.max){
      return 2;
    }
    var _tagContainer = this.newTag(tag_);
    this.setColorOpacity(_tagContainer, this._index);
    if (this._parent) {
      this._parent.append(_tagContainer);
    };
    if(this._options.animate && this._options.position !== 'random'){
      this.setPosition(_tagContainer, 0);
    }else{
      this.setPosition(_tagContainer,this._index);
    }
    this._tagList.push(_tagContainer);
    this.bindDrag(_tagContainer[0]);
    this._index += 1;
    return 1;
  },
  /**
   * [addPreTag description]
   * @param {[type]} tag_ [description]
   */
  addPreTag:function(tag_){
    for (var i = 0; i < this._tagTextList.length; i++) {
      if(this._tagTextList[i] === tag_ ){
        if(i < this._options.max){   //tag is in the show
          var _tag = this._tagList.splice(i,1)[0];
          this._tagList.unshift(_tag);
          var _tagText = this._tagTextList.splice(i,1);
          this._tagTextList.unshift(_tagText[0]);
          for (var j = 0; j < this._tagList.length; j++) {
            this.setColorOpacity(this._tagList[j],j);
          };
          this.showTags();
          return 0;
        }else{    //has the tag but not in the show
          var _tag = this._tagList.splice((this._options.max-1),1)[0];
          _tag.children('.tag-text')[0].text = tag_;
          this._tagList.unshift(_tag);
          var _tagText = this._tagTextList.splice(i,1);
          this._tagTextList.unshift(_tagText);
          for (var j = 0; j < this._tagList.length; j++) {
            this.setColorOpacity(this._tagList[j],j);
          };
          this.showTags();
        }
        return 0;
      }
    };
    this._tagTextList.unshift(tag_);
    var _tagContainer = this.newTag(tag_);
    this._tagList.unshift(_tagContainer);
    for (var i = 0; i < this._tagList.length; i++) {
      this.setColorOpacity((this._tagList[i]),i);
    };
    if (this._parent) {
      this._parent.prepend(_tagContainer);
    };
    this.setPosition(_tagContainer, 0);
    this.bindDrag(_tagContainer[0]);
    if (this._index < this._options.max) {
      this._index++;
    }else{
      this._tagList.pop().remove();
    }
    this.showTags();
  },
  /**
   * [hideTags description]
   * @callback_ {[call back function when finish animate]}
   */
  removeTags:function(callback_){
    var _this = this;
    var _tags = this._parent.children('.tag-container');
    if (!this._options.animate || this._options.position === 'random') {
      _tags.remove();
      if (callback_) {
        callback_();
      };
      return ;
    };
    var _tagLeng = _tags.length;
      if (this._options.direction === 'down') {
        _tags.animate({top:_this._options.positions.top},500,function(){
          _tags.remove();
          _tagLeng--;
          if (callback_&&_tagLeng === 0) {
            callback_();
          };
        })
      }else {
        _tags.animate({bottom:_this._options.positions.bottom},500,function(){
          _tags.remove();
          _tagLeng--;
          if (callback_&&_tagLeng === 0) {
            callback_();
          };
        })
      }
  },
  /**
   * [showTags show Tags]
   * @type {[type]}
   */
  showTags:function(){
    var _this = this;
    if (this._options.position === 'random') {
      this.refreshPosition();
      return 0;
    };
    for (var i = this._tagList.length - 1; i >= 0; i--) {
      if (this._options.direction === 'down') {
        this._tagList[i].animate({top:_this._options.positions.top+ i*_this._options.positions.step},500);
      }else {
        this._tagList[i].animate({bottom:_this._options.positions.bottom+i*_this._options.positions.step},500);
      }
    };
  },
  /**
   * [addTags add mul-tags by addTag function]
   * @type {[type]}
   */
  addTags:function(arrTags_, callback_){
    for (var i = arrTags_.length -1 ;i >= 0 ;i--) {
      this.addTag(arrTags_[i]);
    };
    if(this._options.animate){
      this.showTags(callback_);
    }
  },
  /**
   * [removeTagByText remove a tag by tag content]
   * @type {[type]}
   */
  removeTagByText:function(tag_){
    for (var i = 0; i < this._tagTextList.length; i++) {
      if(this._tagTextList[i] === tag_){
        if(i >= this._options.max){
          this._tagTextList.splice(i,1);
        }else{
          if (i < this._options.max) {
            this._tagList[i].remove();
            this._tagList.splice(i,1);
            this._tagTextList.splice(i,1);
            if(this._tagList.length < this._tagTextList.length){
              var _newtag = this.newTag(this._tagTextList[this._options.max-1]);
              this.setPosition(_newtag,this._options.max);
              this._parent.append(_newtag);
              this.bindDrag(_newtag[0]);
              this._tagList.push(_newtag);
            }else{
              this._index--;
            }
            for (var j = 0; j < this._tagList.length; j++) {
              this.setColorOpacity(this._tagList[j],j)
            };
          };
          this.showTags();
        }
      }
    };
  },
  /**
   * [setParent set element witch would be tagged]
   * @type {[type]}
   */
  setParent:function($parent_, uri_){
    this._parent = $parent_;
    if (uri_) {
      this._uri = uri_;
    };
  },
  setUri:function(uri){
    this._uri = uri;
  },
  /**
   * [refreshPosition refresh position of tag]
   * @type {[type]}
   */
  refreshPosition:function(){
    var _this = this;
    if (this._options.position !== 'random') {
      return 0;
    };
    this._positionIndex = Math.ceil(Math.random()*_this._options.max);
    if (this._positionIndex >= this._options.max) {
      this._positionIndex -= this._options.max;
    };
    if (this._parent && this._options.position === 'random') {
      for (var i = 0; i < this._tagList.length; i++) {
        var _index = this._positionIndex + i;
        _index = (_index > this._options.max -1) ?  _index - this._options.max : _index; 
        var _position = this._options.random_positions[_index];
        var _triangle = this._tagList[i].children('.tag-triangle');
        if (_triangle.hasClass('right-triangle')) {
          _triangle.removeClass('right-triangle');
        }else{
          _triangle.removeClass('left-triangle');
        }
        if (_position.left > 50) {
          _triangle.addClass('left-triangle');
        }else if(_position.left < 50){
          _triangle.addClass('right-triangle');
        }
        $(this._tagList[i]).animate({
          left: _position.left +'%',
          top: _position.top +'px'
        },500);
      };
    };
  },
  /**
   * [refresh refresh init taglist and index]
   * @type {[type]}
   */
  refresh:function(callback_){
    var _this = this;
    this.removeTags(function(){
      _this._index = 0;
      _this._tagList = [];
      _this._tagTextList = [];
      if(callback_){
        callback_();
      }
    });
    _this._index = 0;
    if (this._options.position === 'random') {
      this._positionIndex = Math.ceil(Math.random()*_this._options.max);
    };
  },
  /**
   * [setPosition set tag position]
   * @type {[type]}
   */
  setPosition:function($obj_, index_){
    var _position = undefined;
    if (this._options.position === 'random') {
      var _index = this._positionIndex +index_;
      _index = (_index > this._options.max -1) ?  _index - this._options.max : _index;
      _position = this._options.random_positions[_index];     
      if (_position.left > 50) {
        $obj_.children('div').addClass('left-triangle');
      }else{
        $obj_.children('div').addClass('right-triangle');
      }
      $obj_.css({
        left: _position.left + '%',
        top: _position.top + 'px'
      });
    } else {
      _position = {}
      if (this._options.direction === 'down') {
        _position['top'] = this._options.positions.top + index_ * this._options.positions.step;
        $obj_.css({
          top: _position.top + 'px'
        });
      } else if (this._options.direction === 'up'){
        _position['bottom'] = this._options.positions.bottom + index_ * this._options.positions.step;
        $obj_.css({
          bottom: _position.bottom + 'px'
        });
      }
      $obj_.children('div').addClass('left-triangle');
      $obj_.addClass('rotate');
    }
  },
  /**
   * [bindDrag bind drag Event]
   * @param  {[type]} tag_ [description]
   * @return {[type]}      [description]
   */
  bindDrag:function(tag_){
    var _this = this;
    tag_.ondragstart = function(ev){
      $(ev.currentTarget).addClass('no-rotate');
      var _tagText = $(ev.currentTarget).children('.tag-text')[0].textContent;
      ev.dataTransfer.setData("tag", _tagText);
      if (_this._uri) {
        ev.dataTransfer.setData("uri", _this._uri);
      };
      if(_this._parent[0].id === 'contact-head'){
        ev.dataTransfer.setData("category", 'contact');
      }
      tagDragged = _this;
      ev.stopPropagation();
    }
    tag_.ondragend = this.dragEnd;
  },

  dragEnd:function(ev){
    ev.stopPropagation();
    $(ev.currentTarget).removeClass('no-rotate');
  },

  bindDrop:function(target_){
    var _this = this;
    var drop = function(ev){
      var _tag = ev.dataTransfer.getData('tag');
      var _id = ev.currentTarget.id;
      var _uri = basic.modifyUriToUri(_id).substring(0,_id.length - 3);
      if (typeof _tag === 'string' && _tag.length > 0) {
        DataAPI.setTagByUri(function(err){
          if (err === null) {
            infoList.fixTagNum(_tag,1);
            _this.addPreTag(_tag);
          };
        },[_tag],_uri);
      };
      ev.preventDefault();
      ev.stopPropagation();
    };
    var dragOver = function(ev){
      ev.preventDefault();
    }
    target_.ondrop = drop;
    target_.ondragover = dragOver;
  }
});

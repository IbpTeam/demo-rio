var TagView = Class.extend({
  init:function(options_){
    this._options = {
      direction: 'left',
      position: 'random',  //listView
      background_color: 'rgb(255,0,0)',
      opacity: 0.9,
      color: 'rgb(255,255,255)',
      maxNum: 6,
      random_positions: [{left:25,top:20},{left:60,top:60},{left:20,top:50},{left:18,top:130},{left:70,top:30},{left:65,top:90}],
      positions: {top:10,direction:'down',step:30}
    }
    if (options_) {
      for(var key in options_){
        this._options[key] = options_[key];
      }
    };
    var _this = this;
    this._tagList = [];
    this._parent = undefined;
    if (this._options.position === 'random') {
      this._positionIndex = Math.ceil(Math.random()*_this._options.maxNum);
    };
    this._index = 0;
  },
  /**
   * [addTag add a tag]
   * @type {[type]}
   */
  addTag:function(tag_){
    if(this._index === this._options.maxNum){
      return 0;
    }
    var _tagContainer = $('<div>',{
      'class':'tag-container'
    })
    var _tagBackground = $('<div>',{
      'class':'tag-background'
    });
    var _tagSpan = $('<div>',{
      'class': 'tag-text',
      'text': tag_
    })
    var _tagTriangle = $('<div>',{
      'class':'tag-triangle'
    })
    _tagBackground.css({
      'background-color': this._options.background_color,
      'opacity': this._options.opacity - this._index*0.2
    });
    _tagSpan.css({
      'color': this._options.color,
    });
    _tagTriangle.css({
      'background-color': this._options.background_color,
      'opacity': this._options.opacity - this._index*0.2
    });
    _tagContainer.append(_tagBackground);
    _tagContainer.append(_tagSpan);
    _tagContainer.append(_tagTriangle);
    if (this._parent) {
      this._parent.append(_tagContainer);
    };
    this.setPosition(_tagContainer);
    this._tagList.push(_tagContainer);
    this._index += 1;
  },
  /**
   * [addTags add mul-tags by addTag function]
   * @type {[type]}
   */
  addTags:function(arrTags_){
    for (var i = 0; i < arrTags_.length; i++) {
      this.addTag(arrTags_[i]);
    };
  },
  /**
   * [removeTagByText remove a tag by tag content]
   * @type {[type]}
   */
  removeTagByText:function(tag_){
    for (var i = 0; i < this._tagList.length; i++) {
      if(this._tagList[i][0].textContent === tag_){
        this._tagList[i].remove();
        this._tagList[i].splice(i,1);
      }
    };
  },
  /**
   * [setParent set element witch would be tagged]
   * @type {[type]}
   */
  setParent:function($parent_){
    this._parent = $parent_;
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
    this._positionIndex = this._positionIndex + 1;
    if (this._positionIndex === this._options.maxNum) {
      this._positionIndex = 0;
    };
    if (this._parent && this._options.position === 'random') {
      for (var i = 0; i < this._tagList.length; i++) {
        var _index = this._positionIndex + i;
        _index = (_index > this._options.maxNum -1) ?  _index - this._options.maxNum : _index; 
        var _position = this._options.random_positions[_index];
        $(this._tagList[i]).animate({
          left: _position.left +'%',
          top: _position.top +'px'
        },{
          duration: 2,  
          easing: 'cubic-bezier(1,0.22,0,0.84)' // 'ease-in'  
        },function(){
          var _triangle = this._tagList[i].children('.tag-triangle');
          if (this._position.left < 50 && 
              _triangle.hasClass('right-triangle')) {
            _triangle.removeClass('right-triangle');
            _triangle.addClass('left-triangle');
          }else if(this._position.left > 50 && 
              _triangle.hasClass('left-triangle')){
            _triangle.removeClass('left-triangle');
            _triangle.removeClass('right-triangle');
          }
        });
      };
    };
  },
  /**
   * [setPosition set tag position]
   * @type {[type]}
   */
  setPosition:function($obj_){
    var _position = undefined;
    if (this._options.position === 'random') {
      var _index = this._positionIndex + this._index;
      _index = (_index > this._options.maxNum -1) ?  _index - this._options.maxNum : _index;
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
      _position['right'] = this._options.positions.right;
      if (this._options.positions.direction === 'down') {
        _position['top'] = this._options.positions.top + this._index * this._options.positions.step;
      } else if (this._options.positions.direction === 'up'){
        _position['top'] = this._options.positions.top - this._index * this._options.positions.step;
      }
      $obj_.children('div').addClass('left-triangle');
      $obj_.addClass('rotate');
      $obj_.css({
        top: _position.top + 'px'
      });
    }
  }
});

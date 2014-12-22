var MainVideoView = Class.extend({
  init:function(){
    this._videoContainer = $('<div>',{
      'id': 'video-container'
    });
    this._videoContent = $('<div>',{
      'class': 'video-content'
    });
    this._banner = $('<div>',{
      'class': 'banner'
    });
    this._ul = $('<ul>',{
    })

    this._videoMiddleBtn = $('<a>',{
      'class': 'video-middle-btn',
    });

    this._videoLeftBtn= $('<a>',{
      'class': 'video-left-btn',
    });
    this._videoRightBtn = $('<a>',{
      'class': 'video-right-btn',
    });
    this._unslider = undefined;

    this._videoContainer.append(this._videoContent);
    this._videoContent.append(this._banner);
    this._banner.append(this._ul);
    this._videoContainer.append(this._videoMiddleBtn);
    this._videoContainer.append(this._videoLeftBtn);
    this._videoContainer.append(this._videoRightBtn);
    this._listVideo = {
      'imgPath': 'img/show.jpg',
      'name': 'Sea'
    };
    this._listVideo1 = {
      'imgPath': 'img/heaven.jpg',
      'name': 'heaven'
    };
        this._listVideo2 = {
      'imgPath': 'img/vword.jpg',
      'name': 'desktop'
    };
    this.addVideo(this._listVideo);
    this.addVideo(this._listVideo1);
    this.addVideo(this._listVideo2);
    this._testTags=[['name','flower','water'],
      ['light','home-school','name','flower','water'],
      ['flower','name','flower','water']];
    this._tagView = TagView.create({
      position: 'listview',
      max: 5,
      background_color: 'rgb(204,51,51)'
    });
    this._tagView.setParent(this._videoContent);
    this._tagView.addTags(this._testTags[0]);
    this.addUnslider();
  },

  bindEvent:function(){
    var _this = this;
    this._videoLeftBtn.click(function(ev){
      _this._unslider.prev();
    });

    this._videoRightBtn.click(function(ev){
      _this._unslider.next();
    });
  },

  attach:function($parent_){
    $parent_.append(this._videoContainer);
  },
  /**
   * [addVideo add video View]
   * @param {[json]} video_ [{
   *   path: string
   *   imgPath: string
   *   name: string
   *   tags: [string]
   * }]
   */
  addVideo:function(video_){
    var _li = $('<li>',{
      'class': 'video-img',
      'text': video_.name
    })
    _li.css('background-image', "url('"+video_.imgPath+"')");
    this._ul.append(_li);
  },

  addUnslider:function(){
    var _this = this;
    if (!this._unslider) {
      this._unslider = Unslider.create(this._banner, {
        speed: 500,               // 轮播动画速度
        delay: 3000,              // 轮播延时
        begin: function(index_) {
          _this._tagView.refresh(function(){
            _this._tagView.addTags(_this._testTags[index_]);
          });
        },  // 完成轮播时的响应函数
        keys: true,               // 支持左右按键转换图片
        fluid: false              // 支持响应设计，屏幕变化
      });
    }
    this.bindEvent();
  },
  hide:function(){
    this._videoContainer.hide();
  },
  show:function(){
    this._videoContainer.show();
  }

});

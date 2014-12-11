var MainMusicView = Class.extend({
  init:function(){
    this._musicContainer = $('<div>',{
      'id': 'music-container'
    });
    this._musicContent = $('<div>',{
      'id': 'music-content'
    });
    this._musicBtnContent = $('<div>',{
      'id': 'music-button-content'
    });
    this._musicContainer.append(this._musicContent);
    this._musicContainer.append(this._musicBtnContent);
    this._banner = $('<div>',{
      'class': 'banner'
    });
    this._ul = $('<ul>',{
    })

    this._musicMiddleBtn = $('<a>',{
      'class': 'music-middle-btn icon-play',
    });

    this._musicLeftBtn= $('<a>',{
      'class': 'music-left-btn',
      'text': '<'
    });
    this._musicRightBtn = $('<a>',{
      'class': 'music-right-btn',
      'text': '>'
    });

    this._musicContent.append(this._banner);
    this._banner.append(this._ul);
    this._musicBtnContent.append(this._musicMiddleBtn);
    this._musicBtnContent.append(this._musicLeftBtn);
    this._musicBtnContent.append(this._musicRightBtn);

    this._musicList = {
      'imgPath': 'img/show.jpg',
      'name': 'Sea'
    };
    this._musicList1 = {
      'imgPath': 'img/heaven.jpg',
      'name': 'heaven'
    };
    this._musicList2 = {
      'imgPath': 'img/vword.jpg',
      'name': 'desktop'
    };
    this.addVideo(this._musicList1);
    this.addVideo(this._musicList2);
    this.addVideo(this._musicList);
    this.addUnslider();
    this._testTags=[['light','home-school','name','flower','water'],
    ['flower','name','flower','water'],
    ['name','flower','water']];
    this._tagView = TagView.create({
      position: 'listview',
      direction:'up',
      background_color: 'rgb(51,153,102)',
      positions:{
        bottom:10,
        step: 30
      }
    });
    this._tagView.setParent(this._musicContent);
    this._tagView.addTags(['heaven','flower','water']);
  },
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
      this._unslider = Unslider.create(_this._banner, {
        speed: 500,               // 轮播动画速度
        delay: 3000,              // 轮播延时
        begin: function(index_) {
          _this._tagView.refresh(function(){
            _this._tagView.addTags(_this._testTags[index_]);
          });
        },  // begin轮播时的响应函数
        keys: true,               // 支持左右按键转换图片
        fluid: false              // 支持响应设计，屏幕变化
      });
    }
    this.bindEvent();
  },
  hide:function(){
    this._musicContainer.hide();
  },
  show:function(){
    this._musicContainer.show();
  },

  attach:function($parent_){
    $parent_.append(this._musicContainer);
  },

  bindEvent:function(){
    var _this = this;
    this._musicLeftBtn.click(function(ev){
      _this._unslider.prev();
    });

    this._musicRightBtn.click(function(ev){
      _this._unslider.next();
    });
  }
})
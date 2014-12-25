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
      'class': 'music-middle-btn',
    });

    this._musicLeftBtn= $('<a>',{
      'class': 'music-left-btn active',
    });
    this._musicRightBtn = $('<a>',{
      'class': 'music-right-btn',
    });
    this._dots = [];
    this._musicContent.append(this._banner);
    this._banner.append(this._ul);
    this._musicBtnContent.append(this._musicMiddleBtn);
    this._musicBtnContent.append(this._musicLeftBtn);
    this._musicBtnContent.append(this._musicRightBtn);
    this._dots.push(this._musicLeftBtn);
    this._dots.push(this._musicMiddleBtn);
    this._dots.push(this._musicRightBtn);

    var _this = this;
    _this._tags = [];
    DataAPI.getRecentAccessData(function(err_, music_json_){
      if(err_){
        console.log(err_);
        return;

      }
      var _count = 0;
      for(var i = 0; i < music_json_.length; i ++){
        if(music_json_[i].hasOwnProperty('filename') && music_json_[i].hasOwnProperty('URI')){
          _this.addMusic(music_json_[i]);
          DataAPI.getTagsByUri(function(result_){
            _this._tags.push(result_);
            _count ++;
            if(_count == music_json_.length){
              _this._tagView = TagView.create({
                position: 'listview',
                direction:'up',
                max:3,
                background_color: 'rgb(88,204,82)',
                positions:{
                  bottom:10,
                  step: 30
                }
              });
              _this._tagView.setParent(_this._musicContent);
              _this._tagView.addTags(_this._tags[0]);
              _this.addUnslider();
            }
          }, music_json_[i]['URI']);
        }
      }
    }, 'music', 3);
  },

  getMusicPicData:function(file){
    DataAPI.getMusicPicData(function(err,result){
      if(err){
        console.log(err);
        return;
      }
      else{
        var musciPictureSrc = 'data:image/jpeg;base64,' + result;
        var filep = document.getElementsByName(file['URI']);
        filep[0].src = musciPictureSrc;
      }
    },file['path']);  
  },

  addMusic:function(music_){
    var _li = $('<li>',{
      'class': 'video-img'
    });
    var _name = $('<span>',{
      'text':music_['filename']
    });
    var _img = $('<img>', {
      'name' : music_['URI']
    });
    this.getMusicPicData(music_);
    _li.append(_name);
    _li.append(_img);
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
            _this._tagView.addTags(_this._tags[index_]);
          });
          _this._dots[index_].addClass('active').siblings().removeClass('active');
        },  // begin轮播时的响应函数
        keys: true,               // 支持左右按键转换图片
        //dots:true,
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
      _this._unslider.move(0);
    });
    this._musicMiddleBtn.click(function(ev){
      _this._unslider.move(1);
    });
    this._musicRightBtn.click(function(ev){
      _this._unslider.move(2);
    });
  }
})
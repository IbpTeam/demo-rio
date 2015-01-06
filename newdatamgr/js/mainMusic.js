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
    this._globalSelf;
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
                category:'music',
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
    _globalSelf = this ;
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
      'class': 'music-img'
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
    _li.dblclick(function(ev){
      console.log(music_['URI']);
      _globalSelf.openFile(music_['URI']);
    });
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
  },
  //此函数用来产生一个和用户交互的界面
  genPopupDialog:function(title, message, files){
    $("#popupDialog").remove();
    var headerButton = $('<button>',{
      'type':'button',
      'class':'close',
      'data-dismiss':'modal',
      'aria-hidden':'true',
      'text':'x'
    });
    var headerTitle = $('<h4>',{
      'class':'modal-title',
      'text':title
    });
    var header = $('<div>',{
      'class':'modal-header'
    });
    header.append(headerButton).append(headerTitle);
    var body = $('<div>',{
      'class':'modal-body',
      'html':message
    });
  
    var footer = $('<div>',{
      'class':'modal-footer'
    });
    var footerButton = $('<button>',{
      'type':'button',
      'class':'btn btn-default',
      'data-dismiss':'modal',
      'text':'Close'
    });
    footer.append(footerButton);
  
    var content = $('<div>',{
      'class':'modal-content'
    });
    content.append(header);
    content.append(body);
    content.append(footer);
  
    dialog = $('<div>',{
      'class':'modal-dialog'
    });
    dialog.append(content);
    var div = $('<div>',{
      'id':'popupDialog',
      'class':'modal fade',
      'data-backdrop':'false'
    });
    div.append(dialog);
    $('body').append(div);
    $("#popupDialog").modal('show');
    $('#popupDialog').on('hidden.bs.modal', function(){
      $(this).remove();
    });
  },
  //此函数用来通过json格式找到数据库中的源文件
  cbGetDataSourceFile:function(file){
    if(!file['openmethod'] || !file['content']){
      window.alert('openmethod or content not found.');
      return false;
    }
    var method = file['openmethod'];
    var content = file['content'];
    switch(method){
      case 'alert':
        window.alert(content);
        break;
      case 'html':
        var fileContent;
        var format = file['format'];
        switch(format){
          case 'audio':
            fileContent = $('<audio>',{
              'controls':'controls',
              'src':content,
              'type':'audio/mpeg'
            });
            break;
          case 'video':
            fileContent = $('<video>',{
              'controls':'controls',
              'width':'400',
              'height':'300',
              'src':content,
              'type':'video/ogg'
            });
            break;
          case 'div':
            fileContent = content;
            break;
          case 'txtfile':
            fileContent = $("<p></p>").load(content);
            break;
          default:
            fileContent = content;
            break;
        }

        var title = file['title'];
        if (!file['windowname']){
          if(typeof(fileContent) == 'string' &&fileContent.match("成功打开文件")){
            break;
          }
          else{
            _globalSelf.genPopupDialog(title, fileContent);    
          }
        }
        else{
          var F5Button = $('<button>',{
            'type':'button',
            'class':'btn btn-success',
            'text':'PLAY'
          });
          F5Button.click(function(){
             AppAPI.sendKeyToApp(function(){},file['windowname'],'F5')
          });
          var UpButton = $('<button>',{
            'type':'button',
            'class':'btn btn-success',
            'text':'UP'
          });
          UpButton.click(function(){
            AppAPI.sendKeyToApp(function(){},file['windowname'],'Up')
          });
          var DownButton = $('<button>',{
            'type':'button',
            'class':'btn btn-success',
            'text':'DOWN'
          });
          DownButton.click(function(){
            AppAPI.sendKeyToApp(function(){},file['windowname'],'Down')
          });
          var StopButton = $('<button>',{
            'type':'button',
            'class':'btn btn-success',
            'text':'STOP'
          });
          StopButton.click(function(){
            AppAPI.sendKeyToApp(function(){},file['windowname'],'Escape')
          });
          var genDiv = $('<div></div>');
          genDiv.append(F5Button);
          genDiv.append('<br>');
          genDiv.append(UpButton);
          // genDiv.append('<br>');
          genDiv.append(DownButton);
          genDiv.append('<br>');
          genDiv.append(StopButton);
          genDiv.append('<br>');
          _globalSelf.genPopupDialog("窗口控制",genDiv);
        }
        break;
      default:
        break;
    }
    return; 
  },
  //此函数用来打开一个文件，传入的是文件的URI
  openFile:function(uri_){
    console.log(uri_);
    if(!uri_){
      window.alert('the file is not found');
    }
    else{
        DataAPI.openDataByUri(this.cbGetDataSourceFile, uri_);
    }
  }
})
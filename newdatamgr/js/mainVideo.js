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

    /*this._videoMiddleBtn = $('<a>',{
      'class': 'video-middle-btn',
    });*/

    this._videoLeftBtn= $('<a>',{
      'class': 'video-left-btn',
    });
    this._videoRightBtn = $('<a>',{
      'class': 'video-right-btn',
    });
    this._unslider = undefined;
    this._globalSelf;
    this._videoContainer.append(this._videoContent);
    this._videoContent.append(this._banner);
    this._banner.append(this._ul);
    //this._videoContainer.append(this._videoMiddleBtn);
    this._videoContainer.append(this._videoLeftBtn);
    this._videoContainer.append(this._videoRightBtn);
    var _this = this;
    _this._tags = [];
    DataAPI.getRecentAccessData(function(err_, video_json_){
      if(err_){
        console.log(err_);
        return;
      }
      if(video_json_.length === 0){
        homePage._noneData++;
        if (homePage._noneData === homePage._dataClasses) {
          $('#avatar')[0].click();
        };
      }
      var _count = 0;
      for(var i = 0; i < video_json_.length; i ++){
        if(video_json_[i].hasOwnProperty('filename') && video_json_[i].hasOwnProperty('URI')){
          _this.addVideo(video_json_[i]);
          DataAPI.getTagsByUri(function(result_){
            _this._tags.push(result_);
            _count ++;
            if(_count == video_json_.length){
              _this._tagView = TagView.create({
                position: 'listview',
                max: 5,
                category:'video',
                background_color: 'rgb(232,114,114)'
              });
              _this._tagView.setParent(_this._videoContent);
              _this._tagView.addTags(_this._tags[0]);
              _this.addUnslider();
            }
          }, video_json_[i]['URI']);
        }
      }
    }, 'video', 3);   
    _globalSelf = this ;
  },

  getVideoPicData:function(file){
    DataAPI.getVideoThumbnail(function(err,result){
      if(err){
        console.log(err);
        return;
      }
      else{
        var videoPictureSrc = 'data:image/jpeg;base64,' + result;
        var fileImg = document.getElementsByName(file['URI']);
        fileImg[0].src = videoPictureSrc;
      }
    },file['path']);  
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
    var _this = this;
    var _li = $('<li>',{
      'class': 'video-img',
      'text': video_['filename']
    });
    var _img = $('<img>', {
      'name' : video_['URI']
    });
    var _videoMiddleBtn = $('<a>',{
          'class': 'video-middle-btn',
        });
    this.getVideoPicData(video_);
    _li.append(_img);
    _li.append(_videoMiddleBtn);
    this._ul.append(_li);

    _videoMiddleBtn.click(function(ev){
      console.log("open");
      _this.openFile(video_['URI']);
    });
  },

  addUnslider:function(){
    var _this = this;
    if (!this._unslider) {
      this._unslider = Unslider.create(this._banner, {
        speed: 800,               // 轮播动画速度
        delay: 5000,              // 轮播延时
        begin: function(index_) {
          _this._tagView.refresh(function(){
            _this._tagView.addTags(_this._tags[index_]);
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
  //此函数用来打开一个文件，传入的是文件的URI，传入的是自己修改过的，把#去掉的
  openFile:function(uri_){
    console.log(uri_);
    if(!uri_){
      window.alert('the file is not found');
    }
    else{
        DataAPI.openDataByUri(this.cbGetDataSourceFile, uri_);
    }
  }
});

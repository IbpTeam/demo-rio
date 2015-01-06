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
          'uri': picture_json_[i]['URI'],
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
        'id': pic_.uri.replace(/#/g,'-')+'div',
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
    this._tagView.setParent(_picContent,pic_.uri);
    this._tagView.addTags(pic_.tags);
    this._tagView.bindDrop(_picContent[0]);
    _picContent.dblclick(function(ev){
      console.log(pic_.uri);
      _this.openFile(pic_.uri);
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
});

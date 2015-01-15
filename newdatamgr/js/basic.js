var Basic = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    basic = this;
    this._uri = undefined;   
    this._tag = undefined;
    //用于记录被拖拽的标签的对象，被tagview.js设置
    this._tagDragged = undefined;
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
    var _this = this;
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
            basic.genPopupDialog(title, fileContent);    
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
          genDiv.append(DownButton);
          genDiv.append('<br>');
          genDiv.append(StopButton);
          genDiv.append('<br>');
          basic.genPopupDialog("窗口控制",genDiv);
        }
        break;
      default:
        break;
    }
    return; 
  },

  //按照URI搜索本地文件的功能，传入的是修改之后的URI
  findFileByURI:function(URI, files){
    var file = false;
    if(files.length){
      for(var i =0;i<files.length;i++){
        if(files[i]['URI'] && basic.uriToModifyUri(files[i]['URI']) == URI){
          file = files[i];
          break;
        }
      }
    }
    return file;
  },
//转换uri与可用于id的uri
  uriToModifyUri:function(uri_){
    return uri_.replace(/#/g,'-');
  },
//转换uri与可用于id的uri
  modifyUriToUri:function(modifyURI_){
    return modifyURI_.replace(/-/g,'#');
  },

  isStrInStrArr:function(str_,Arr_){
    for(var _val in Arr_){
      if(str_ === Arr_[_val]) return true;
    }
    return false;
  },

  //此函数用来打开一个文件，传入的是文件的URI，传入的是自己修改过的，把#去掉的
  openFile:function(file){
    var _this = this;
    if(file){
      if(file.URI.indexOf('#') != -1){
        if(file.postfix == 'pdf'){
          function cbViewPdf(){
          }
          AppAPI.getRegisteredAppInfo(function(err, appInfo) {
            if (err) {
              return console.log(err);
            }
            AppAPI.startApp(cbViewPdf, appInfo, file.path);
          }, "viewerPDF-app");
        }
        else {
          DataAPI.openDataByUri(basic.cbGetDataSourceFile, file.URI);
        }
      }
    }
    else{
      window.alert('the file is not found');
    }
  },

  //用于获取视频截图，传入一个文件json，和截图的要放的ID
  getVideoPicData:function(file,imgID){
    DataAPI.getVideoThumbnail(function(err,result){
      if(err){
        console.log(err);
      }
      else{
        var videoPictureSrc = 'data:image/jpeg;base64,' + result;
        var fileImg = document.getElementById(imgID);
        //var fileImg = $(imgID);
        fileImg.src = videoPictureSrc;
      }
    },file['path']);  
  },

  //此函数用来获得音乐的专辑图片，传入的是一个json和截图的id
  getMusicPicData:function(file,imgID){
    DataAPI.getMusicPicData(function(err,result){
      if(err){
        window.alert(err);
      }
      else{
        var musciPictureSrc = 'data:image/jpeg;base64,' + result;
        var filep = document.getElementById(imgID);
        filep.src = musciPictureSrc;
      }
    },file['path']);  
  },

  //显示添加标签界面
  addTagView:function(this_,uri_,category_){
    var _this = this;
    var _addTagForm = $('<form>', {
      'id': 'add-tag-form'
    });
    var _addTagInput = $('<input>', {
      'id':'new-tag',
      'type':'text'
    });
    _addTagForm.append(_addTagInput);
    var _addTagButton = $('<input>', {
      'type': 'button',
      'id': 'add-tag-button',
      'value': 'Add'
    });
    _addTagForm.append(_addTagButton);
    _this.genPopupDialog('Add Tag', _addTagForm);
    $('#add-tag-button').on('click', function(){
      var _newTag = document.getElementById('new-tag').value;
      DataAPI.setTagByUri(function(err){
        if(err === null){
          if(category_ === 'contact'){
            this_._tagView.addTag(_newTag);
            infoList.setContent();
          }else{
            try{
              basic._uri = uri_;
              basic._tag = _newTag;
              infoList.fixTagNum(_newTag,1);
              _this._tagDragged.addPreTag(_newTag);
            }catch(e){
              console.log(e);
            }
          }
          $('#popupDialog').remove();
        }else{
          window.alert("Add tags failed!");
        }
      }, [_newTag], uri_);
    });
  },
//显示删除标签界面
  removeTagView:function(this_,uri_,category_){
    var _this = this;
    DataAPI.getTagsByUri(function(tags_){
      if(tags_ != null && tags_.length > 0 && tags_[0] != ""){
        var _deleteTagForm = $('<form>', {
          'id': 'delete-tag-form'
        });
        for(var i = 0; i < tags_.length; i ++){
          var _deleteTagInput = $('<input>', {
            'id':'delete-tag-input',
            'name':'tags',
            'value': tags_[i],
            'type':'checkbox'
          });
          _deleteTagForm.append(_deleteTagInput);
          _deleteTagForm.append(tags_[i]+'</br>');
        }
        _deleteTagForm.append('</br>');
        var _deleteTagButton = $('<input>', {
          'id':'delete-tag-button',
          'type':'button',
          'value':'Delete'
        });
        _deleteTagForm.append(_deleteTagButton);
        var _tagsToDelete = [];
        _this.genPopupDialog('Delete Tag', _deleteTagForm);
        $('#delete-tag-button').on('click', function(){
          var _webtags = document.getElementsByName("tags");
          for (var i = 0; i < _webtags.length; ++i){
            if(_webtags[i].checked){
              _tagsToDelete.push(_webtags[i].value);
            }
          }
          if(_tagsToDelete != null && _tagsToDelete.length > 0){
            basic.removeTagsOrFile(_tagsToDelete, uri_, category_);
            $('#popupDialog').remove();
          }
        });
      }else{
        window.alert("There is no tag to delete!");
      }
    }, uri_);
  },
//删除标签和删除文件的执行函数
  removeTagsOrFile:function(tags_,uri_,category_){
    var _tags = (typeof tags_ === 'string' && tags_)?[tags_]:tags_;
    var _uri = uri_;
    var _category = category_;
    if(_tags && _uri){
      DataAPI.rmTagsByUri(function(result){
        if (result === 'commit') {
          if(basic._tagDragged){
            basic._tagDragged.removeTagByText(_tags);
            basic._tagDragged = undefined;
          }
          for (var i = 0; i < _tags.length; i++) {
            if (infoList.isShow()) {
              infoList.fixTagNum(_tags[i],-1);
            };
            if (_category === 'contact') {
              var _tagsArr = contact._contacts[contact._selectId]['others'].split(',');
              var _others = '';
              for (var j = 0; j < _tagsArr.length; j++) {
                if (_tagsArr[j] == _tags[i]) continue;
                if(_others === '') {
                  _others = _tagsArr[j];
                }else{
                  _others += ','+_tagsArr[j];
                }
              };
              contact._contacts[contact._selectId]['others'] = _others;
            };
          }
        }else{
          console.log('Delect tags failed!');
        }
      },_tags,_uri);
    }else if(_uri && !_tags){  //drag file to remove
      if (_category === 'mainDoc') {
        DataAPI.rmDataByUri(function(err_){
          if(err_ !== null){
            console.log('Delect file failed:' + err_);
            return 0;
          }
          if(!homePage._doc.removeFile(_uri)){
            alert('remove doc div error');
          }
        },_uri);
      }else{
        showfiles.deleteFileByUri(basic.uriToModifyUri(_uri));
      }
    }
  }
})

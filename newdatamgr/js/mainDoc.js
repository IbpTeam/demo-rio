var MainDocView = Class.extend({
  init:function(){
    this._docContainer = $('<div>',{
      'id': 'doc-container'
    })
    this._docTitleContent = $('<div>',{
      'id': 'doc-title-content'
    });
    this._docContent = $('<div>',{
      'id': 'doc-content'
    });
    this._docContainer.append(this._docTitleContent);
    this._docContainer.append(this._docContent);
    //input title ui
    this._docTitleTag = $('<div>',{
      'id': 'doc-title-tag'
    })
    this._docTitleContent.append(this._docTitleTag);
    this._docTitleText = $('<span>',{
      'id': 'doc-title-text',
      'text': 'Documents'
    })
    this._docTitleContent.append(this._docTitleText);
    this._docSelectDiv = $('<div>',{
      'id': 'doc-select-div'
    })
    this._docTitleContent.append(this._docSelectDiv);
    this._docSelectWord = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox',
      'class': 'regular-checkbox',
      'id':'checkbox-1',
      'checked': 'checked'

    })
    this._docSelectDiv.append(this._docSelectWord);
    this._docSelectWordLabel = $('<label>',{
      'for':'checkbox-1'
    })
    this._docSelectDiv.append(this._docSelectWordLabel);
    this._docSelectDiv.append('<span class="select-text">Word</span>');
    this._docSelectExcel = $('<input>',{
      'class' : 'doc-select',
      'type': 'checkbox',
      'class': 'regular-checkbox',
      'id':'checkbox-2',
      'checked': 'checked'
    });
    this._docSelectDiv.append(this._docSelectExcel);
    this._docSelectExcelLabel = $('<label>',{
      'for':'checkbox-2'
    })
    this._docSelectDiv.append(this._docSelectExcelLabel);
    this._docSelectDiv.append('<span class="select-text">Excel</span>');
    this._docSelectPpt = $('<input>',{
      'class': 'doc-select',
      'type': 'checkbox',
      'class': 'regular-checkbox',
      'id':'checkbox-3',
      'checked': 'checked'
    })
    this._docSelectDiv.append(this._docSelectPpt);
    this._docSelectPptLabel = $('<label>',{
      'for':'checkbox-3'
    })
    this._docSelectDiv.append(this._docSelectPptLabel);
    this._docSelectDiv.append('<span class="select-text">PowerPoint</span>');

    this.iconpath = {};
    this.setIcon();
    var _this = this;
    DataAPI.getRecentAccessData(function(err_, document_json_){
      if(document_json_.length === 0){
        homePage._noneData++;
        if (homePage._noneData === homePage._dataClasses) {
          $('#avatar')[0].click();
        };
      }
      for(var i = 0; i < document_json_.length; i++){
        _this.appendFile({
          'uri': document_json_[i]['URI'],
          'type': _this.getType(document_json_[i]['postfix']),
          'name': document_json_[i]['filename'] + document_json_[i]['postfix'],
          'path': document_json_[i]['path']
        });
      }
    }, 'document', 30);
    _this.addClickEvent(this._docContent,'.doc-icon');
  },

  setIcon:function(){
    this.iconpath['Word'] = 'icons/word.png';
    this.iconpath['Excel'] = 'icons/excel.png';
    this.iconpath['Powerpoint'] = 'icons/powerpoint.png';
    this.iconpath['PDF'] = 'icons/pdf.png';
    this.iconpath['Text'] = 'icons/text.png';
    this.iconpath['default'] = 'icons/none.png';
  },

  removeFile:function(uri_){
    var _files = this._docContent.children('.doc-icon');
    for (var i = 0; i < _files.length; i++) {
      if($(_files[i]).data('uri') === uri_){
        $(_files[i]).remove();
        return 1;
      }
    };
    return 0;
  },

  appendFile:function(file_){
    var _fileView = $('<div>',{
      'class': 'doc-icon',
      'id':JSON.stringify(file_),
      'draggable': true
    });
    _fileView.data('uri',file_.uri);
    _fileView.html('<img draggable="false" src='
      + this.iconpath[file_.type]+' /><P title='+file_.name.replace(/ /g,'')+'>' + file_.name + '</P>');
    this._docContent.append(_fileView);
    this.bindDrag(_fileView[0]);
  },

  attach:function($parent_){
    $parent_.append(this._docContainer);
  },

  hide:function(){
    this._docContainer.hide();
  },

  show:function(){
    this._docContainer.show();
  },

  getType:function(postfix_){
    if(postfix_ == 'ppt' || postfix_ == 'pptx'){
      return 'Powerpoint';
    } else if(postfix_ == 'xls' || postfix_ == 'xlsx' || postfix_ == 'et' || postfix_ == 'ods'){
      return 'Excel';
    } else if(postfix_ == 'doc' || postfix_ == 'docx' || postfix_ == 'wps'){
      return 'Word';
    } else if(postfix_ == 'pdf'){
      return 'PDF';
    } else if(postfix_ == 'txt' || postfix_ == ''){
      return 'Text';
    } else {
      return 'default';
    }
  },

  bindDrag:function(file_){
    var _this = this;
    file_.ondragstart = function(ev){
      ev.dataTransfer.setData('uri',$(ev.currentTarget).data('uri'));
      ev.dataTransfer.setData('category','mainDoc');
    }
  },

  addClickEvent:function(jQueryElement,whichClass){
    //一个JQuery元素代表的是一系列文件
    this.files = jQueryElement;
    var _this = this;
    //增加单击和右击事件,1是单击，3是右击
    this.files.delegate(whichClass,'mousedown',function(e){
      /*switch(e.which){
        case 1:
          $(this).addClass('selected').siblings().removeClass('selected');

          //绑定一些快捷键，删除、重命名因为只有选择的时候才会有快捷键
          if(!$(this).attr('tabindex')){
            $(this).blur(function() {
              $(this).removeClass('selected');
            });
            $(this).attr('tabindex','1').keydown(function(e) {
              if(e.which == 46){
                //触发的是键盘的delete事件,表示删除
                var modifyURI_ = _globalSelf.findURIByDiv($(this));
                _globalSelf.deleteFileByUri(modifyURI_);
              }
              else if(e.which == 113){
                //按下F2键，表示要重命名
                _globalSelf.renameFileByDivId($(this).attr('id'));
              }
            });
          }
          break;
        case 3:
          $(this).addClass('selected').siblings().removeClass('selected');
          break;  
      }*/
      console.log("mousedown!");
    });
    //绑定双击事件
    this.files.delegate(whichClass,'dblclick',function(e){
      file=JSON.parse(this.id)
      console.log(file.uri);
      _this.openFile(file);
      console.log("dblclick!");
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
  openFile:function(file_){
    console.log(file_);
    if(!file_){
      window.alert('the file is not found');
    }
    else{
      if(file_.type == 'PDF'){
        function cbViewPdf(){
        }
        AppAPI.getRegisteredAppInfo(function(err, appInfo) {
          if (err) {
            return console.log(err);
          }
          AppAPI.startApp(cbViewPdf, appInfo, file_.path);
        }, "viewerPDF-app");
      }
      else{
        DataAPI.openDataByUri(this.cbGetDataSourceFile, file_.uri);
      }
    }
  }
});

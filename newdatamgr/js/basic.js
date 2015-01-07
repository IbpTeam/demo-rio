var Basic = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    _globalSelf = this 
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
  openFile:function(file){
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
          DataAPI.openDataByUri(_globalSelf.cbGetDataSourceFile, file.URI);
        }
      }
    }
    else{
      window.alert('the file is not found');
    }
  }
})
var ShowFiles = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    this._contextMenuDivID = '';
    this._globalSelf;
    this._globalDir = ['root/Contact','root/Picture','root/Video','root/Document','root/Music','root/Other'];
    this._getFiles = {};
    this._musicPicture ={};
    this._videoPicture = {};
    this._showFilesBytag = [];
    this._imgReady;
    this._copiedFilepath = '';
    this._showNormal = [0,0,0,0,0,0];
    this._pictureContentReady = false;
    this._currentCategory = ['contact','picture','video','document','music','other'];
    this._wantFiles = ['contact','Picture','Video','Document','Music','Other'];
    this._contentIds = ['contact','pictureContent','videoContent','documentContent','musicContent','otherContent'];
    this._contentIdsList = ['contactList','pictureContentList','videoContentList','documentContentList','musicContentList','otherContentList'];
    this._contentIdsSortByTime = ['contactSortByTime','pictureContentSortByTime','videoContentSortByTime','documentContentSortByTime','musicContentSortByTime','otherContentSortByTime'];
    this._choice = $('<div>',{
      'id':'choice'
    });
    this._showContent = $('<div>',{
      'id':'showContent',
      'style':'overflow:auto'
    });
    $("#contentDiv").append(this._choice);
    $("#contentDiv").append(this._showContent);
    this.setChoice();
    this.setDataContextMenu();
    _globalSelf = this 
  },

  setDocumentContextMenu:function(id_){
    contextMenu.addCtxMenu([
      {header: 'document menu'},
      {text:'New Text',action:function(){

      }},
      {text:'New Document',action:function(){

      }},
      {text:'New PPT',action:function(){

      }},
      {text:'New Excel',action:function(){

      }},
    ]);
    contextMenu.attachToMenu('#'+id_,
      contextMenu.getMenuByHeader('document menu'),
      function(){});
  },

  setDataContextMenu:function(){
    contextMenu.addCtxMenu([
      {header: 'data menu'},
      {text:'Open',action:function(){
        console.log(_globalSelf._contextMenuDivID);
      }},
      {text:'Rename',action:function(){

      }},
      {text:'Delete',action:function(){

      }},
      {text:'Tag', subMenu:[
        {header: 'tag'},
        {text: 'Add',action:function(){

        }},
        {text: 'Remove', action:function(){

        }}
      ]},
      {text: 'Detail',action:function(){

      }}
    ]);
  },

  attachDataMenu:function(id_){
    contextMenu.attachToMenu('#'+id_,
      contextMenu.getMenuByHeader('data menu'),
      function(ID_){
        _globalSelf._contextMenuDivID = ID_;
      }
    );
  },

  //此函数用来设置选择界面看按照哪种方式显示
  setChoice:function(){
    var showlistButton = $('<div>',{
      'id':'showlistButton',
      'class':'showlistButton'
    });
    var line = $('<div>',{
      'id':'line',
    });
    var shownormalButton = $('<div>',{
      'id':'_shownormalButton',
      'class':'normalButtonFocus shownormalButton'
    });
    var sortbyButton = $('<div>',{
      'id':'sortbyButton',
      'text':'sortby'
    });
    this._choice.append(showlistButton);
    this._choice.append(line);
    this._choice.append(shownormalButton);
    this._choice.append(sortbyButton);
    showlistButton.click(function(){
      shownormalButton.removeClass('normalButtonFocus');
      showlistButton.addClass('showlistButtonFocus');
      _globalSelf._showNormal[_globalSelf._index] = 1;
      _globalSelf.showFile();
    });
    shownormalButton.click(function(){
      showlistButton.removeClass('showlistButtonFocus');
      shownormalButton.addClass('normalButtonFocus');
      _globalSelf._showNormal[_globalSelf._index] = 0;
      _globalSelf.showFile();
    });
    sortbyButton.click(function(){
      _globalSelf._showNormal[_globalSelf._index] = 2;
      _globalSelf.showFile();
    });
  },
  
  //此函数用来初始化index的值，看传入的index是多少，从而判断到底是需要展示什么文件
  setIndex:function(index_){
    if (typeof index_ === 'number' && index_ >0 && index_ <6) {
      this._index = index_;
      this._showFilesBytag = [];
    }
    _globalSelf.showFile();
  },

  //此函数就是外面调用函数的接口，在初始化函数和index之后，直接调用此函数就会显示.
  showFile:function(){
    _globalSelf._choice.show();
    _globalSelf._showContent.show();
    _globalSelf._showContent.children().hide();
    if(!this._getFiles[this._index]){
      DataAPI.getAllDataByCate(this.getCallBackData,this._wantFiles[this._index]);
    }
    else{
      //判断要使用那种方式展示，0代表正常，1代表表格，2代表按时间排序
      switch(this._showNormal[this._index]){
        case 0:
          if($('#'+this._contentIds[this._index]).children('div') .length >0){
            if(this._index ==1){
              $('#outWaterFall').show();
            }
            $('#'+this._contentIds[this._index]).show();
          }
          else{
            var sortByTime = $('#'+this._contentIdsSortByTime[this._index]).children('div');
            for(var i =0;i<sortByTime.length;i++){
              var sortByTimeDiv = sortByTime.eq(i).children('div');
              for(var j=0;j<sortByTimeDiv.length;j++){
                var div = sortByTimeDiv.eq(j);
                if(this._index ==1){
                  div.removeClass('pictureContainer');
                  var pictureDiv = div.children('div').eq(0);
                  pictureDiv.removeClass('pictureHolder');
                  pictureDiv.attr('class', 'pictureHolderWaterFall');
                  var pDiv = div.children('p');
                  pDiv.removeClass('picturedescription');
                  pDiv.addClass('picturedescriptionWaterFall');
                  div.addClass('pictureContainerWaterFall');
                }
                $('#'+this._contentIds[this._index]).append(div);
              }
            }
            $('#'+ this._contentIdsSortByTime[this._index]).remove();
            $('#outWaterFall').show();
            $('#'+this._contentIds[this._index]).show();
          }
          if(this._index ==1){
              $('#'+this._contentIds[this._index]).BlocksIt({
                numOfCol:5
            }); 
          }
          if(this._index ==2){
              $('#'+this._contentIds[this._index]).attr('class', 'videoContent');; 
          }
          break;
        case 1:
            if($('#'+ this._contentIdsList[this._index]).children('div').length >0){
              $('#'+ this._contentIdsList[this._index]).show();
            }
            else {
              _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index]));
              if(_globalSelf._showFilesBytag.length >0){
                _globalSelf.showFileByTag(_globalSelf._showFilesBytag);
              }
            }
            break;
        case 2:
            if($('#'+ this._contentIdsSortByTime[this._index]).children('div').length >0){
              $('#'+ this._contentIdsSortByTime[this._index]).show();
            }
            else {
              var fileDivs = $('#'+this._contentIds[this._index]).children('div');
              var returnshow = _globalSelf.showFilesSortByTime(fileDivs);
              returnshow.attr('id', _globalSelf._contentIdsSortByTime[_globalSelf._index]);
              if(this._index ==2){
                returnshow.attr('class', 'videoContent');; 
              }
              var sortByTimeDivs = returnshow.children('.sortByTime');
              for(var i =0;i<sortByTimeDivs.length;i++){
                var sortByTimeDiv = sortByTimeDivs.eq(i);
                if(_globalSelf._showFilesBytag.length >0 && sortByTimeDiv.children('.showFileByTag').length == 0){
                  sortByTimeDiv.hide();
                }
              }
              _globalSelf._showContent.append(returnshow);
              if(this._index ==1 && _globalSelf._showFilesBytag.length >0){
                _globalSelf.showFileByTag(_globalSelf._showFilesBytag);
              }
            }
            break;
        default:
      }
    } 
  },

  //此函数就是外面调用函数的接口，传入想要展示的文件的URI信息，然后进行展示.
  showFileByTag:function(fileURIS){
    _globalSelf._showFilesBytag = fileURIS;
    for(var i =0;i<fileURIS.length;i++){
      var fileURI = fileURIS[i].replace('#','').replace('#','');
      var div = $("#"+fileURI+'div');
      var tr = $("#"+fileURI+'tr');
      div.addClass('showFileByTag');
      tr.addClass('showFileByTag');
    }
    div.siblings('div:not(.showFileByTag)').hide();
    tr.siblings('tr:not(.showFileByTag)').hide();
    var divParent = div.parent('.sortByTime');
    if(divParent.length >0){
      var sortBytimeDivs = divParent.parent('div').children('.sortByTime');
      for(var i =0;i<sortBytimeDivs.length;i++){
        var sortByTimeDiv = sortBytimeDivs.eq(i).children('div');
        for(var j =0;j<sortByTimeDiv.length;j++){
          var innerDiv = sortByTimeDiv.eq(j);
          if(innerDiv.attr('class').indexOf('showFileByTag') == -1){
            innerDiv.hide();
          }
        }
        if(sortBytimeDivs.eq(i).children('.showFileByTag').length == 0){
          sortBytimeDivs.eq(i).hide();
        }
      }
    }
    if(_globalSelf._index ==1){
      $('#'+this._contentIds[this._index]).BlocksIt({
        numOfCol:5
      }); 
    }
  },

  //回调函数，用来获得数据库中的所有的数据，获得的是json的格式，从而对json进行操作。
  getCallBackData:function(files){
    _globalSelf._getFiles[_globalSelf._index] = files;
    _globalSelf._imgReady = files.length;
    var returnContent = _globalSelf.showFilesNormal(files);
    returnContent.attr('id',_globalSelf._contentIds[_globalSelf._index]);
    if(_globalSelf._index ==2){
      returnContent.attr('class', 'videoContent');
    }
    if(_globalSelf._index ==1){
      var outWaterFall = $('<div>',{
        'id':'outWaterFall'
      });
      outWaterFall.append(returnContent);
      _globalSelf._showContent.append(outWaterFall);
    }
    else{
      _globalSelf._showContent.append(returnContent);
    }
    if (_globalSelf._contentIds[_globalSelf._index] === 'documentContent') {
      _globalSelf.setDocumentContextMenu(_globalSelf._contentIds[_globalSelf._index]);
    };
  },

  //此函数用来通过一个div的URI信息找到具体的文件，方便以后打开时或者加标签等使用
  findURIByDiv:function(div){
    var divId = div.attr('id');
    var URILength = _globalSelf._getFiles[_globalSelf._index][0]['URI'].length -2;
    var URI = divId.substr(divId.indexOf('rio'),URILength);
    return URI;
  },

  //此函数用来通过一个div的URI信息找到具体的文件，方便以后打开时或者加标签等使用
  findFileByURI:function(URI){
    var all = _globalSelf._getFiles[_globalSelf._index];
    var file = false;
    if(all.length){
      for(var i =0;i<all.length;i++){
        if(all[i]['URI'] && all[i]['URI'].replace('#','').replace('#','') == URI){
          file = all[i];
          break;
        }
      }
    }
    return file;
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
          genDiv.append('<br>');
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
  
  //此函数用来获得音乐的专辑图片，并且保存在本地
  getMusicPicData:function(file){
    DataAPI.getMusicPicData(function(err,result){
      if(err){
        window.alert(err);
      }
      else{
        var musciPictureSrc = 'data:image/jpeg;base64,' + result;
        _globalSelf._musicPicture[file['path']] = musciPictureSrc;
        var filep = document.getElementById(file['URI']);
        filep.src = musciPictureSrc;
      }
    },file['path']);  
  },

  //此函数用来获得视频截图图片，并且保存在本地
  getVideoPicData:function(file){
    DataAPI.getVideoThumbnail(function(err,result){
      if(err){
        console.log(err);
      }
      else{
        var videoPictureSrc = 'data:image/jpeg;base64,' + result;
        _globalSelf._videoPicture[file['path']] = videoPictureSrc;
        var fileImg = document.getElementById(file['URI']);
        fileImg.src = videoPictureSrc;
      }
    },file['path']);  
  },

  //此函数用来获得在列表显示时的表头信息。就是想要表现的的是什么及表头信息,返回的是一个数组
  getShowMessage:function(){
    var theadMessage = [];
    theadMessage.push('filename');
    theadMessage.push('lastModifyTime');
    theadMessage.push('size');
    theadMessage.push('createTime');
    return theadMessage;
  },

  //此函数用来绑定一些单击双击事件
  addClickEvent:function(jQueryElement,whichClass){
    //一个JQuery元素代表的是一系列文件
    this.files = jQueryElement;
    //增加单击和右击事件,1是单击，3是右击
    this.files.delegate(whichClass,'mousedown',function(e){
      switch(e.which){
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
      }
    });
    //绑定双击事件
    this.files.delegate(whichClass,'dblclick',function(e){
      var fileModifyURI = _globalSelf.findURIByDiv($(this));
      _globalSelf.openFileByUri(fileModifyURI);
    });
  },

  //此函数用来打开一个文件，传入的是文件的URI，传入的是自己修改过的，把#去掉的
  openFileByUri:function(modifyURI_){
    var file = _globalSelf.findFileByURI(modifyURI_);
    if(!file){
      window.alert('the file is not found');
    }
    else{
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
  },

  //此函数用来对文件重命名，传入的是文件的对应的div的ID，因为也要找到名字存在的位置然后产生inputer
  //还要把本地的获取的文件的名字修改，同时所有现存的div的名字选项也要修改
  renameFileByDivId:function(DivId_){
    var modifyURI = _globalSelf.findURIByDiv($('#'+DivId_));
    var file = _globalSelf.findFileByURI(modifyURI);
    if(!file){
      window.alert('the file is not found');
    }
    else{
      if(_globalSelf._showNormal[_globalSelf._index] == 1){
        var renameTh = $('#'+DivId_).children('th').eq(0);
        if(_globalSelf._index == 3){
          var rename = renameTh.children('p');
        }
        else{
          var rename = renameTh;
        }
      }
      else {
        var rename = $('#'+DivId_).children('p')
      }
      var inputer = Inputer.create('button-name');
      var options = {
        'left': rename.offset().left,
        'top': rename.offset().top,
        'width': 80,
        'height': 25,
        'oldtext': file['filename'],
        'callback': function(newtext){
          DataAPI.renameDataByUri(_globalSelf._currentCategory[_globalSelf._index], 
            file['URI'], newtext+'.'+file['postfix'], 
            function(err, result){
              if(result == 'success'){
                $('#'+modifyURI+'div').children('p').html(newtext);
                if(_globalSelf._index ==3){
                  $('#'+modifyURI+'tr').children('th').eq(0).children('p').html(newtext);
                }
                else{
                  $('#'+modifyURI+'tr').children('th').eq(0).html(newtext);
                }
                for(var i =0;i<_globalSelf._getFiles[_globalSelf._index].length;i++){
                  if(_globalSelf._getFiles[_globalSelf._index][i]['URI'] == file['URI']){
                    _globalSelf._getFiles[_globalSelf._index][i]['filename'] = newtext;
                  break;
                  }
                }
              }
              else{
                window.alert("Rename failed!");
              }
          });
        }
      }
      inputer.show(options); 
    }
  },

  //此函数用来删除一个文件，传入的是文件的URI，传入的是自己修改过的，把#去掉的,
  //删除以后还要进行本地的一些操作，把有的div给删除掉，本地的获取文件也删除掉
  deleteFileByUri:function(modifyURI_){
    var file = _globalSelf.findFileByURI(modifyURI_);
    if(!file){
      window.alert('the file is not found');
    }
    else{
      DataAPI.rmDataByUri(function(err,result){
        if(result == 'success'){
          for(var i =0;i<_globalSelf._getFiles[_globalSelf._index].length;i++){
            if(_globalSelf._getFiles[_globalSelf._index][i]['URI'] == file['URI']){
              _globalSelf._getFiles[_globalSelf._index].splice(i,1);
              break;
            }
          }
          $("#"+modifyURI_+'div').remove();
          $("#"+modifyURI_+'tr').remove();
        }
        else{
          window.alert('Delete file failed');
        }
      },file['URI']);
    }
  },

  //此函数用来转换时间
  changeDate:function(changedate){
    var date = new Date(changedate);
    return date.toLocaleDateString() + date.toLocaleTimeString();
  },

  //此函数用来算时间差，然后按照时间排序
  dateDifference:function(file){
    var lastModifyTime = new Date(file['lastModifyTime']);
    var lastAccessTime = new Date(file['lastAccessTime']);
    var createTime = new Date(file['createTime']);
    var today = new Date();
    if(lastModifyTime > lastAccessTime){
      if(lastModifyTime > createTime){
        var dateDifference = (today- lastModifyTime)/(60*60*1000);
      }
      else {
        var dateDifference = (today- createTime)/(60*60*1000);
      }
    }
    else{
      if(lastAccessTime > createTime){
        var dateDifference = (today- lastAccessTime)/(60*60*1000);
      }
      else {
        var dateDifference = (today- createTime)/(60*60*1000);
      }
    }
    return dateDifference;
  },

  //此函数用来列表输出所有的文件，包括图片，音乐，视频和文档.
  showFilesList:function(files){
    if(!files.length){
      return '';
    }
    //此函数用来获得表格内容的信息，输入是一个文件和要展示的表头信息.返回的是一个文档的tr。
    function GenerateBodyTr(file,theadMessage){
      var bodytr = $('<tr>',{
        'id':file['URI'].replace('#','').replace('#','')+'tr',
        'class':'bodytr'
      });
      for(var i =0;i<theadMessage.length;i++){
        switch(i){
          case 0:
            if(_globalSelf._index == 3){
              var thP = $('<P>',{
                'text':file[theadMessage[i]]
              });
              var thPicture = $('<img>',{
                'style':'float:left',
                'src':'icons/'+_globalSelf.setIcon(file['postfix'])+'.png'
              });
              var thName = $('<th>');
              thName.append(thPicture);
              thName.append('</br>');
              thName.append(thP);
              bodytr.append(thName);
            }
            else{
              var th = $('<th>',{
                'text':file[theadMessage[i]]
              });
              bodytr.append(th);
            }
            break;
          case 1:
            bodytr.append($('<th>'+_globalSelf.changeDate(file[theadMessage[i]])+ '</th>'));
            break;
          case 2:
            bodytr.append($('<th>'+file[theadMessage[i]] + '</th>'));
            break;
          case 3:
            bodytr.append($('<th>'+_globalSelf.changeDate(file[theadMessage[i]]) + '</th>'));
            break;
          default:
            window.alert('The theadMessage does not exist.');
            break;
        }
      }
      _globalSelf.attachDataMenu(bodytr[0].id);
      return bodytr;
    }
    

    //整个div中的信息用表格来显示，其中thead是表头，tbody代表表格内的具体内容,表头和表主体放在了两个表格里，为了表头固定
    var tableHead = $('<table>',{
      'class':'tableHead',
      "cellspacing":'0',
      'width':'100%'
    });
     var tableBody = $('<table>',{
      'class':'tableBody',
      "cellspacing":'0',
      'width':'100%'
    });
    var thead = $('<thead></thead>');
    var tbody = $('<tbody></tbody>');
    //设置表头的信息
    var theadtr = $('<tr></tr>');
    var theadMessage = this.getShowMessage();
    theadtr.append($('<th>Name</th>'));
    theadtr.append($('<th>Date Modified</th>'));
    theadtr.append($('<th>Size</th>'));
    theadtr.append($('<th>Date Added</th>'));
    theadtr.addClass('theadtr');
    thead.append(theadtr);
    //设置表格内具体内容
    for(var i =0;i<files.length;i++){
      tbody.append(GenerateBodyTr(files[i],theadMessage));
    }
    tableHead.append(thead);
    tableBody.append(tbody);
    var returnContent = $('<div>',{
      'class':'tableContainer'
    });
    var returnHeadContent = $('<div>',{
      'class':'returnTableHead'
    });
    var returnBodyContent = $('<div>',{
      'class':'returnTableBody'
    });
    returnContent.append(returnHeadContent);
    returnContent.append(returnBodyContent);
    returnHeadContent.append(tableHead);
    returnBodyContent.append(tableBody);
    _globalSelf.addClickEvent(returnContent,'.bodytr');
    return returnContent;
  },

  //此函数用来按照时间排序来显示文档，音乐，图片和视频信息,其中div是按照正常的时候的div。
  showFilesSortByTime:function(Divs){
    var returnContent = $('<div>',{
      'overflow':'auto'
    });
    var today = $('<div>',{
      'class':'sortByTime'
    });
    var previous7Days = $('<div>',{
      'class':'sortByTime'
    });
    var previous30Days = $('<div>',{
      'class':'sortByTime'
    });
    var previousOneYear = $('<div>',{
      'class':'sortByTime'
    });
    var todaySpan = $('<span>',{
      'text':'Today'
    });
    var previous7DaysSpan = $('<span>',{
      'text':'previous7Days'
    });
    var previous30DaysSpan = $('<span>',{
      'text':'previous30Days'
    });
    var previousOneYearSpan = $('<span>',{
      'text':'previousOneYear'
    });
    today.append(todaySpan);
    previous7Days.append(previous7DaysSpan);
    previous30Days.append(previous30DaysSpan);
    previousOneYear.append(previousOneYearSpan);
    for(var i =0;i<Divs.length;i++){
      var div = Divs.eq(i);
      if(_globalSelf._index == 1){
        div.removeClass('pictureContainerWaterFall')
        div[0].style.cssText = '';
        var pictureDiv = div.children('div').eq(0);
        pictureDiv.removeClass('pictureHolderWaterFall');
        pictureDiv.attr('class', 'pictureHolder');
        var pDiv = div.children('p');
        pDiv.removeClass('picturedescriptionWaterFall');
        pDiv.addClass('picturedescription');
        div.addClass('pictureContainer');
      }
      var fileURI = _globalSelf.findURIByDiv(div);
      var file = _globalSelf.findFileByURI(fileURI);
      var timeDifference = _globalSelf.dateDifference(file);
      if(timeDifference >=0 && timeDifference <=24){
        today.append(div);
      }
      else if(timeDifference>24 && timeDifference <=24*7){
        previous7Days.append(div);
      }
      else if(timeDifference >24*7 && timeDifference <24*30){
        previous30Days.append(div);
      }
      else {
        previousOneYear.append(div);
      }
    }
    if(today.children('div').length ==0 ){
      today.hide();
    }
    if(previous7Days.children('div').length ==0 ){
      previous7Days.hide();
    }
    if(previous30Days.children('div').length ==0){
      previous30Days.hide();
    }
    if(previousOneYear.children('div').length ==0){
      previousOneYear.hide();
    }
    returnContent.append(today);
    returnContent.append(previous7Days);
    returnContent.append(previous30Days);
    returnContent.append(previousOneYear);
    _globalSelf.addClickEvent(returnContent,'.pictureContainer');
    _globalSelf.addClickEvent(returnContent,'.videoContainer');
    _globalSelf.addClickEvent(returnContent,'.musicContainer');
    _globalSelf.addClickEvent(returnContent,'.doc-icon');
    return returnContent;
  },

  //此函数是刚开始的默认展示方式，就是瀑布流的展示方式，其中主要是图片和视频，因为文档和音乐的图标都一样，所以展示不出效果
  showFilesNormal:function(files){
    var returnContent = $('<div style= "overflow:auto"></div>');
    for(var i =0;i<files.length;i++){
      var file = files[i];
      switch(_globalSelf._index){
        case 1:
          var Container = $('<div>',{
            'id':file['URI'].replace('#','').replace('#','')+'div',
            'class':'pictureContainerWaterFall',
            'draggable': true
          });
          var Holder = $('<div>',{
            'class':'pictureHolderWaterFall'
          });
          //用来定义最后描述的名字.
          var description = $('<p>',{
            'class':'picturedescriptionWaterFall',
            'text':file['filename']
          });
          Holder.append($('<img src="' + file['path'] + '" draggable=false></img>'));
          Container.append(Holder);
          Container.append(description);
          returnContent.append(Container);
          returnContent.hide();
          Holder.children('img')[0].onload = function(){
            _globalSelf._imgReady = _globalSelf._imgReady - 1;
            if(_globalSelf._imgReady ==0){
              returnContent.show();
              $('#pictureContent').BlocksIt({
                numOfCol:5
              });
            }
          };
          _globalSelf.bindDrag(Container[0]);
          _globalSelf.attachDataMenu(Container[0].id);
          break;
        case 2:
          var Container = $('<div>',{
            'id':file['URI'].replace('#','').replace('#','')+'div',
            'class':'videoContainer',
            'draggable': true
          });
          var Holder = $('<div>',{
            'class':'videoHolder'
          });
          //用来定义最后描述的名字.
          var description = $('<p>',{
            'class':'videodescription',
            'text':file['filename']
          });
          var img = $('<img>',{
            'id':file['URI'],
            'draggable':false
          });
          _globalSelf.getVideoPicData(file);
          Holder.append(img);
          Container.append(Holder);
          Container.append(description);
          returnContent.append(Container);
          _globalSelf.bindDrag(Container[0]);
          _globalSelf.attachDataMenu(Container[0].id);
          break;
        case 3:
          var Container = $('<div>',{
            'id':file['URI'].replace('#','').replace('#','')+'div',
            'class':'doc-icon',
            'draggable': true
          });
          var img = $('<img>',{
            'src':'icons/'+_globalSelf.setIcon(file['postfix'])+'.png',
            'draggable':false
          });
          Container.append(img);
          var p = $('<p>',{
            'text':file['filename']
          });
          Container.append(p);
          returnContent.append(Container);
          _globalSelf.bindDrag(Container[0]);
          _globalSelf.attachDataMenu(Container[0].id);
          break;
        case 4:
          _globalSelf.getMusicPicData(file);
          var Container = $('<div>',{
            'id':file['URI'].replace('#','').replace('#','')+'div',
            'class':'musicContainer',
            'draggable': true
          });
          var Holder = $('<div>',{
            'class':'musicHolder',
            'draggable':false
          });
          //用来定义最后描述的名字.
          var description = $('<p>',{
            'class':'musicdescription',
            'text':file['filename']
          });
          var musicImg = $('<img>',{
             'id':file['URI'],
             'draggable':false
          });
          Holder.append(musicImg);
          Container.append(Holder);
          Container.append(description);
          returnContent.append(Container);
          _globalSelf.bindDrag(Container[0]);
          _globalSelf.attachDataMenu(Container[0].id);
          break;
        case 5:
          var Container = $('<div>',{
            'id':file['URI'].replace('#','').replace('#','')+'div',
            'class':'doc-icon',
            'draggable': true
          });
          var img = $('<img>',{
            'src':'icons/Other.png',
            'draggable':false
          });
          Container.append(img);
          var p = $('<p>',{
            'text':file['filename']
          });
          Container.append(p);
          returnContent.append(Container);
          _globalSelf.bindDrag(Container[0]);
          _globalSelf.attachDataMenu(Container[0].id);
          break;
        default:
      }
    }
    _globalSelf.addClickEvent(returnContent,'.pictureContainerWaterFall');
    _globalSelf.addClickEvent(returnContent,'.videoContainer');
    _globalSelf.addClickEvent(returnContent,'.musicContainer');
    _globalSelf.addClickEvent(returnContent,'.doc-icon');
    return returnContent;
  },
  
  //根据后缀名设置文档类型.
  setIcon:function(postfix_){
    switch(postfix_){
      case 'ppt':
        return 'powerpoint';
      case 'pptx':
        return 'powerpoint';
      case 'none':
        return 'Other';
      case 'txt':
        return 'text';
      case 'xlsx':
        return 'excel';
      case 'xls':
        return 'excel';
      case 'et':
        return 'excel';
      case 'ods':
        return 'excel';
      case 'docx':
        return 'word';
      case 'doc':
        return 'word';
      case 'wps':
        return 'word';
      case 'ogg':
        return 'Videos';
      case 'mp3':
        return 'Music'
      case 'jpg':
        return 'Pictures';
      case 'png':
        return 'Pictures';
      case 'html5ppt':
        return 'html5ppt'
      case 'pdf':
        return 'pdf'
      case 'odt':
        return 'odt'
      case 'html':
        return 'html'
      case 'zip':
        return 'zip';
      case 'sh':
        return 'sh';
      case 'gz':
        return 'gz';
      default:
        return 'Other';
    }
  },

  bindDrag:function(file_){
    file_.ondragstart = function(ev){
      $(ev.currentTarget).fadeTo(0,0.4);
      $(ev.currentTarget).fadeTo(20,1);
      ev.dataTransfer.setData('uri',_globalSelf.findURIByDiv($(ev.currentTarget)));
      ev.dataTransfer.setData('category',_globalSelf._currentCategory[_globalSelf._index]);
    }
  }
})
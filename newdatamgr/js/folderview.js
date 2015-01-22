var ShowFiles = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    this._contextMenuDivID = '';
    this._propertyView = PropertyView.create();
    this._globalSelf;
    this._getFiles = {};
    this._showFilesBytag = false;
    this._showFilesBytagUris = [];
    this._imgReady;
    this._showNormal = [0,0,0,0,0,0,0];
    this._pictureContentReady = false;
    this._currentCategory = ['contact','picture','video','document','music','other','picture'];
    this._contentIds = ['contact','pictureContent','videoContent','documentContent','musicContent','otherContent','deleteContent'];
    this._contentIdsList = ['contactList','pictureContentList','videoContentList','documentContentList','musicContentList','otherContentList','deleteContentList'];
    this._contentIdsSortByTime = ['contactSortByTime','pictureContentSortByTime','videoContentSortByTime','documentContentSortByTime','musicContentSortByTime','otherContentSortByTime','deleteContenSortByTime'];
    this._choice = $('<div>',{
      'id':'choice'
    });
    this._showContent = $('<div>',{
      'id':'showContent',
      'class':'nanoshowContent'
    });
    $("#contentDiv").append(this._choice);
    $("#contentDiv").append(this._showContent);
    this.setChoice();
    this.setDataContextMenu();
    this.setDeletedFilesContextMenu();
    this._choice.hide();
    this._showContent.hide();
    _globalSelf = this 
  },

  setDocumentContextMenu:function(id_){
    contextMenu.addCtxMenu([
      {header: 'document menu'},
      {text:'新建文本文档',action:function(){

      }},
      {text:'新建文档',action:function(){

      }},
      {text:'新建PPT',action:function(){

      }},
      {text:'新建Excel',action:function(){

      }},
    ]);
    contextMenu.attachToMenu('#'+id_,
      contextMenu.getMenuByHeader('document menu'),
      function(){});
  },

  setDataContextMenu:function(){
    contextMenu.addCtxMenu([
      {header: 'data menu'},
      {text:'打开',action:function(){
        var divId = _globalSelf._contextMenuDivID;
        var URILength = _globalSelf._getFiles[_globalSelf._index][0]['URI'].length;
        var modifyURI = divId.substr(divId.indexOf('rio'),URILength);
        var file = basic.findFileByURI(modifyURI,_globalSelf._getFiles[_globalSelf._index]);
        basic.openFile(file);
      }},
      {text:'重命名',action:function(){
        _globalSelf.renameFileByDivId(_globalSelf._contextMenuDivID);
      }},
      {text:'删除',action:function(){
        var divId = _globalSelf._contextMenuDivID;
        var URILength = _globalSelf._getFiles[_globalSelf._index][0]['URI'].length;
        var modifyURI = divId.substr(divId.indexOf('rio'),URILength);
        _globalSelf.deleteFileByUri(modifyURI);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
      }},
      {text:'标签', subMenu:[
        {header: 'tag'},
        {text: '增加',action:function(){
          var _id = _globalSelf._contextMenuDivID;
          var _uri= basic.modifyUriToUri(_globalSelf.getModifyUriById(_id));
          var _target = _globalSelf._showContent.find('#'+_id);
          basic.addTagView(_target,_uri,'no-contact');
        }},
        {text: '删除', action:function(){
          var _id = _globalSelf._contextMenuDivID;
          var _uri= basic.modifyUriToUri(_globalSelf.getModifyUriById(_id));
          var _target = _globalSelf._showContent.find('#'+_id);
          basic.removeTagView(_target,_uri,'no-contact');
        }}
      ]},
      {text: '详细信息',action:function(){
        var _id = _globalSelf._contextMenuDivID;
        var _modifyUri = _globalSelf.getModifyUriById(_id);
        var _file = basic.findFileByURI(_modifyUri,_globalSelf._getFiles[_globalSelf._index]);
        _globalSelf._propertyView.loadData(_file);
        var _img = $('#'+_modifyUri+'div').find('img');
        _globalSelf._propertyView.setImg(_img[0].src);
      }}
    ]);
  },

  deleteDivByDivID:function(divId_){
    var URILength = _globalSelf._getFiles[_globalSelf._index][0]['URI'].length;
    var modifyURI = divId_.substr(divId_.indexOf('rio'),URILength);
    var file;
    for(var i =0;i<_globalSelf._getFiles[_globalSelf._index].length;i++){
      if(_globalSelf._getFiles[_globalSelf._index][i]['URI'] == basic.modifyUriToUri(modifyURI)){
        file = _globalSelf._getFiles[_globalSelf._index][i];
        _globalSelf._getFiles[_globalSelf._index].splice(i,1);
        break;
      }
    }
    $("#"+modifyURI+'divdeleted').remove();
    $("#"+modifyURI+'trdeleted').remove();
    return file;
  },

  setDeletedFilesContextMenu:function(){
    contextMenu.addCtxMenu([
      {header: 'deleted file'},
      {text:'恢复',action:function(){
        var file = _globalSelf.deleteDivByDivID(_globalSelf._contextMenuDivID);
        _globalSelf.refreshByPath(file['path']);
        //此处只是把当前的展示的文件恢复到本地展示，还需要把后台数据库的文件删除状体进行修改.保存了你要修改的文件的json格式，file就是.   
      }},
      {text:'确认删除',action:function(){
        var file = _globalSelf.deleteDivByDivID(_globalSelf._contextMenuDivID);  
        //此处只是把当前的展示的文件删除，还需要把后台数据库的文件删除.保存了你要删除的文件的json格式，file就是.

      }}
    ]);
  },

  getModifyUriById:function(id_){
    var _modifyUri = '';
    if(id_.substr(id_.length-3,3) === 'div'){
      _modifyUri = id_.substr(0,id_.length-3);
    }else if(id_.substr(id_.length-2,2) === 'tr'){
      _modifyUri = id_.substr(0,id_.length - 2);
    }
    return _modifyUri;
  },

  attachDataMenu:function(id_,header_){
    contextMenu.attachToMenu('#'+id_,
      contextMenu.getMenuByHeader(header_),
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
      'text':'按时间排序'
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
    if (typeof index_ === 'number' && index_ >0 && index_ <7) {
      this._index = index_;
      this._showFilesBytag = false;
    }
    _globalSelf.showFile();
  },

  //此函数就是外面调用函数的接口，在初始化函数和index之后，直接调用此函数就会显示.
  showFile:function(){
    _globalSelf._choice.show();
    _globalSelf._showContent.show();
    _globalSelf._showContent.children().hide();
    if(!this._getFiles[this._index]){
      DataAPI.getAllDataByCate(this.getCallBackData,this._currentCategory[this._index]);
    }
    else{
      infoList.searchTag(_params);
      //判断要使用那种方式展示，0代表正常，1代表表格，2代表按时间排序
      switch(this._showNormal[this._index]){
        case 0:
          $('#showlistButton').removeClass('showlistButtonFocus');
          $('#_shownormalButton').addClass('normalButtonFocus');
          if($('#'+this._contentIds[this._index]).children('div').length >0){
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
                  var pictureDiv = div.children('.pictureHolder').eq(0);
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
            if(this._index ==1){
              $('#outWaterFall').show();
            }
            $('#'+this._contentIds[this._index]).show();
            if(_globalSelf.showFileByTag && this._index ==1){
              var showFileByTag = $('#pictureContent').find('.showFileByTag');
              var notShowFileByTag = $('#pictureContent').find('.pictureContainerWaterFall:not(.showFileByTag)');
              $('#pictureContent').children('div').remove();
              $('#pictureContent').append(showFileByTag).append(notShowFileByTag);
              _globalSelf.refreshWaterFall();
            }  
          }
          if(!_globalSelf._showFilesBytag){
            if(this._index ==1){
              var pictureWaterFall = $('#pictureContent').find('.pictureContainerWaterFall');
              $('#pictureContent').children('div').remove();
              $('#pictureContent').append(pictureWaterFall.show());
              _globalSelf.refreshWaterFall();
            }
            $('#'+this._contentIds[this._index]).children('div').show();
          }
          var refreshDiv = $('#'+this._contentIds[this._index]).find('.refreshDiv');
          if(this._index == 1 && refreshDiv.length>0){
            refreshDiv.removeClass('refreshDiv');
            _globalSelf.refreshWaterFall();
          }
          if(this._index ==2){
            $('#'+this._contentIds[this._index]).attr('class', 'videoContent');; 
          }
          $(".nanoshowContent").nanoScroller();
          break;
        case 1:
          $('#_shownormalButton').removeClass('normalButtonFocus');
          $('#showlistButton').addClass('showlistButtonFocus');
          if($('#'+ this._contentIdsList[this._index]).children('div').length >0){
            $('#'+ this._contentIdsList[this._index]).show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index]));
          }
          if(_globalSelf._showFilesBytag){
            _globalSelf.showFileByTag(_globalSelf._showFilesBytagUris);
          }
          else{
            $('.bodytr').show();
          }
          $('.returnTableBody').nanoScroller();
          break;
        case 2:
          $('#showlistButton').removeClass('showlistButtonFocus');
          $('#_shownormalButton').addClass('normalButtonFocus');
          if($('#'+ this._contentIdsSortByTime[this._index]).children('div').length >0){
            $('#'+ this._contentIdsSortByTime[this._index]).show();
          }
          else {
            if(this._index ==1){
              var fileDivs = $('#'+this._contentIds[this._index]).find('.pictureContainerWaterFall');
              $('#'+this._contentIds[this._index]).children('div').remove();
            }
            else{
              var fileDivs = $('#'+this._contentIds[this._index]).children('div');
            }
            var returnshow = _globalSelf.showFilesSortByTime(fileDivs);
            returnshow.attr('id', _globalSelf._contentIdsSortByTime[_globalSelf._index]);
            if(this._index ==2){
              returnshow.attr('class', 'videoContent');; 
            }
            var sortByTimeDivs = returnshow.children('.sortByTime');
            for(var i =0;i<sortByTimeDivs.length;i++){
              var sortByTimeDiv = sortByTimeDivs.eq(i);
              if(_globalSelf._showFilesBytag && sortByTimeDiv.children('.showFileByTag').length == 0){
                sortByTimeDiv.hide();
              }
            }
            _globalSelf._showContent.append(returnshow);
            if(this._index ==1 && _globalSelf._showFilesBytag){
              _globalSelf.showFileByTag(_globalSelf._showFilesBytagUris);
            }
            returnshow.addClass('nano-content');
          }
          if(!_globalSelf._showFilesBytag){
            var sortByTimeDivs = $('#'+ this._contentIdsSortByTime[this._index]).children('div');
            for(var i =0;i<sortByTimeDivs.length;i++){
              var sortByTimeDiv = sortByTimeDivs.eq(i);
              if(sortByTimeDiv.children('div').length > 0){
                sortByTimeDiv.children('div').show();
                sortByTimeDiv.show();
              }
            }
          }
          $('.nanoshowContent').nanoScroller();
          break;
        default:
      }
    }
  },

  //此函数用来等窗口的大小改变之后，来刷新瀑布流的显示
  refreshWaterFall:function(){
    $('#pictureContent').gridalicious({
      gutter:20,
      width:300,
      animate:true,
      animationOptions:{
        speed:150,
        duration:400,
        complete:function(data){
          $(".nanoshowContent").nanoScroller();
        }
      },
    });
  },

  //此函数就是外面调用函数的接口，传入想要展示的文件的URI信息，然后进行展示.
  showFileByTag:function(fileURIS){
    _globalSelf._showFilesBytag = true;
    _globalSelf._showFilesBytagUris = fileURIS;
    $('.showFileByTag').removeClass('showFileByTag');
    if(fileURIS.length >0){
      for(var i =0;i<fileURIS.length;i++){
        var fileURI = basic.uriToModifyUri(fileURIS[i]);
        var div = $('#showContent').find('#'+fileURI+'div');
        var tr = $("#"+fileURI+'tr');
        div.addClass('showFileByTag').show();
        tr.addClass('showFileByTag').show();
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
          else{
            sortBytimeDivs.eq(i).show();
          }
        }
      }
      if(_globalSelf._index ==1 && _globalSelf._showNormal[1] == 0){
        var showFileByTag =$('#pictureContent').find('.showFileByTag');
        var notShowFileByTag = $('#pictureContent').find('.pictureContainerWaterFall:not(.showFileByTag)');
        $('#pictureContent').children('div').remove();
        $('#pictureContent').append(showFileByTag);
        $('#pictureContent').append(notShowFileByTag.hide());
        _globalSelf.refreshWaterFall();
      }
    }
    else{
      $('#'+_globalSelf._contentIds[_globalSelf._index]).children('div').hide();
      $('.bodytr').hide();
      $('.sortByTime').hide();
      $('.sortByTime').children('div').hide();
    }
  },

  //此函数用来刷新当前展示的文件.
  refreshByCategory:function(){
    $('#'+ _globalSelf._contentIdsList[_globalSelf._index]).remove();
    $('#'+ _globalSelf._contentIds[_globalSelf._index]).remove();
    $('#'+ _globalSelf._contentIdsSortByTime[_globalSelf._index]).remove();
    if(_globalSelf._index ==1){
      $('#outWaterFall').remove();
    }
    _globalSelf._getFiles[_globalSelf._index] = '';
    _globalSelf.showFile();
  },

  //此函数用来刷新特有的一个文件,传入一个文件路径，获取所有信息，并且添加显示.
  refreshByPath:function(filePath_){
    DataAPI.getDataByPath(function(file_){
      var file = file_[0];
      var category = file['URI'].substring(file['URI'].lastIndexOf('#')+1,file['URI'].length);
      var index = $.inArray(category, _globalSelf._currentCategory);
      if(_globalSelf._getFiles[index]){
        for(var i =0;i<_globalSelf._getFiles[index].length;i++){
          if(_globalSelf._getFiles[index][i]['URI'] == file['URI']){
            _globalSelf._getFiles[index].splice(i,1);
            break;
          }
        }
        _globalSelf._getFiles[index].push(file);
        $('#'+basic.uriToModifyUri(file['URI'])+'div').remove();
        $('#'+basic.uriToModifyUri(file['URI'])+'tr').remove();
        _globalSelf._getFiles[index].push(file);
        switch(index){
          case 1:
            var Container = _globalSelf.generateWaterFallDiv(file);
            break;
          case 2:
            var Container = _globalSelf.generateVideoDiv(file);
            break;
          case 3:
            var Container = _globalSelf.generateDocumentOtherDiv(file);
            break;
          case 4:
            var Container = _globalSelf.generateMusicDiv(file);
            break;
          case 5:
            var Container = _globalSelf.generateDocumentOtherDiv(file);
            break;
          default:
        }
        if($('#'+_globalSelf._contentIds[index]).children('div') .length >0){
          if(index == 1){
            var pictureWaterFall = $('#pictureContent').find('.pictureContainerWaterFall');
            $('#pictureContent').children('div').remove();
            $('#pictureContent').append(Container);
            $('#pictureContent').append(pictureWaterFall);
          }
          else{
            $('#'+_globalSelf._contentIds[index]).prepend(Container);
          }
        }
        if($('#'+ _globalSelf._contentIdsSortByTime[index]).children('div').length >0){
          var sortByTimeDivs = $('#'+ _globalSelf._contentIdsSortByTime[index]).children('div');
          var timeDifference = _globalSelf.dateDifference(file);
          if(timeDifference >=0 && timeDifference <=24){
            sortByTimeDivs.eq(0).prepend(Container);
          }
          else if(timeDifference>24 && timeDifference <=24*7){
            sortByTimeDivs.eq(1).prepend(Container);
          }
          else if(timeDifference >24*7 && timeDifference <24*30){
            sortByTimeDivs.eq(2).prepend(Container);
          }
          else {
            sortByTimeDivs.eq(3).prepend(Container);
          }
        }
        if($('#'+ _globalSelf._contentIdsList[index]).children('div').length >0){
          var theadMessage = _globalSelf.getShowMessage();
          var refreshTr = _globalSelf.generateBodyTr(file,theadMessage);
          refreshTr.addClass('refreshTr');
          var tableBody =$('#'+ _globalSelf._contentIdsList[index]).children('.returnTableBody');
          var tbody = tableBody.children('.tableBody').children('tbody');
          tbody.prepend(refreshTr);
        }
      }
    },filePath_);
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
        'id':'outWaterFall',
        'class':'nano-content'
      });
      outWaterFall.append(returnContent);
      _globalSelf._showContent.append(outWaterFall);
    }
    else{
      returnContent.addClass('nano-content');
      _globalSelf._showContent.append(returnContent);
      $(".nanoshowContent").nanoScroller();
    }
    if (_globalSelf._contentIds[_globalSelf._index] === 'documentContent') {
      _globalSelf.setDocumentContextMenu(_globalSelf._contentIds[_globalSelf._index]);
    };
    infoList.searchTag(_params);
  },

  //此函数用来通过一个div的URI信息找到具体的文件，方便以后打开时或者加标签等使用
  findURIByDiv:function(div){
    var divId = div.attr('id');
    var URILength = _globalSelf._getFiles[_globalSelf._index][0]['URI'].length;
    var modifyURI = divId.substr(divId.indexOf('rio'),URILength);
    return modifyURI;
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
                    if(_globalSelf._index != 6){
                      _globalSelf.deleteFileByUri(modifyURI_);  
                    }
                  }
                  else if(e.which == 113){
                    //按下F2键，表示要重命名
                    if(_globalSelf._index !=6){
                      _globalSelf.renameFileByDivId($(this).attr('id')); 
                    }
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
    if(_globalSelf._index != 6){
      this.files.delegate(whichClass,'dblclick',function(e){
        var fileModifyURI = _globalSelf.findURIByDiv($(this));
        var file = basic.findFileByURI(fileModifyURI,_globalSelf._getFiles[_globalSelf._index]);
        if(file){
          basic.openFile(file);
        }
        else{
          window.alert('what are you gong!!!');
        }
      });
    }
  },

  //此函数用来对文件重命名，传入的是文件的对应的div的ID，因为也要找到名字存在的位置然后产生inputer
  //还要把本地的获取的文件的名字修改，同时所有现存的div的名字选项也要修改
  renameFileByDivId:function(DivId_){
    var modifyURI = _globalSelf.findURIByDiv($('#'+DivId_));
    var file = basic.findFileByURI(modifyURI,_globalSelf._getFiles[_globalSelf._index]);
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
        var selectDiv = $('#showContent').find('#'+DivId_);
        var rename = selectDiv.children('p')
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
    var file = basic.findFileByURI(modifyURI_,_globalSelf._getFiles[_globalSelf._index]);
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
          if(_globalSelf._index ==1 && _globalSelf._showNormal[1] ==0){
            //查看是否瀑布流删除之后进行操作，待定？
          }
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

  //此函数用来获得表格内容的信息，输入是一个文件和要展示的表头信息.返回的是一个文档的tr。
  generateBodyTr:function(file,theadMessage){
    if(_globalSelf._index !=6){
      var bodytr = $('<tr>',{
        'id':basic.uriToModifyUri(file['URI'])+'tr',
        'class':'bodytr'
      });
    }
    else{
      var bodytr = $('<tr>',{
        'id':basic.uriToModifyUri(file['URI'])+'trdeleted',
        'class':'bodytr'
      });
    }
    for(var i =0;i<theadMessage.length;i++){
      switch(i){
        case 0:
          if(_globalSelf._index == 3){
            var thP = $('<P>',{
              'text':file[theadMessage[i]],
              'title':file[theadMessage[i]]
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
    if(_globalSelf._index ==6){
      _globalSelf.attachDataMenu(bodytr[0].id,'deleted file');
    }
    else{
      _globalSelf.attachDataMenu(bodytr[0].id,'data menu');
    }
    return bodytr;
  },

  //此函数用来列表输出所有的文件，包括图片，音乐，视频和文档.
  showFilesList:function(files){
    if(!files.length){
      return '';
    }    
    //整个div中的信息用表格来显示，其中thead是表头，tbody代表表格内的具体内容,表头和表主体放在了两个表格里，为了表头固定
    var tableHead = $('<table>',{
      'class':'tableHead',
      "cellspacing":'0',
      'width':'100%'
    });
    var nanoTableBody = $('<div>',{
      'class':'nano-content'
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
    theadtr.append($('<th>名称</th>'));
    theadtr.append($('<th>修改日期</th>'));
    theadtr.append($('<th>大小</th>'));
    theadtr.append($('<th>添加时间</th>'));
    theadtr.addClass('theadtr');
    thead.append(theadtr);
    //设置表格内具体内容
    for(var i =0;i<files.length;i++){
      tbody.append(_globalSelf.generateBodyTr(files[i],theadMessage));
    }
    tableHead.append(thead);
    tableBody.append(tbody);
    nanoTableBody.append(tableBody);
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
    returnBodyContent.append(nanoTableBody);
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
      'text':'今天'
    });
    var previous7DaysSpan = $('<span>',{
      'text':'7天以内'
    });
    var previous30DaysSpan = $('<span>',{
      'text':'一个月以内'
    });
    var previousOneYearSpan = $('<span>',{
      'text':'一年以内'
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
        var pictureDiv = div.children('.pictureHolderWaterFall');
        pictureDiv.removeClass('pictureHolderWaterFall');
        pictureDiv.attr('class', 'pictureHolder');
        var picture = pictureDiv.children('img')[0];
        picture.style.cssText = '';
        var pDiv = div.children('p');
        pDiv.removeClass('picturedescriptionWaterFall');
        pDiv.addClass('picturedescription');
        div.addClass('pictureContainer');
      }
      var fileURI = _globalSelf.findURIByDiv(div);
      var file = basic.findFileByURI(fileURI,_globalSelf._getFiles[_globalSelf._index]);
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
  
  //根据传来的file，产生要展现的div。
  generateWaterFallDiv:function(file){
    var Container = $('<div>',{
      'id':basic.uriToModifyUri(file['URI'])+'div',
      'class':'pictureContainerWaterFall',
      'draggable': true
    });
    var Holder = $('<div>',{
      'class':'pictureHolderWaterFall'
    });
    //用来定义最后描述的名字.
    var description = $('<p>',{
      'class':'picturedescriptionWaterFall',
      'text':file['filename'],
      'title':file['filename']
    });
    Holder.append($('<img src="' + file['path'] + '" draggable=false></img>'));
    Container.append(Holder);
    Container.append(description);
    _globalSelf.bindDrag(Container[0]);
    var _tagView = TagView.create({
      position: 'listview',
      category: 'picture',
      background_color: 'rgb(110,204,188)',
      max:3
    });
    _tagView.setParent(Container,file['URI']);
    _tagView.addTags(file['others'].split(','));
    _tagView.bindDrop(Container[0]);
    _globalSelf.attachDataMenu(Container[0].id,'data menu');

    return Container;
  },

  generateVideoDiv:function(file){
    var Container = $('<div>',{
      'id':basic.uriToModifyUri(file['URI'])+'div',
      'class':'videoContainer',
      'draggable': true
    });
    var Holder = $('<div>',{
      'class':'videoHolder'
    });
    //用来定义最后描述的名字.
    var description = $('<p>',{
      'class':'videodescription',
      'text':file['filename'],
      'title':file['filename']
    });
    var img = $('<img>',{
      'id':file['URI']+'showvideo',
      'draggable':false
    });
    basic.getVideoPicData(file,img.attr('id'));
    Holder.append(img);
    Container.append(Holder);
    Container.append(description);
    _globalSelf.bindDrag(Container[0]);
    var _tagView = TagView.create({
      position: 'listview',
      category: 'video',
      background_color: 'rgb(132,204,117)',
      max:3
    });
    _tagView.setParent(Container,file['URI']);
    _tagView.addTags(file['others'].split(','));
    _tagView.bindDrop(Container[0]);
    _globalSelf.attachDataMenu(Container[0].id,'data menu');

    return Container;
  },

  generateMusicDiv:function(file){
    var Container = $('<div>',{
      'id':basic.uriToModifyUri(file['URI'])+'div',
      'class':'musicContainer',
      'draggable': true
    });
    var Holder = $('<div>',{
      'class':'musicHolder',
      'draggable':false
    });
    var tagHolder = $('<div>',{
      'class':'tagHolder'
    });
    //用来定义最后描述的名字.
    var description = $('<p>',{
      'class':'musicdescription',
      'text':file['filename']
    });
    var musicImg = $('<img>',{
       'id':file['URI']+'showMusicPic',
       'draggable':false
    });
    basic.getMusicPicData(file,musicImg.attr('id'));
    Holder.append(musicImg);
    Holder.append(tagHolder);
    Container.append(Holder);
    Container.append(description);
    _globalSelf.bindDrag(Container[0]);
    var _tagView = TagView.create({
      position: 'listview',
      category: 'music',
      background_color: 'rgb(237,148,148)',
      max:3
    });
    _tagView.setParent(tagHolder,file['URI']);
    _tagView.addTags(file['others'].split(','));
    _tagView.bindDrop(tagHolder[0]);
    _globalSelf.attachDataMenu(Container[0].id,'data menu');

    return Container;
  },

  generateDocumentOtherDiv:function(file){
    var Container = $('<div>',{
      'id':basic.uriToModifyUri(file['URI'])+'div',
      'class':'doc-icon',
      'draggable': true
    });
    var img = $('<img>',{
      'src':'icons/'+_globalSelf.setIcon(file['postfix'])+'.png',
      'draggable':false
    });
    Container.append(img);
    var p = $('<p>',{
      'text':file['filename'],
      'title':file['filename']
    });
    Container.append(p);
    var _tagView = TagView.create({
      position: 'listview',
      background_color: 'rgb(120,78,100)',
      max:0
    });
    _tagView.setParent(Container,file['URI']);
    _tagView.addTags(file['others'].split(','));
    _tagView.bindDrop(Container[0]);
    _globalSelf.bindDrag(Container[0]);
    _globalSelf.attachDataMenu(Container[0].id,'data menu');

    return Container;
  },

  generateDeletedFilesDiv:function(file){
    var Container = $('<div>',{
      'id':basic.uriToModifyUri(file['URI'])+'divdeleted',
      'class':'doc-icon deleted',
      'draggable': true
    });
    var img = $('<img>',{
      'src':'icons/'+_globalSelf.setIcon(file['postfix'])+'.png',
      'class':'deletedFile',
      'draggable':false
    });
    Container.append(img);
    var p = $('<p>',{
      'text':file['filename'],
      'title':file['filename']
    });
    Container.append(p);
    var _tagView = TagView.create({
      position: 'listview',
      background_color: 'rgb(120,78,100)',
      max:0
    });
    _tagView.setParent(Container,file['URI']);
    _tagView.addTags(file['others'].split(','));
    _tagView.bindDrop(Container[0]);
    _globalSelf.bindDrag(Container[0]);
    _globalSelf.attachDataMenu(Container[0].id,'deleted file');

    return Container;
  },

  //此函数是刚开始的默认展示方式，就是瀑布流的展示方式，其中主要是图片和视频，因为文档和音乐的图标都一样，所以展示不出效果
  showFilesNormal:function(files){
    $('#showlistButton').removeClass('showlistButtonFocus');
    $('#_shownormalButton').addClass('normalButtonFocus');
    var returnContent = $('<div style= "overflow-x:hidden"></div>');
    for(var i =0;i<files.length;i++){
      var file = files[i];
      switch(_globalSelf._index){
        case 1:
          var Container = _globalSelf.generateWaterFallDiv(file);
          returnContent.append(Container);
          returnContent.hide();
          Container.find('img')[0].onload = function(){
            _globalSelf._imgReady = _globalSelf._imgReady - 1;
            if(_globalSelf._imgReady ==0){
              returnContent.show();
              _globalSelf.refreshWaterFall();
            }
          };
          break;
        case 2:
          var Container = _globalSelf.generateVideoDiv(file);
          returnContent.append(Container);
          break;
        case 3:
          var Container = _globalSelf.generateDocumentOtherDiv(file);
          returnContent.append(Container);
          break;
        case 4:
          var Container = _globalSelf.generateMusicDiv(file);
          returnContent.append(Container);
          break;
        case 5:
          var Container = _globalSelf.generateDocumentOtherDiv(file);
          returnContent.append(Container);
          break;
        case 6:
          var Container = _globalSelf.generateDeletedFilesDiv(file);
          returnContent.append(Container);
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
    var _this = this;
    var _tags = undefined;
    file_.ondragstart = function(ev){
      $(ev.currentTarget).fadeTo(0,0.4);
      $(ev.currentTarget).fadeTo(20,1);
      var _uri = ev.currentTarget.id.substring(0,ev.currentTarget.id.length-3);
      ev.dataTransfer.setData('uri',basic.modifyUriToUri(_uri));
      ev.dataTransfer.setData('category',_globalSelf._currentCategory[_globalSelf._index]);
      _tags = $(ev.currentTarget).find('.tag-container');
      _tags.hide();
      _tags.show(10);
    }
  }
})

var ShowFiles = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    this._globalSelf;
    this._globalDir;
    this._fileArchJson = {};
    this._getFiles = {};
    this._copiedFilepath = '';
    this._showNormal = true;
    this._contentIds = ['contact','pictureContent','videoContent','documentContent','musicContent'];
    this._contentIdsList = ['contactList','pictureContentList','videoContentList','documentContentList','musicContentList'];
    this._choice = $('<div id = "choice"></div>');
    this._showContent = $('<div id = "showContent" style= "overflow:auto"></div>');
    $("#contentDiv").append(this._choice);
    $("#contentDiv").append(this._showContent);   
    this.set_Choice();
    _globalSelf = this;
  },

  //此函数用来设置选择界面看按照哪种方式显示
  set_Choice:function(){
    var showlistButton = $('<div id = "showlistButton" class="showlistButton"> </div>');
    //var linebetweenButton = &('<div id = "linebetweenButton"> </div>');
    var _shownormalButton = $('<div id = "_shownormalButton" class="_shownormalButton _shownormalButtonFocus"> </div>');
    var sortbyButton = $('<div id = "sortbyButton">sortby </div>');
    this._choice.append(showlistButton);
    //this._choice.append(linebetweenButton);
    this._choice.append(_shownormalButton);
    this._choice.append(sortbyButton);
    showlistButton.click(function(){
      _shownormalButton.removeClass('_shownormalButtonFocus');
      showlistButton.addClass('showlistButtonFocus');
      _globalSelf._showNormal = false;
      _globalSelf.showFile();
    });
    _shownormalButton.click(function(){
      showlistButton.removeClass('showlistButtonFocus');
      _shownormalButton.addClass('_shownormalButtonFocus');
      _globalSelf._showNormal = true;
      _globalSelf.showFile();
    })
  },
  
  //此函数用来初始化index的值，看传入的index是多少，从而判断到底是需要展示什么文件
  setIndex:function(index_){
    if (typeof index_ === 'number' && index_ >0 && index_ <5) {
      this._index = index_;
    }
    this.showFile();
  },

  //此函数就是外面调用函数的接口，在初始化函数和index之后，直接调用此函数就会显示.
  showFile:function(){
    _globalSelf._choice.show();
    _globalSelf._showContent.show();
    _globalSelf._showContent.children().hide();
    if (this._index == 1){
      //所请求的是图片，显示图片
      if(!this._getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Picture');
      }
      else {
        if(this._showNormal){
          if($("#pictureContent").length>0){
            $("#pictureContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#pictureContentList").length>0){
            $("#pictureContentList").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index])); 
          }
        }
      }
    }
    else if(this._index == 2){
      //所请求的是视频，显示视频
      if(!this._getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Video');
      }
      else {
        if(this._showNormal){
          if($("#videoContent").length>0){
            $("#videoContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#videoContentList").length>0){
            $("#videoContentList").show();
          }
          else {
          _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index])); 
          }
        }
      }
    }
    else if(this._index ==3){
      //所请求的是文档，显示文档
      if(!this._getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Document');
      }
      else {
        if(this._showNormal){
          if($("#documentContent").length>0){
            $("#documentContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#documentContentList").length>0){
            $("#documentContentList").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index])); 
          }
        }
      }
    }
    else if(this._index ==4){
      //所请求的是音乐，显示音乐
      if(!this._getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Music');
      }
      else {
        if(this._showNormal){
          if($("#musicContent").length>0){
            $("#musicContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#musicContentList").length>0){
            $("#musicContentList").show();
          }
          else {
          _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index])); 
          }
        }
      }
    }
  },

  //回调函数，用来获得数据库中的所有的数据，获得的是json的格式，从而对json进行操作。
  getCallBackData:function(data_json){
    console.log('data from server: ', data_json);
    var category = '';
    for(var i=0; i<data_json.length; i++){
      if(data_json[i].hasOwnProperty('type')){
        category = 'root';
      }else if(data_json[i].hasOwnProperty('URI') && data_json[i]['URI'].lastIndexOf('#') != -1){
        category = data_json[i]['URI'].substring(data_json[i]['URI'].lastIndexOf('#')+1, data_json[i]['URI'].length);
      }else if(data_json[i].hasOwnProperty('device_id')){
        category = 'devices';
      }
      switch(category){
        case 'root':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = 'root/'+data_json[i]['type'];
          data_json[i]['props']['name'] = data_json[i]['type'];
          data_json[i]['props']['type'] = 'folder';
          data_json[i]['props']['icon'] = 'folder';          
          break;
        case 'contact':
          data_json[i]['props'] = {};
          //data_json[i]['img'] = data_json[i]['photoPath'];
          data_json[i]['props']['path'] = 'root/Contact/'+data_json[i]['name']+'.contacts';
          data_json[i]['props']['name'] = data_json[i]['name'];
          data_json[i]['props']['type'] = 'contact';
          data_json[i]['props']['icon'] = 'Contacts';
          break;
        case 'picture':
          data_json[i]['props'] = {};
          data_json[i]['props']['img'] = data_json[i]['path'];
          data_json[i]['props']['path'] = 'root/Picture/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];      
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = _globalSelf.setIcon(data_json[i]['postfix']);;
          break;
        case 'video':
          data_json[i]['props'] = {};
          data_json[i]['props']['video'] = data_json[i]['path'];
          data_json[i]['props']['path'] = 'root/Video/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];          
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = _globalSelf.setIcon(data_json[i]['postfix']);
          break;
        case 'document':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = 'root/Document/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];   
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = _globalSelf.setIcon(data_json[i]['postfix']);
          break;
        case 'music':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = 'root/Music/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];           
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = _globalSelf.setIcon(data_json[i]['postfix']);
          break;
        case 'devices':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = _globalDir+'/'+data_json[i]['name']+'.device';
          data_json[i]['props']['name'] = data_json[i]['name'];           
          data_json[i]['props']['type'] = 'device';
          data_json[i]['props']['icon'] = 'Devices';
          break;
        default:
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = _globalDir+'/'+data_json[i]['filename'];
          data_json[i]['props']['name'] = data_json[i]['filename'];           
          data_json[i]['props']['type'] = 'other';
          data_json[i]['props']['icon'] = _globalSelf.setIcon(data_json[i]['postfix']);
          break;
      }
    }
    _globalSelf._getFiles[_globalSelf._index] = data_json;
    if(_globalSelf._showNormal){
      _globalSelf._showContent.append(_globalSelf.showFilesNormal(data_json).attr('id',_globalSelf._contentIds[_globalSelf._index]));   
    }
    else {
      _globalSelf._showContent.append(_globalSelf.showFilesList(data_json).attr('id',_globalSelf._contentIdsList[_globalSelf._index]));
    }

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

  //此函数用来列表输出所有的文件，包括图片，音乐，视频和文档.
  showFilesList:function(files){
    if(!files.length){
      return '';
    }
    //此函数用来获得表格内容的信息，输入是一个文件和要展示的表头信息.返回的是一个文档的tr。
    function GenerateBodyTr(file,theadMessage){
      var bodytr = $('<tr></tr>');
      for(var i =0;i<theadMessage.length;i++){
        bodytr.append($('<th>'+file[theadMessage[i]] + '</th>'));
      }
      bodytr.mousedown(function(e){
        e.stopPropagation();
      });

      return bodytr;
    }
    //整个div中的信息用表格来显示，其中thead是表头，tbody代表表格内的具体内容.
    var table = $('<table cellspacing="0" width="100%"></table>');
    var thead = $('<thead></thead>');
    var tbody = $('<tbody></tbody>');
    //设置表头的信息
    var theadtr = $('<tr></tr>');
    var theadMessage = this.getShowMessage();
    for(var i = 0;i<theadMessage.length;i++){
      theadtr.append($('<th>'+ theadMessage[i] + '</th>'));
    }
    theadtr.addClass('theadtr');
    thead.append(theadtr);
    //设置表格内具体内容
    for(var i =0;i<files.length;i++){
      tbody.append(GenerateBodyTr(files[i],theadMessage));
    }
    table.append(thead);
    table.append(tbody);
    var returnContent = $('<div style= "overflow:auto"></div>');
    returnContent.append(table);
    return returnContent;
  },

  //此函数用来正常的显示文档，音乐，图片和视频信息。
  showFilesNormal:function(files){
    var returnContent = $('<div style= "overflow:auto"></div>');
    for(var i =0;i<files.length;i++){
      var file = files[i];
      var outContainer = $('<div class="outContainer" data-path="'+file['props'].path +'"></div>)');
      var Holder = $('<div class = "Holder"></div>');
      //用来定义最后描述的名字.
      if(file['props'].name.indexOf(' ') != -1 ||
         file['props'].name.indexOf('\'' != -1)){
        var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
        var description = $('<div class="description">'+file['props'].name+'</div>');
      }else{
        var description = $('<div class="description">'+file['props'].name+'</div>');
      } 
      if(file['props'].img){
        Holder.append($('<img src="' + file['props'].img + '"></img>'));
        outContainer.append(Holder);
        outContainer.append(description);
        returnContent.append(outContainer);
      }
      else if(file['props'].video){
        Holder.append($('<video src="' + file['props'].video + '"></video>'));
        outContainer.append(Holder);
        outContainer.append(description);
        returnContent.append(outContainer);
      }
      else {
        var fileContainer = $('<div class="doc-icon" data-path="' + file['props'].path + '"></div>');
        fileContainer.append($('<img src="icons/' + file['props'].icon + '.png"></img>'));
        if(file['props'].name.indexOf(' ') != -1 ||
           file['props'].name.indexOf('\'' != -1)){
          var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
          fileContainer.append($('<p id="'+ id +'">' + file['props'].name + '</p>'));
        }else{
          fileContainer.append($('<p id="'+ file['props'].name +'">' + file['props'].name + '</p>'));
        }
        returnContent.append(fileContainer);
      }
    }
    return returnContent;
  },

  //根据后缀名设置文档类型.
  setIcon:function(postfix_){
    switch(postfix_){
      case 'ppt':
        return 'powerpoint';
      case 'pptx':
        return 'powerpoint';
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
      default:
        return 'Documents';
    }
  }
})
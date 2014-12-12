var ShowFiles = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    this._globalSelf;
    this._globalDir;
    this._getFiles = {};
    this._imgReady;
    this._copiedFilepath = '';
    this._showNormal = true;
    this._pictureContentReady = false;
    this._contentIds = ['contact','pictureContent','videoContent','documentContent','musicContent'];
    this._contentIdsList = ['contactList','pictureContentList','videoContentList','documentContentList','musicContentList'];
    this._choice = $('<div id = "choice"></div>');
    this._showContent = $('<div id = "showContent" style= "overflow:auto"></div>');
    $("#contentDiv").append(this._choice);
    $("#contentDiv").append(this._showContent);
    this.setChoice();
    _globalSelf = this 
  },

  //此函数用来设置选择界面看按照哪种方式显示
  setChoice:function(){
    var showlistButton = $('<div id = "showlistButton" class="showlistButton"> </div>');
    //var linebetweenButton = &('<div id = "linebetweenButton"> </div>');
    var shownormalButton = $('<div id = "shownormalButton" class="shownormalButton shownormalButtonFocus"> </div>');
    var sortbyButton = $('<div id = "sortbyButton">sortby </div>');
    this._choice.append(showlistButton);
    //this._choice.append(linebetweenButton);
    this._choice.append(shownormalButton);
    this._choice.append(sortbyButton);
    showlistButton.click(function(){
      shownormalButton.removeClass('shownormalButtonFocus');
      showlistButton.addClass('showlistButtonFocus');
      _globalSelf._showNormal = false;
      _globalSelf.showFile();
    });
    shownormalButton.click(function(){
      showlistButton.removeClass('showlistButtonFocus');
      shownormalButton.addClass('shownormalButtonFocus');
      _globalSelf._showNormal = true;
      _globalSelf.showFile();
    });
    sortbyButton.click(function(){
      _globalSelf._showContent.show();
      _globalSelf._showContent.children().hide();
      _globalSelf._showContent.append(_globalSelf.showFilesSortByTime(_globalSelf._getFiles[_globalSelf._index]));
    });
  },
  
  //此函数用来初始化index的值，看传入的index是多少，从而判断到底是需要展示什么文件
  setIndex:function(index_){
    if (typeof index_ === 'number' && index_ >0 && index_ <5) {
      this._index = index_;
    }
    _globalSelf.showFile();
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
          if($("#pictureContent").children('div').length>0){
            $("#pictureContent").show();
            $('#pictureContent').BlocksIt({
              numOfCol: 5,
            });
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#pictureContentList").children('table').length>0){
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
          if($("#videoContent").children('div').length>0){
            $("#videoContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#videoContentList").children('table').length>0){
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
          if($("#documentContent").children('div').length>0){
            $("#documentContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {
          if ($("#documentContentList").children('table').length>0){
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
          if($("#musicContent").children('div').length>0){
            $("#musicContent").show();
          }
          else {
            _globalSelf._showContent.append(_globalSelf.showFilesNormal(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIds[_globalSelf._index]));
          }
        }
        else {

          if ($("#musicContentList").children('table').length>0){
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
  getCallBackData:function(files){
    var category = '';
    for(var i=0; i<files.length; i++){
      if(files[i].hasOwnProperty('type')){
        category = 'root';
      }else if(files[i].hasOwnProperty('URI') && files[i]['URI'].lastIndexOf('#') != -1){
        category = files[i]['URI'].substring(files[i]['URI'].lastIndexOf('#')+1, files[i]['URI'].length);
      }else if(files[i].hasOwnProperty('device_id')){
        category = 'devices';
      }
      switch(category){
        case 'root':
          files[i]['props'] = {};
          files[i]['props']['path'] = 'root/'+files[i]['type'];
          files[i]['props']['name'] = files[i]['type'];
          files[i]['props']['type'] = 'folder';
          files[i]['props']['icon'] = 'folder';          
          break;
        case 'contact':
          files[i]['props'] = {};
          //files[i]['img'] = files[i]['photoPath'];
          files[i]['props']['path'] = 'root/Contact/'+files[i]['name']+'.contacts';
          files[i]['props']['name'] = files[i]['name'];
          files[i]['props']['type'] = 'contact';
          files[i]['props']['icon'] = 'Contacts';
          break;
        case 'picture':
          files[i]['props'] = {};
          files[i]['props']['img'] = files[i]['path'];
          files[i]['props']['path'] = 'root/Picture/'+files[i]['filename']+'.'+files[i]['postfix'];
          files[i]['props']['name'] = files[i]['filename'];      
          files[i]['props']['type'] = 'file';
          files[i]['props']['icon'] = _globalSelf.setIcon(files[i]['postfix']);;
          break;
        case 'video':
          files[i]['props'] = {};
          files[i]['props']['video'] = files[i]['path'];
          files[i]['props']['path'] = 'root/Video/'+files[i]['filename']+'.'+files[i]['postfix'];
          files[i]['props']['name'] = files[i]['filename'];          
          files[i]['props']['type'] = 'file';
          files[i]['props']['icon'] = _globalSelf.setIcon(files[i]['postfix']);
          break;
        case 'document':
          files[i]['props'] = {};
          files[i]['props']['path'] = 'root/Document/'+files[i]['filename']+'.'+files[i]['postfix'];
          files[i]['props']['name'] = files[i]['filename'];   
          files[i]['props']['type'] = 'file';
          files[i]['props']['icon'] = _globalSelf.setIcon(files[i]['postfix']);
          break;
        case 'music':
          files[i]['props'] = {};
          files[i]['props']['path'] = 'root/Music/'+files[i]['filename']+'.'+files[i]['postfix'];
          files[i]['props']['name'] = files[i]['filename'];           
          files[i]['props']['type'] = 'file';
          files[i]['props']['icon'] = _globalSelf.setIcon(files[i]['postfix']);
          break;
        case 'devices':
          files[i]['props'] = {};
          files[i]['props']['path'] = _globalDir+'/'+files[i]['name']+'.device';
          files[i]['props']['name'] = files[i]['name'];           
          files[i]['props']['type'] = 'device';
          files[i]['props']['icon'] = 'Devices';
          break;
        default:
          files[i]['props'] = {};
          files[i]['props']['path'] = _globalDir+'/'+files[i]['filename'];
          files[i]['props']['name'] = files[i]['filename'];           
          files[i]['props']['type'] = 'other';
          files[i]['props']['icon'] = _globalSelf.setIcon(files[i]['postfix']);
          break;
      }
    }
    _globalSelf._getFiles[_globalSelf._index] = files;
    if(_globalSelf._showNormal){
      _globalSelf._imgReady = files.length;
      _globalSelf._showContent.append(_globalSelf.showFilesNormal(files).attr('id',_globalSelf._contentIds[_globalSelf._index]));
    }
    else {
      _globalSelf._showContent.append(_globalSelf.showFilesList(files).attr('id',_globalSelf._contentIdsList[_globalSelf._index]));
    }
  },

  //此函数用来通过文件的路径找到具体的文件，方便以后打开时或者加标签等使用
  findFileByPath:function(filePath){
    var all = _globalSelf._getFiles[_globalSelf._index];
    var file = false;
    if(all.length){
      for(var i =0;i<all.length;i++){
        if(all[i]['path'] && all[i]['path'].indexOf(filePath) != -1){
          file = all[i];
          break;
        }
        if(all[i]['props'].path == filePath){
          file = all[i];
          break;
        }
      }
    }
    return file;
  },

  //次函数用通过文件的id来找到文件
  findFileById:function(fileid){
    var all = _globalSelf._getFiles[_getFiles._index];
    var file = false;
    if(all.length){
      for(var i=0;i<all.length;i++){
        if(all[i].id == fileid){
          file = all[i];
          break;
        }
      }
    }
    return file;
  },

  //此函数用来产生一个和用户交互的界面
  genPopupDialog:function(title, message, files){
    $("#popup_dialog").remove();
    var header_btn = $('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
    var header_title = $('<h4 class="modal-title"></h4>');
    header_title.text(title);
    var header = $('<div class="modal-header"></div>');
    header.append(header_btn).append(header_title);
  
    var body = $('<div class="modal-body"></div>');
    body.html(message);
  
    var footer = $('<div class="modal-footer"></div>');
    var footer_btn = $('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>');
    footer.append(footer_btn);
  
    var content = $('<div class="modal-content"></div>');
    content.append(header);
    content.append(body);
    content.append(footer);
  
    var dialog = $('<div class="modal-dialog"></div>');
    dialog.append(content);
    var div = $('<div id="popup_dialog" class="modal fade" data-backdrop="false"></div>');
    div.append(dialog);
    $('body').append(div);
    $("#popup_dialog").modal('show');
    $('#popup_dialog').on('hidden.bs.modal', function(){
      $(this).remove();
    });
    $('#edit_button').on('click', function(){
      if(files != null){
        $(this).removeData('bs.modal');
        _globalSelf.genEditDialog(files);
      }
      else{
        window.alert("You can not edit this file.");
      }
    });
  },

  //产生一个可以编辑的对话框
  genEditDialog:function(dataJson){
    var file_propery='<form>';
    for(var key in dataJson){
      if(key == 'props' || key == 'URI'){
        continue;
      }
      file_propery += '<p>'+key+':</p> <input id="'+key+'" type="text" size="60" aligin="right" value="'+dataJson[key]+'"/>';
    }
    file_propery += '</form></br>';
    file_propery += '<button type="button" class="btn active" id="save_button" data-dismiss="modal">Save</button>';
    _globalSelf.genPopupDialog('Edit', file_propery);
    $('#save_button').on('click', function(){
      var new_json = {};
      for(var key in dataJson){
        if(key == 'props' || key == 'URI'){
          continue;
        }
        var new_value = document.getElementById(key).value;
        new_json[key] = new_value;
      }
      new_json['category'] = get_category();
      new_json['URI'] = dataJson['URI'];
      DataAPI.updateDataValue(function(result){
        if(result == 'success'){
          window.alert("Saved successfully!");
        }
        else{
          window.alert("Saved failed!");
        }
      }, [new_json]);
    });
  },

  //此函数用来通过json格式找到数据库中的源文件
  cbGetDataSourceFile:function(dataJson){
    if(!dataJson['openmethod'] || !dataJson['content']){
      window.alert('openmethod or content not found.');
      return false;
    }

    var method = dataJson['openmethod'];
    var content = dataJson['content'];
    switch(method){
      case 'alert':
        window.alert(content);
        break;
      case 'html':
        var file_content;
        var format = dataJson['format'];
        switch(format){
          case 'audio':
            file_content = $('<audio controls></audio>');
            file_content.html('<source src=\"' + content + '\"" type="audio/mpeg">');
            break;
          case 'video':
            file_content = $('<video width="400" height="300" controls></video>');
            file_content.html('<source src=\"' + content + '\"" type="video/ogg">');
            break;
          case 'div':
            file_content = content;
            break;
          case 'txtfile':
            file_content = $("<p></p>").load(content);
            break;
          default:
            file_content = content;
            break;
        }

        var title = dataJson['title'];
        if (!dataJson['windowname']){
          _globalSelf.genPopupDialog(title, file_content);
        }
        else{
          _globalSelf.genPopupDialog("窗口控制", "<div>\
              <button type=\"button\" class=\"btn btn-success\" onclick=\"_globalSelf.sendKeyToWindow(\'" + dataJson['windowname'] + "\', \'F5\')\">PLAY</button><br>\
              <button type=\"button\" class=\"btn btn-success\" onclick=\"_globalSelf.sendKeyToWindow(\'" + dataJson['windowname'] + "\', \'Up\')\">UP</button><br>\
              <button type=\"button\" class=\"btn btn-success\" onclick=\"_globalSelf.sendKeyToWindow(\'" + dataJson['windowname'] + "\', \'Down\')\">DOWN</button><br>\
              <button type=\"button\" class=\"btn btn-success\" onclick=\"_globalSelf.sendKeyToWindow(\'" + dataJson['windowname'] + "\', \'Escape\')\">STOP</button><br>\
            </div>");
        }
        break;
      default:
        break;
    }
    return; 
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
    var self = this;
    this.files.delegate(whichClass,'mousedown',function(e){
      switch(e.which){
        case 1:
          $(this).addClass('selected').siblings().removeClass('selected');
          $(this).delegate($(this),'mousedown',function(e){
            console.log("you have left twice ");
          })
          $(this).attr('tabindex', 1).keydown(function(e) {
              if($(this).attr('data-path')){
                var file = _globalSelf.findFileByPath($(this).attr('data-path')); 
              }
              else{
                var file = _globalSelf.findFileByPath($(this).attr('id'));
              }
            if(e.which == 46){
              var toDelete = $(this);
              DataAPI.rmDataByUri(function(err,result){
                if(result == 'success'){
                  toDelete.remove();
                }
                else{
                  window.alert('Delete file failed');
                }
              },file['URI']);
            }
            else {
              console.log("what do you want to do");
            }
          });
          break;
        case 3:
          break;  
      }
      e.stopPropagation();
    });
    this.files.delegate(whichClass,'dblclick',function(e){
      if($(this).attr('data-path')){
        var file = _globalSelf.findFileByPath($(this).attr('data-path')); 
      }
      else{
        var file = _globalSelf.findFileByPath($(this).attr('id'));
      }
      if(!file){
        window.alert('the file is not found !');
        return false;
      }
      if(file.URI.indexOf('#') != -1){
        if(file.postfix == 'pdf'){
          function cbViewPdf(){
            console.log('open pdf with viewer PDF');
          }
          AppAPI.startAppByName(cbViewPdf, "viewerPDF", file.path);
        }
        else {
          DataAPI.openDataByUri(_globalSelf.cbGetDataSourceFile, file.URI);
        }
      }
    });
  },

  //此函数是用来播放PPT时，向桌面发送按键
  sendKeyToWindow:function(windowname,key){
    console.log("sendkey " + key + " To Window " + windowname);
    AppAPI.sendKeyToApp(function(){}, windowname, key);
  },

  //此函数用来转换时间
  changeDate:function(changedate){
    var date = new Date(changedate);
    return date.toLocaleDateString() + date.toLocaleTimeString();
  },

  //此函数用来算时间差，然后按照时间排序
  dateDifference:function(lastModifyTime){
    var date = new Date(lastModifyTime);
    var today = new Date();
    var dateDifference = (today- date)/(60*60*1000);
    return dateDifference;
  },

  //此函数用来列表输出所有的文件，包括图片，音乐，视频和文档.
  showFilesList:function(files){
    if(!files.length){
      return '';
    }
    //此函数用来获得表格内容的信息，输入是一个文件和要展示的表头信息.返回的是一个文档的tr。
    function GenerateBodyTr(file,theadMessage){
      var bodytr = $('<tr id="'+file['path']+'" class= "bodytr"></tr>');
      for(var i =0;i<theadMessage.length;i++){
        //bodytr.append($('<th>'+file[theadMessage[i]] + '</th>'));
        switch(i){
          case 0:
            bodytr.append($('<th>'+file[theadMessage[i]] + '</th>'));
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
      return bodytr;
    }
    //整个div中的信息用表格来显示，其中thead是表头，tbody代表表格内的具体内容.
    var table = $('<table  class="table" cellspacing="0" width="100%"></table>');
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
    table.append(thead);
    table.append(tbody);
    var returnContent = $('<div class = "tableContainer" style= "overflow:auto"></div>');
    returnContent.append(table);
    _globalSelf.addClickEvent(returnContent,'.bodytr');
    return returnContent;
  },

  //此函数用来正常的显示文档，音乐，图片和视频信息。
  showFilesSortByTime:function(files){
    var returnContent = $('<div style= "overflow:auto"></div>');
    var today = $('<div  class = "sortByTime" ></div>');
    var previous7Days = $('<div class = "sortByTime" ></div>');
    var previous30Days = $('<div  class = "sortByTime" ></div>');
    var previousOneYear = $('<div class = "sortByTime" ></div>');
    for(var i =0;i<files.length;i++){
      var file = files[i];
      var timeDifference = _globalSelf.dateDifference(file['lastModifyTime']);
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
        if(timeDifference >=0 && timeDifference <=24){
          today.append(outContainer);
        }
        else if(timeDifference>24 && timeDifference <=24*7){
          previous7Days.append(outContainer);
        }
        else if(timeDifference >24*7 && timeDifference <24*30){
          previous30Days.append(outContainer);
        }
        else {
          previousOneYear.append(outContainer);
        }

      }
      else if(file['props'].video){
        Holder.append($('<video src="' + file['props'].video + '"></video>'));
        outContainer.append(Holder);
        outContainer.append(description);
        //returnContent.append(outContainer);
        if(timeDifference >=0 && timeDifference <=24){
          today.append(outContainer);
        }
        else if(timeDifference>24 && timeDifference <=24*7){
          previous7Days.append(outContainer);
        }
        else if(timeDifference >24*7 && timeDifference <24*30){
          previous30Days.append(outContainer);
        }
        else {
          previousOneYear.append(outContainer);
        }
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
        if(timeDifference >=0 && timeDifference <=24){
          today.append(fileContainer);
        }
        else if(timeDifference>24 && timeDifference <=24*7){
          previous7Days.append(fileContainer);
        }
        else if(timeDifference >24*7 && timeDifference <24*30){
          previous30Days.append(fileContainer);
        }
        else {
          previousOneYear.append(fileContainer);
        }
      }
    }
    if(today.children('div').length ==0){
      today.hide();
    }
    if(previous7Days.children('div').length ==0){
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
    _globalSelf.addClickEvent(returnContent,'.outContainer');
    _globalSelf.addClickEvent(returnContent,'.doc-icon');
    return returnContent;
  },

  //此函数是刚开始的默认展示方式，就是瀑布流的展示方式，其中主要是图片和视频，因为文档和音乐的图标都一样，所以展示不出效果
  showFilesNormal:function(files){
    var returnContent = $('<div class = "returnContent" style= "overflow:auto"></div>');
    for(var i =0;i<files.length;i++){
      var file = files[i];
      var outContainer = $('<div class="outContainerWaterFall" data-path="'+file['props'].path +'"></div>)');
      var Holder = $('<div class = "HolderWaterFall"></div>');
      //用来定义最后描述的名字.
      if(file['props'].name.indexOf(' ') != -1 ||
         file['props'].name.indexOf('\'' != -1)){
        var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
        var description = $('<div class="descriptionWaterFall">'+file['props'].name+'</div>');
      }else{
        var description = $('<div class="descriptionWaterFall">'+file['props'].name+'</div>');
      } 
      if(file['props'].img){
        Holder.append($('<img src="' + file['props'].img + '"></img>'));
        outContainer.append(Holder);
        outContainer.append(description);
        returnContent.append(outContainer);
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
    _globalSelf.addClickEvent(returnContent,'.outContainerWaterFall');
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
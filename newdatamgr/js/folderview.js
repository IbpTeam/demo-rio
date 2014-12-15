var ShowFiles = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    this._globalSelf;
    this._globalDir = ['root/Contact','root/Picture','root/Video','root/Document','root/Music','root/Other'];
    this._getFiles = {};
    this._imgReady;
    this._copiedFilepath = '';
    this._showNormal = [0,0,0,0,0,0];
    this._pictureContentReady = false;
    this._currentCategory = ['contact','picture','video','document','music','other'];
    this._wantFiles = ['contact','Picture','Video','Document','Music','Other'];
    this._contentIds = ['contact','pictureContent','videoContent','documentContent','musicContent','otherContent'];
    this._contentIdsList = ['contactList','pictureContentList','videoContentList','documentContentList','musicContentList','otherContentList'];
    this._contentIdsSortByTime = ['contactSortByTime','pictureContentSortByTime','videoContentSortByTime','documentContentSortByTime','musicContentSortByTime','otherContentSortByTime'];
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
    var shownormalButton = $('<div id = "shownormalButton" class="shownormalButton shownormalButtonFocus"> </div>');
    var sortbyButton = $('<div id = "sortbyButton">sortby </div>');
    this._choice.append(showlistButton);
    this._choice.append(shownormalButton);
    this._choice.append(sortbyButton);
    showlistButton.click(function(){
      shownormalButton.removeClass('shownormalButtonFocus');
      showlistButton.addClass('showlistButtonFocus');
      _globalSelf._showNormal[_globalSelf._index] = 1;
      _globalSelf.showFile();
    });
    shownormalButton.click(function(){
      showlistButton.removeClass('showlistButtonFocus');
      shownormalButton.addClass('shownormalButtonFocus');
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
    if(!this._getFiles[this._index]){
      DataAPI.getAllDataByCate(this.getCallBackData,this._wantFiles[this._index]);
    }
    else{
      //判断要使用那种方式展示，0代表正常，1代表表格，2代表按时间排序
      switch(this._showNormal[this._index]){
        case 0:
          $('#'+this._contentIds[this._index]).show();
          if(this._index ==1){
              $('#'+this._contentIds[this._index]).BlocksIt({
              numOfCol:5
            }); 
          }
          break;
        case 1:
            if($('#'+ this._contentIdsList[this._index]).children('table').length >0){
              $('#'+ this._contentIdsList[this._index]).show();
            }
            else {
              _globalSelf._showContent.append(_globalSelf.showFilesList(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsList[_globalSelf._index]));
            }
            break;
        case 2:
            if($('#'+ this._contentIdsSortByTime[this._index]).children('div').length >0){
              $('#'+ this._contentIdsSortByTime[this._index]).show();
            }
            else {
              _globalSelf._showContent.append(_globalSelf.showFilesSortByTime(_globalSelf._getFiles[_globalSelf._index]).attr('id',_globalSelf._contentIdsSortByTime[_globalSelf._index]));
            }
            break;
        default:
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
          // files[i]['props']['video'] = files[i]['path'];
          files[i]['props']['video'] = 'icons/Videos.png';
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
          files[i]['props']['music'] = 'icons/Music.png';
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
          files[i]['props']['other'] = 'icons/Other.png';
          files[i]['props']['path'] = _globalDir+'/'+files[i]['filename'];
          files[i]['props']['name'] = files[i]['filename'];           
          files[i]['props']['type'] = 'other';
          files[i]['props']['icon'] = _globalSelf.setIcon(files[i]['postfix']);
          break;
      }
    }
    _globalSelf._getFiles[_globalSelf._index] = files;
    _globalSelf._imgReady = files.length;
    _globalSelf._showContent.append(_globalSelf.showFilesNormal(files).attr('id',_globalSelf._contentIds[_globalSelf._index]));
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
  findFileById:function(fileId){
    var all = _globalSelf._getFiles[_getFiles._index];
    var file = false;
    if(all.length){
      for(var i=0;i<all.length;i++){
        if(all[i].id == fileId){
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
  genEditDialog:function(file){
    var editDiv = $('<div></div>');
    var fileForm = $('<form></form>');
    for(var key in file){
      if(key == 'props' || key == 'URI'){
        continue;
      }
      var p = $('<p>'+key+':</p>');
      var input = $('id ="'+key+'" type = "text" size = "60" aligin = "right" value = "'+file[key]+'"/>');
      fileForm.append(p);
      fileForm.append(input);
    }
    editDiv.append(fileForm);
    editDiv.append('</br>');
    var saveButton = $('<button type="button" class="btn active" id="save_button" data-dismiss="modal">Save</button>');
    editDiv.append(saveButton);
    _globalSelf.genPopupDialog('Edit', editDiv);
    $('#save_button').on('click', function(){
      var new_json = {};
      for(var key in file){
        if(key == 'props' || key == 'URI'){
          continue;
        }
        var new_value = document.getElementById(key).value;
        new_json[key] = new_value;
      }
      new_json['category'] = _globalSelf._currentCategory[_globalSelf._index];
      new_json['URI'] = file['URI'];
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
            fileContent = $('<audio controls></audio>');
            fileContent.append('<source src=\"' + content + '\"" type="audio/mpeg">');
            break;
          case 'video':
            fileContent = $('<video width="400" height="300" controls></video>');
            fileContent.append('<source src=\"' + content + '\"" type="video/ogg">');
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
          var F5Button = $('<button type="button" class="btn btn-success">PLAY</button>');
          F5Button.click(function(){
             _globalSelf.sendKeyToWindow(file['windowname'],'F5')
          });
          var UpButton = $('<button type="button" class="btn btn-success">UP</button>');
          UpButton.click(function(){
            _globalSelf.sendKeyToWindow(file['windowname'],'Up')
          });
          var DownButton = $('<button type="button" class="btn btn-success">DOWN</button>');
          DownButton.click(function(){
            _globalSelf.sendKeyToWindow(file['windowname'],'Down')
          });
          var StopButton = $('<button type="button" class="btn btn-success">STOP</button>');
          StopButton.click(function(){
            _globalSelf.sendKeyToWindow(file['windowname'],'Escape')
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
    //增加单击和右击事件,1是单击，3是右击
    this.files.delegate(whichClass,'mousedown',function(e){
      switch(e.which){
        case 1:
          $(this).addClass('selected').siblings().removeClass('selected');
          $(this).delegate($(this),'mousedown',function(e){
          })
          $(this).attr('tabindex', 1).keydown(function(e) {
              if($(this).attr('data-path')){
                var file = _globalSelf.findFileByPath($(this).attr('data-path'));
                var filePath = $(this).attr('data-path'); 
              }
              else{
                var file = _globalSelf.findFileByPath($(this).attr('id'));
                var filePath = $(this).attr('id');
              }
            if(e.which == 46){
              //触发的是键盘的delete事件,表示删除
              var toDelete = $(this);
              DataAPI.rmDataByUri(function(err,result){
                if(result == 'success'){
                  toDelete.remove();
                  for(var i =0;i<_globalSelf._getFiles[_globalSelf._index].length;i++){
                    if(_globalSelf._getFiles[_globalSelf._index][i]['props'].path == filePath){
                      _globalSelf._getFiles[_globalSelf._index].splice(i,1);
                      break;
                    }
                  }
                  if($('#'+ _globalSelf._contentIds[_globalSelf._index]).children('div').length >0){
                    var div = $('#'+ _globalSelf._contentIds[_globalSelf._index]).children('div');
                    for(var i=0;i<div.length;i++){
                      if($(div[i]).attr('data-path') == filePath){
                        $(div[i]).remove();
                      }
                    }
                  }
                  if($('#'+ _globalSelf._contentIdsSortByTime[_globalSelf._index]).children('div').length >0){
                    var timeDifference = _globalSelf.dateDifference(file['lastModifyTime']);
                    var sortDivs = $('#'+ _globalSelf._contentIdsSortByTime[_globalSelf._index]).children('div');
                    var whichDiv = 0;
                    if(timeDifference >=0 && timeDifference <=24){
                      whichDiv =0;
                    }
                    else if(timeDifference>24 && timeDifference <=24*7){
                      whichDiv =1;
                    }
                    else if(timeDifference >24*7 && timeDifference <24*30){
                      whichDiv =2;
                    }
                    else {
                      whichDiv =3;
                    }
                    var div = $(sortDivs[whichDiv]).children('div');
                    for(var i=0;i<div.length;i++){
                      if($(div[i]).attr('data-path') == filePath){
                        $(div[i]).remove();
                      }
                    }
                  }
                  if($('#'+ _globalSelf._contentIdsList[_globalSelf._index]).children('table').length >0){
                    $('table,tr').each(function(index, el) {
                      if($(this).attr('id') == filePath){
                        $(this).remove();
                      }
                    });
                  }
                  _globalSelf.showFile();
                }
                else{
                  window.alert('Delete file failed');
                }
              },file['URI']);
            }
            else if(e.which == 113){
              //按下F2键，表示要重命名
              $("."+file['props'].name).html('Rename')
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
          }
          // AppAPI.startAppByName(cbViewPdf, "viewerPDF", file.path);
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
    });
  },

  //此函数是用来播放PPT时，向桌面发送按键
  sendKeyToWindow:function(windowname,key){
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
      var bodytr = $('<tr id="'+file['props'].path+'" class= "bodytr"></tr>');
      if(file['props'].name.indexOf(' ') != -1 ||
        file['props'].name.indexOf('\'' != -1)){
        var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
      }
      else{
          var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
      }
      for(var i =0;i<theadMessage.length;i++){
        switch(i){
          case 0:
            if(_globalSelf._index == 3 || _globalSelf._index == 5){
              var thP = $('<p class = "'+id +'">'+file[theadMessage[i]]+'</p>');
              var thPicture = $('<img style="float:left" src="icons/' + file['props'].icon + '.png"></img>');
              var thName = $('<th class = "'+_globalSelf._currentCategory[_globalSelf._index]+'"></th>');
              thName.append(thPicture);
              thName.append('</br>');
              thName.append(thP);
              bodytr.append(thName);
            }
            else{
              bodytr.append($('<th class = "'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+id +'">'+file[theadMessage[i]]+ '</th>')); 
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
      switch(_globalSelf._index){
        case 1:
          var Container = $('<div class="pictureContainer" data-path="'+file['props'].path +'"></div>)');
          var Holder = $('<div class = "pictureHolder"></div>');
          //用来定义最后描述的名字.
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            var description = $('<div class="picturedescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">'+file['props'].name+'</div>');
          }else{
            var description = $('<div class="picturedescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">'+file['props'].name+'</div>');
          }
          Holder.append($('<img src="' + file['props'].img + '"></img>'));
          Container.append(Holder);
          Container.append(description);
          if(timeDifference >=0 && timeDifference <=24){
            today.append(Container);
          }
          else if(timeDifference>24 && timeDifference <=24*7){
            previous7Days.append(Container);
          }
          else if(timeDifference >24*7 && timeDifference <24*30){
            previous30Days.append(Container);
          }
          else {
            previousOneYear.append(Container);
          }
          break;
        case 2:
          var Container = $('<div class="videoContainer" data-path="'+file['props'].path +'"></div>)');
          var Holder = $('<div class = "videoHolder"></div>');
          //用来定义最后描述的名字.
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            var description = $('<div class="videodescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">'+file['props'].name+'</div>');
          }else{
            var description = $('<div class="videodescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">'+file['props'].name+'</div>');
          }
          Holder.append($('<img src="' + file['props'].video + '"></img>'));
          Container.append(Holder);
          Container.append(description);
          if(timeDifference >=0 && timeDifference <=24){
            today.append(Container);
          }
          else if(timeDifference>24 && timeDifference <=24*7){
            previous7Days.append(Container);
          }
          else if(timeDifference >24*7 && timeDifference <24*30){
            previous30Days.append(Container);
          }
          else {
            previousOneYear.append(Container);
          }
          break;
        case 3:
          var Container = $('<div class="doc-icon" data-path="' + file['props'].path + '"></div>');
          Container.append($('<img src="icons/' + file['props'].icon + '.png"></img>'));
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">' + file['props'].name + '</p>'));
          }else{
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">' + file['props'].name + '</p>'));
          }
          if(timeDifference >=0 && timeDifference <=24){
            today.append(Container);
          }
          else if(timeDifference>24 && timeDifference <=24*7){
            previous7Days.append(Container);
          }
          else if(timeDifference >24*7 && timeDifference <24*30){
            previous30Days.append(Container);
          }
          else {
            previousOneYear.append(Container);
          }
          break;
        case 4:
          var Container = $('<div class="musicContainer" data-path="'+file['props'].path +'"></div>)');
          var Holder = $('<div class = "musicHolder"></div>');
          //用来定义最后描述的名字.
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            var description = $('<div class="musicdescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">'+file['props'].name+'</div>');
          }else{
            var description = $('<div class="musicdescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">'+file['props'].name+'</div>');
          }
          Holder.append($('<img src="' + file['props'].music + '"></img>'));
          Container.append(Holder);
          Container.append(description);
          if(timeDifference >=0 && timeDifference <=24){
            today.append(Container);
          }
          else if(timeDifference>24 && timeDifference <=24*7){
            previous7Days.append(Container);
          }
          else if(timeDifference >24*7 && timeDifference <24*30){
            previous30Days.append(Container);
          }
          else {
            previousOneYear.append(Container);
          }
          break;
        case 5:
          var Container = $('<div class="doc-icon" data-path="' + file['props'].path + '"></div>');
          Container.append($('<img src="icons/' + file['props'].icon + '.png"></img>'));
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">' + file['props'].name + '</p>'));
          }else{
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">' + file['props'].name + '</p>'));
          }
          if(timeDifference >=0 && timeDifference <=24){
            today.append(Container);
          }
          else if(timeDifference>24 && timeDifference <=24*7){
            previous7Days.append(Container);
          }
          else if(timeDifference >24*7 && timeDifference <24*30){
            previous30Days.append(Container);
          }
          else {
            previousOneYear.append(Container);
          }
          break;
        default:
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
          var Container = $('<div class="pictureContainerWaterFall" data-path="'+file['props'].path +'"></div>)');
          var Holder = $('<div class = "pictureHolderWaterFall"></div>');
          //用来定义最后描述的名字.
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            var description = $('<div class="picturedescriptionWaterFall '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+id +'">'+file['props'].name+'</div>');
          }else{
            var description = $('<div class="picturedescriptionWaterFall '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">'+file['props'].name+'</div>');
          }
          Holder.append($('<img src="' + file['props'].img + '"></img>'));
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
          break;
        case 2:
          var Container = $('<div class="videoContainer" data-path="'+file['props'].path +'"></div>)');
          var Holder = $('<div class = "videoHolder"></div>');
          //用来定义最后描述的名字.
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            var description = $('<div class="videodescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">'+file['props'].name+'</div>');
          }else{
            var description = $('<div class="videodescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">'+file['props'].name+'</div>');
          }
          Holder.append($('<img src="' + file['props'].video + '"></img>'));
          Container.append(Holder);
          Container.append(description);
          returnContent.append(Container);
          
          break;
        case 3:
          var Container = $('<div class="doc-icon" data-path="' + file['props'].path + '"></div>');
          Container.append($('<img src="icons/' + file['props'].icon + '.png"></img>'));
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">' + file['props'].name + '</p>'));
          }else{
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">' + file['props'].name + '</p>'));
          }
          returnContent.append(Container);
          break;
        case 4:
          var Container = $('<div class="musicContainer" data-path="'+file['props'].path +'" ></div>)');
          var Holder = $('<div class = "musicHolder"></div>');
          //用来定义最后描述的名字.
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            var description = $('<div class="musicdescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">'+file['props'].name+'</div>');
          }else{
            var description = $('<div class="musicdescription '+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">'+file['props'].name+'</div>');
          }
          Holder.append($('<img src="' + file['props'].music + '"></img>'));
          Container.append(Holder);
          Container.append(description);
          returnContent.append(Container);     
          break;
        case 5:
          var Container = $('<div class="doc-icon" data-path="' + file['props'].path + '"></div>');
          Container.append($('<img src="icons/' + file['props'].icon + '.png"></img>'));
          if(file['props'].name.indexOf(' ') != -1 ||
            file['props'].name.indexOf('\'' != -1)){
            var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ id +'">' + file['props'].name + '</p>'));
          }else{
            Container.append($('<p class="'+_globalSelf._currentCategory[_globalSelf._index]+ ' '+ file['props'].name +'">' + file['props'].name + '</p>'));
          }
          returnContent.append(Container);
          break;
        default:
      }
    }
    _globalSelf.addClickEvent(returnContent,'.doc-icon');
    _globalSelf.addClickEvent(returnContent,'.pictureContainerWaterFall');
    _globalSelf.addClickEvent(returnContent,'.videoContainer');
    _globalSelf.addClickEvent(returnContent,'.musicContainer');
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
        return 'blank';
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
  }
})
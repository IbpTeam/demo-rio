var ShowFiles = Class.extend({

  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    this.global_self;
    this.global_dir;
    this.file_arch_json = {};
    this.getFiles = {};
    this.copied_filepath = '';
    this.showNormal = true;
    this._contentIds = ['contact','pictureContent','videoContent','documentContent','musicContent'];
    this.choice = $('<div id = "choice"></div>');
    this.showContent = $('<div id = "showContent" style= "overflow:auto"></div>');
    //var showContent = $('<div id = "showContent" style= "overflow:auto"></div>');
    //$("#contentDiv").empty();
    $("#contentDiv").append(this.choice);
    $("#contentDiv").append(this.showContent);   
    //this.showContent.empty();
  },
  
  //此函数用来初始化index的值，看传入的index是多少，从而判断到底是需要展示什么文件
  setIndex:function(index_){
    if (typeof index_ === 'number' && index_ >0 && index_ <5) {
      this._index = index_;
    }
  },

  //此函数就是外面调用函数的接口，在初始化函数和index之后，直接调用此函数就会显示.
  showFile:function(){
    global_self = this;
    global_self.choice.show();
    global_self.showContent.show();
    if (this._index == 1){
      //所请求的是图片，显示图片
      if(!this.getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Picture');
      }
      else {
        //this.showFilesNormal(global_self.getFiles[global_self._index]);
        $("#pictureContent").siblings().hide();
        $("#pictureContent").show();       
      }
    }
    else if(this._index == 2){
      //所请求的是视频，显示视频
      //DataAPI.getAllDataByCate(this.getCallBackData,'Video');
      if(!this.getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Video');
      }
      else {
        //this.showFilesNormal(global_self.getFiles[global_self._index]); 
        $("#videoContent").siblings().hide();
        $("#videoContent").show();     
      }
    }
    else if(this._index ==3){
      //所请求的是文档，显示文档
      //DataAPI.getAllDataByCate(this.getCallBackData,'Document');
      if(!this.getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Document');
      }
      else {
        //this.showFilesNormal(global_self.getFiles[global_self._index]);
        $("#documentContent").siblings().hide(); 
        $("#documentContent").show();      
      }
    }
    else if(this._index ==4){
      //所请求的是音乐，显示音乐
      if(!this.getFiles[this._index]){
        DataAPI.getAllDataByCate(this.getCallBackData,'Music');
      }
      else {
        //this.showFilesNormal(global_self.getFiles[global_self._index]);  
        $("#musicContent").siblings().hide();  
        $("#musicContent").show();   
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
          data_json[i]['props']['icon'] = global_self.setIcon(data_json[i]['postfix']);;
          break;
        case 'video':
          data_json[i]['props'] = {};
          data_json[i]['props']['video'] = data_json[i]['path'];
          data_json[i]['props']['path'] = 'root/Video/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];          
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = global_self.setIcon(data_json[i]['postfix']);
          break;
        case 'document':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = 'root/Document/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];   
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = global_self.setIcon(data_json[i]['postfix']);
          break;
        case 'music':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = 'root/Music/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
          data_json[i]['props']['name'] = data_json[i]['filename'];           
          data_json[i]['props']['type'] = 'file';
          data_json[i]['props']['icon'] = global_self.setIcon(data_json[i]['postfix']);
          break;
        case 'devices':
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = global_dir+'/'+data_json[i]['name']+'.device';
          data_json[i]['props']['name'] = data_json[i]['name'];           
          data_json[i]['props']['type'] = 'device';
          data_json[i]['props']['icon'] = 'Devices';
          break;
        default:
          data_json[i]['props'] = {};
          data_json[i]['props']['path'] = global_dir+'/'+data_json[i]['filename'];
          data_json[i]['props']['name'] = data_json[i]['filename'];           
          data_json[i]['props']['type'] = 'other';
          data_json[i]['props']['icon'] = global_self.setIcon(data_json[i]['postfix']);
          break;
      }
    }
    //global_self.showFilesList(data_json);
    global_self.getFiles[global_self._index] = data_json;
    // if(global_self.showNormal){
    //   global_self.showFilesNormal(data_json);    
    // }
    // else {
    //   global_self.showFilesList(data_json);
    // }
    if(global_self.showNormal){
      global_self.showContent.children().hide();
      global_self.showContent.append(global_self.showFilesNormal(data_json).attr('id',global_self._contentIds[global_self._index]));   
    }
    else {
      global_self.showContent.children().hide();
      global_self.showContent.append(global_self.showFilesList(data_json).attr('id',global_self._contentIds[global_self._index]));
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
    //$('#contentDiv').append(returnContent);
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
        var fileContainer = $('<div class="fileContainer" data-path="' + file['props'].path + '"></div>');
        var iconContainer = $('<div class="iconContainer"></div>');
        iconContainer.append($('<img src="icons/' + file['props'].icon + '.png"></img>'));
        fileContainer.append(iconContainer);
        if(file['props'].name.indexOf(' ') != -1 ||
           file['props'].name.indexOf('\'' != -1)){
          var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
          fileContainer.append($('<div class="name" id="'+ id +'">' + file['props'].name + '</div>'));
        }else{
          fileContainer.append($('<div class="name" id="'+ file['props'].name +'">' + file['props'].name + '</div>'));
        }
        returnContent.append(fileContainer);
      }
    }
    //$('#contentDiv').append(returnContent);
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
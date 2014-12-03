var ShowFiles = Class.extend({
  //这是一个初始化的函数，用来初始化一些数据，比如index索引.索引用来表示要展示的内容，1代表图片，2代表视频，3代表文档，4代表音乐.
  init:function(){
    this._index = 0;
    var global_self;
    var global_dir;
    var file_arch_json = {};
    var copied_filepath = '';
    $("#contentDiv").empty();
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
    if (this._index == 1){
      //所请求的是图片，显示图片
      DataAPI.getAllDataByCate(this.getCallBackData,'Picture');
    }
    else if(this._index == 2){
      //所请求的是视频，显示视频
      DataAPI.getAllDataByCate(this.getCallBackData,'Video');
    }
    else if(this._index ==3){
      //所请求的是图片，显示文档
      DataAPI.getAllDataByCate(this.getCallBackData,'Document');
    }
    else if(this._index ==4){
      //所请求的是图片，显示音乐
      DataAPI.getAllDataByCate(this.getCallBackData,'Music');
    }
  },

  //回调函数，用来获得数据库中的所有的数据，获得的是json的格式，从而对json进行操作。
  getCallBackData:function(data_json){
    console.log('data from server: this is a begin ---------------', data_json);
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
    global_self.showFilesList(data_json);
  },

  //此函数用来列表输出所有的文件，包括图片，音乐，视频和文档.
  showFilesListtest:function(files){
    var table = $('<table cellspacing="0" width="100%"></table>');
    var thead = $('<thead></thead>');
    var tbody = $('<tbody></tbody>');
    var theadtr = $('<tr></tr>');
    theadtr.append('<th>Name</th>');
    theadtr.append('<th>Date Modified</th>');
    theadtr.append('<th>Size</th>');
    theadtr.append('<th>Date Added</th>');
    thead.append(theadtr);
    var tbodytr = $('<tr></tr>');
    var th = '<th>Start date</th>';
    for(var i =0;i<4;i++){
      tbodytr.append(th)
    }
    tbody.append(tbodytr);
    table.append(thead);
    table.append(tbody);
    //document.getElementById("contentDiv").innerHTML = table; 
    $('#contentDiv').append(table);
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

  //此函数用来列表显示.
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
    $('#contentDiv').append(table);
  },

  showFilesNormal:function(files){
    var results = [];   
    //var PictureAndVideoStyleEnd = ' </div> <div class="description">this is a picture</div></div>';
    for(var i =0;i<files.length;i++){
      var file = files[i];
      var PictureAndVideoStyleBegin = '<div class="outContainer" data-path="'+file['props'].path +'"> <div class="Holder">';
      //用来定义最后描述的名字.
      if(file['props'].name.indexOf(' ') != -1 ||
         file['props'].name.indexOf('\'' != -1)){
        var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
        //results.push('<div class="name" id="'+ id +'">' + file['props'].name + '</div>');
        var PictureAndVideoStyleEnd = ' </div> <div class="description">'+file['props'].name+'</div></div>';
      }else{
      //results.push('<div class="name" id="'+ file['props'].name +'">' + file['props'].name + '</div>');
        var PictureAndVideoStyleEnd = ' </div> <div class="description">'+file['props'].name+'</div></div>';
      } 
      if(file['props'].img){
        results.push(PictureAndVideoStyleBegin);
        results.push('<img src="' + file['props'].img + '"></img>');
        results.push(PictureAndVideoStyleEnd);
      }
      else if(file['props'].video){
        results.push(PictureAndVideoStyleBegin);
        results.push('<video src="' + file['props'].video + '"></video>');
        results.push(PictureAndVideoStyleEnd);
      }
      else {
        results.push('<div class="file" data-path="' + file['props'].path + '"><div class="icon">');
        results.push('<img src="icons/' + file['props'].icon + '.png"></img>');
        if(file['props'].name.indexOf(' ') != -1 ||
           file['props'].name.indexOf('\'' != -1)){
          var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
          results.push('</div><div class="name" id="'+ id +'">' + file['props'].name + '</div></div>');
        }else{
          results.push('</div><div class="name" id="'+ file['props'].name +'">' + file['props'].name + '</div></div>');
        }
        //results.push('/<div>');
      }
    }
    document.getElementById("contentDiv").innerHTML = results.join("\n");
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
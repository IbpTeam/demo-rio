//var events = require('events');
//var util = require('util');

//var fs = require('fs');
//eval(fs.readFileSync('../backend/api.js')+'');

//var ip='192.168.160.176';

// Template engine
function gen_popup_dialog(title, message, data_json){
  $("#popup_dialog").remove();
  var header_btn = $('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>');
  var header_title = $('<h4 class="modal-title"></h4>');
  header_title.text(title);
  var header = $('<div class="modal-header"></div>');
  header.append(header_btn).append(header_title);
  
  var body = $('<div class="modal-body"></div>');
  body.html(message);
  
  var footer = $('<div class="modal-footer"></div>');
  //var footer_edit = $('<button type="button" class="btn btn-success" data-dismiss="modal" id="edit_button">Edit</button>');
  //footer.append(footer_edit);
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
//  function close_dialog(){
//    $("#popup_dialog").modal('hide');
//    $("#popup_dialog").remove();
//    $(".modal-backdrop").remove();
//  }
//  $(header_btn).click(close_dialog);
//  $(footer_btn).click(close_dialog);

  $('#popup_dialog').on('hidden.bs.modal', function(){
    $(this).remove();
  });
  $('#edit_button').on('click', function(){
    if(data_json != null){
      $(this).removeData('bs.modal');
      gen_edit_dialog(data_json);
    }
    else{
      window.alert("You can not edit this file.");
    }
  });
}

function get_all_data_file(data_json){
  console.log('get all data file', data_json);
  var file_propery='';
  for(var key in data_json){
    if(key == 'props' || key == 'URI'){
      continue;
    }
    file_propery += '<p>' + key + ': ' + data_json[key] + '</p>';
  }
  if(data_json.hasOwnProperty('URI')){
    file_propery += '<button type="button" class="btn active" id="edit_button" data-dismiss="modal">Edit</button>';
  }
  gen_popup_dialog('Property', file_propery, data_json);
}

function gen_edit_dialog(data_json){
  console.log("gen edit dialog!", data_json);
  var file_propery='<form>';
  for(var key in data_json){
    if(key == 'props' || key == 'URI'){
      continue;
    }
    file_propery += '<p>'+key+':</p> <input id="'+key+'" type="text" size="60" aligin="right" value="'+data_json[key]+'"/>';
  }
  file_propery += '</form></br>';
  file_propery += '<button type="button" class="btn active" id="save_button" data-dismiss="modal">Save</button>';
  gen_popup_dialog('Edit', file_propery);
  $('#save_button').on('click', function(){
    var new_json = {};
    for(var key in data_json){
      if(key == 'props' || key == 'URI'){
        continue;
      }
      var new_value = document.getElementById(key).value;
      new_json[key] = new_value;
    }
    new_json['category'] = get_category();
    new_json['URI'] = data_json['URI'];
    DataAPI.updateDataValue(function(result){
      if(result == 'success'){
        window.alert("Saved successfully!");
      }
      else{
        window.alert("Saved failed!");
      }
    }, [new_json]);
  });
}

function sendKeyToWindow(windowname, key){
  console.log("sendkey " + key + " To Window " + windowname);
  AppAPI.sendKeyToApp(function(){}, windowname, key);
}

function cb_get_data_source_file(data_json){
  console.log('get data source file', data_json);
  if(!data_json['openmethod'] || !data_json['content']){
    window.alert('openmethod or content not found.');
    return false;
  }

  var method = data_json['openmethod'];
  var content = data_json['content'];
  switch(method){
    case 'alert':
      window.alert(content);
      break;
    case 'html':
      var file_content;
      var format = data_json['format'];
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

      var title = data_json['title'];
      if (!data_json['windowname']){
        gen_popup_dialog(title, file_content);
      }else{
        gen_popup_dialog("窗口控制", "<div>\
            <button type=\"button\" class=\"btn btn-success\" onclick=\"sendKeyToWindow(\'" + data_json['windowname'] + "\', \'F5\')\">PLAY</button><br>\
            <button type=\"button\" class=\"btn btn-success\" onclick=\"sendKeyToWindow(\'" + data_json['windowname'] + "\', \'Up\')\">UP</button><br>\
            <button type=\"button\" class=\"btn btn-success\" onclick=\"sendKeyToWindow(\'" + data_json['windowname'] + "\', \'Down\')\">DOWN</button><br>\
            <button type=\"button\" class=\"btn btn-success\" onclick=\"sendKeyToWindow(\'" + data_json['windowname'] + "\', \'Escape\')\">STOP</button><br>\
          </div>");
      }
      break;
    default:
      break;
  }
  return;
}

function path_transfer(front_path, base_dir){
  switch(front_path){
    case 'root':
      return base_dir;
      break;
    case 'root/Contact':
      return null;
      break;
    case 'root/Picture':
     return base_dir+'/picture';
      break;
    case 'root/Video':
      return base_dir+'/video';
      break;
    case 'root/Document':
      return base_dir+'/document';
      break;
    case 'root/Music':
      return base_dir+'/music';
      break;
    default:
      return null;
      break;
  }
}

function get_category(){
  return global_dir.substring(global_dir.lastIndexOf('/')+1, global_dir.length).toLowerCase();
}

function gen_add_tags_dialog(data_uri){
  console.log("gen_add_tags_dialog!", data_uri);
  var file_propery='<form>';
  file_propery += '<input id="newtag" type="text" size="60" aligin="right" />';
  file_propery += '</form></br>';
  file_propery += '<button type="button" class="btn btn-success" id="addtag_button" data-dismiss="modal">Add</button>';
  gen_popup_dialog('Add new tag', file_propery);
  $('#addtag_button').on('click', function(){
    var new_tag = document.getElementById('newtag').value;
    DataAPI.setTagByUri(function(result){
      if(result == 'commit'){
        window.alert("Add tags successfully!");
      }
      else{
        window.alert("Add tags failed!");
      }
    }, [new_tag], data_uri);
  });
}

function gen_delete_tags_dialog(data_uri){
  console.log("gen_delete_tags_dialog!", data_uri);
  DataAPI.getTagsByUri(function(tags){
    if(tags.length > 0 && tags[0] != ""){
      var file_propery='<form>';
      for(var i=0; i<tags.length; i++){
        file_propery += '<input name="tags" value="'+tags[i]+'" type="checkbox" size="60" aligin="right" />';
        file_propery += tags[i]+'</br>';
      }
      file_propery += '</form></br>';
      file_propery += '<button type="button" class="btn btn-success" id="deletetag_button" data-dismiss="modal">Delete</button>';
      var tags_to_delete = [];
      gen_popup_dialog('Delete tags', file_propery);
      $('#deletetag_button').on('click', function(){
         var webtags = document.getElementsByName("tags");
         for (var i=0; i<webtags.length; ++i){
           if(webtags[i].checked){
             tags_to_delete.push(webtags[i].value);
           }
         }
         DataAPI.rmTagsByUri(function(result){
           if(result == 'commit'){
             window.alert("Delete tags successfully!");
           }else{
             window.alert("Delete tags failed!");
           }
         }, tags_to_delete, data_uri);
      });
    }else{
      window.alert("There is no tag to delete!");
    }
  }, data_uri);
}

// Our type
function Folder(jquery_element) {
  this.files = jquery_element;
  var self = this;
  this.files.parent().on('mousedown', function(e) {
    switch(e.which){
    case 3:
      var contents = [];
      if(get_category() == 'document'){
        contents.push('New Document');
      }
      if(copied_filepath != ''){
        contents.push('Paste');
      }
      contents.push('Property');
      
      var popup_menu = self.gen_popup_menu(contents);      
      $(popup_menu).on('mouseup', function(e){
        switch($(e.target).text()){
          case 'New Document':
            var name = 'NewFile';
            var filename = name + '.txt';
            DataAPI.createFile(function(result){
              if(result == 'success'){
                global_self.open(global_dir);
              }else{
                window.alert("Add new file failed!");
              }              
            }, filename, get_category());
            break;
          case 'Property':
            gen_popup_dialog('属性', '"基于html5的文件管理器模型"');
            break;
          case 'Paste':
            console.log(copied_filepath);
            DataAPI.pasteFile(function(result){
              if(result == 'success'){
                global_self.open(global_dir);
              }else{
                window.alert("Paste file failed!");
              }
            }, copied_filepath, get_category());
            copied_filepath = '';
            break;
        }
        $(this).remove();
        self.files.children('.focus').removeClass('focus');
        e.stopPropagation();  
      });
      self.files.append(popup_menu);  
      self.files.children('.dropdown-menu').css({
        'display':'block',
        'position': 'fixed',
        'left': (e.pageX) + 'px',
        'top': (e.pageY) + 'px'
      });
      break;
    case 1:
      self.files.children('.focus').removeClass('focus');
      self.files.children('.dropdown-menu').css({'display':'none'});
      break;
    }
    //e.stopPropagation();
  });
  
  this.files.delegate('.file', 'mousedown', function(e) {
    self.files.children('.focus').removeClass('focus');
    $(this).addClass('focus');
    switch(e.which){
    case 3:
      var contents = ['Open', 'Copy', 'Rename', 'Delete', 'Add tags', 'Delete tags'];
      var popup_menu = self.gen_popup_menu(contents);
      var dst_file = this;
      $(popup_menu).on('mouseup', function(e){
//        for(var i=0; i<contents.length; i++){
//          if($(e.target).text() == contents[i]){
//            //console.log('destination file: '+ $(dst_file).attr('data-path') + ' pop_menu ' + contents[i] + 'is clicked');
//          }        
//        }
        if($(dst_file).attr('data-path').lastIndexOf('.') != -1 || 
        $(dst_file).attr('data-path') == 'root/Contact' || 
        $(dst_file).attr('data-path') == 'root/Picture' || 
        $(dst_file).attr('data-path') == 'root/Video' || 
        $(dst_file).attr('data-path') == 'root/Document' || 
        $(dst_file).attr('data-path') == 'root/Music'){
          var file_json = self.find_json_by_path($(dst_file).attr('data-path'));
          if(!file_json){
            window.alert('data-json was not found.');
            return false;
          }
          switch($(e.target).text()){
            case 'Open':
              switch(file_json['props']['type']){
                case 'folder':
                  self.emit('navigate', file_json);
                break;
                case 'file':
                  DataAPI.openDataByUri(cb_get_data_source_file, file_json.URI);
                break;
                case 'other':
                  get_all_data_file(file_json);
                break;
              }
            break;
            case 'Copy':
              switch(file_json['props']['type']){
                case 'folder':
                //  self.emit('navigate', file_json);
                break;
                case 'file':
                  copied_filepath = file_json['path'];
                  console.log(copied_filepath);
                break;
              }
            break;
            case 'Rename':
              switch(file_json['props']['type']){
                case 'folder':
                  window.alert('You can not rename the category.');
                break;
                case 'file':
                  var inputer = Inputer.create('button-name');
                  var options = {
                    'left': $('#'+file_json['props'].name.replace(/\s+/g,'_').replace(/'/g, '')).offset().left,
                    'top': $('#'+file_json['props'].name.replace(/\s+/g,'_').replace(/'/g, '')).offset().top,
                    'width': 80,
                    'height': 25,
                    'oldtext': file_json['props'].name,
                    'callback': function(newtext){
                      DataAPI.renameDataByUri(get_category(), file_json['URI'], newtext+'.'+file_json['postfix'], function(err, result){
                        if(result == 'success'){
                          $("#"+file_json['props'].name).html(newtext);
                        }
                        else{
                          window.alert("Rename failed!");
                        }
                      });
                    }
                  }
                  inputer.show(options);
                break;
              }
            break;
            case 'Property':
              switch(file_json['props']['type']){
                case 'folder':
                  var data_json = file_json['props'];
                  var file_propery='';
                  for(var key in data_json){
                    file_propery += '<p>' + key + ': ' + data_json[key] + '</p>';
                  }
                  gen_popup_dialog('属性', file_propery);
                break;
                case 'file':
                  DataAPI.getDataByUri(get_all_data_file, file_json.URI);
                break;
              }
            break;
            //wangyu: add delete function.
            case 'Delete':
              switch(file_json['props']['type']){
                case 'folder':
                  window.alert('You can not delete the whole category.');
                break;
                case 'file':
                  DataAPI.rmDataByUri(function(err, result){
                    if(result == "success"){
                      var id = file_json['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
                      $("#"+id).parent().remove();
                    }else{
                      window.alert("Delete file failed!");
                    }
                  },file_json['URI']);
                break;
                case 'contact':
                  DataAPI.rmDataByUri(function(err, result){
                    if(result == "success"){
                      var id = file_json['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
                      $("#"+id).parent().remove();
                    }else{
                      window.alert("Delete file failed!");
                    }
                  },file_json['URI']);
                break;
              }
            break;
            case 'Add tags':
              switch(file_json['props']['type']){
                case 'folder':
                  window.alert('You can not add tags for the whole category.');
                break;
                case 'file':
                  gen_add_tags_dialog(file_json['URI']);
                break;
              }
            break;
            case 'Delete tags':
              switch(file_json['props']['type']){
                case 'folder':
                  window.alert('You can not delete tags for the whole category.');
                break;
                case 'file':
                  gen_delete_tags_dialog(file_json['URI']);
                break;
              }
            break;       
          }
        }
        $(this).remove();
        self.files.children('.focus').removeClass('focus');
        e.stopPropagation();  
      });

      self.files.append(popup_menu);
      self.files.children('.dropdown-menu').css({
        'display':'block',
        'position': 'fixed',
        'left': (e.pageX) + 'px',
        'top': (e.pageY) + 'px'
      });
      break;
    case 1:
      self.files.children('.dropdown-menu').css({'display':'none'});
      break;
    }
    e.stopPropagation();
  });
  // Double click on file
  //wangyu: edit this function to folder view mode.
  this.files.delegate('.file', 'dblclick', function(e) {
    var file_json;
    if($(this).attr('data-path').lastIndexOf('.') != -1 || 
       $(this).attr('data-path') == 'root/Contact' || 
       $(this).attr('data-path') == 'root/Picture' || 
       $(this).attr('data-path') == 'root/Video' || 
       $(this).attr('data-path') == 'root/Document' || 
       $(this).attr('data-path') == 'root/Music'){     
      file_json = self.find_json_by_path($(this).attr('data-path'));
      if(!file_json){
        window.alert('data-json was not found.');
        return false;
      }
      switch(file_json['props']['type']){
      case 'folder':
        self.emit('navigate', file_json);
        break;
      case 'file':
        if(file_json.URI.indexOf('#') != -1){
          DataAPI.openDataByUri(cb_get_data_source_file, file_json.URI);
        }
        break;
      case 'device':
        im_view.showSend(file_json);
        break;
      case 'contact':
        get_all_data_file(file_json);
        break;
      case 'devices':
        get_all_data_file(file_json);
        break;
      }
    }else{
      file_json = self.find_jsons_by_path($(this).attr('data-path'));
      if(!file_json){
        return;
      }
      var fs_structure = self.build_fs_tree(file_json);
      if(!fs_structure) 
        return;
      var pointer = fs_structure;
      var depth = (($(this).attr('data-path').replace(data_dir+'/', '')).split('/')).length-1;
      var datapath = '';
      while(depth > 0){
        datapath = datapath+pointer.item+'/';
        pointer = pointer.childNodes[0];
        depth --;
      }
      var foldername = $(this).attr('data-path').substring($(this).attr('data-path').lastIndexOf('/')+1, $(this).attr('data-path').length);
      if(pointer.item == foldername){
        self.show_folder_mode_view(pointer, file_json, datapath);
      }
      else{
        window.alert("There is some error in path search!");
      }
    }
  });  
    
  $('#div-setting').css('background', 'none');
//  function change_value(){
//    console.log($("#div-setting #liststyle").slider("value"));
//  }
  $("#div-setting #liststyle").slider({
    orientation: "horizontal",
    min: 0,
    max: 29,
    range: "min",
    value:15,
    change: self.show_folder_view,
  });
}

Folder.prototype.gen_popup_menu = function(contents){
  this.files.children('.dropdown-menu').remove();
  var menu = $('<ul></ul>');
  $(menu).attr({
    'class':'dropdown-menu',
    'role':'menu',
    'aria-labelledby': 'dropdownMenu'
  });
  var items = [];
  for(var i=0; i<contents.length; i++){
    items.push('<li><a tabindex="-1" href="#">' + contents[i] + '</a></li>');
  }
  $(menu).html(items.join('\n'));
  
      $(menu).on('mousedown', function(e){
        e.stopPropagation();  
      });
  //<li class="divider"></li>
  return menu;
}
var global_self;
var global_dir;
var file_arch_json = {};
var copied_filepath = '';

//wangyu: add this function for open folder in folder view mode.
Folder.prototype.find_jsons_by_path = function(filepath){
  var all = file_arch_json[global_dir];
  var files = new Array();
  var j = 0;
  if(all.length){
    for(var i=0; i<all.length; i++){
      if(all[i]['path'].indexOf(filepath) != -1){
        files[j] = all[i];
        j++;
      }
    }
  }
  return files;
}

Folder.prototype.find_json_by_path = function(filepath){
  var all = file_arch_json[global_dir];
  //console.log('global_dir', global_dir);
  //console.log('filepath', filepath);
  var file = false;
  if(all.length){
    for(var i=0; i<all.length; i++){
      if(all[i]['path'] && all[i]['path'].indexOf(filepath) != -1){
        file = all[i];
        break;
      }
      if(all[i]['props'].path == filepath){
        file = all[i];
        break;
      }
    }
  }
  return file;
}
Folder.prototype.find_json_by_id = function(fileid){
  var all = file_arch_json[global_dir];
  var file = false;
  if(all.length){
    for(var i=0; i<all.length; i++){
      if(all[i].id == fileid){
        file = all[i];
        break;
      }
    }
  }
  return file;
}
Folder.prototype.set_icon = function(postfix){
  switch(postfix){
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
Folder.prototype.get_callback_data = function(data_json){
  console.log('data from server:', data_json);
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
        data_json[i]['props']['icon'] = global_self.set_icon(data_json[i]['postfix']);;
        break;
      case 'video':
        data_json[i]['props'] = {};
        data_json[i]['props']['path'] = 'root/Video/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
        data_json[i]['props']['name'] = data_json[i]['filename'];          
        data_json[i]['props']['type'] = 'file';
        data_json[i]['props']['icon'] = global_self.set_icon(data_json[i]['postfix']);;
        break;
      case 'document':
        data_json[i]['props'] = {};
        data_json[i]['props']['path'] = 'root/Document/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
        data_json[i]['props']['name'] = data_json[i]['filename'];   
        data_json[i]['props']['type'] = 'file';
        data_json[i]['props']['icon'] = global_self.set_icon(data_json[i]['postfix']);
        break;
      case 'music':
        data_json[i]['props'] = {};
        data_json[i]['props']['path'] = 'root/Music/'+data_json[i]['filename']+'.'+data_json[i]['postfix'];
        data_json[i]['props']['name'] = data_json[i]['filename'];           
        data_json[i]['props']['type'] = 'file';
        data_json[i]['props']['icon'] = global_self.set_icon(data_json[i]['postfix']);
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
        data_json[i]['props']['icon'] = global_self.set_icon(data_json[i]['postfix']);
        break;
    }
  }
  if(global_dir == 'root'){
    global_self.emit('set_favorites', data_json);
  }else{
    global_self.emit('set_sidebar', data_json);
  }
  file_arch_json[global_dir] = data_json;
  global_self.show_folder_view(global_dir);
}

//wangyu: add this function to show history
Folder.prototype.show_history = function(){
  if(global_dir.lastIndexOf('/') != -1){
    DataAPI.getGitLog(function(err, result){
      var file_property='';
      var commitIds = [];
      for(var commitId in result){
        commitIds.push(commitId);
      }
      var count = 0;
      for(var i in result){
        file_property += '<li class="divider">--------------------</li>';
        file_property += '<p>'+result[i]['Author']+' '+result[i]['content']['op']+' data on '+result[i]['Date'];
        file_property += ' using device '+result[i]['content']['device']+'</p>';
        file_property += '<input type=button class="btn active" id='+result[i]['commitID']+' value="More Detail"/>';        
        if(count == commitIds.length - 1){
          file_property += '<input type=button class="btn active" name="null" value="Confirm Recover"/>';
        }else{
          file_property += '<input type=button class="btn active" name='+commitIds[count]+' value="Confirm Recover"/>';
          count ++;
        }
      }
      var history_win = Window.create('operation_history', 'Operation History', {left:100, top:100, height: 500, width: 500, resize: true});
      history_win._windowContent.append(file_property);
      $('input[value="More Detail"]').on('click', function(){
        var detail_win = Window.create('operation_details', 'Operation Details', {left:150, top:150, height: 500, width: 430, resize: true});
        var details = '';
        for(var i=0; i<result[this.id]['content']['file'].length; i++){
          details += '<p>' + result[this.id]['content']['file'][i] + '</p>';
        }
        detail_win._windowContent.append(details);
      });
      $('input[value="Confirm Recover"]').on('click', function(){
        if(this.name == 'null'){
          window.alert("You are already in the first version, so you can not do recovery operation.");
        }else{
          DataAPI.repoReset(function(err, result){
            if(result == 'success'){
              window.alert("Version recover successfully!");
              global_self.open(global_dir);
            }else{
              window.alert("Version recover failed!");
            }
          }, get_category(), this.name);
        }
      });
    }, get_category());
  }
}

//wangyu: add this funtion for folder view.
Folder.prototype.use_folder_view_mode = function(){
  switch(global_dir){
  case 'root':
    break;
  case 'root/Contact':
    break;
  case 'root/Picture':
    //getAllDataByCate(this.folder_view_mode_cb, 'Pictures');
    break;
  case 'root/Video':
    //getAllDataByCate(this.folder_view_mode_cb, 'Videos');
    break;
  case 'root/Document':
    DataAPI.getAllDataByCate(this.folder_view_mode_cb, 'Documents');
    break;
  case 'root/Music':
    //getAllDataByCate(this.folder_view_mode_cb, 'Music');
    break;
  default:
    window.alert('Path ' + global_dir + ' does not exist.');
    break;
  }
}

//wangyu: add tree data strcture storing data paths.
function Tree(item){
  this.item = item;
  this.childNodes = new Array();;
}
Tree.prototype.addChild = function(node) {
  this.childNodes[this.childNodes.length] = new Tree(node);
}

//wangyu: this function build file system tree structure.
Folder.prototype.build_fs_tree = function(data_json){
  var j = 0;
  var fs_structure;
  var pointer;
  for(var i=0; i<data_json.length; i++){
    var file = data_json[i];
    file['path'] = file['path'].replace(data_dir+'/', "");
    var paths = file['path'].split('/');
    if(! fs_structure){
      fs_structure = new Tree(paths[j]);   
    }
    pointer = fs_structure;
    for(var k=j+1; k<paths.length; k++){
      var foldername = paths[k];
      var l;
      for(l=0; l<pointer.childNodes.length; l++){
        if(pointer.childNodes[l].item == foldername){
          break;
        }
      }
      if(l == pointer.childNodes.length){
        pointer.addChild(foldername);
      }
      pointer = pointer.childNodes[l];
    }
  }
  return fs_structure;
}

//wangyu: add this function to show folder mode view.
Folder.prototype.show_folder_mode_view = function(fs_structure, data_json, datapath){
  global_self.files.children().remove();
  var results = [];
  var pointer = fs_structure;
  for(var i=0; i<pointer.childNodes.length; i++){
    var data_json = {};
    if((pointer.childNodes[i].childNodes).length == 0){
      data_json['name'] = pointer.childNodes[i].item;
      data_json['type'] = 'file';
      var postfix = pointer.childNodes[i].item.substring(pointer.childNodes[i].item.lastIndexOf('.')+1, pointer.childNodes[i].item.length);
      data_json['icon'] = global_self.set_icon(postfix);
      data_json['path'] = datapath+pointer.item+'/'+data_json['name'];
    }
    else{
      data_json['name'] = pointer.childNodes[i].item;
      data_json['path'] = datapath+pointer.item+'/'+data_json['name'];
      data_json['type'] = 'folder';
      data_json['icon'] = 'folder';
    }
    results.push('<div class="file" data-path="' + data_json.path + '">');
    results.push('<div class="icon"> <img src="icons/' + data_json.icon + '.png"></div>');
    results.push('<div class="name" id="'+data_json.name+'">' + data_json.name + '</div>');
    results.push('</div>');
  }
  global_self.files.html(results.join('\n'));
}

//wangyu: add this call back function for folder mode view.
Folder.prototype.folder_view_mode_cb = function(data_json){
  var fs_structure = global_self.build_fs_tree(data_json);
  global_self.show_folder_mode_view(fs_structure, data_json, '');
}


Folder.prototype.show_folder_view = function() {
  //console.log('in show folder view, global dir:', get_settings('liststyle'));
  data_json = file_arch_json[global_dir];
  global_self.files.children().remove();
  switch(get_settings('liststyle')){
    case 0:
      global_self.files.append(global_self.gen_view_table(data_json));
      break;
    case 1:
      global_self.files.html(global_self.gen_view_files_normal(data_json));
      break;
    case 2:
      global_self.gen_view_files_big(data_json);
      break;
    default:
      global_self.files.html(global_self.gen_view_files_normal(data_json));
      break;
  }
}

Folder.prototype.gen_view_files_normal = function(files){
  var results = [];
  for(var i=0; i<files.length; i++){
	var file = files[i];
    results.push('<div class="file" data-path="' + file['props'].path + '">');
    if(file['props'].img){
        results.push('<div class="icon"> <img src="' + file['props'].img + '"></div>');
    }else{
        results.push('<div class="icon"> <img src="icons/' + file['props'].icon + '.png"></div>');
    }
    if(file['props'].name.indexOf(' ') != -1 ||
       file['props'].name.indexOf('\'' != -1)){
      var id = file['props'].name.replace(/\s+/g, '_').replace(/'/g, '');
      results.push('<div class="name" id="'+ id +'">' + file['props'].name + '</div>');
    }else{
      results.push('<div class="name" id="'+ file['props'].name +'">' + file['props'].name + '</div>');
    }
    results.push('</div>');
  }
  return results.join('\n');
}

function get_json_key(data_json){
  var keys = [];
  for(var key in data_json){
    if(key == 'props')
      continue;
    keys.push(key);
  }
  return keys;
}

Folder.prototype.gen_view_files_big = function(files){
  if(!files.length){
    return '';
  }
  var json_keys = get_json_key(files[0]);
  
  for(var i=0; i<files.length; i++){
    var file = files[i];
    var jfile = $('<div class="file file-big" data-path="' + file['props'].path + '">');
    var jimg = $('<img></img>');
    if(file['props'].img){
      jimg.attr({
        'src': file['props'].img
      });
    }else{
      jimg.attr({
        'src': 'icons/' + file['props'].icon + '.png'
      });
    }
    var jimg_div = $('<div class="icon-big"></div>').append(jimg);
    jfile.append(jimg_div);
    var jprop_div = $('<div class="file-props"></div>');
    for(var j=0; j<json_keys.length; j++){
      jprop_div.append($('<p><span style="font-weight:bold">' + json_keys[j] + ':</span> ' + file[json_keys[j]] + '</p>'));
    }
    jfile.append(jprop_div);
    global_self.files.append(jfile);
  }

}
Folder.prototype.gen_view_table = function(files){
  if(!files.length){
    return '';
  }
  function gen_body_tr(data_json, keys){
	  var tr = $('<tr></tr>');
	  for(var i=0; i<keys.length; i++){
	    if(keys[i] == 'id'){
//	      var id = $('<span class="id">' + data_json[keys[i]] + '</span>');
//	      a.click(function(){
//	        var file_json = global_self.find_json_by_id($(this).text());
//          if(!file_json){
//            window.alert('data-json was not found. current folder view: table.');
//            return false;
//          }
//          switch(file_json['props']['type']){
//          case 'folder':
//            global_self.emit('navigate', file_json);
//            break;
//          case 'file':
//            getDataSourceById(cb_get_data_source_file, file_json.id);
//            break;
//          }
//	      })
	      tr.append($('<th class="id">' + data_json[keys[i]] + '</th>'));
	    }else{
	      tr.append($('<th>' + data_json[keys[i]] + '</th>'));
	    }
	  }
	  tr.click(function(){
      var file_json = global_self.find_json_by_id($(this).children('.id').text());
      if(!file_json){
        window.alert('data-json was not found. current folder view: table.');
        return false;
      }
      switch(file_json['props']['type']){
      case 'folder':
        global_self.emit('navigate', file_json);
        break;
      case 'file':
        DataAPI.openDataByUri(cb_get_data_source_file, file_json.URI);
        break;
      }
    });
    tr.mousedown(function(e) {
      e.stopPropagation();
    });
	  return tr;
	}
	
  var keys = get_json_key(files[0]);
  //console.log('keys', keys);
  
  var thead = $('<thead></thead>');
	var tr = $('<tr></tr>');
	for(var i=0; i<keys.length; i++){
	  tr.append($('<th>' + keys[i] + '</th>'))
	}
	tr.addClass('success');
	thead.append(tr);
	  
  var tbody = $('<tbody></tbody>');
  for(var i=0; i<files.length; i++){
		tbody.append(gen_body_tr(files[i], keys));
	}
	  
	var table = $('<table></table>');
	table.append(thead);
	table.append(tbody);
	table.addClass('table');
	
  var div = $('<div></div>');
  div.addClass('panel panel-primary');
  div.append(table);
  
  return div;
}
function get_settings(set){
  switch(set){
  case 'liststyle':
    var liststyle = $("#div-setting #liststyle").slider("value") / 10;
    liststyle = parseInt(liststyle);
    return liststyle;
    //break;
  }
}

Folder.prototype.open = function(dir) {
  global_self = this;
  global_dir = dir;
  console.log('global_dir', global_dir);
  switch(global_dir){
  case 'root':
    DataAPI.getAllCate(this.get_callback_data);
    break;
  case 'root/Contact':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Contact');
    break;
  case 'root/Picture':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Picture');
    break;
  case 'root/Video':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Video');
    break;
  case 'root/Document':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Document');
    break;
  case 'root/Music':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Music');
    break;
  case 'root/Devices':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Devices');
    break;
  case 'root/Other':
    DataAPI.getAllDataByCate(this.get_callback_data, 'Other');
    break;
  default:
    window.alert('Path ' + global_dir + ' does not exist.');
    break;
  }
}

$.extend(Folder.prototype, $.eventEmitter);
//exports.Folder = Folder;


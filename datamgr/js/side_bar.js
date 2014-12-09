// Our type
function SideBar(jquery_element) {
  this.element = jquery_element;
  this.favorites = $(jquery_element).children('#favorites');
  this.tags = $(jquery_element).children('#tags');
  this.filters = $(jquery_element).children('#filters');
  this.recent = $(jquery_element).children('#recent');
  var self = this;
  self.filters.delegate('#search_submit', 'click', function(){
    var keyword = document.getElementById('search_input').value;
    DataAPI.getCategoryFilesByTag(function(err,result){
      self.emit('show_filter_result', result);
    }, [keyword]);
  });
}

SideBar.prototype.set_tags = function(json){
  var self = this;
  var result = [];
  var labels = new Array();
  var count = 0;
  result.push('<li class="divider"></li>');
  result.push('<li class="nav-header">标签</li>');

  function get_tags(mytags){
    if(mytags == null){
      self.tags.html(result.join('\n'));
    }
    else{
      var oTags = mytags.tags;
      for(var k=0;k<oTags.length;k++){
        result.push('<a id='+oTags[k]+' href="#">'+oTags[k]+'</a>'+'<br/>');
      }
      self.tags.html(result.join('\n'));
      var children = self.tags.children('a');
      children.one("click", function(event){
        var tag = $(this).attr('id');
        self.emit('show_filter_tag', tag);
        var tag_items = mytags.tagFiles[tag];
        var filter_result = [];
        if(tag_items != null){
          for(var j=0; j<tag_items.length; j++){
            filter_result.push({
              URI: tag_items[j][0],
              filename: tag_items[j][1],
              postfix: tag_items[j][2],
              path: tag_items[j][3]
            });
          }
        }
        self.emit('show_filter_result', filter_result);
      });
    }
  }

  if(!json[count]){
    self.tags.html(result.join('\n'));
  }else{
    if(json[0].hasOwnProperty('URI') && json[0].URI != null){
      var uris = [];
      for(var i=0; i<json.length; i++){
        uris.push(json[i].URI);
      }
      DataAPI.getTagsByUris(get_tags,uris);
    }
    else{
      self.tags.html(result.join('\n'));
    }
  }
}

SideBar.prototype.set_recent = function(json){
  var self = this;
  var result = [];
  result.push('<li class="divider"></li>');
  result.push('<li class="nav-header">最近访问</li>');
  var count = 0;
  function get_recent(recent_result){
    for(var i=0; i<recent_result.length; i++){
      var filename;
      if(recent_result[i].hasOwnProperty("filename")){
        filename = (JSON.stringify(recent_result[i].filename)).replace(/\"/g, '');
      }else if(recent_result[i].hasOwnProperty("name")){
        filename = (JSON.stringify(recent_result[i].name)).replace(/\"/g, '');
      }
      result.push('<li><a href="#">'+filename+'</a></li>');
      count ++;
      if(count == recent_result.length){
        self.recent.html(result.join('\n'));
      }
    }
  }
  DataAPI.getRecentAccessData(get_recent, 10);
}

SideBar.prototype.set_favorites = function(favorites_json){
  var self = this;
  var result = [];
  result.push('<li class="nav-header">快捷菜单</li>');
  //result.push('<li data-path="root" class="active"><a href="index.html"><i class="icon-white icon-home"></i> Home</a></li>');
  result.push('<li data-path="root" class="active"><a href="file-explorer.html"><i class="glyphicon glyphicon-home" style="color:white"></i> Home</a></li>');
  for(var i=0; i< favorites_json.length; i++){
    var str='<li data-path="'+favorites_json[i]['props'].path+'"><a href="#"><i class="';
    switch(favorites_json[i]['props'].name)
    {
      case 'Contact':
        str+='glyphicon glyphicon-user';
        break;
      case 'Picture':
        str+='glyphicon glyphicon-picture';
        break;
      case 'Video':
        str+='glyphicon glyphicon-film';
        break;
      case 'Document':
        str+='glyphicon glyphicon-book';
        break;
      case 'Music':
        str+='glyphicon glyphicon-music';
        break;
      case 'Devices':
        str+='glyphicon glyphicon-th';
        break;
      default:
        str+='glyphicon glyphicon-folder-close';
        break;
    }
    str+='"></i> '+favorites_json[i]['props'].name+'</a></li>';
    result.push(str);
  }
  self.favorites.html(result.join('\n'));
  self.favorites.delegate('a', 'click', function() {
    self.favorites.children('.active').removeAttr('class');//removeClass('active');
    $(this).parent().addClass('active');
    self.favorites.find('[style="color:white"]').removeAttr('style');
    $(this).children('i').attr('style', 'color:white');
    //self.favorites.find('.icon-white').removeClass('icon-white');
    //$(this).children('i').addClass('icon-white ');
    var file_path = $(this).parent().attr('data-path');
	  //var file_json = global_self.find_json_by_path(file_path);
	  //console.log('click on side_bar', file_json);
	  //if(file_json){
		  //global_self.emit('navigate', file_json);
		//}
    if('about' == file_path){
	  window.alert('in developing...^_^');
    }
    else if('root' == file_path){
    //return to homepage
    }
    else{
      //self.open(file_path);
      self.emit('open_favorite', file_path);
    }
  });
}
SideBar.prototype.set_favorites_focus = function(full_path){
  self = this;
  var file_path = full_path;
  var children = self.favorites.children('li');
  for(var i=0; i<children.length; i++){
    child = $(children[i]);
    //console.log('child length',child.attr('data-path'), file_path);  
    if(child.attr('data-path') == file_path){
      //console.log("match match");
      self.favorites.children('.active').removeAttr('class');//removeClass('active');      
      self.favorites.find('[style="color:white"]').removeAttr('style');
      child.children('a').children('i').attr('style', 'color:white');
      //self.favorites.find('.icon-white').removeClass('icon-white');
      //child.children('a').children('i').addClass('icon-white ');
      child.addClass('active');
      break;
    }
  }
}
SideBar.prototype.find_json_by_path = function(filepath){
  var all = file_arch_json[global_dir];
  //console.log('global_dir', global_dir);
  //console.log('filepath', filepath);
  //console.log('file_arch_json[global_dir]', file_arch_json[global_dir]);
  var file = false;
  for(var i=0; i<all.length; i++){
    if(all[i].path == filepath){
      file = all[i];
      break;
    }
  }
  return file;
}

$.extend(SideBar.prototype, $.eventEmitter);
//exports.SideBar = SideBar;

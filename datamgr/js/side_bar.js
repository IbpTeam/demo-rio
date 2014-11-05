// Our type
function SideBar(jquery_element) {
  this.element = jquery_element;
  this.favorites = $(jquery_element).children('#favorites');
  this.tags = $(jquery_element).children('#tags');
  this.filters = $(jquery_element).children('#filters');
  this.recent = $(jquery_element).children('#recent');
  var self = this;
}

SideBar.prototype.set_tags = function(json){
  var self = this;
  var result = [];
  var labels = new Array();
  var count = 0;
  result.push('<li class="divider"></li>');
  result.push('<li class="nav-header">标签</li>');

  function get_tags(mytags){
    console.log("callback was baclled");
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
      for(var i=0; i<children.length; i++){
        self.tags.delegate("#"+$(children[i]).attr('id'), "click", function(){
          var tag = $(this).attr('id');
          var tag_items = mytags.tagFiles[tag];
          var filter_result = [];
          for(var j=0; j<tag_items.length; j++)
          {
            DataAPI.getDataByUri(function(result){
               filter_result.push(result[0]);
              if(filter_result.length == tag_items.length){
                self.emit('show_filter_result', filter_result);
              }
            }, tag_items[j][0]);
          }
        });
      }
    }
  }

  if(!json[count]){
    self.tags.html(result.join('\n'));
  }else{
    if(json[0].hasOwnProperty('URI') && json[0].URI != null){
      var category = json[0].URI.substring(json[0].URI.lastIndexOf('#')+1, json[0].URI.length);
      DataAPI.getAllTagsByCategory(get_tags,[category]);
    }
    else{
      self.tags.html(result.join('\n'));
    }
  }
}

/*
SideBar.prototype.set_tags = function(json){
  var self = this;
  var result = [];
  var labels = new Array();
  result.push('<li class="divider"></li>');
  result.push('<li class="nav-header">标签</li>');
  //console.log("json =======: ", json);
  var count = 0;
  if(!json[count]){
  self.tags.html(result.join('\n'));
  }else {
  function get_labels(record){
    if(record.others != null){
    var one_record_labels = (JSON.stringify(record.others)).replace(/\"/g, '');
    var tmp_labels = one_record_labels.split(",");
    for(var k=0; k<tmp_labels.length; k++){
      var label = tmp_labels[k];
      for(var j=0; j<labels.length; j++){
      if(labels[j] == label){
        break;
      }
      }
      if(j == labels.length){
      labels.push(label);
      result.push('<a id='+label+' href="#">'+label+'</a>');
      }
    } 
    }
    count ++;
    if(count == json.length){
    self.tags.html(result.join('\n'));
    var children = self.tags.children('a');
    for(var i=0; i<children.length; i++){
      self.tags.delegate("#"+$(children[i]).attr('URI'), "click", function(){
//      self.emit('do_filter', json, $(this).attr('id'));
      self.do_filter(json, $(this).attr('URI'));
      });
    }
    }else{
    DataAPI.getDataByUri(get_labels, json[count].URI);    
    }
  }
  DataAPI.getDataByUri(get_labels, json[count].URI);
  }
}
*/
SideBar.prototype.set_filters = function(json){
  var self = this;
  var result = [];

  result.push('<li class="divider"></li>');
  result.push('<li class="nav-header">数据过滤</li>');
	 if(json.length){
		switch(json[0]['props'].icon)
		{
		  case 'folder':
		    break;
		  case 'Contacts':
		    result.push('<input type="button" id="filter_135" value="345开头"/>');
            self.filters.delegate("#filter_135", "click", function(){
              var keyword = "345";
//              self.do_filter(json, keyword);
            });
		    break;
		  case 'Pictures':
		    result.push('<input type="button" id="filter_group" value="版本组"/>');
        self.filters.delegate("#filter_group", "click", function(){
          var keyword = "版本组";
//          self.do_filter(json, keyword);
        });
		    break;
		  case 'Music':
		    result.push('<input type="button" id="filter_jay" value="东风破"/>');
        self.filters.delegate("#filter_jay", "click", function(){
          var keyword = "东风破";
//          self.do_filter(json, keyword);
        });
		    break;
		  case 'Documents':
		    result.push('<input type="button" id="filter_hgj" value="COS Desktop"/>');
        self.filters.delegate("#filter_hgj", "click", function(){
          var keyword = "COS Desktop";
//          self.do_filter(json, keyword);
        });
		    break;
      default:
        break;
		}    
	}
  self.filters.html(result.join('\n'));
}


/*SideBar.prototype.do_filter = function(json){
  var self = this;
  self.emit('show_filter_result', json);
  var filter_result = new Array();
  switch(keyword)
  {
    case '345':
      var count = 0;
      for (var i=0; i<json.length; i++) {
        function get_filter_result(result){
          if(result){
            var phone = JSON.stringify(result.phone);
            if(phone.match('^'+keyword) != null){
              filter_result.push({
                uri:result.URI,
                name:result.name,
                photoPath:result.photoPath,
              });
            }
            count ++;
            if(count == json.length){
              self.emit('show_filter_result', filter_result);
            }
          }else{
            console.log("full information is null.");
            count ++;
          }
        }
        DataAPI.getDataByUri(get_filter_result, json[i].URI);
      }
      break;
    case '版本组':
      var team_members = ['jianmin', 'wangfeng', 'wangyu', 'xifei', 'wuxiang', 'yuanzhe', 'wangtan'];
      for(var i=0; i<json.length; i++){
        var record_str = JSON.stringify(json[i].filename);
        for(var j=0; j<team_members.length; j++){
          if(record_str.match(team_members[j]) != null){
            filter_result.push({
              uri:json[i].URI,
              filename:json[i].filename,
              postfix:json[i].postfix,
              path:json[i].path,
            });
          }
        }
      }
      self.emit('show_filter_result', filter_result);
      break;
    case '东风破':
      for(var i=0; i<json.length; i++){
        var record_str = JSON.stringify(json[i]);
        if(record_str.match(keyword) != null){
          filter_result.push({
            uri:json[i].URI,
            filename:json[i].filename,
            postfix:json[i].postfix,
            path:json[i].path,
          });
        }
      }
      self.emit('show_filter_result', filter_result);
      break;
    case 'COS Desktop':
      for(var i=0; i<json.length; i++){
        var record_str = JSON.stringify(json[i]);
        if(record_str.match(keyword) != null){
          filter_result.push({
            uri:json[i].URI,
            filename:json[i].filename,
            postfix:json[i].postfix,
            path:json[i].path,
          });
        }
      }
      self.emit('show_filter_result', filter_result);
      break;
    default:
      self.emit('show_filter_result', filter_result);
      var count = 0;
      for(var i=0; i<json.length; i++){
            var record_str = JSON.stringify(result);
            if(record_str.match(keyword) != null){
              filter_result.push({
                uri:result.URI,
                filename:result.filename,
                postfix:result.postfix,
                path:result.path,
              });
            }
            count ++;
            if(count == json.length){
              console.log("filter result: ", filter_result);
              self.emit('show_filter_result', filter_result);
            }
        }
      break;
  }
}*/

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

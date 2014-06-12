(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
global.$ = $;

//console.log(global.__dirname);
//console.log(global.__filename);
//console.log("path:" + process.cwd());
var sbar = require("side_bar.js");//./file-explorer/node_modules/
var abar = require("address_bar.js");//./file-explorer/node_modules/
var folder_view = require('folder_view.js');//./file-explorer/node_modules/
//var path = require('path');
//var shell = require('nw.gui').Shell;

//    function get_data(text){
//	console.log('data from server:', text);
//    }
$(document).ready(function() {
    //getAllCate(get_data);
    var sidebar = new sbar.SideBar($('#sidebar'));
	var folder = new folder_view.Folder($('#files'), $('#sidebar'));
	var addressbar = new abar.AddressBar($('#addressbar'));

	folder.open('root');//process.cwd()
	addressbar.set('root');//

	folder.on('navigate', function(mime) {
		if (mime.type == 'folder') {
		    sidebar.set_favorites_focus(mime);
			addressbar.enter(mime);
		} else {
			//shell.openItem(mime.path);
			var file_propery='';
		    for(var key in mime){
			    file_propery += key + ':' + mime[key] + '\n';
		    }
		    alert(file_propery);
		}
	});
	folder.on('folder_set_favorites', function(dirs) {
	    sidebar.set_favorites(dirs);
	});
	folder.on('folder_set_tags', function(dirs){
        sidebar.set_tags(dirs);
    });
    folder.on('folder_set_filters', function(dirs){
        sidebar.set_filters(dirs);
    });
    folder.on('folder_set_recent', function(dirs){
        sidebar.set_recent(dirs);
    });
	sidebar.on('open_favorite', function(dir) {
	    //console.log('on set address', dir);
		folder.open(dir);
		addressbar.set(dir);
	});
	addressbar.on('navigate', function(dir) {
		folder.open(dir);
	});
});

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"address_bar.js":2,"folder_view.js":3,"side_bar.js":4}],2:[function(require,module,exports){
(function (process){
var events = require("events");
var util = require("util");

// Template engine
function gen_bar(dirs){
    var result = [];
    for(var i=0; i<dirs.length; i++){
        if(i != dirs.length-1){
            result.push('<li data-path="' + dirs[i].path + '"><a href="#">' + dirs[i].name + '</a><span class="divider">/</span></li>');
        }else{
            result.push('<li data-path="' + dirs[i].path + '"  class="active"><a href="#">' + dirs[i].name + '</a></li>');        
        }
    }
    return result.join('\n');
}
function gen_one_fie(dir){
    var result = [];
    result.push('<li data-path="' + dir.path + '"><a href="#">' + dir.name + '</a></li>');
    return result.join('\n');	
}

// Our real type
function AddressBar(element) {
	events.EventEmitter.call(this);
	this.element = element;

	// Monitor click on AddressBar
	var self = this;
	element.delegate('a', 'click', function() {
		self.element.children('.active').removeClass('active');
		$(this).parent().addClass('active');
		self.emit('navigate', $(this).parent().attr('data-path'));
		return false;
	});
}

util.inherits(AddressBar, events.EventEmitter);

AddressBar.prototype.set = function(dir_path) {
	//this.current_path = path.normalize(dir_path);
	var path_sep='/';
	this.current_path = dir_path;
	var sequence = this.current_path.split(path_sep);//path.sep
	var result = [];
	var i = 0;
	for (; i < sequence.length; ++i) {
	  result.push({
	    name: sequence[i],
	    path: sequence.slice(0, 1 + i).join(path_sep),
	  });
	}
	//console.log('current_path:' + this.current_path);
	//console.log('sequence:', sequence);
	//console.log('result:', result);

	// Add root for *nix
	if (sequence[0] == '' && process.platform != 'win32') {
		result[0] = {
			name : 'root',
			path : '/',
		};
	}
    //console.log(gen_bar({sequence : result}));
	this.element.html(gen_bar(result));
}

AddressBar.prototype.enter = function(mine) {
	// Where is current
	var how_many = this.element.children().length;
	var where = this.element.children('.active').index();
	if (where == how_many - 1) {
		// Add '/' on tail
		this.element.children().eq(-1).append('<span class="divider">/</span>');
	} else {
		this.element.children('li:gt(' + where + ')').remove();
	}

	// Add new folder
	this.element.append(gen_one_fie(mine));
	this.element.find('a:last').trigger('click');
}

exports.AddressBar = AddressBar;


	/*
	var sequence = [ "", "home", "cos", "Templates" ];
	var result = [ {
		"name" : "",
		"path" : ""
	}, {
		"name" : "home",
		"path" : "/home"
	}, {
		"name" : "cos",
		"path" : "/home/cos"
	}, {
		"name" : "Templates",
		"path" : "/home/cos/Templates"
	} ];
	*/

}).call(this,require("lppjwH"))
},{"events":5,"lppjwH":7,"util":9}],3:[function(require,module,exports){
var events = require('events');
var util = require('util');
//var mime = require('mime');
//var netcomm = require('/home/cos/Templates/demo-rio/nodewebkit/backend/apilocalHandle.js');

//var fs = require('fs');
//eval(fs.readFileSync('../backend/api.js')+'');
//eval(fs.readFileSync('../backend/apiHttpHandle.js')+'');
function browser(){
  var ua = window.navigator.userAgent,
      ret = "";
  //console.log('ua', ua);
  if(/Firefox/g.test(ua)){
    ua = ua.split(" ");
    ret="Firefox|"+ua[ua.length-1].split("/")[1];
  }
  else if(/Nodejs/g.test(ua)){
    ua = ua.split(" ");
    ret = clienet_local + "|"+ua[ua.length-1].split("/")[1];
  }
  else if(/MSIE/g.test(ua)){
    ua = ua.split(";");
    ret = "IE|"+ua[1].split(" ")[2];
  }
  else if(/Opera/g.test(ua)){
    ua = ua.split(" ");
    ret = "Opera|"+ua[ua.length-1].split("/")[1];
  }
  else if(/Chrome/g.test(ua)){
    ua = ua.split(" ");
    ret = "Chrome|"+ua[ua.length-2].split("/")[1];
  }
  else if(/^apple\s+/i.test(window.navigator.vendor)){
    ua = ua.split(" ");
    ret = "Safair|"+ua[ua.length-2].split("/")[1];
  }
  else{
    ret = "未知浏览器";
  }
  return ret.split("|");
}

var r=browser();
var client_type = r[0];
var clienet_local = 'Nodejs';
//var ip='192.168.160.176';
var ip = '127.0.0.1';
var port = ':8888';
function getAllCateFromHttp(getAllCateCb) {
//  var studentData = CollectionData();
    var ajax_url = '';
    console.log('client_type', client_type);
    console.log('clienet_local', clienet_local);
    if(client_type == clienet_local){
        ajax_url = '/getAllCate';
    }else{
        ajax_url = 'http://' + ip + port + '/getAllCate';
    }
    console.log('ajax_url', ajax_url);
  $.ajax({
    url: ajax_url,
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllCate","arg":"null"}',
    success: function(result) {
      var cates = new Array();
      result.forEach(function (each){
        cates.push({
          id:each.id,
          type:each.type,
          path:each.path
        });
      });
      getAllCateCb(cates);
    },
    error: function(e) {
      getAllCateCb(e);
    }
  });
}

function getAllDataByCateFromHttp(getAllDataByCateCb,cate) {
//  var studentData = CollectionData();
    var ajax_url = '';
    if(client_type == clienet_local){
        ajax_url = '/getAllDataByCate';
    }else{
        ajax_url = 'http://' + ip + port + '/getAllDataByCate';
    }
  $.ajax({
    url: ajax_url,
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllDataByCate","arg":"'+cate+'"}',
    success: function(result) {
      var cates = new Array();
      result.forEach(function (each){
        cates.push({
          id:each.id,
          filename:each.filename,
          postfix:each.postfix,
          path:each.path
        });
      });
      getAllDataByCateCb(cates);
    },
    error: function(e) {
      getAllDataByCateCb(e);
    }
  });
}
function getAllContactsFromHttp(getAllContactsCb) {
//  var studentData = CollectionData();
    var ajax_url = '';
    if(client_type == clienet_local){
        ajax_url = '/getAllContacts';
    }else{
        ajax_url = 'http://' + ip + port + '/getAllContacts';
    }
  $.ajax({
    url: ajax_url,
    type: "post",
    contentType: "application/json;charset=utf-8",
    dataType: "json",
    data: '{"func":"getAllContacts","arg":"null"}',
    success: function(result) {
      var contacts = new Array();
      result.forEach(function (each){
        contacts.push({
          id:each.id,
          name:each.name,
          photoPath:each.photoPath
        });
      });
      getAllContactsCb(contacts);
    },
    error: function(e) {
      getAllContactsCb(e);
    }
  });
}
//console.log('current path in folder_view.js:', process.cwd());
// Template engine
function gen_files_view(files){
    var result = [];
    for(var i=0; i<files.length; i++){
        result.push('<div class="file" data-path="' + files[i].path + '">');
        if(files[i].img){
            if(client_type == clienet_local){ 
                result.push('<div class="icon"> <img src="' + files[i].img + '"></div>');
            }else{
                result.push('<div class="icon"> <img src="' + files[i].img + '?query=absolute"></div>');
            }
        }else{
            result.push('<div class="icon"> <img src="icons/' + files[i].type + '.png"></div>');
        }
        result.push('<div class="name">' + files[i].name + '</div>');
        result.push('</div>');
    }
    return result.join('\n');
}
// Our type
function Folder(jquery_element, sidebar) {
	events.EventEmitter.call(this);
	this.element = jquery_element;
    this.side_bar = sidebar;
	var self = this;
	this.element.parent().on('mousedown', function(e) {
	    console.log('in this.element mouse down');
//		console.log('e.pageX', e.pageX);
//		console.log('e.pageY', e.pageY);
//		console.log('e.target', e.target);
//		console.log('e.timeStamp', e.timeStamp);
//		console.log('e.type', e.type);
//		console.log('e.which', e.which);	
        
		switch(e.which){
		case 3:
            var contents = ['创建文件夹', '创建文档', '排列项目', '属性'];
            //var contents = ['aaa', 'bbb', 'ccc', 'ddd'];
		    var popup_menu = self.gen_popup_menu(contents);		    
            var row = this;
            $(popup_menu).on('mousedown', function(e){
                //console.log('in popup menu e.target', $(e.target).text());
                console.log('right button for ', global_dir);//$(row).attr('data-path')
                //console.log('contents', contents);
                for(var i=0; i<contents.length; i++){
                    if($(e.target).text() == contents[i]){
                        console.log(contents[i] + 'is clicked');
                    }                
                }
		        //e.stopPropagation();  
            });
            self.element.append(popup_menu);  
            self.element.children('.dropdown-menu').css({
                'display':'block',
                'position': 'fixed',
                'left': (e.pageX) + 'px',
                'top': (e.pageY) + 'px'
            });
		    break;
        case 1:
		    self.element.children('.focus').removeClass('focus');
            self.element.children('.dropdown-menu').css({'display':'none'});
            break;
        }
		//e.stopPropagation();
	});
	/*
	// Click on blank
	this.element.parent().on('click', function(e) {
		self.element.children('.focus').removeClass('focus');
        self.element.children('.dropdown-menu').css({'display':'none'});
	});
	// Click on file
	this.element.delegate('.file', 'click', function(e) {
		self.element.children('.focus').removeClass('focus');
		$(this).addClass('focus');
		e.stopPropagation();
	});
	*/
	
	this.element.delegate('.file', 'mousedown', function(e) {
	    console.log('in file mouse down');
		self.element.children('.focus').removeClass('focus');
		$(this).addClass('focus');
		switch(e.which){
		case 3:
		    var contents = ['打开', '编辑', '删除', '属性'];
		    var popup_menu = self.gen_popup_menu(contents);
            var file = this;
            $(popup_menu).on('mousedown', function(e){
                //console.log('in popup menu e.target', $(e.target).text());
                console.log('right button for ', $(file).attr('data-path'));
                //console.log('contents', contents);
                for(var i=0; i<contents.length; i++){
                    if($(e.target).text() == contents[i]){
                        console.log(contents[i] + 'is clicked');
                    }                
                }
		        //e.stopPropagation();  
            });
            self.element.append(popup_menu);            
//            var offset = self.element.parent().offset();
//            console.log('page:', e.pageX, e.pageY);
//            console.log('offset:', offset.left, offset.top);
//    		  console.log('e.target', e.target.toString());
            self.element.children('.dropdown-menu').css({
                'display':'block',
                'position': 'fixed',
                'left': (e.pageX) + 'px',
                'top': (e.pageY) + 'px'
                //'left': (e.pageX - offset.left) + 'px',
                //'top': (e.pageY - offset.top) + 'px'
            });
            break;
        case 1:
            self.element.children('.dropdown-menu').css({'display':'none'});
            break;
        }
		e.stopPropagation();
	});
	// Double click on file
	this.element.delegate('.file', 'dblclick', function() {
	    var file_json = self.find_json_by_path($(this).attr('data-path'));
	    var file_path = file_json.path;
	    //console.log('file_json:', file_json);
	    if(file_json){
		    self.emit('navigate', file_json);//mime.stat(file_path, file_type)
		}
	});
	//to prevent default context menu
    $('body').bind('contextmenu', function(e) {
        return false;
    });
}
util.inherits(Folder, events.EventEmitter);

Folder.prototype.gen_popup_menu = function(contents){
    this.element.children('.dropdown-menu').remove();
    var menu = $('<ul class="dropdown-menu" role="menu" aria-labelledby="dropdownMenu"></ul>');
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
    //<li class="divider"></li>
    return menu;
}
var global_self;
var global_dir;
var file_arch_json = {};
Folder.prototype.find_json_by_path = function(filepath){
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
Folder.prototype.get_callback_data = function(data_json){
	console.log('data from server:', data_json);
	switch(global_dir){
	case 'root':
	    for(var i=0; i<data_json.length; i++){
	        data_json[i]['path'] = 'root/'+data_json[i]['type'];
	        data_json[i]['name'] = data_json[i]['type'];
	        data_json[i]['type'] = 'folder';	    
	    }
	    //global_self.gen_side_bar(data_json);	    
		global_self.emit('folder_set_favorites', data_json);//mime.stat(file_path, file_type)
	    break;
    case 'root/Contacts':
	    for(var i=0; i<data_json.length; i++){
	        //data_json[i]['img'] = data_json[i]['photoPath'];
	        data_json[i]['path'] = 'root/Contacts/'+data_json[i]['name']; 
	        data_json[i]['type'] = 'image';
	    }
        break;
    case 'root/Pictures':
	    for(var i=0; i<data_json.length; i++){
	        data_json[i]['img'] = data_json[i]['path'];
	        data_json[i]['path'] = 'root/Pictures/'+data_json[i]['filename'];
	        data_json[i]['name'] = data_json[i]['filename'];      
	        data_json[i]['type'] = 'text';
	    }
        break;
    case 'root/Videos':
	    for(var i=0; i<data_json.length; i++){
	        data_json[i]['path'] = 'root/Videos/'+data_json[i]['filename'];
	        data_json[i]['name'] = data_json[i]['filename'];
	        //data_json[i]['img'] = '.'+data_json[i]['photoPath'];	        
	        data_json[i]['type'] = 'movie';
	    }
        break;
    default:
        break;
	}
	file_arch_json[global_dir] = data_json;
	//console.log('data from server after treat:', data_json);
	global_self.element.html(gen_files_view(data_json));
}


Folder.prototype.open = function(dir) {
	global_self = this;
	global_dir = dir;
	switch(global_dir){
	case 'root':
	    getAllCateFromHttp(this.get_callback_data);
	    //netcomm.getAllCateFromLocal(this.get_callback_data);
	    break;
    case 'root/Contacts':
        getAllContactsFromHttp(this.get_callback_data);
        //netcomm.getAllContactsFromLocal(this.get_callback_data);
        break;
    case 'root/Pictures':
        getAllDataByCateFromHttp(this.get_callback_data, 'Pictures');
        //netcomm.getAllDataByCateFromLocal(this.get_callback_data, 'Pictures');
        break;
    case 'root/Videos':
        getAllDataByCateFromHttp(this.get_callback_data, 'Videos');
        //netcomm.getAllDataByCateFromLocal(this.get_callback_data, 'Videos');
        break;
    default:
        window.alert('Path '+global_dir+' does not exist.');
        break;
	}
}

exports.Folder = Folder;
//data from server:
//root:
//[{"id":"0#101","type":"Contacts","path":"./resources/logo/contacts.png"},{"id":"0#102","type":"Pictures","path":"./resources/logo/pictures.png"},{"id":"0#103","type":"Videos","path":"./resources/logo/videos.png"}]
//Contact:
//[{"id":"1#1","name":"Lily","photoPath":"./resources/contacts/boy.jpg"},{"id":"1#2","name":"zhang","photoPath":"./resources/contacts/city3.jpg"},{"id":"1#3","name":"wang","photoPath":"./resources/contacts/girl1.jpg"},{"id":"1#4","name":"li","photoPath":"./resources/contacts/girl2.jpg"},{"id":"1#5","name":"zhao","photoPath":"./resources/contacts/girl3.jpg"},{"id":"1#13","name":"zhang","photoPath":"./resource/photo/test.jpg"},{"id":"1#1000014","name":"zhang","photoPath":"./resource/photo/test.jpg"}]
//Pictures
// [{"id":"2#1","filename":"jianmin","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/jianmin.jpg"},{"id":"2#2","filename":"wangyu","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/wangyu.jpg"},{"id":"2#3","filename":"xifei","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/xifei.jpg"},{"id":"2#4","filename":"yuanzhe","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/yuanzhe.jpg"},{"id":"2#5","filename":"contacts","postfix":"png","path":"/home/v1/demo-rio/nodewebkit/resources/logo/contacts.png"},{"id":"2#6","filename":"pictures","postfix":"png","path":"/home/v1/demo-rio/nodewebkit/resources/logo/pictures.png"},{"id":"2#7","filename":"city1","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/city1.jpg"},{"id":"2#8","filename":"city4","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/city4.jpg"},{"id":"2#9","filename":"city3","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/city3.jpg"},{"id":"2#10","filename":"city2","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/city2.jpg"},{"id":"2#11","filename":"girl2","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/girl2.jpg"},{"id":"2#12","filename":"girl3","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/girl3.jpg"},{"id":"2#13","filename":"vessel1","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/vessel1.jpg"},{"id":"2#14","filename":"Penguins","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/Penguins.jpg"},{"id":"2#15","filename":"city5","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/city5.jpg"},{"id":"2#16","filename":"wangtan","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/wangtan.jpg"},{"id":"2#17","filename":"wuxiang","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/wuxiang.jpg"},{"id":"2#18","filename":"boy","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/boy.jpg"},{"id":"2#19","filename":"cat","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/cat.jpg"},{"id":"2#20","filename":"videos","postfix":"png","path":"/home/v1/demo-rio/nodewebkit/resources/logo/videos.png"},{"id":"2#21","filename":"vessel2","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/vessel2.jpg"},{"id":"2#22","filename":"wangfeng","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/contactsphoto/wangfeng.jpg"},{"id":"2#23","filename":"girl1","postfix":"jpg","path":"/home/v1/demo-rio/nodewebkit/resources/pictures/girl1.jpg"}]
//Videos
//[{"id":"3#1","filename":null,"postfix":"flv","path":"./resources/videos/test1.flv"},{"id":"3#2","filename":null,"postfix":"flv","path":"./resources/videos/test2.flv"},{"id":"3#3","filename":null,"postfix":"flv","path":"./resources/videos/test3.flv"},{"id":"3#4","filename":null,"postfix":"hlv","path":"./resources/videos/test4.hlv"},{"id":"3#10000005","filename":null,"postfix":"hlv","path":"./resources/videos/test5.hlv"}]
/*
	files = [
			{
				"name" : "bootstrap",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/bootstrap",
				"type" : "folder"
			},
			{
				"name" : "bundle.js",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/bundle.js",
				"type" : "blank"
			},
			{
				"name" : "icons",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/icons",
				"type" : "folder"
			},
			{
				"name" : "images",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/images",
				"type" : "folder"
			},
			{
				"name" : "index.html",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/index.html",
				"type" : "html"
			},
			{
				"name" : "js",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/js",
				"type" : "folder"
			},
			{
				"name" : "main.js",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/main.js",
				"type" : "blank"
			},
			{
				"name" : "node_modules",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/node_modules",
				"type" : "folder"
			},
			{
				"name" : "package.json",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/package.json",
				"type" : "blank"
			},
			{
				"name" : "README.md",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/README.md",
				"type" : "text"
			},
			{
				"name" : "style.css",
				"path" : "/home/cos/Templates/node-webkit-v0.9.2-linux-ia32_and_example/file-explorer/style.css",
				"type" : "css"
			} ];
*/

},{"events":5,"util":9}],4:[function(require,module,exports){
var events = require('events');
var util = require('util');

// Our type
function SideBar(jquery_element) {
    events.EventEmitter.call(this);
    this.element = jquery_element;
    this.favorites = $(jquery_element).children('#favorites');
    this.tags = $(jquery_element).children('#tags');
    this.filters = $(jquery_element).children('#filters');
    this.recent = $(jquery_element).children('#recent');
    //this.side_bar = sidebar;
    var self = this;
	/*
	// Click on blank
	this.element.parent().on('click', function() {
		self.element.children('.focus').removeClass('focus');
	});
	// Click on file
	this.element.delegate('.file', 'click', function(e) {
		self.element.children('.focus').removeClass('focus');
		$(this).addClass('focus');
		e.stopPropagation();
	});
	// Double click on file
	this.element.delegate('.file', 'dblclick', function() {
	    var file_json = self.find_json_by_path($(this).attr('data-path'));
	    var file_path = file_json.path;
	    //console.log('file_json:', file_json);
	    if(file_json){
            var children = self.side_bar.children('li');
            for(var i=0; i<children.length; i++){
                child = $(children[i]);
                //console.log('child length',child.attr('data-path'), file_path);            
                if(child.attr('data-path') == file_path){
                    //console.log("match match");
                    self.side_bar.children('.active').removeClass('active');
                    self.side_bar.find('.icon-white').removeClass('icon-white');
                    child.addClass('active');
                    child.children('a').children('i').addClass('icon-white ');
                    break;
                }
            }
		    self.emit('navigate', file_json);//mime.stat(file_path, file_type)
		}
	});
	*/
}

util.inherits(SideBar, events.EventEmitter);

SideBar.prototype.set_tags = function(json){
    var self = this;
    var result = [];
    result.push('<li class="divider"></li>');
    result.push('<li class="nav-header">标签</li>');
    //result.push('<li data-path="about"><a href="#"><i class="icon-flag"></i> About</a></li>');
    result.push('<a href="#"> 上海项目</a> <a href="#"> 技术研讨会</a>');
    self.tags.html(result.join('\n'));
}

SideBar.prototype.set_filters = function(json){
    var self = this;
    var result = [];
    result.push('<li class="divider"></li>');
    result.push('<li class="nav-header">数据过滤</li>');
    for(var i=0; i< json.length; i++){
        switch(json[i].name)
        {
            case 'Contacts':
                result.push('<form action="" name="fxk" method="post"><input type="checkbox" value="A1" name="test" />135开头</form>');
                break;
            case 'Pictures':
                result.push('<form action="" name="fxk" method="post"><input type="checkbox" value="A1" name="test" />版本组</form>');
                break;
            case 'Music':
                result.push('<form action="" name="fxk" method="post"><input type="checkbox" value="A1" name="test" />周杰伦</form>');
                break;
            case 'Documents':
                result.push('<form action="" name="fxk" method="post"><input type="checkbox" value="A1" name="test" />核高基项目</form>');
                break;
        }
    }
    self.filters.html(result.join('\n'));
}

SideBar.prototype.set_recent = function(json){
    var self = this;
    var result = [];
    result.push('<li class="divider"></li>');
    result.push('<li class="divider"></li>');
    result.push('<li class="nav-header">最近访问</li>');
    self.recent.html(result.join('\n'));
}

SideBar.prototype.set_favorites = function(favorites_json){
    var self = this;
    var result = [];
    result.push('<li class="nav-header">快捷菜单</li>');
    result.push('<li data-path="root" class="active"><a href="#"><i class="icon-white icon-home"></i> Home</a></li>');
    for(var i=0; i< favorites_json.length; i++){
        var str='<li data-path="'+favorites_json[i].path+'"><a href="#"><i class="';
        switch(favorites_json[i].name)
        {
            case 'Contacts':
                str+='icon-user';
                break;
            case 'Pictures':
                str+='icon-picture';
                break;
            case 'Videos':
                str+='icon-film';
                break;
            case 'Documents':
                str+='icon-book';
                break;
            case 'Musics':
                str+='icon-music';
                break;
        }
        str+='"></i> '+favorites_json[i].name+'</a></li>';
        result.push(str);
    }
    self.favorites.html(result.join('\n'));
    self.favorites.delegate('a', 'click', function() {
        self.favorites.children('.active').removeClass('active');
        self.favorites.find('.icon-white').removeClass('icon-white');
        $(this).parent().addClass('active');
        $(this).children('i').addClass('icon-white ');
        var file_path = $(this).parent().attr('data-path');		
	   //var file_json = global_self.find_json_by_path(file_path);
	    //console.log('click on side_bar', file_json);
	    //if(file_json){
		    //global_self.emit('navigate', file_json);
		//}
        if('about' == file_path){
	    window.alert('in developing...^_^');
        }else{
            //self.open(file_path);
            self.emit('open_favorite', file_path);
        }
    });
}
SideBar.prototype.set_favorites_focus = function(mime){
    self = this;
    var file_path = mime.path;
    var children = self.favorites.children('li');
    for(var i=0; i<children.length; i++){
        child = $(children[i]);
        //console.log('child length',child.attr('data-path'), file_path);    
        if(child.attr('data-path') == file_path){
            //console.log("match match");
            self.favorites.children('.active').removeClass('active');
            self.favorites.find('.icon-white').removeClass('icon-white');
            child.addClass('active');
            child.children('a').children('i').addClass('icon-white ');
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

exports.SideBar = SideBar;

},{"events":5,"util":9}],5:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],6:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],7:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],8:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],9:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require("lppjwH"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":8,"inherits":6,"lppjwH":7}]},{},[1])
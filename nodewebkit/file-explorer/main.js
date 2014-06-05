global.$ = $;
//console.log(global.__dirname);//当前路径
//console.log(global.__filename);
//console.log("path:" + process.cwd());
var abar = require("./file-explorer/node_modules/address_bar.js");//
var folder_view = require('./file-explorer/node_modules/folder_view.js');//
//var path = require('path');
//var shell = require('nw.gui').Shell;

//    function get_data(text){
//	console.log('data from server:', text);
//    }
$(document).ready(function() {
    //getAllCate(get_data);
	var folder = new folder_view.Folder($('#files'), $('#sidebar'));
	var addressbar = new abar.AddressBar($('#addressbar'));

	folder.open('root');//process.cwd()
	addressbar.set('root');//

	folder.on('navigate', function(mime) {
		if (mime.type == 'folder') {
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
	folder.on('set_address', function(dir) {
	    //console.log('on set address', dir);
		addressbar.set(dir);
	});
	addressbar.on('navigate', function(dir) {
		folder.open(dir);
	});
});

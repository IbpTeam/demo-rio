global.$ = $;

//console.log(global.__dirname);
//console.log(global.__filename);
//console.log("path:" + process.cwd());
//var sbar = require("side_bar.js");//./file-explorer/node_modules/
//var abar = require("address_bar.js");//./file-explorer/node_modules/
//var folder_view = require('folder_view.js');//./file-explorer/node_modules/
//var path = require('path');
//var shell = require('nw.gui').Shell;

//    function get_data(text){
//	console.log('data from server:', text);
//    }

$(document).ready(function() {
    //getAllCate(get_data);
    configuration();
    var sidebar = new SideBar($('#sidebar'));
	var folder = new Folder($('#files'), $('#sidebar'));
	var addressbar = new AddressBar($('#addressbar'));

	folder.open('root');//process.cwd()
	addressbar.set('root');//

	folder.on('navigate', function(mime) {
		if (mime['props'].type == 'folder') {
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
	folder.on('folder_set_sidebar', function(dirs){
        sidebar.set_tags(dirs);
        sidebar.set_filters(dirs);
        sidebar.set_recent(dirs);
    });
    
	sidebar.on('open_favorite', function(dir) {
	    console.log('on open_favorite: ', dir);
		folder.open(dir);
		addressbar.set(dir);
	});
    sidebar.on('do_filter', function(dir, keyword) {
        console.log('wangyu: on do_filter.');
        sidebar.do_filter(dir, keyword);
    });
    sidebar.on('show_filter_result', function(filter_json) {
        console.log('wangyu:', filter_json);
        folder.get_callback_data(filter_json);
        //addressbar.set(dir);
    });
	addressbar.on('navigate', function(dir) {
		folder.open(dir);
	});
});


function configuration(){
    //$(function () { $("[data-toggle='popover']").popover(); });
    // for qrcode popover
    /*
    <div class="popover bottom">
      <div class="arrow"></div>
      <h3 class="popover-title">Popover bottom</h3>
      <div class="popover-content">
        <p>Sed posuere consectetur est at lobortis. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.</p>
      </div>
    </div>
    */    
    $('#qrcode').on('click', function(){
        if($('.popover').length){
            $('.popover').remove();
        }else{
            var popover = $('<div></div>').addClass("popover bottom");
            popover.append($('<div></div>').addClass("arrow"));
            popover.append($('<h3>扫描二维码</h3>').addClass("popover-title"));
            var popover_content = $('<div></div>').addClass("popover-content");
            popover_content.qrcode({
                        text: 'html5-file-explorer.版本制作组',
                        width: 150,
                        height: 150
                    });
            popover.append(popover_content);
            
            var right = $('#frontend').offset().left + $('#frontend').width();
            var popover_width = 200;//just guess;
            var btn_bottom = $(this).offset().top + $(this).height();
            var btn_mid_horizon = $(this).offset().left + $(this).width() / 2;
            var popover_left = btn_mid_horizon - popover_width / 2;
            var popover_right = btn_mid_horizon + popover_width / 2;
            var popover_top = btn_bottom + 'px';
//            console.log('popover_width', popover_width);
//            console.log('btn_bottomh', btn_bottom);
//            console.log('btn_mid_horizon', btn_mid_horizon);
//            console.log('popover_left', popover_left);
            popover_left = ((popover_right > right) ? right - popover_width : popover_left)+ 'px';
            popover.css({
                'top': popover_top,
                'left': popover_left,
                'display': 'block',
            });
            $('#frontend').append(popover);
        }
//        console.log('popover', $('.popover').width(), $('.popover').height(), $('.popover').css('padding-top'), $('.popover').css('padding-left'));
//        console.log('qrcode button is pressed.');
//        console.log('frontend', $('#frontend').offset().top, $('#frontend').offset().left, $('#frontend').width(), $('#frontend').height(), $('#frontend').css('padding-top'), $('#frontend').css('padding-left'));
//        console.log('qrcode-button', $(this).offset().top, $(this).offset().left, $(this).width(), $(this).height(), $(this).css('padding-top'), $(this).css('padding-left'));
    });
    
	//to prevent default context menu
    $('body').bind('contextmenu', function(e) {
        return false;
    });
}

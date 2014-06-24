//global.$ = $;
//global.getAllCate = getAllCate;
//global.getAllDataByCate = getAllDataByCate;
//global.rmDataById = rmDataById;
//global.getDataById = getDataById;
//global.getDataSourceById = getDataSourceById;
//global.updateDataValue = updateDataValue;
//global.getRecentAccessData = getRecentAccessData;
//var rel_path = '';//./frontend-dev/node_modules/
//var sbar = require("side_bar.js");
//var abar = require("address_bar.js");
//var folder_view = require('folder_view.js');

//var path = require('path');
//var shell = require('nw.gui').Shell;
pre_config();
$(document).ready(function() {
    //getAllCate(get_data);
    configuration();
//    var sidebar = new sbar.SideBar($('#sidebar'));
//	var addressbar = new abar.AddressBar($('#addressbar'));
//	var folder = new folder_view.Folder($('#files'));

//    if($.eventEmitter){
//        console.log('*in main.js', $.eventEmitter);
//    }
    var sidebar = new SideBar($('#sidebar'));
	var folder = new Folder($('#files'));
	var addressbar = new AddressBar($('#addressbar'));

	folder.open('root');//process.cwd()
	addressbar.set('root');

	folder.on('navigate', function(event, mime) {
//		if (mime['props'].type == 'folder') {
		    sidebar.set_favorites_focus(mime);
			addressbar.enter(mime);
//		}
//		else {
//			//shell.openItem(mime.path);
//			var file_propery='';
//		    for(var key in mime){
//			    file_propery += key + ':' + mime[key] + '\n';
//		    }
//		    alert(file_propery);
//		}
	});
	folder.on('set_favorites', function(event) {
	    var messages = Array.prototype.slice.call(arguments, 1);
	    //console.log('set favorites2.', messages);
	    sidebar.set_favorites(messages);
	});
	folder.on('set_sidebar', function(event){
        var messages = Array.prototype.slice.call(arguments, 1);
        sidebar.set_tags(messages);
        sidebar.set_filters(messages);
        sidebar.set_recent(messages);
    });
    
	sidebar.on('open_favorite', function(event, dirs) {
		folder.open(dirs);
		addressbar.set(dirs);
	});
    sidebar.on('do_filter', function(event, keyword) {
        console.log('wangyu: on do_filter.');
        var messages = Array.prototype.slice.call(arguments, 1);
        sidebar.do_filter(messages, keyword);
    });
    sidebar.on('show_filter_result', function(event) {
        var messages = Array.prototype.slice.call(arguments, 1);
        folder.get_callback_data(messages);
        //addressbar.set(dir);
    });
	addressbar.on('navigate', function(event, dir) {
	    console.log('dir:', dir);
		folder.open(dir);
	});
});

function pre_config(){
    (function(jQuery) {
      jQuery.eventEmitter = {
        _JQInit: function() {
          this._JQ = jQuery(this);
        },
        emit: function(evt, data) {
          !this._JQ && this._JQInit();
          this._JQ.trigger(evt, data);
        },
        once: function(evt, handler) {
          !this._JQ && this._JQInit();
          this._JQ.one(evt, handler);
        },
        on: function(evt, handler) {
          !this._JQ && this._JQInit();
          this._JQ.bind(evt, handler);
        },
        off: function(evt, handler) {
          !this._JQ && this._JQInit();
          this._JQ.unbind(evt, handler);
        }
      };
    }(jQuery));
}

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

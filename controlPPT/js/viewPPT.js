/* app for controlling ppt
*/

// get all ppt files in the Datamgr
function cb_get_ppt_data(data_json){
    var i=0;
    var pl = $('#pptlist');
    for(i=0;i<data_json.length;i++)
    	if(data_json[i].postfix == 'ppt' || data_json[i].postfix == 'pptx')
    	{
    		console.log(data_json[i].filename);

    		var _div1 = $('<div class = "file" data-uri = "' + data_json[i].URI + '"></div>');
    		var _div2 = $('<div class = "icon"></div>');
    		var _img = $('<img src = "icons/Powerpoint.png">');
    		var _div3 = $('<div class = "name" id = "'+ data_json[i].filename +'">' + data_json[i].filename +
    			'</div>');
    		pl.append(_div1);
    		_div1.append(_div2);
    		_div2.append(_img);
    		_div1.append(_div3);
    		_div1.click(function(ev){
                view_ppt_file($(this).data('uri'));
            });
    	}

    }

function getAllDataByCate() {
    WDC.requireAPI(['data'], function(data){
    console.log("data:" +  data);
    data.getAllDataByCate(cb_get_ppt_data,"document");
      });
    }  

function view_ppt_file(uri){
	console.log("open ppt with localApp... ");
    var _ppturi = uri;
    WDC.requireAPI(['data'],function(data){
            console.log("data:" + data);
            data.openDataByUri(cb_get_ppt_source_file,_ppturi);
        });
}

function cb_get_ppt_source_file(data_json){
    console.log('get ppt source file', data_json);
    var _div = $('<div>',{
        id:'control'
    });
   
    var _play_button = $('<button>',{
        id:'palybutton',
        class:'btn btn-success',
        text:'PLAY'
    })
    var _up_button = $('<button>',{
        id:'upbutton',
        class:'btn btn-success',
        text:'UP'
    })
    var _down_button = $('<button>',{
        id:'downbutton',
        class:'btn btn-success',
        text:'DOWN'
    })
    var _esc_button = $('<button>',{
        id:'escbutton',
        class:'btn btn-success',
        text:'STOP'
    })
    var _text = $('<p>',{
        id:'pptname',
        align:'center',
        text:'file name: '+ data_json.windowname
    })

    _div.append(_text);
    _div.append(_play_button);
    _div.append(_up_button);
    _div.append(_down_button);
    _div.append(_esc_button);
    $('body').append(_div);


    _play_button.click(function(e) {
        sendKeyToWindow(data_json['windowname'],'F5');
    });
    _up_button.click(function(e) {
        sendKeyToWindow(data_json['windowname'], 'Up');
    });
    _down_button.click(function(e) {
        sendKeyToWindow(data_json['windowname'], 'Down');
    });
    _esc_button.click(function(e) {
        sendKeyToWindow(data_json['windowname'], 'Escape');
        _div.hide();
    });

}

function sendKeyToWindow(windowname, key){
    console.log("sendkey " + key + " To Window " + windowname);
    WDC.requireAPI(['app'],function(app){
        _app = app;
        _app.sendKeyToApp(function(){}, windowname, key);
    });
}


function genQrcode(){
    _isQrc = false;
    addQrcode();
    _qrcodeContainer.hide();
    bindEvent();
}

function bindEvent(){
        // var _this = this;
    var hideQrc = function(ev){
      if(_qrcodeContainer){
        _qrcodeContainer.hide('fast', function() {
            $('body').unbind('click',hideQrc);
        });
      }
    }
    $('#qrcode').click(function(ev) {
      if (_isQrc === false) {
        WDC.requireAPI(['data'],function(data){
            console.log("data"+data);
            data.getServerAddress(function(serverAddr_){
                if(window !== top){
                    var _hostLink = 'http://' + serverAddr_.ip + ':' + serverAddr_.port +'/callapp/'+WDC.AppID+ '/index.html';
                }else{
                    var _hostLink = 'http://' + serverAddr_.ip + ':' + serverAddr_.port + '/index.html';
                }
                console.log("_hostLink of the qrcode is " + _hostLink);
                _qrcodeContainer.children('.qrcode-content') .qrcode({
                    text: _hostLink,
                    width:150,
                    height: 150
                });
                _isQrc = true;
            });
        });
      }
      _qrcodeContainer.show('fast', function() {
        $('body').click(hideQrc);
      });
    });
}

function addQrcode(){
    _qrcodeContainer = $('<div>',{
        'class': 'qrcode-container'
    });
    var _qrcodeTriangle = $('<div>',{
        'class':'qrcode-triangle qrcode-down'
    })
    var _qrcodeTriangleCover = $('<i>',{
        'class':'qrcode-triangle qrcode-top'
    })
    var _qrcodeTitle = $('<div>',{
        'class':'qrcode-title',
        'text': '二维码显示'
    })
    var _qrcodeContent = $('<div>',{
        'class': 'qrcode-content'
    });
    _qrcodeContainer.append(_qrcodeTriangle);
    _qrcodeContainer.append(_qrcodeTriangleCover);
    _qrcodeContainer.append(_qrcodeTitle);
    _qrcodeContainer.append(_qrcodeContent);
    $('body').append(_qrcodeContainer);
}
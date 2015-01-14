var PropertyView = Class.extend({
  init:function(){
    this._windowOption = {
      'close':true,
      'max':false,
      'min':false,
      'hide':false,
      'resize':false,
      'hideWindow':false,
      'maxWindow':false,
      'animate':true,
      'contentDiv':true,
      'iframe':true,
      'title_align':'center',
      'fadeSpeed':200,
      'width':500,
      'height':580,
      'left':150,
      'top':40,
      'minWidth':200,
      'minHeight':200,
    };
    this._json = {};
  },
  loadData:function(json_){
    this._window = Window.create('property-window','属性',this._windowOption);
    var _window_div = $('<div>',{
      'class':'window-div',
    });
    var _content_div = $('<div>',{
      'class':'content-div',
    });
    this._json = json_;
    var _json_arys = ['createDev','postfix','actorName','location','TALB','TPE1','TIT2'
          ,'size','createTime','lastAccessTime','lastModifyTime','lastAccessDev'
          ,'lastModifyDev'];
	 var _json_arys_chs = ['生成设备','文件名','表演者','地点','TALB','TPE1','TIT2','大小','生成时间','最后访问时间','最后修改时间','最后访问设备','最后修改设备'];
    var text;
    for(var key = 0; key<=_json_arys.length-1;key++){
      if((this._json[_json_arys[key]] != null)&&(this._json[_json_arys[key]] != 'null')) {
        switch(true){
          case _json_arys[key] == 'postfix' :
            text = this._json['filename'] +'.'+ this._json['postfix'];
          break;
          case _json_arys[key].indexOf("Time") >=0 :
            var time = new Date(this._json[_json_arys[key]]);
            text = time.toLocaleString()
          break;
          default:
            text = this._json[_json_arys[key]];
        } 
        var _window_text = $('<li>',{
          'class':'window-text',
        });
        var _text_title = $('<span>',{
          'class':'text-title',
          'text':_json_arys_chs[key]+':'
        });
        var _text_content = $('<span>',{
          'class':'text-content',
          'text':text
        });
        _window_text.append(_text_title);
        _window_text.append(_text_content);
        _content_div.append(_window_text);
      } else {
          continue; 
      }
    }
    var _window_text = $('<li>',{
      'class':'window-text',
    });
    var _text_title = $('<span>',{
      'class':'text-title',
      'text':'标签:'
    });
    var _tag_area = $('<textarea>',{
      'class':'tag-area',
      'readonly':'readonly'
    });
    _tag_area[0].innerHTML = json_['others'].replace(/,/g,', ');
    _window_text.append(_text_title);
    _window_text.append(_tag_area);
    _content_div.append(_window_text);

    var _window_img = $('<div>',{
      'class':'window-img',
    });
    this._content_img = $('<img>',{
      'class':'content-img',
    })
    _window_img.append(this._content_img);
    _window_div.append(_content_div);
    _window_div.append(_window_img);
    this._window.append(_window_div);
  },
  setImg:function(src_){
    this._content_img[0].src = src_;
  },
  show:function(){
    this._window.show();
  },
  hide:function(){
    this._window.hide();
  }
});

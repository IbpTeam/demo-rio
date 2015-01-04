//搜索框部分的窗口实现。
var Search = Class.extend({
  init:function(){
    this._searchButton = $('<div>',{
      'id': 'search-button',
      'class': 'icon-search'
    })
    this._qrcode = $('<a>',{
      'id': 'qrcode-button',
      'class': 'icon-qrcode'
    });
    this._isQrc = false;
    this.addQrcode();
    this._qrcodeContainer.hide();

    this._textTag = $('#search_input').textext({ plugins : 'prompt tags autocomplete' });
    this.bindRemove(function(ev,value_){
      alert(value_);
    })
    this.bindEvent();
  },

  attach:function($parent_){
    $parent_.append(this._searchButton);
    $parent_.append(this._qrcode);    
    $parent_.append(this._qrcodeContainer);
  },

  clearTags:function(){
    this._textTag.textext()[0]._plugins['tags'].tagElements().remove();
    $('#search_input').css('padding-left','5px');
    $('.text-prompt').css('padding-left','5px');
  },

  bindEvent:function(){
    var _this = this;
    var hideQrc = function(ev){
      if(_this._qrcodeContainer){
        _this._qrcodeContainer.hide('fast', function() {
          $('body').unbind('click',hideQrc);
        });
      }
    }
    this._qrcode.click(function(ev) {
      if (_this._isQrc === false) {
        DataAPI.getServerAddress(function(serverAddr_){
          var _hostLink = 'http://' + serverAddr_.ip + ':' + serverAddr_.port + '/index.html#';
          _this._qrcodeContainer.children('.qrcode-content') .qrcode({
            text: _hostLink,
            width:150,
            height: 150
          });
          _this._isQrc = true;
        });
      }
      _this._qrcodeContainer.show('fast', function() {
        $('body').click(hideQrc);
      });
    });
  },
  /**
   * [bindSuggestion 绑定搜索框内的自动提示数组，传入的是要自动提示功能的数组]
   * @return {[type]} [description]
   */
  bindSuggestion:function(tagTextList_){
    var _this = this;
    this._textTag.bind('getSuggestions',function(e,data){
      var textext = $(e.target).textext()[0];
      var query = (data ? data.query : '') || '';
      $(this).trigger(
        'setSuggestions',
        { result : textext.itemManager().filter(tagTextList_, query) }
      );
    });
  },
  /**
   * [bindRemove 当点击删除或点击退格键删除标签时触发callback_]
  * 触发回调函数时传回两个参数e鼠标或键盘的点击事件，value_是标签字符串
   * @param  {[type]} callback_ [description]
   * @return {[type]}           [description]
   */
  bindRemove:function(callback_){
    this._textTag.bind('tagRemove',function(e,value_){
      if (callback_) {
        callback_(e,value_);
      };
    });
  },
  /**
   * [bindClick 绑定点击事件，向回调函数中传回四个参数]
  * e：鼠标点击事件，
  * tag_: 标签对象
  *value_:标签的字符串
  *callbackTag_（newTagText_）：回调函数，用于修改标签名
   * @param  {[type]} callback_ [description]
   * @return {[type]}           [description]
   */
  bindClick:function(callback_){
    this._textTag.bind('tagClick'),function(e,tag_,value_,callbackTag_){
      if (callback_) {
        callback_(e,tag_,value_,callbackTag_);
      };
    }
  },

  addQrcode:function(){
    this._qrcodeContainer = $('<div>',{
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
    this._qrcodeContainer.append(_qrcodeTriangle);
    this._qrcodeContainer.append(_qrcodeTriangleCover);
    this._qrcodeContainer.append(_qrcodeTitle);
    this._qrcodeContainer.append(_qrcodeContent);
  }
});

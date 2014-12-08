//搜索框部分的窗口实现。
var Search = Class.extend({
  init:function(){
    this._Container = $('<div>',{
      'id': 'search-container'
    });
    this._inputer = $('<input>',{
      'type': 'text',
      'id': 'search-input',
      'value': 'Search...'
    });
    this._searchButton = $('<div>',{
      'id': 'search-button',
      'class': 'icon-search'
    })
    this._Container.append(this._inputer);
    this._Container.append(this._searchButton);
    this._qrcode = $('<a>',{
      'id': 'qrcode-button',
      'class': 'icon-qrcode'
    });
    this._isQrc = false;
    this.addQrcode();
    this._qrcodeContainer.hide();
    this.bindEvent();
  },

  attach:function($parent_){
    $parent_.append(this._Container);
    $parent_.append(this._qrcode);    
    $parent_.append(this._qrcodeContainer);
  },


  bindEvent:function(){
    var _this = this;
    this._inputer[0].onfocus = function(){
      this.select();
    }
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
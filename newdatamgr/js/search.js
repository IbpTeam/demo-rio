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
    this._qrcode = $('<div>',{
      'id': 'qrcode-button',
      'class': 'icon-qrcode'
    });

    this.bindEvent();
  },

  attach:function($parent_){
    $parent_.append(this._Container);
    $parent_.append(this._qrcode);
  },


  bindEvent:function(){
    this._inputer[0].onfocus = function(){
      this.select();
    }
  }
});

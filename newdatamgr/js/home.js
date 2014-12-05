var HomePage = Class.extend({
  init:function(){
    this._doc = MainVideoView.create();
    this._pic = MainPicView.create();
    this._video = MainDocView.create();
    this._music = undefined;
    this._contact = undefined;
    this._isShow = undefined;
  },

  attach:function($parent_){
    this._doc.attach($parent_);
    this._pic.attach($parent_);
    this._video.attach($parent_);
  },

  show:function(){
    this._isShow = true;
    this._doc.show();
    this._video.show();
    this._pic.show();
  },

  hide:function(){
    this._isShow = false;
    this._doc.hide();
    this._pic.hide();
    this._video.hide();
  }
})
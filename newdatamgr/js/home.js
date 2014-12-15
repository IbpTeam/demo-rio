var HomePage = Class.extend({
  init:function(){
    this._video = MainVideoView.create();
    this._pic = MainPicView.create();
    this._doc = MainDocView.create();
    this._music = MainMusicView.create();
    this._contact = MainContactView.create();
    this._isShow = undefined;
  },

  attach:function($parent_){
    this._doc.attach($parent_);
    this._pic.attach($parent_);
    this._video.attach($parent_);
    this._music.attach($parent_);
    this._contact.attach($parent_);
  },

  show:function(){
    this._isShow = true;
    this._doc.show();
    this._video.show();
    this._pic.show();
    this._music.show();
    this._contact.show();
  },

  hide:function(){
    this._isShow = false;
    this._doc.hide();
    this._pic.hide();
    this._video.hide();
    this._music.hide();
    this._contact.hide();
  }
})
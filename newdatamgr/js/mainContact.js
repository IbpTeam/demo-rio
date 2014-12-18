var MainContactView = Class.extend({
  init:function(){
    this._ContactsContainer = $('<div>',{
      'id': 'contacts-container'
    })
    this._ContactsTitleContent = $('<div>',{
      'id': 'contacts-title-content'
    });
    this._ContactsContainer.append(this._ContactsTitleContent);
    this._ContactsContent = $('<div>',{
      'id': 'contacts-content'
    });
    this._contactslistContent = $('<ul>',{
      'id':'contacts-list-content'
    });
    this._ContactsContent.append(this._contactslistContent);
    this._ContactsContainer.append(this._ContactsContent);
    //input title ui
    this._ContactsTitleTag = $('<div>',{
      'id': 'contacts-title-tag'
    })
    this._ContactsTitleContent.append(this._ContactsTitleTag);
    this._ContactsTitleText = $('<span>',{
      'id': 'contacts-title-text',
      'text': 'Contacts'
    })
    this._ContactsTitleContent.append(this._ContactsTitleText);
    this._titlebutton = $('<div>',{
      'id': 'title-button',
      'class': 'icon-plus-sign'
    })
    this._ContactsTitleContent.append(this._titlebutton);
    this.setContent();
  },

  setContent:function(){
    var _this = this;
    DataAPI.getAllDataByCate(function(contact_json_){
      if(contact_json_.length === 0){
        homePage._noneData++;
        if (homePage._noneData === homePage._dataClasses) {
          $('#avatar')[0].click();
        };
      }
      _this._contacts = contact_json_;
      var names_json = {};
      for(var i = 0; i < _this._contacts.length; i ++){
        var full_name = _this._contacts[i]['name'];
        var _email = _this._contacts[i]['email'];
        names_json[full_name] = _email;
      }
      if(contact_json_){
          for(var i in names_json){
            var _li = $('<li>',{
              'class':'contacts-list'
            });
            var _text = $('<span>',{
              'class':'contacts-list-title',
              'text': i
            });
            var _email = $('<a>',{
              'id':'email-button',
              'class':'icon-envelope',
              'href': 'mailto:'+names_json[i]
            });
            _li.append(_text);
           // _li.append(_date);
            _li.append(_email);
            _this._contactslistContent.append(_li);
          }
       }
    },'contact');
  },

  attach:function($parent_){
    $parent_.append(this._ContactsContainer);
  },

  show:function(){
    this._ContactsContainer.show();
  },
  
  hide:function(){
    this._ContactsContainer.hide();
  }
});
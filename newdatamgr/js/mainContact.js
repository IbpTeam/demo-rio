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
      'id': 'contacts-content',
      'class': 'nanoMaincontent'
    });
    this._ContactsContentNano = $('<div>',{
      'class': 'nano-content'
    });
    this._contactslistContent = $('<ul>',{
      'id':'contacts-list-content'
    });
    this._ContactsContentNano.append(this._contactslistContent);
    this._ContactsContainer.append(this._ContactsContent);
    this._ContactsContent.append(this._ContactsContentNano);
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
    DataAPI.getAllDataByCate(function(err, contact_json_){
      if(err){
        throw err;
      }
      if(contact_json_.length === 0){
        homePage._noneData++;
        if (homePage._noneData === homePage._dataClasses) {
          $('#avatar')[0].click();
        };
      }
      _this._contacts = contact_json_;
      var names_json = {};
      for(var i = 0; i < _this._contacts.length; i ++){
        var full_name = _this._contacts[i]['lastname']+_this._contacts[i]['firstname'];
        var _email = _this._contacts[i]['email'];
        names_json[full_name] = _email;
      }
      if(contact_json_){
          for(var _name in names_json){
            var _li = $('<li>',{
              'class':'contacts-list'
            });
            var _text = $('<span>',{
              'class':'contacts-list-title',
              'text': _name
            });
            var _email = $('<a>',{
              'id':'email-button',
              'class':'icon-envelope',
              'href': 'mailto:'+names_json[_name]
            });
            _li.append(_text);
            _li.append(_email);
            _this._contactslistContent.append(_li);
            _li.click(function(){
              var _contacts = $('.li-name');
              for (var i = 0; i < _contacts.length; i++) {
                if(_contacts[i].textContent === $(this).children('span')[0].textContent){
                  $('#js-label2')[0].click();
                  _contacts[i].click();
                  break;
                }
              };
            })
            _email.click(function(ev){
              ev.stopPropagation();
            })
          }
       }
       _this.refreshScroll();
    },'contact');
  },

  attach:function($parent_){
    $parent_.append(this._ContactsContainer);
  },

  show:function(){
    this._ContactsContainer.show();
    this.refreshScroll();
  },

  refreshScroll:function(){
    this._ContactsContent.nanoScroller();
  },
  
  hide:function(){
    this._ContactsContainer.hide();
  }
});
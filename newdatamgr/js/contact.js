var Contact = Class.extend({
  init:function(){
    this._contacts = [];
    this._ContactContainer = $('<div>',{
      'id': 'contact-container'
    })
    this._contactsList = $('<div>', {
      'id': 'contact-left'
    });
    this._ContactContainer.append(this._contactsList);
    this._contactHead = $('<div>', {
      'id': 'contact-head'
    });
    this._ContactContainer.append(this._contactHead);
    this._defaultPhoto = 'img/headphoto.png';
    this._contactDetails = $('<div>', {
      'id': 'contact-detail'
    });
    this._ContactContainer.append(this._contactDetails);
    this._tagView = TagView.create();
    this._tagView.setParent(this._contactHead);
  },

  setContactsList:function(){
    var _this = this;
    DataAPI.getAllDataByCate(function(contact_json_){
      _this._contacts = contact_json_;
      var family_name_json = {};
      for(var i = 0; i < _this._contacts.length; i ++){
        var family_name = _this._contacts[i]['name'][0];
        if(family_name_json.hasOwnProperty(family_name)){
          family_name_json[family_name].push({
            name: _this._contacts[i]['name'],
            id: i
          });
        } else {
          family_name_json[family_name] = [{
            name: _this._contacts[i]['name'],
            id: i
          }];
        }
      }
      for(var i in family_name_json){
        var _ul = $('<ul>', {
          'class':'ul-family'
        });
        var _first = $('<li>',{
          'class': 'ul-first',
          'text': i
        });
        _ul.append(_first);
        for(var j = 0; j < family_name_json[i].length; j ++){
          var _name = $('<li>', {
            'class':'li-name',
            'text': family_name_json[i][j]['name'],
            'id': family_name_json[i][j]['id']
          });
          _ul.append(_name);
        }
        _this._contactsList.append(_ul);
      }
      _this.setHead(_this._contacts[0]);
      _this.setDetails(_this._contacts[0]);
      _this.bindAction();
    }, 'Contact');
  },

  bindAction: function(){
    var _this = this;
    $('.li-name').on('click', function(){
      _this.removeHead();
      _this.removeDetails();
      _this.setHead(_this._contacts[this.id]);
      _this.setDetails(_this._contacts[this.id]);
    });
  },

  setHead: function(contact_){
    var _headPhotoPath = '';
    if(contact_['photoPath'] != null){
      _headPhotoPath = contact_['photoPath'];
    } else{
      _headPhotoPath = this._defaultPhoto;
    }
    var _photoDiv = $('<div>', {
      'class' : 'div-headphoto'
    });
    var _photo = $('<img>', {
      'class': 'img',
      'src': _headPhotoPath
    });
    _photoDiv.append(_photo);
    var _nameDiv = $('<div>', {
      'class': 'div-name',
      'text': contact_['name']
    });
    var _tags = ['Family', 'School', 'Friends'];
    this._contactHead.append(_photoDiv);
    this._contactHead.append(_nameDiv);
    this._tagView.refresh();
    this._tagView.addTags(_tags);
  },

  setDetails: function(contact_){
    var _ul = $('<ul>', {
      'class':'ul-details'
    });
    for(var key in contact_){
      if(key == 'URI') continue;
      var _li = $('<li>',{
        'class': 'li-details'
      });
      var _keyDiv = $('<div>', {
        'class': 'div-key',
        'text': key
      });
      var _valueDiv = $('<div>', {
        'class': 'div-value',
        'text': contact_[key]
      });
      _li.append(_keyDiv);
      _li.append(_valueDiv);
      _ul.append(_li);
    }
    this._contactDetails.append(_ul);
  },

  removeHead: function(){
    var _list = this._contactHead.children();
    if(_list.length != 0){
      _list.remove();
    }
  },

  removeDetails: function(){
    var _list = this._contactDetails.children();
    if(_list.length != 0){
      _list.remove();
    }
  },

  attach:function($parent_){
    $parent_.append(this._ContactContainer);
  }

});

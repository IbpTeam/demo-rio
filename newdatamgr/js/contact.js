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
    this._defaultPhoto = 'img/headphoto.svg';
    this._contactDetails = $('<div>', {
      'id': 'contact-detail'
    });
    this._first = true;
    this._ContactContainer.append(this._contactDetails);
    this._tagView = TagView.create();
    this._tagView.setParent(this._contactHead);
    this._uri = undefined;
    this.bindDrag(this._contactHead[0]);
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
      _this._first = false;
    }, 'Contact');
  },

  bindAction: function(){
    var _this = this;
    $('.li-name').on('click', function(){
      _this.removeHead();
      _this.removeDetails();
      _this.setHead(_this._contacts[this.id]);
      _this.setDetails(_this._contacts[this.id], this.id);
    });
  },

  setHead: function(contact_){
    var _headPhotoPath = '';
    if(contact_ && contact_['photoPath']){
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

    this._uri = contact_? contact_['URI']:undefined;
    var _tags = [];
    var _tagStr = contact_ ? contact_['others']:undefined;
    if (typeof _tagStr === 'string' && _tagStr.length > 0) {
      _tags = _tagStr.split(',');
    };
    this._contactHead.append(_photoDiv);

    this._tagView.refresh();
    this._tagView.addTags(_tags);

    var _contactHeadBackBlue = $('<div>', {
      'id':'contact-back-blue'
    });
    this._contactHead.append(_contactHeadBackBlue);
    var _contactHeadBackRed = $('<div>', {
      'id':'contact-back-red'
    });
    this._contactHead.append(_contactHeadBackRed);

  },

  setDetails: function(contact_, id){
    var _this = this;
    var _nameDiv = $('<div>', {
      'class': 'div-name',
      'text': (contact_ ? contact_['name'] : 'none')
    });
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
    this._contactDetails.append(_nameDiv);
    this._contactDetails.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _editButton = $('<input>', {
      'type' : 'button',
      'id' : 'edit-button',
      'value' : 'Edit'
    });
    _buttonsDiv.append(_editButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#edit-button').on('click', function(){
      _this.editDetails(contact_, id);
    });
  },

  editDetails: function(contact_, id){
    var _this = this;
    _this.removeDetails();
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
      });
      var _editInput = $('<input>', {
        'class' : 'input-value',
        'value' : contact_[key],
        'id' : key
      });
      _valueDiv.append(_editInput);
      _li.append(_keyDiv);
      _li.append(_valueDiv);
      _ul.append(_li);
    }
    _this._contactDetails.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _saveButton = $('<input>', {
      'type' : 'button',
      'id' : 'save-button',
      'value' : 'Save'
    });
    _buttonsDiv.append(_saveButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#save-button').on('click', function(){
      var _newContact = {};
      for(var key in contact_){
        if(key == 'URI') continue;
        var _newValue = document.getElementById(key).value;
        _newContact[key] = _newValue;
      }
      _newContact['category'] = 'contact';
      _newContact['URI'] = contact_['URI'];
      DataAPI.updateDataValue(function(result_){
        if(result_ == 'success'){
          _this.removeDetails();
          _this.setDetails(_newContact);
          _this._contacts[id] = _newContact;
        } else {
          alert('Saved failed!');
        }
      }, [_newContact]);
    });
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
  },

  bindDrag:function(target_){
    target_.ondragover = this.dragover;
    target_.ondrop = this.drop;
  },
  drop:function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    var _tag = ev.dataTransfer.getData('tag');
    if (typeof _tag === 'string' && _tag.length > 0) {
      DataAPI.setTagByUri(function(result_){
        if (result_ === 'commit') {
          contact._tagView.addTag(_tag);
          contact._tagView.setUri(contact._uri);
          infoList.fixTagNum(_tag,1);
        };
      },[_tag],contact._uri);
    };
  },
  dragover:function(ev){
    ev.preventDefault();  
  }

});

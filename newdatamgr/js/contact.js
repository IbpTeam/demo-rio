var Contact = Class.extend({
  init:function(){
    this._contacts = [];
    this._showList = [];
    this._ContactContainer = $('<div>',{
      'id': 'contact-container'
    })
    this._contactsList = $('<div>', {
      'id': 'contact-left',
      'class': 'nanoContact'
    });
    this._contactsListNano = $('<div>',{
      'class': 'nano-content'
    });
    this._ContactContainer.append(this._contactsList);
    this._contactsList.append(this._contactsListNano);
    this._contactHead = $('<div>', {
      'id': 'contact-head'
    });
    this._ContactContainer.append(this._contactHead);
    this._defaultPhoto = 'img/headphoto.svg';
    this._contactDetails = $('<div>', {
      'id': 'contact-detail',
      'class': 'contactDetail'
    });
    this._contactsDetailsNano = $('<div>',{
      'class': 'nano-content'
    });
    this._first = true;
    this._ContactContainer.append(this._contactDetails);
    this._contactDetails.append(this._contactsDetailsNano);
    this._tagView = TagView.create({
      category:'contact'
    });
    this._tagView.setParent(this._contactHead);
    this._selectId = 0;
    this.bindDrag(this._contactHead[0]);
    this.setContextMenu();
  },

  setContactsList:function(){
    var _this = this;
    DataAPI.getAllDataByCate(function(err, contact_json_){
      if (err) {
         throw err; 
         return 0;
      };
      _this._contacts = contact_json_;
      if(_this._contacts != null && _this._contacts.length > 0){
        _this.loadContactsList(0);
      }
      infoList.searchTag(_params);
      _this._first = false;
    }, 'contact');
  },

  loadContactsList:function(_index, showList){
    if(showList != null){
      this._showList = [];
      for(var i = 0; i < showList.length; i ++)
          {
            var tmp = {};
            tmp['URI']=showList[i]['URI'];
            tmp['lastname']=showList[i]['lastname'];
            tmp['firstname']=showList[i]['firstname'];
            tmp['sex']=showList[i]['sex'];
            tmp['age']=showList[i]['age'];
            tmp['photoPath']=showList[i]['photoPath'];
            tmp['phone']=showList[i]['phone'];
            tmp['email']=showList[i]['email'];
            tmp['tags']=showList[i]['tags'];
            this._showList.push(tmp);
           }
    } else {
      this._showList = this._contacts;
    }
    this.removeContactList();

    var family_name_json = {};
    for(var i = 0; i < this._showList.length; i ++){
      var family_name = this._showList[i]['lastname'][0];
      if(family_name_json.hasOwnProperty(family_name)){


        family_name_json[family_name].push({
          name: this._showList[i]['lastname']+this._showList[i]['firstname'],
          id: i
        });
      } else {


        family_name_json[family_name] = [{
          name: this._showList[i]['lastname']+this._showList[i]['firstname'],
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
      this._contactsListNano.append(_ul);
    }
    this.removeHead();
    this.setHead(this._showList[_index]);
    this.removeDetails();
    this.setDetails(this._showList[_index]);
    this.bindAction();
    this.refreshListScroll();

  },

  bindAction: function(){
    var _this = this;
    $('.li-name').on('click', function(){
      _this.removeHead();
      _this.removeDetails();
      _this.setHead(_this._showList[this.id]);
      _this.setDetails(_this._showList[this.id], this.id);
      _this._selectId = this.id;
    });

    //forbid context menu
    $(document).on('contextmenu','#'+_this._contactsList[0].id, function(ev){
      ev.stopPropagation();
      ev.preventDefault();
    });
  },
  
  setContextMenu:function(){
    var _this = this;
    contextMenu.addCtxMenu([
      {header: 'contact menu'},
      {text:'Tag', subMenu:[
        {text: 'Add',action:function(){
          basic.addTagView(_this,_this._contacts[_this._selectId]['URI'],'contact');
        }},
        {text: 'Remove', action:function(){
          basic.removeTagView(_this._contactHead,_this._contacts[_this._selectId]['URI'],'contact');
        }}
      ]},
      {text: 'Remove Contact', action:function(){
        DataAPI.rmDataByUri(function(err){
          if (err) {
            window.alert("Delete file failed!");
          } else {
            _this._contacts.splice(_this._selectId, 1);
            _this.loadContactsList(0);
            infoList.setContent();
          }
        },_this._contacts[_this._selectId]['URI']);
      }},
      {text: 'Edit Contact',action:function(){
        _this.editDetails(_this._contacts[_this._selectId], _this._selectId);
      }}
    ]);
    contextMenu.attachToMenu('#contact-container',
      contextMenu.getMenuByHeader('contact menu'),
      function(){
        basic._tagDragged = _this._tagView; 
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

    var _uri = contact_? contact_['URI']:undefined;
    var _tags = contact_.tags ? contact_.tags : [];
    this._contactHead.append(_photoDiv);

    this._tagView.refresh();
    this._tagView.addTags(_tags);
    this._tagView.setUri(_uri);

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
      'text': (contact_ ? contact_['lastname']+contact_['firstname'] : 'none')
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
    _this._contactsDetailsNano.append(_nameDiv);
    _this._contactsDetailsNano.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _addButton = $('<input>', {
      'type' : 'button',
      'id': 'add-button',
      'value': 'Add'
    });
    _buttonsDiv.append(_addButton);
    var _editButton = $('<input>', {
      'type' : 'button',
      'id' : 'edit-button',
      'value' : 'Edit'
    });
    _buttonsDiv.append(_editButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#add-button').on('click', function(){
      _this.addContact();
    });
    $('#edit-button').on('click', function(){
      _this.editDetails(contact_, id);
    });
    _this.refreshDetailScroll();
  },

  addContact: function(){
    var _this = this;
    _this.removeDetails();
    _this.setHead({});
    var keys = ['lastname','firstname', 'phone', 'email', 'sex', 'age'];
    var _ul = $('<ul>', {
      'class':'ul-details'
    });
    for(var i = 0; i < keys.length; i ++){
      var _li = $('<li>',{
        'class': 'li-details'
      });
      var _keyDiv = $('<div>', {
        'class': 'div-key',
        'text': keys[i]
      });
      var _valueDiv = $('<div>', {
        'class': 'div-value',
      });
      var _editInput = $('<input>', {
        'class' : 'input-value',
        'id' : 'add'+keys[i]
      });
      _valueDiv.append(_editInput);
      _li.append(_keyDiv);
      _li.append(_valueDiv);
      _ul.append(_li);
    }
    _this._contactsDetailsNano.append(_ul);
    var _buttonsDiv = $('<div>', {
      'id' : 'buttons-div'
    });
    var _confirmAddButton = $('<input>', {
      'type' : 'button',
      'id' : 'confirm-add-button',
      'value' : 'Add'
    });
    _buttonsDiv.append(_confirmAddButton);
    _this._contactDetails.append(_buttonsDiv);
    $('#confirm-add-button').on('click', function(){
      var _newContact = {};
      var _isValid = true;
      for(var i = 0; i < keys.length; i ++){
        var _newValue = document.getElementById('add'+keys[i]).value;
        _newContact[keys[i]] = _newValue;
      }
      if(_newContact['email'] != '' && _newContact['email'].indexOf('@') == -1){
        _isValid = false;
        alert("Invalid Email!");
      }
      if(_newContact['phone'] != '' && isNaN(_newContact['phone'])){
        _isValid = false;
        alert("Invalid Phone Number!");
      }
      if(_newContact['lastname'] == '' &&_newContact['firstname'] == ''){
        _isValid = false;
        alert("Name can not be null!");
      }
      if(_isValid == true){
        DataAPI.createFile(function(err_, result_){
          if(err_ ){
            throw err_;
            alert('Saved failed!');
          }else{
            _this._contacts.push(_newContact);
            _this.loadContactsList(_this._contacts.length - 1);
          } 
        }, _newContact, 'contact');
      }
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
    _this._contactsDetailsNano.append(_ul);
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
      var _newContact = {
        _uri: contact_.URI,
        _changes: []
      };
      for(var key in contact_){
        if(key == 'URI') continue;
        var _newValue = document.getElementById(key).value;
        _newContact._changes.push({
          _property: key,
          _value: _newValue
        });
      }
      DataAPI.updateDataValue(function(err){
        if (err) {
          alert('Saved failed!');
        } else {
          DataAPI.getDataByUri(function(err, result_){
            if (err) {
              alert('Saved failed!');
            } else {
              var _newContent = {
                URI: result_[0].URI,
                name: result_[0].lastname + result_[0].firstname,
                sex: result_[0].sex,
                age: result_[0].age,
                photoPath: result_[0].photoPath,
                phone: result_[0].phone,
                email: result_[0].email,
                tags: result_[0].tags
              };
              _this.removeDetails();
              _this.setDetails(_newContent);
              _this._contacts[id] = _newContent;
            }
          },contact_.URI);
        }
      }, _newContact);
    });
  },

  removeHead: function(){
    var _list = this._contactHead.children();
    if(_list.length != 0){
      _list.remove();
    }
  },

  removeDetails: function(){
    var _list = this._contactsDetailsNano.children();
    if(_list.length != 0){
      _list.remove();
    }
    this._contactDetails.children('#buttons-div').remove();
  },

  removeContactList: function(){
    var _list = this._contactsListNano.children();
    if(_list.length != 0){
      _list.remove();
    }
  },

  attach:function($parent_){
    $parent_.append(this._ContactContainer);
  },

  hide:function(){
    this._ContactContainer.hide();
  },

  show:function(){
    this._ContactContainer.show();
    this.refreshListScroll();
    this.refreshDetailScroll();
  },

  refresh:function(){
    this._contactsListNano.children('ul').remove();
    this.setContactsList();
  },

  refreshListScroll:function(){
    this._contactsList.nanoScroller();
  },

  refreshDetailScroll:function(){
    this._contactDetails.nanoScroller();
  },

  bindDrag:function(target_){
    target_.ondragover = this.dragover;
    target_.ondrop = this.drop;
  },
  drop:function(ev){
    ev.preventDefault();
    ev.stopPropagation();
    var _tag = ev.dataTransfer.getData('tag');
    var _category = ev.dataTransfer.getData('category');
    var _uri = ev.dataTransfer.getData('uri');
    if (typeof _tag === 'string' && _tag.length > 0) {
      DataAPI.setTagByUri(function(err_){
        if (err_ == undefined ||err_ == null) {
          if(!contact._tagView.addTag(_tag)){
            return 0;
          }
          if(contact._contacts[contact._selectId]['tags'] == ""){
            contact._contacts[contact._selectId]['tags'] = [];
          }
          contact._contacts[contact._selectId]['tags'].push(_tag);
          var num_ = infoList.fixTagNum(_tag,1);
          // if(infoList._info['tagFiles'].hasOwnProperty(_tag)){
          //   infoList._info['tagFiles'][_tag].push(_tagedFile);
          // } else {
          //   infoList._info['tagFiles'][_tag] = [_tagedFile];
          //   infoList._info['tags'].push([_tag,1]);
          // }
        };
      },[_tag],contact._tagView._uri);
    }else if(_uri && _category === 'picture'){
      var _modalUri = basic.uriToModifyUri(_uri);
      var _file = basic.findFileByURI(_modalUri,_globalSelf._getFiles[1]);  //index = 1 is picture
      var _path = _file['path'];
      var _contactJson = contact._contacts[contact._selectId];
      _contactJson['photoPath'] = _path;
      _contactJson['category'] = 'contact';
      var _info = {
        _uri: contact._tagView._uri,
        _changes: [{
          _property: "photoPath",
          _value: _path
        }, {
          _property: "lastModifyDev",
          _value: (new Date()).toString()
        }, {
          _property: "lastAccessTime",
          _value: (new Date()).toString()
        }]
      }
      DataAPI.updateDataValue(function(err){
        if(err){
          alert('Saved failed!');
        }else{
          contact._contacts[contact._selectId] = _contactJson;
          contact.removeHead();
          contact.setHead(_contactJson);
        }
      },_info);
    }
  },
  dragover:function(ev){
    ev.preventDefault();  
  }
});
